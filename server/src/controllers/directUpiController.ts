import { Response } from "express";
import crypto from "crypto";
import { prisma } from "../prisma";
import { AuthRequest } from "../middleware/auth";
import { sendOrderReceiptEmail } from "../services/emailService";
import { z } from "zod";

// Helper to get active Merchant UPI settings (from DB or fallback to .env)
export async function getActiveMerchantUpi() {
  const upiIdSetting = await prisma.platformSetting.findUnique({
    where: { key: "MERCHANT_UPI_ID" }
  });
  const upiNameSetting = await prisma.platformSetting.findUnique({
    where: { key: "MERCHANT_NAME" }
  });

  return {
    upiId: upiIdSetting?.value || process.env.MERCHANT_UPI_ID || "9356618282@okaxis",
    name: upiNameSetting?.value || process.env.MERCHANT_NAME || "KrishiRent AgroMart",
  };
}

const createOrderSchema = z.object({
  addressId: z.string().optional(),
  shippingAddress: z.object({
    fullName: z.string(),
    phone: z.string(),
    street: z.string(),
    villageTown: z.string(),
    district: z.string(),
    state: z.string(),
    pincode: z.string(),
  }).optional(),
  notes: z.string().optional(),
});

const submitUtrSchema = z.object({
  orderId: z.string(),
  utrNumber: z.string().min(6, "UTR / Reference number must be at least 6 digits").max(30),
  payerUpiId: z.string().optional(),
});

const adminVerifySchema = z.object({
  decision: z.enum(["CONFIRM", "REJECT"]),
  rejectionReason: z.string().optional(),
});

