import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Tractor, 
  ShoppingBag, 
  PhoneCall, 
  User as UserIcon, 
  ShoppingCart, 
  Menu, 
  X, 
  Globe, 
  ShieldCheck, 
  Store,
  LayoutDashboard
} from "lucide-react";
import { useApp } from "../context/AppContext";

export const Navbar: React.FC = () => {
  const { user, language, setLanguage, t, cartItems, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "mr" : "en");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      {/* Top Kisan Toll-Free Bar */}
      <div className="bg-green-900 text-green-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-green-400" />
            <span className="font-medium">{t.helplineTitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1 text-green-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Govt & CIB Reg. Compliant Platform
            </span>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 bg-green-800 hover:bg-green-700 text-white px-2.5 py-0.5 rounded text-xs transition"
            >
              <Globe className="w-3 h-3 text-amber-400" />
              <span>{language === "en" ? "ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ (MR)" : "English (EN)"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-700 to-green-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Tractor className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-green-900 block leading-tight">
                {t.brandName}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-700 block">
                Agro Rental & Supply Hub
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700">
            <Link to="/" className="hover:text-green-700 transition">
              {t.navHome}
            </Link>
            <Link to="/rentals" className="hover:text-green-700 flex items-center gap-1 transition">
              <Tractor className="w-4 h-4 text-green-600" />
              {t.navRentals}
            </Link>
            <Link to="/sales" className="hover:text-green-700 transition">
              {t.navEquipment}
            </Link>
            <Link to="/supplies" className="hover:text-green-700 transition">
              {t.navSupplies}
            </Link>
            {user?.role === "SELLER" && (
              <Link to="/seller-dashboard" className="text-amber-800 font-semibold hover:text-amber-900 flex items-center gap-1">
                <Store className="w-4 h-4" />
                {t.navSellerHub}
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link to="/admin" className="text-purple-800 font-semibold hover:text-purple-900 flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" />
                {t.navAdmin}
              </Link>
            )}
          </nav>

          {/* Right Actions: Cart & Auth */}
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-stone-700 hover:text-green-700 rounded-lg hover:bg-stone-100 transition"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-800 text-sm font-medium"
                >
                  <UserIcon className="w-4 h-4 text-green-700" />
                  <span>{user.name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="text-xs text-stone-500 hover:text-red-600 font-medium px-2 py-1"
                >
                  {t.navSignOut}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth?mode=signin"
                  className="text-sm font-medium text-green-800 hover:text-green-900 px-3 py-1.5 rounded-lg hover:bg-green-50 transition"
                >
                  {t.navSignIn}
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="text-sm font-medium bg-green-700 hover:bg-green-800 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition"
                >
                  {t.navRegister}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-stone-800 hover:text-green-700"
          >
            {t.navHome}
          </Link>
          <Link
            to="/rentals"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-stone-800 hover:text-green-700"
          >
            ÃƒÂ°Ã…Â¸Ã…Â¡Ã…â€œ {t.navRentals}
          </Link>
          <Link
            to="/sales"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-stone-800 hover:text-green-700"
          >
            ÃƒÂ¢Ã…Â¡Ã¢â€žÂ¢ÃƒÂ¯Ã‚Â¸Ã‚Â {t.navEquipment}
          </Link>
          <Link
            to="/supplies"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-stone-800 hover:text-green-700"
          >
            ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â± {t.navSupplies}
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-green-800"
            >
              ÃƒÂ°Ã…Â¸Ã‚Â§Ã¢â‚¬ËœÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â¾ {t.navDashboard}
            </Link>
          )}
          {user?.role === "SELLER" && (
            <Link
              to="/seller-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-amber-800"
            >
              ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Â¬ {t.navSellerHub}
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-purple-800"
            >
              ÃƒÂ¢Ã…Â¡Ã¢â€žÂ¢ÃƒÂ¯Ã‚Â¸Ã‚Â {t.navAdmin}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3 text-white">
              <Tractor className="w-6 h-6 text-green-500" />
              <span className="font-bold text-lg">KrishiRent & AgroMart</span>
            </div>
            <p className="text-sm text-stone-400 mb-4 leading-relaxed">
              Empowering Indian farmers with affordable farm mechanization, reliable machinery rentals, and certified agricultural inputs with authentic UPI payments.
            </p>
            <div className="text-xs text-stone-500">
              Approved by APMC Partners & Kisan Vikas Forum
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/rentals" className="hover:text-green-400">Tractor & Harvester Rentals</Link></li>
              <li><Link to="/rentals" className="hover:text-green-400">Rotavator & Plough Implements</Link></li>
              <li><Link to="/sales" className="hover:text-green-400">Certified Used Tractors</Link></li>
              <li><Link to="/supplies" className="hover:text-green-400">IFFCO Khad & Organic Manure</Link></li>
              <li><Link to="/supplies" className="hover:text-green-400">Certified Seeds & Bio-Sprays</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Farmer Support & Trust</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-green-400">Frequently Asked Questions (FAQ)</Link></li>
              <li><Link to="/how-it-works" className="hover:text-green-400">How Machinery Rental Works</Link></li>
              <li><Link to="/contact" className="hover:text-green-400">Kisan Contact & APMC Centers</Link></li>
              <li><Link to="/safety-guidelines" className="hover:text-green-400">Pesticide & Safety Protocols</Link></li>
              <li className="text-green-400 font-semibold">Toll-Free: 1800-180-1551</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Legal & Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-green-400">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-green-400">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-green-400">Refund & Security Deposit Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-green-400">Machinery Delivery & Transport</Link></li>
            </ul>
            <div className="mt-4 pt-4 border-t border-stone-800">
              <span className="text-xs text-amber-400 font-medium block">
                ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â³ Secure UPI Payments:
              </span>
              <span className="text-xs text-stone-400 block mt-1">
                Google Pay ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ PhonePe ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Paytm ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ BHIM UPI
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-4">
          <p>Ãƒâ€šÃ‚Â© {new Date().getFullYear()} KrishiRent & AgroMart Technologies Pvt Ltd. All rights reserved.</p>
          <p>Made with ÃƒÂ¢Ã‚ÂÃ‚Â¤ÃƒÂ¯Ã‚Â¸Ã‚Â for Indian Farmers (ÃƒÂ Ã‚Â¤Ã‚Â­ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ÃƒÂ Ã‚Â¤Ã‚Â¯ ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ ÃƒÂ Ã‚Â¤Ã‚Â¬ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã‚Â§ÃƒÂ Ã‚Â¥Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¤)</p>
        </div>
      </div>
    </footer>
  );
};