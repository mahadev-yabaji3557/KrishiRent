import { Router } from "express";
import { 
  getProducts, 
  getProductById, 
  checkRentalAvailability, 
  getCategories 
} from "../controllers/productController";
import { getCart, addToCart, removeCartItem, clearCart } from "../controllers/cartController";
import { createCheckoutOrder, verifyPayment, handleRazorpayWebhook } from "../controllers/paymentController";
import { 
  getCustomerOrders, 
  getCustomerRentals, 
  getSellerDashboard, 
  createOrUpdateSellerProduct, 
  getAdminOverview, 
  approveSeller 
} from "../controllers/dashboardController";
import { requireAuth, requireRole } from "../middleware/auth";

export const productRouter = Router();
productRouter.get("/categories", getCategories);
productRouter.get("/availability", checkRentalAvailability);
productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);

export const cartRouter = Router();
cartRouter.use(requireAuth);
cartRouter.get("/", getCart);
cartRouter.post("/add", addToCart);
cartRouter.delete("/item/:id", removeCartItem);
cartRouter.delete("/clear", clearCart);

export const paymentRouter = Router();
paymentRouter.post("/create-order", requireAuth, createCheckoutOrder);
paymentRouter.post("/verify-payment", requireAuth, verifyPayment);
paymentRouter.post("/webhook", handleRazorpayWebhook);

export const customerRouter = Router();
customerRouter.use(requireAuth);
customerRouter.get("/orders", getCustomerOrders);
customerRouter.get("/rentals", getCustomerRentals);

export const sellerRouter = Router();
sellerRouter.use(requireAuth);
sellerRouter.use(requireRole(["SELLER", "ADMIN"]));
sellerRouter.get("/dashboard", getSellerDashboard);
sellerRouter.post("/products", createOrUpdateSellerProduct);

export const adminRouter = Router();
adminRouter.use(requireAuth);
adminRouter.use(requireRole(["ADMIN"]));
adminRouter.get("/overview", getAdminOverview);
adminRouter.patch("/sellers/:sellerId/verify", approveSeller);