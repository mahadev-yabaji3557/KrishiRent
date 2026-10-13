import { Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
  isRental: z.boolean().default(false),
  rentalStartDate: z.string().optional(),
  rentalEndDate: z.string().optional(),
  rentalRateUnit: z.enum(["HOUR", "DAY", "ACRE"]).optional(),
  rentalUnits: z.number().int().positive().optional(),
});

export async function getCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            seller: { select: { businessName: true, district: true } }
          }
        }
      }
    });

    let subtotalPaise = 0;
    let deliveryFeePaise = 0;

    const formatted = cartItems.map(item => {
      let itemPrice = item.product.pricePaise;
      let calculatedTotal = 0;

      if (item.isRental) {
        if (item.rentalRateUnit === "HOUR" && item.product.hourlyRatePaise) {
          calculatedTotal = item.product.hourlyRatePaise * (item.rentalUnits || 1);
        } else if (item.rentalRateUnit === "ACRE" && item.product.perAcreRatePaise) {
          calculatedTotal = item.product.perAcreRatePaise * (item.rentalUnits || 1);
        } else {
          // Default DAY rate
          const days = item.rentalStartDate && item.rentalEndDate
            ? Math.max(1, Math.ceil((new Date(item.rentalEndDate).getTime() - new Date(item.rentalStartDate).getTime()) / (1000 * 60 * 60 * 24)))
            : (item.rentalUnits || 1);
          calculatedTotal = item.product.pricePaise * days;
        }
        // Add security deposit
        if (item.product.securityDepositPaise) {
          calculatedTotal += item.product.securityDepositPaise;
        }
      } else {
        calculatedTotal = item.product.pricePaise * item.quantity;
      }

      subtotalPaise += calculatedTotal;
      deliveryFeePaise += (item.product.deliveryFeePaise || 0);

      let parsedImages = [];
      try {
        parsedImages = JSON.parse(item.product.imagesJson);
      } catch {
        parsedImages = [item.product.imagesJson];
      }

      return {
        ...item,
        product: {
          ...item.product,
          images: parsedImages,
        },
        calculatedTotalPaise: calculatedTotal,
      };
    });

    const taxPaise = Math.round(subtotalPaise * 0.05); // Standard 5% GST on agro goods
    const totalPaise = subtotalPaise + deliveryFeePaise + taxPaise;

    res.json({
      success: true,
      items: formatted,
      summary: {
        itemCount: formatted.length,
        subtotalPaise,
        deliveryFeePaise,
        taxPaise,
        totalPaise,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function addToCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const data = addToCartSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product || !product.isActive || !product.isApproved) {
      res.status(404).json({ success: false, message: "Product is not available for purchase or rental" });
      return;
    }

    if (data.isRental) {
      if (!data.rentalStartDate || !data.rentalEndDate) {
        res.status(400).json({ success: false, message: "Rental start date and end date are required" });
        return;
      }

      const start = new Date(data.rentalStartDate);
      const end = new Date(data.rentalEndDate);

      // Verify availability
      const overlapping = await prisma.rentalBooking.findFirst({
        where: {
          productId: data.productId,
          status: { in: ["CONFIRMED", "ACTIVE"] },
          AND: [
            { startDate: { lte: end } },
            { endDate: { gte: start } }
          ]
        }
      });

      if (overlapping) {
        res.status(400).json({ 
          success: false, 
          message: "This machinery is already booked for the selected dates. Please choose another slot." 
        });
        return;
      }
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId: data.productId,
        quantity: data.quantity,
        isRental: data.isRental,
        rentalStartDate: data.rentalStartDate ? new Date(data.rentalStartDate) : null,
        rentalEndDate: data.rentalEndDate ? new Date(data.rentalEndDate) : null,
        rentalRateUnit: data.rentalRateUnit || "DAY",
        rentalUnits: data.rentalUnits || 1,
      }
    });

    res.json({ success: true, message: "Added to cart successfully", item: cartItem });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors?.[0]?.message || error.message });
  }
}

export async function removeCartItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await prisma.cartItem.deleteMany({
      where: { id, userId }
    });

    res.json({ success: true, message: "Item removed from cart" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function clearCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    await prisma.cartItem.deleteMany({ where: { userId } });
    res.json({ success: true, message: "Cart cleared" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}