// 1. Get Merchant UPI Config (Public / Auth)
export async function getMerchantUpiConfig(_req: any, res: Response): Promise<void> {
  try {
    const config = await getActiveMerchantUpi();
    res.json({
      success: true,
      data: config,
      note: "Direct Peer-to-Merchant zero-fee UPI payments supported for all Indian UPI apps."
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Create Order & Generate Direct Amount-Specific UPI Deep-Link
export async function createDirectUpiOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = createOrderSchema.parse(req.body);

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      res.status(400).json({ success: false, message: "Your cart is empty" });
      return;
    }

    let subtotalPaise = 0;
    let deliveryFeePaise = 0;

    for (const item of cartItems) {
      if (!item.product.isActive || !item.product.isApproved) {
        res.status(400).json({ success: false, message: `Product "${item.product.title}" is no longer available.` });
        return;
      }

      if (item.isRental) {
        if (!item.rentalStartDate || !item.rentalEndDate) {
          res.status(400).json({ success: false, message: "Incomplete rental booking dates in cart." });
          return;
        }

        const overlap = await prisma.rentalBooking.findFirst({
          where: {
            productId: item.productId,
            status: { in: ["CONFIRMED", "ACTIVE"] },
            AND: [
              { startDate: { lte: item.rentalEndDate } },
              { endDate: { gte: item.rentalStartDate } }
            ]
          }
        });

        if (overlap) {
          res.status(400).json({
            success: false,
            message: `Rental conflict: "${item.product.title}" is already booked for these dates.`
          });
          return;
        }

        let itemTotal = 0;
        if (item.rentalRateUnit === "HOUR" && item.product.hourlyRatePaise) {
          itemTotal = item.product.hourlyRatePaise * (item.rentalUnits || 1);
        } else if (item.rentalRateUnit === "ACRE" && item.product.perAcreRatePaise) {
          itemTotal = item.product.perAcreRatePaise * (item.rentalUnits || 1);
        } else {
          const days = Math.max(1, Math.ceil((new Date(item.rentalEndDate).getTime() - new Date(item.rentalStartDate).getTime()) / (1000 * 60 * 60 * 24)));
          itemTotal = item.product.pricePaise * days;
        }

        if (item.product.securityDepositPaise) {
          itemTotal += item.product.securityDepositPaise;
        }

        subtotalPaise += itemTotal;
      } else {
        if (item.product.stock < item.quantity) {
          res.status(400).json({ success: false, message: `Insufficient stock for "${item.product.title}".` });
          return;
        }
        subtotalPaise += item.product.pricePaise * item.quantity;
      }

      deliveryFeePaise += (item.product.deliveryFeePaise || 0);
    }

    const taxPaise = Math.round(subtotalPaise * 0.05);
    const totalPaise = subtotalPaise + deliveryFeePaise + taxPaise;
    const amountRupees = (totalPaise / 100).toFixed(2);

    let addressId = body.addressId;
    if (!addressId && body.shippingAddress) {
      const newAddress = await prisma.address.create({
        data: {
          userId,
          ...body.shippingAddress,
          isDefault: true,
        }
      });
      addressId = newAddress.id;
    }

    const orderNumber = `KRISHI-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const merchant = await getActiveMerchantUpi();

    // Direct UPI Specification Standard URL (NPCI UPI linking standard):
    // upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR&tn=<NOTE>&tr=<REF_ID>
    const note = encodeURIComponent(`Order ${orderNumber}`);
    const encodedName = encodeURIComponent(merchant.name);
    const upiLink = `upi://pay?pa=${encodeURIComponent(merchant.upiId)}&pn=${encodedName}&am=${amountRupees}&cu=INR&tn=${note}&tr=${orderNumber}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        addressId: addressId || null,
        subtotalPaise,
        deliveryFeePaise,
        taxPaise,
        totalPaise,
        status: "PENDING_PAYMENT",
        upiIdUsed: merchant.upiId,
        notes: body.notes || null,
        items: {
          create: cartItems.map(c => ({
            productId: c.productId,
            sellerId: c.product.sellerId,
            quantity: c.quantity,
            unitPricePaise: c.product.pricePaise,
            totalPaise: c.isRental ? subtotalPaise : (c.product.pricePaise * c.quantity),
            itemType: c.product.type,
            rentalDaysOrHours: c.isRental ? c.rentalUnits : null,
          }))
        }
      }
    });

    // Record initial transaction
    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        gateway: "DIRECT_UPI",
        gatewayOrderId: orderNumber,
        amountPaise: totalPaise,
        currency: "INR",
        status: "PENDING",
        vpa: merchant.upiId,
      }
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        amountPaise: totalPaise,
        amountRupees,
        status: order.status,
      },
      directUpi: {
        merchantUpiId: merchant.upiId,
        merchantName: merchant.name,
        amountRupees,
        orderNumber,
        upiLink, // For Pay Now button / direct app invocation
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Customer Submits 12-Digit UTR / Bank Reference Number
export async function submitPaymentUtr(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { orderId, utrNumber, payerUpiId } = submitUtrSchema.parse(req.body);
    const cleanUtr = utrNumber.trim();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { transactions: true }
    });

    if (!order || order.userId !== userId) {
      res.status(404).json({ success: false, message: "Order not found or unauthorized." });
      return;
    }

    if (order.status === "CONFIRMED") {
      res.status(400).json({ success: false, message: "This order has already been verified and paid." });
      return;
    }

    // Check for duplicate UTR usage across confirmed or pending orders
    const duplicateUtr = await prisma.order.findFirst({
      where: {
        utrNumber: cleanUtr,
        id: { not: orderId },
        status: { in: ["CONFIRMED", "PAYMENT_SUBMITTED"] }
      }
    });

    if (duplicateUtr) {
      res.status(400).json({
        success: false,
        message: `This UTR reference (${cleanUtr}) has already been submitted for another order. Please check your bank transaction statement.`
      });
      return;
    }

    // Update order status to PAYMENT_SUBMITTED (Awaiting Admin Bank Credit Check)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAYMENT_SUBMITTED",
        utrNumber: cleanUtr,
        payerUpiId: payerUpiId || null,
        paymentSubmittedAt: new Date(),
      }
    });

    await prisma.paymentTransaction.updateMany({
      where: { orderId },
      data: {
        gatewayPaymentId: cleanUtr,
        status: "SUBMITTED",
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "CUSTOMER_SUBMITTED_UTR",
        detailsJson: JSON.stringify({ orderId, orderNumber: order.orderNumber, utr: cleanUtr })
      }
    });

    res.json({
      success: true,
      message: "UTR submitted successfully! Your order is now in verification queue.",
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors?.[0]?.message || error.message });
  }
}

