import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Product } from "../types";
import { ProductCard } from "../components/ProductCard";
import { useApp } from "../context/AppContext";
import { Filter, SlidersHorizontal, Search, RefreshCw } from "lucide-react";

interface MarketplacePageProps {
  listingType?: "RENTAL" | "SALE" | "SUPPLY";
  pageTitle: string;
  pageSubtitle: string;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ 
  listingType, 
  pageTitle, 
  pageSubtitle 
}) => {
  const { language } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [district, setDistrict] = useState(searchParams.get("district") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (listingType) params.type = listingType;
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (district) params.district = district;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy === "price_asc" || sortBy === "price_desc") params.sortBy = sortBy;

      const res = await axios.get("http://localhost:5000/api/products", { params });
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios.get("http://localhost:5000/api/products/categories").then(res => {
      if (res.data.success) {
        if (listingType) {
          setCategories(res.data.data.filter((c: any) => c.type === listingType));
        } else {
          setCategories(res.data.data);
        }
      }
    });
  }, [listingType]);

  useEffect(() => {
    fetchListings();
  }, [listingType, selectedCategory, district, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setDistrict("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setSearchParams({});
    fetchListings();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          {pageTitle}
        </h1>
        <p className="text-sm text-stone-500 mt-1 max-w-2xl">
          {pageSubtitle}
        </p>

        {/* Search input bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by machinery name, model, district or village..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
            />
          </div>
          <button type="submit" className="btn-primary text-sm px-6 py-2.5 rounded-xl whitespace-nowrap">
            Apply Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <div className="space-y-6 bg-white p-5 rounded-2xl border border-stone-200 h-fit shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <span>Filters</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-stone-500 hover:text-emerald-700 flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="space-y-1.5 text-sm">
              <label className="flex items-center gap-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                <input
                  type="radio"
                  name="cat"
                  checked={selectedCategory === ""}
                  onChange={() => setSelectedCategory("")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>All Categories</span>
              </label>
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 cursor-pointer">
                  <input
                    type="radio"
                    name="cat"
                    checked={selectedCategory === c.slug}
                    onChange={() => setSelectedCategory(c.slug)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{language === "mr" && c.nameMr ? c.nameMr : c.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              District / Region
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full text-sm border border-stone-300 rounded-lg p-2 bg-stone-50 focus:bg-white focus:outline-none"
            >
              <option value="">All Maharashtra & India</option>
              <option value="Pune">Pune (ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡)</option>
              <option value="Satara">Satara (ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾)</option>
              <option value="Kolhapur">Kolhapur (ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°)</option>
              <option value="Solapur">Solapur (ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°)</option>
              <option value="Nashik">Nashik (ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢)</option>
              <option value="Ahmednagar">Ahmednagar (ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°)</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Price Range (ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-stone-50"
              />
              <span className="text-stone-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-stone-50"
              />
            </div>
            <button
              onClick={fetchListings}
              className="w-full mt-2 text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium py-1.5 rounded-lg transition"
            >
              Apply Price
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Sort Bar */}
          <div className="flex items-center justify-between text-xs text-stone-600 bg-white p-3 rounded-xl border border-stone-200">
            <span>Showing <strong>{products.length}</strong> available listings</span>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="font-medium text-stone-500">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-stone-300 rounded-md p-1 bg-white focus:outline-none"
              >
                <option value="newest">Latest Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 bg-stone-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-stone-200">
              <p className="text-stone-500 text-sm">No items found matching your filters.</p>
              <button
                onClick={resetFilters}
                className="btn-outline text-xs mt-4 mx-auto"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};