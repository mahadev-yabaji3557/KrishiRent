import { Request, Response } from "express";
import { prisma } from "../prisma";

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const { 
      type, 
      category, 
      search, 
      district, 
      crop,
      soil,
      region,
      minPrice, 
      maxPrice, 
      sortBy,
      page = "1",
      limit = "30"
    } = req.query;

    const where: any = {
      isActive: true,
      isApproved: true,
    };

    if (type && typeof type === "string") {
      where.type = type.toUpperCase();
    }

    if (category && typeof category === "string") {
      where.category = {
        slug: category
      };
    }

    if (district && typeof district === "string") {
      where.district = { contains: district };
    }

    if (crop && typeof crop === "string") {
      where.targetCrops = { contains: crop };
    }

    if (soil && typeof soil === "string") {
      where.suitableSoil = { contains: soil };
    }

    if (region && typeof region === "string") {
      where.maharashtraRegion = { contains: region };
    }

    if (minPrice || maxPrice) {
      where.pricePaise = {};
      if (minPrice) where.pricePaise.gte = Math.round(Number(minPrice) * 100);
      if (maxPrice) where.pricePaise.lte = Math.round(Number(maxPrice) * 100);
    }

    if (search && typeof search === "string") {
      where.OR = [
        { title: { contains: search } },
        { titleMr: { contains: search } },
        { description: { contains: search } },
        { targetCrops: { contains: search } },
        { suitableSoil: { contains: search } },
        { targetPestOrDisease: { contains: search } },
        { maharashtraRegion: { contains: search } },
        { villageTown: { contains: search } },
        { district: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price_asc") orderBy = { pricePaise: "asc" };
    else if (sortBy === "price_desc") orderBy = { pricePaise: "desc" };

    const take = Math.min(Number(limit) || 30, 50);
    const skip = ((Number(page) || 1) - 1) * take;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        take,
        skip,
        orderBy,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              businessName: true,
              district: true,
              state: true,
              isVerified: true,
            }
          },
          reviews: {
            select: { rating: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    const formatted = products.map(p => {
      let parsedImages = [];
      try {
        parsedImages = JSON.parse(p.imagesJson);
      } catch (e) {
        parsedImages = [p.imagesJson];
      }

      let parsedSpecs = {};
      try {
        if (p.specificationsJson) parsedSpecs = JSON.parse(p.specificationsJson);
      } catch (e) {}

      const avgRating = p.reviews.length > 0
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
        : 4.8;

      return {
        ...p,
        images: parsedImages,
        specifications: parsedSpecs,
        avgRating: Number(avgRating.toFixed(1)),
        reviewCount: p.reviews.length,
      };
    });

    res.json({
      success: true,
      data: formatted,
      meta: {
        total: totalCount,
        page: Number(page) || 1,
        limit: take,
        pages: Math.ceil(totalCount / take),
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            businessName: true,
            farmOrShopAddress: true,
            district: true,
            state: true,
            isVerified: true,
            pesticideLicenseNo: true,
            fertilizerLicenseNo: true,
          }
        },
        reviews: {
          include: {
            user: { select: { name: true, district: true } }
          }
        },
        rentalBookings: {
          where: {
            status: { in: ["CONFIRMED", "ACTIVE"] },
            endDate: { gte: new Date() }
          },
          select: {
            startDate: true,
            endDate: true,
          }
        }
      }
    });

    if (!product) {
      res.status(404).json({ success: false, message: "Product or equipment not found" });
      return;
    }

    let parsedImages = [];
    try {
      parsedImages = JSON.parse(product.imagesJson);
    } catch {
      parsedImages = [product.imagesJson];
    }

    let parsedSpecs = {};
    try {
      if (product.specificationsJson) parsedSpecs = JSON.parse(product.specificationsJson);
    } catch {}

    res.json({
      success: true,
      data: {
        ...product,
        images: parsedImages,
        specifications: parsedSpecs,
        bookedPeriods: product.rentalBookings,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function checkRentalAvailability(req: Request, res: Response): Promise<void> {
  try {
    const { productId, startDate, endDate } = req.query;

    if (!productId || !startDate || !endDate) {
      res.status(400).json({ success: false, message: "productId, startDate, and endDate are required" });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      res.status(400).json({ success: false, message: "Invalid date range specified" });
      return;
    }

    const overlapping = await prisma.rentalBooking.findFirst({
      where: {
        productId: productId as string,
        status: { in: ["CONFIRMED", "ACTIVE"] },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } }
        ]
      }
    });

    const isAvailable = !overlapping;

    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable 
        ? "Equipment is fully available for selected dates" 
        : "Equipment is already booked during these dates. Please choose another date range."
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}