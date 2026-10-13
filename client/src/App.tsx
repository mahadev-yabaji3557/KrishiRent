import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Navbar, Footer } from "./components/NavbarFooter";
import { HomePage } from "./pages/HomePage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { CartCheckoutPage } from "./pages/CartCheckoutPage";
import { AuthPage } from "./pages/AuthPage";
import { CustomerDashboardPage } from "./pages/CustomerDashboardPage";
import { SellerDashboardPage } from "./pages/SellerDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { LegalAndInfoPages } from "./pages/LegalAndInfoPages";

export function App() {
 return (
  <AppProvider>
   <BrowserRouter>
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-100 selection:text-emerald-900">
     <Navbar />
     <main className="flex-1">
      <Routes>
       {/* Home */}
       <Route path="/" element={<HomePage />} />

       {/* Machinery Rentals */}
       <Route
        path="/rentals"
        element={
         <MarketplacePage
          listingType="RENTAL"
          pageTitle="Farm Machinery & Tractor Rentals"
          pageSubtitle="Tractors, Harvesters, Rotavators & Tillers with Hourly, Daily or Per-Acre Booking"
         />
        }
       />

       {/* Equipment Sales */}
       <Route
        path="/sales"
        element={
         <MarketplacePage
          listingType="SALE"
          pageTitle="Certified New & Used Farming Machinery"
          pageSubtitle="Inspected tractors, implements, power tillers and pumps for direct sale"
         />
        }
       />

       {/* Agro Supplies: Fertilizers & Seeds */}
       <Route
        path="/supplies"
        element={
         <MarketplacePage
          listingType="SUPPLY"
          pageTitle="Fertilizers, Certified Seeds & Crop Protection"
          pageSubtitle="IFFCO Khad, organic manure, CIB-registered pesticides and certified hybrid seeds"
         />
        }
       />

       {/* Product / Machinery Detail */}
       <Route path="/product/:id" element={<ProductDetailsPage />} />

       {/* Cart & Razorpay UPI Checkout */}
       <Route path="/cart" element={<CartCheckoutPage />} />

       {/* Auth: Email OTP flow */}
       <Route path="/auth" element={<AuthPage />} />

       {/* Dashboards */}
       <Route path="/dashboard" element={<CustomerDashboardPage />} />
       <Route path="/seller-dashboard" element={<SellerDashboardPage />} />
       <Route path="/admin" element={<AdminDashboardPage />} />

       {/* Legal & Info */}
       <Route path="/faq" element={<LegalAndInfoPages type="faq" />} />
       <Route path="/refund-policy" element={<LegalAndInfoPages type="refund" />} />
       <Route path="/shipping" element={<LegalAndInfoPages type="shipping" />} />
       <Route path="/contact" element={<LegalAndInfoPages type="contact" />} />
       <Route path="/terms" element={<LegalAndInfoPages type="terms" />} />
       <Route path="/privacy" element={<LegalAndInfoPages type="privacy" />} />
       <Route path="/how-it-works" element={<LegalAndInfoPages type="how-it-works" />} />
      </Routes>
     </main>
     <Footer />
    </div>
   </BrowserRouter>
  </AppProvider>
 );
}

export default App;