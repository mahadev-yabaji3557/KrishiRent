import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Product } from "../types";
import { ProductCard } from "../components/ProductCard";
import { useApp } from "../context/AppContext";
import { 
  Tractor, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  CalendarCheck, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  Truck,
  Leaf,
  Layers
} from "lucide-react";

export const HomePage: React.FC = () => {
  const { t, language } = useApp();
  const [rentals, setRentals] = useState<Product[]>([]);
  const [supplies, setSupplies] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [rentalRes, supplyRes, catRes] = await Promise.all([
          axios.get("http://localhost:5000/api/products?type=RENTAL&limit=4"),
          axios.get("http://localhost:5000/api/products?type=SUPPLY&limit=4"),
          axios.get("http://localhost:5000/api/products/categories"),
        ]);
        if (rentalRes.data.success) setRentals(rentalRes.data.data);
        if (supplyRes.data.success) setSupplies(supplyRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
      } catch (err) {
        console.error("Home data load error", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/rentals?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-stone-900 text-white overflow-hidden py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-green-700/60 backdrop-blur-sm border border-green-500/30 text-green-200 px-3.5 py-1.5 rounded-full text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Government Compliant ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Authentic UPI Checkout</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {language === "mr" 
                ? "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Âµ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¸" 
                : "Rent Farm Machinery & Buy Certified Agro Supplies Online"}
            </h1>

            <p className="text-green-100/90 text-base sm:text-lg max-w-2xl leading-relaxed">
              Book tractors, rotavators, and harvesters on hourly, daily, or per-acre rates with verified local owners. Pay instantly and safely via Google Pay, PhonePe, or Paytm UPI.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl shadow-xl max-w-xl flex items-center gap-2">
              <div className="pl-3 text-stone-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full text-stone-800 text-sm focus:outline-none placeholder-stone-400 py-2"
              />
              <button
                type="submit"
                className="btn-primary text-sm whitespace-nowrap px-6 py-2.5 rounded-xl shadow-md"
              >
                Search
              </button>
            </form>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-green-700/50 max-w-lg text-center sm:text-left">
              <div>
                <span className="block text-2xl font-black text-amber-400">500+</span>
                <span className="text-xs text-green-200">Machinery Rentals</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-amber-400">100%</span>
                <span className="text-xs text-green-200">Verified Sellers</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-amber-400">0%</span>
                <span className="text-xs text-green-200">Double Bookings</span>
              </div>
            </div>
          </div>

          {/* Hero Feature Highlight Card */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2 text-amber-300">
              <Tractor className="w-5 h-5" />
              Kisan Quick Machinery Booking
            </h3>
            <p className="text-sm text-stone-200 leading-relaxed">
              Need emergency rotavator tillage or combine harvesting before rains? Browse nearby available machinery with upfront rates, driver options, and instant UPI confirmations.
            </p>
            <div className="space-y-3 text-xs text-green-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero hidden charges ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Upfront refundable deposit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct delivery to your farm village</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>CIB-certified pesticide and IFFCO fertilizer tags</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Link to="/rentals" className="btn-secondary w-full text-xs font-semibold py-2.5">
                Explore Rentals
              </Link>
              <Link to="/supplies" className="btn-outline bg-white/20 hover:bg-white/30 text-white border-transparent w-full text-xs font-semibold py-2.5">
                Browse Supplies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {language === "mr" ? "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â" : "Agricultural Marketplace Categories"}
            </h2>
            <p className="text-sm text-stone-500">
              Choose from heavy tractors, implements, fertilizers, or hybrid seeds
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.type === "RENTAL" ? `/rentals?category=${cat.slug}` : `/supplies?category=${cat.slug}`}
              className="kisan-card p-4 hover:border-emerald-600 transition group flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl mb-2 block">
                  {cat.type === "RENTAL" ? "ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â¡Ãƒâ€¦Ã¢â‚¬Å“" : cat.type === "SALE" ? "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â" : "ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã¢â‚¬â„¢Ãƒâ€šÃ‚Â±"}
                </span>
                <h4 className="font-bold text-stone-900 text-sm group-hover:text-emerald-700 transition">
                  {language === "mr" && cat.nameMr ? cat.nameMr : cat.name}
                </h4>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                  {cat.description}
                </p>
              </div>
              <div className="mt-3 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <span>Browse {cat._count?.products || ""} listings</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Machinery for Rent */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
              <Tractor className="w-4 h-4" />
              Available In Your District
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {language === "mr" ? "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â§ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬" : "Popular Farm Machinery for Rent"}
            </h2>
          </div>
          <Link to="/rentals" className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 bg-stone-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rentals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* How Machinery Rental Works */}
      <section className="bg-emerald-50 border-y border-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              How KrishiRent Works for Farmers
            </h2>
            <p className="text-stone-600 text-sm mt-2">
              Simple, transparent 4-step process designed for Indian farmers and village entrepreneurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h4 className="font-bold text-stone-900 mb-1">Select Machinery</h4>
              <p className="text-xs text-stone-500">
                Browse verified tractors, harvesters or sprayers in your taluka/district.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h4 className="font-bold text-stone-900 mb-1">Choose Dates</h4>
              <p className="text-xs text-stone-500">
                Real-time calendar prevents double bookings and locks your preferred slot.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h4 className="font-bold text-stone-900 mb-1">Pay with UPI</h4>
              <p className="text-xs text-stone-500">
                Pay securely via Google Pay, PhonePe, or Paytm with instant server verification.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h4 className="font-bold text-stone-900 mb-1">Farm Delivery & Work</h4>
              <p className="text-xs text-stone-500">
                Machinery is delivered with operator or for pickup. Complete your field work hassle-free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fertilizers & Certified Seeds */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
              <Leaf className="w-4 h-4 text-emerald-600" />
              Subsidized & Certified Agro Inputs
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {language === "mr" ? "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£" : "Fertilizers, Seeds & Crop Protection"}
            </h2>
          </div>
          <Link to="/supplies" className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {supplies.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Kisan Trust & Helpline Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-800 via-stone-800 to-green-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-300">
              APMC & Government Agricultural Partnership
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Need assistance with Tractor booking or Fertilizer delivery?
            </h3>
            <p className="text-stone-300 text-sm max-w-xl">
              Our rural Kisan field managers are available on phone & WhatsApp across Maharashtra and Indian agricultural belts.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <a
              href="tel:18001801551"
              className="btn-secondary px-6 py-3 rounded-xl font-bold text-sm shadow-lg whitespace-nowrap"
            >
              Call 1800-180-1551 (Toll-Free)
            </a>
            <Link
              to="/contact"
              className="btn-outline bg-white/10 hover:bg-white/20 text-white border-white/30 px-6 py-3 rounded-xl text-sm"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};