// 4. Admin Verification Endpoint: Confirm or Reject based on Real Bank Credit
export async function verifyOrderPaymentByAdmin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;
    const { decision, rejectionReason } = adminVerifySchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { product: true } }
      }
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    if (order.status === "CONFIRMED") {
      res.status(400).json({ success: false, message: "Order is already verified as Paid." });
      return;
    }

    if (decision === "CONFIRM") {
      // Execute Atomic DB Transaction: deduct stock or confirm rental schedule
      await prisma.$transaction(async (tx) => {
        // 1. Mark order CONFIRMED
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "CONFIRMED",
            verifiedAt: new Date(),
            rejectionReason: null,
          }
        });

        // 2. Mark Transaction SUCCESS
        await tx.paymentTransaction.updateMany({
          where: { orderId },
          data: { status: "SUCCESS" }
        });

        // 3. Process Rental and Sales Items
        const userCart = await tx.cartItem.findMany({
          where: { userId: order.userId },
          include: { product: true }
        });

        for (const cart of userCart) {
          if (cart.isRental && cart.rentalStartDate && cart.rentalEndDate) {
            await tx.rentalBooking.create({
              data: {
                userId: order.userId,
                productId: cart.productId,
                orderId: order.id,
                startDate: cart.rentalStartDate,
                endDate: cart.rentalEndDate,
                rateUnit: cart.rentalRateUnit || "DAY",
                unitsBooked: cart.rentalUnits || 1,
                rentalFeePaise: cart.product.pricePaise,
                depositPaise: cart.product.securityDepositPaise || 0,
                totalPaise: order.totalPaise,
                status: "CONFIRMED",
              }
            });
          } else {
            await tx.product.update({
              where: { id: cart.productId },
              data: { stock: { decrement: cart.quantity } }
            });
          }
        }

        // 4. Clear cart
        await tx.cartItem.deleteMany({ where: { userId: order.userId } });

        // 5. Audit Log
        await tx.auditLog.create({
          data: {
            userId: req.user!.id,
            action: "ADMIN_CONFIRMED_DIRECT_UPI",
            detailsJson: JSON.stringify({
              orderId,
              orderNumber: order.orderNumber,
              utrNumber: order.utrNumber,
              amountPaise: order.totalPaise,
            })
          }
        });
      });

      // Send confirmation receipt to farmer's email
      await sendOrderReceiptEmail(
        order.user.email,
        order.orderNumber,
        order.totalPaise,
        order.items.map(i => `${i.product.title} (x${i.quantity})`).join(", ")
      );

      res.json({
        success: true,
        message: `Order #${order.orderNumber} successfully confirmed as PAID upon verified bank credit!`,
        orderNumber: order.orderNumber,
        status: "CONFIRMED"
      });
    } else {
      // REJECT DECISION
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "REJECTED",
          verifiedAt: new Date(),
          rejectionReason: rejectionReason || "UTR not found in merchant bank account.",
        }
      });

      await prisma.paymentTransaction.updateMany({
        where: { orderId },
        data: { status: "FAILED", errorMessage: rejectionReason }
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: "ADMIN_REJECTED_DIRECT_UPI",
          detailsJson: JSON.stringify({
            orderId,
            orderNumber: order.orderNumber,
            reason: rejectionReason,
          })
        }
      });

      res.json({
        success: true,
        message: `Order #${order.orderNumber} payment rejected. Customer notified.`,
        status: "REJECTED"
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Update Merchant UPI Settings (Admin Only)
export async function updateMerchantUpiConfig(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { upiId, name } = req.body;
    if (!upiId) {
      res.status(400).json({ success: false, message: "Valid Merchant UPI ID is required." });
      return;
    }

    await prisma.platformSetting.upsert({
      where: { key: "MERCHANT_UPI_ID" },
      update: { value: upiId.trim() },
      create: { key: "MERCHANT_UPI_ID", value: upiId.trim(), description: "Active Merchant VPA for QR and links" }
    });

    if (name) {
      await prisma.platformSetting.upsert({
        where: { key: "MERCHANT_NAME" },
        update: { value: name.trim() },
        create: { key: "MERCHANT_NAME", value: name.trim(), description: "Merchant Business Name on UPI" }
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "MERCHANT_UPI_SETTING_UPDATED",
        detailsJson: JSON.stringify({ upiId, name })
      }
    });

    res.json({
      success: true,
      message: "Merchant UPI configuration saved successfully!",
      data: { upiId, name }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}