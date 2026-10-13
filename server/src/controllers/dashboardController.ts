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
        imagesJson: JSON.stringify(Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800"]),
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