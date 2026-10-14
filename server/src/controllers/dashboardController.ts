import { Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middleware/auth";
import { getActiveMerchantUpi } from "./directUpiController";

// --- CUSTOMER / FARMER APIS ---
export async function getCustomerOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        rentalBookings: { include: { product: true } },
        transactions: true,
        address: true,
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCustomerRentals(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const rentals = await prisma.rentalBooking.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            seller: { select: { businessName: true, district: true } }
          }
        },
        order: true,
      },
      orderBy: { startDate: "desc" }
    });

    const formatted = rentals.map(r => {
      let images = [];
      try {
        images = JSON.parse(r.product.imagesJson);
      } catch {
        images = [r.product.imagesJson];
      }
      return {
        ...r,
        product: { ...r.product, images }
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// --- SELLER / MACHINERY OWNER APIS ---
export async function getSellerDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        products: {
          include: {
            category: true,
            _count: { select: { rentalBookings: true, orderItems: true } }
          }
        }
      }
    });

    if (!seller) {
      res.status(404).json({ success: false, message: "Seller profile not registered." });
      return;
    }

    const productIds = seller.products.map(p => p.id);
    const rentalBookings = await prisma.rentalBooking.findMany({
      where: { productId: { in: productIds } },
      include: {
        user: { select: { name: true, phone: true, villageOrTown: true, district: true } },
        product: { select: { title: true, type: true } }
      },
      orderBy: { startDate: "desc" }
    });

    const orderItems = await prisma.orderItem.findMany({
      where: { sellerId: seller.id },
      include: {
        order: { include: { user: { select: { name: true, phone: true } }, address: true } },
        product: { select: { title: true, type: true } }
      },
      orderBy: { order: { createdAt: "desc" } }
    });

    const totalEarningsPaise = orderItems.reduce((acc, curr) => acc + curr.totalPaise, 0);

    res.json({
      success: true,
      seller,
      stats: {
        totalProducts: seller.products.length,
        totalBookings: rentalBookings.length,
        totalSales: orderItems.length,
        earningsPaise: totalEarningsPaise,
      },
      rentalBookings,
      recentOrders: orderItems,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createOrUpdateSellerProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const seller = await prisma.sellerProfile.findUnique({ where: { userId } });

    if (!seller) {
      res.status(403).json({ success: false, message: "Active seller profile required." });
      return;
    }

    const {
      title,
      titleMr,
      description,
      descriptionMr,
      type,
      categoryId,
      subCategory,
      pricePaise,
      hourlyRatePaise,
      perAcreRatePaise,
      securityDepositPaise,
      stock = 1,
      condition,
      modelYear,
      horsepower,
      villageTown,
      district,
      state,
      deliveryAvailable = true,
      deliveryFeePaise = 0,
      images,
      specifications,
      safetyWarning,
      toxicityColor,
      cibRegistrationNo,
      activeIngredients,
      dosageRecommendation,
      targetCrops,
      suitableSoil,
      maharashtraRegion,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId,
        title,
        titleMr: titleMr || null,
        description,
        descriptionMr: descriptionMr || null,
        type,
        subCategory: subCategory || null,
        targetCrops: targetCrops || null,
        suitableSoil: suitableSoil || null,
        maharashtraRegion: maharashtraRegion || "Western Maharashtra",
        pricePaise: Number(pricePaise),
        hourlyRatePaise: hourlyRatePaise ? Number(hourlyRatePaise) : null,
        perAcreRatePaise: perAcreRatePaise ? Number(perAcreRatePaise) : null,
        securityDepositPaise: securityDepositPaise ? Number(securityDepositPaise) : null,
        stock: Number(stock),
        condition: condition || null,
        modelYear: modelYear ? Number(modelYear) : null,
        horsepower: horsepower ? Number(horsepower) : null,
        villageTown: villageTown || seller.farmOrShopAddress,
        district: district || seller.district,
        state: state || seller.state,
        deliveryAvailable: Boolean(deliveryAvailable),
        deliveryFeePaise: Number(deliveryFeePaise || 0),
        imagesJson: JSON.stringify(Array.isArray(images) && images.length > 0 ? images : ["/images/products/mahindra-tractor.jpg"]),
        specificationsJson: specifications ? JSON.stringify(specifications) : null,
        safetyWarning: safetyWarning || null,
        toxicityColor: toxicityColor || null,
        cibRegistrationNo: cibRegistrationNo || null,
        activeIngredients: activeIngredients || null,
        dosageRecommendation: dosageRecommendation || null,
        isApproved: true,
        isActive: true,
      }
    });

    res.json({ success: true, message: "Product listed successfully", data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// --- ADMIN CONTROL APIS ---
export async function getAdminOverview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [
      usersCount,
      sellersCount,
      productsCount,
      ordersCount,
      pendingVerificationOrders,
      allOrders,
      transactions,
      recentUsers,
      pendingSellers,
      auditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.sellerProfile.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: "PAYMENT_SUBMITTED" },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: { include: { product: true } }
        },
        orderBy: { paymentSubmittedAt: "desc" }
      }),
      prisma.order.findMany({
        take: 15,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, phone: true } },
          items: { include: { product: true } }
        }
      }),
      prisma.paymentTransaction.findMany({
        where: { status: "SUCCESS" },
        select: { amountPaise: true }
      }),
      prisma.user.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
      prisma.sellerProfile.findMany({
        where: { isVerified: false },
        include: { user: { select: { name: true, email: true, phone: true } } }
      }),
      prisma.auditLog.findMany({
        take: 15,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true, role: true } } }
      })
    ]);

    const totalRevenuePaise = transactions.reduce((acc, t) => acc + t.amountPaise, 0);
    const activeMerchantUpi = await getActiveMerchantUpi();

    res.json({
      success: true,
      stats: {
        usersCount,
        sellersCount,
        productsCount,
        ordersCount,
        revenuePaise: totalRevenuePaise,
        pendingUtrCount: pendingVerificationOrders.length,
      },
      activeMerchantUpi,
      pendingVerificationOrders,
      recentOrders: allOrders,
      recentUsers,
      pendingSellers,
      auditLogs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function approveSeller(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { sellerId } = req.params;
    const { isVerified = true, notes } = req.body;

    const seller = await prisma.sellerProfile.update({
      where: { id: sellerId },
      data: {
        isVerified,
        verificationNotes: notes || "Verified by platform admin.",
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "SELLER_APPROVAL_STATUS_CHANGED",
        detailsJson: JSON.stringify({ sellerId, isVerified })
      }
    });

    res.json({ success: true, message: "Seller verification updated", seller });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// --- ADMIN DIRECT PRODUCT / EQUIPMENT MANAGEMENT ---
export async function adminGetAllProducts(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, seller: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function adminCreateProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      title,
      titleMr,
      description,
      descriptionMr,
      type,
      categoryId,
      subCategory,
      pricePaise,
      hourlyRatePaise,
      acreRatePaise,
      securityDepositPaise,
      stockQuantity = 1,
      minRentalHours = 1,
      minRentalDays = 1,
      district,
      state = "Maharashtra",
      regionMaharashtra,
      suitableSoilTypes,
      targetCrops,
      hpRating,
      fuelType,
      implementsIncluded,
      images,
      specifications,
      safetyWarning,
      toxicityColor,
      cibRegistrationNo,
      activeIngredients,
      dosageRecommendation,
    } = req.body;

    let seller = await prisma.sellerProfile.findFirst();
    if (!seller) {
      const defaultAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      seller = await prisma.sellerProfile.create({
        data: {
          userId: defaultAdmin?.id || req.user!.id,
          businessName: "KrishiRent Admin Official Hub",
          farmOrShopAddress: "Krishi Bhavan, Shivajinagar",
          pincode: "411005",
          district: "Pune",
          state: "Maharashtra",
          isVerified: true
        }
      });
    }

    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        title,
        titleMr: titleMr || null,
        description,
        descriptionMr: descriptionMr || null,
        type,
        categoryId,
        subCategory: subCategory || null,
        pricePaise: Number(pricePaise) || 0,
        hourlyRatePaise: hourlyRatePaise ? Number(hourlyRatePaise) : null,
        perAcreRatePaise: acreRatePaise ? Number(acreRatePaise) : null,
        securityDepositPaise: securityDepositPaise ? Number(securityDepositPaise) : 0,
        stock: Number(stockQuantity) || 1,
        horsepower: hpRating ? Number(hpRating) : null,
        villageTown: "Krishi Bhavan",
        district: district || "Pune",
        state: state || "Maharashtra",
        maharashtraRegion: regionMaharashtra || "Western Maharashtra",
        suitableSoil: suitableSoilTypes ? (Array.isArray(suitableSoilTypes) ? suitableSoilTypes.join(", ") : String(suitableSoilTypes)) : null,
        targetCrops: targetCrops ? (Array.isArray(targetCrops) ? targetCrops.join(", ") : String(targetCrops)) : null,
        imagesJson: JSON.stringify(Array.isArray(images) && images.length > 0 ? images : ["/images/products/mahindra-tractor.jpg"]),
        specificationsJson: specifications ? JSON.stringify(specifications) : null,
        safetyWarning: safetyWarning || null,
        toxicityColor: toxicityColor || null,
        cibRegistrationNo: cibRegistrationNo || null,
        activeIngredients: activeIngredients || null,
        dosageRecommendation: dosageRecommendation || null,
        isApproved: true,
        isActive: true,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "ADMIN_PRODUCT_CREATED",
        detailsJson: JSON.stringify({ productId: product.id, title: product.title })
      }
    });

    res.json({ success: true, message: "Equipment/product created successfully by Admin", data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function adminUpdateProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const cleanData: any = {};
    if (body.title !== undefined) cleanData.title = String(body.title);
    if (body.titleMr !== undefined) cleanData.titleMr = body.titleMr ? String(body.titleMr) : null;
    if (body.description !== undefined) cleanData.description = String(body.description);
    if (body.descriptionMr !== undefined) cleanData.descriptionMr = body.descriptionMr ? String(body.descriptionMr) : null;
    if (body.type !== undefined) cleanData.type = String(body.type);
    if (body.categoryId !== undefined) cleanData.categoryId = String(body.categoryId);
    if (body.subCategory !== undefined) cleanData.subCategory = body.subCategory ? String(body.subCategory) : null;
    if (body.targetCrops !== undefined) cleanData.targetCrops = body.targetCrops ? String(body.targetCrops) : null;
    if (body.suitableSoil !== undefined) cleanData.suitableSoil = body.suitableSoil ? String(body.suitableSoil) : null;
    if (body.targetPestOrDisease !== undefined) cleanData.targetPestOrDisease = body.targetPestOrDisease ? String(body.targetPestOrDisease) : null;
    if (body.maharashtraRegion !== undefined) cleanData.maharashtraRegion = body.maharashtraRegion ? String(body.maharashtraRegion) : null;
    if (body.pricePaise !== undefined) cleanData.pricePaise = Number(body.pricePaise);
    if (body.hourlyRatePaise !== undefined) cleanData.hourlyRatePaise = body.hourlyRatePaise ? Number(body.hourlyRatePaise) : null;
    if (body.perAcreRatePaise !== undefined) cleanData.perAcreRatePaise = body.perAcreRatePaise ? Number(body.perAcreRatePaise) : null;
    if (body.securityDepositPaise !== undefined) cleanData.securityDepositPaise = body.securityDepositPaise ? Number(body.securityDepositPaise) : 0;
    if (body.stock !== undefined) cleanData.stock = Number(body.stock);
    if (body.condition !== undefined) cleanData.condition = body.condition ? String(body.condition) : null;
    if (body.modelYear !== undefined) cleanData.modelYear = body.modelYear ? Number(body.modelYear) : null;
    if (body.horsepower !== undefined) cleanData.horsepower = body.horsepower ? Number(body.horsepower) : null;
    if (body.villageTown !== undefined) cleanData.villageTown = String(body.villageTown);
    if (body.district !== undefined) cleanData.district = String(body.district);
    if (body.state !== undefined) cleanData.state = String(body.state);
    if (body.deliveryAvailable !== undefined) cleanData.deliveryAvailable = Boolean(body.deliveryAvailable);
    if (body.deliveryFeePaise !== undefined) cleanData.deliveryFeePaise = Number(body.deliveryFeePaise || 0);
    if (body.isActive !== undefined) cleanData.isActive = Boolean(body.isActive);
    if (body.isApproved !== undefined) cleanData.isApproved = Boolean(body.isApproved);

    if (Array.isArray(body.images)) {
      cleanData.imagesJson = JSON.stringify(body.images);
    } else if (body.imagesJson !== undefined) {
      cleanData.imagesJson = typeof body.imagesJson === "string" ? body.imagesJson : JSON.stringify(body.imagesJson);
    }

    if (body.specifications && typeof body.specifications === "object") {
      cleanData.specificationsJson = JSON.stringify(body.specifications);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: cleanData
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "ADMIN_PRODUCT_UPDATED",
        detailsJson: JSON.stringify({ productId: id, title: updated.title })
      }
    });

    res.json({ success: true, message: "Equipment/product updated successfully by Admin", data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function adminDeleteProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "ADMIN_PRODUCT_DELETED",
        detailsJson: JSON.stringify({ productId: id })
      }
    });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}