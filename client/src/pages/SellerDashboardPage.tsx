import React, { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";
import { 
  Store, 
  PlusCircle, 
  Tractor, 
  TrendingUp, 
  Calendar, 
  Package, 
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export const SellerDashboardPage: React.FC = () => {
  const { user, token } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Listing State
  const [title, setTitle] = useState("");
  const [titleMr, setTitleMr] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"RENTAL" | "SALE" | "SUPPLY">("RENTAL");
  const [priceRupees, setPriceRupees] = useState("");
  const [hourlyRateRupees, setHourlyRateRupees] = useState("");
  const [securityDepositRupees, setSecurityDepositRupees] = useState("");
  const [stock, setStock] = useState(1);
  const [imageUrl, setImageUrl] = useState("");
  const [villageTown, setVillageTown] = useState("");
  const [district, setDistrict] = useState("Pune");
  const [creating, setCreating] = useState(false);

  const fetchSellerData = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/seller/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [token]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !priceRupees) {
      alert("Please fill in title and pricing.");
      return;
    }

    setCreating(true);
    try {
      // Find default category
      const catRes = await axios.get("http://localhost:5000/api/products/categories");
      const matchedCat = catRes.data.data.find((c: any) => c.type === type) || catRes.data.data[0];

      await axios.post(
        "http://localhost:5000/api/seller/products",
        {
          title,
          titleMr: titleMr || null,
          description,
          type,
          categoryId: matchedCat.id,
          pricePaise: Math.round(Number(priceRupees) * 100),
          hourlyRatePaise: hourlyRateRupees ? Math.round(Number(hourlyRateRupees) * 100) : null,
          securityDepositPaise: securityDepositRupees ? Math.round(Number(securityDepositRupees) * 100) : null,
          stock: Number(stock),
          villageTown: villageTown || "Baramati",
          district,
          state: "Maharashtra",
          images: imageUrl ? [imageUrl] : ["https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800"],
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Equipment listed successfully!");
      setShowAddModal(false);
      setTitle("");
      setPriceRupees("");
      fetchSellerData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add listing");
    } finally {
      setCreating(false);
    }
  };

  if (!user || user.role !== "SELLER" && user.role !== "ADMIN") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <Store className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Seller Account Required</h2>
        <p className="text-stone-500 text-sm">
          Please register or sign in as an agricultural machinery owner or farm supply merchant.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Seller Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-stone-900">
              {data?.seller?.businessName || "Agro Machinery Rentals Hub"}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Merchant
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {data?.seller?.farmOrShopAddress}, {data?.seller?.district} ({data?.seller?.state})
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-sm shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          List New Machinery / Product
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block">Total Equipment Listed</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {data?.stats?.totalProducts || 0}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block">Incoming Rental Bookings</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {data?.stats?.totalBookings || 0}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block">Supplies Sold</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {data?.stats?.totalSales || 0}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block">Total Merchant Earnings</span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">
            ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{((data?.stats?.earningsPaise || 0) / 100).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Active Listings Grid */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-bold text-stone-900 text-lg">My Machinery & Inventory</h3>
        <div className="divide-y divide-stone-100">
          {data?.seller?.products?.map((p: any) => (
            <div key={p.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded">
                  {p.type}
                </span>
                <h4 className="font-bold text-stone-900 text-sm mt-1">{p.title}</h4>
                <p className="text-xs text-stone-500">
                  Daily: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{p.pricePaise / 100} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Stock: {p.stock} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Bookings: {p._count?.rentalBookings || 0}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-green-50 text-green-700 font-semibold px-2.5 py-1 rounded-md">
                  Active in Marketplace
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-black text-stone-900 text-lg">List New Machinery or Agricultural Supply</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700">ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Listing Type</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                >
                  <option value="RENTAL">Machinery Rental (Tractor, Rotavator, Harvester)</option>
                  <option value="SALE">Equipment Sale (Used/New Machinery)</option>
                  <option value="SUPPLY">Agricultural Supplies (Fertilizers, Seeds, Sprays)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. John Deere 5050D Tractor (50 HP)"
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Title (Marathi - Optional)</label>
                <input
                  type="text"
                  value={titleMr}
                  onChange={(e) => setTitleMr(e.target.value)}
                  placeholder="ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾. ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚Â«ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚Â«ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚Â¦ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°"
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Base Price / Day (ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹)</label>
                  <input
                    type="number"
                    required
                    value={priceRupees}
                    onChange={(e) => setPriceRupees(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Hourly Rate (ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹ - Optional)</label>
                  <input
                    type="number"
                    value={hourlyRateRupees}
                    onChange={(e) => setHourlyRateRupees(e.target.value)}
                    placeholder="e.g. 300"
                    className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Refundable Deposit (ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹)</label>
                  <input
                    type="number"
                    value={securityDepositRupees}
                    onChange={(e) => setSecurityDepositRupees(e.target.value)}
                    placeholder="e.g. 3000"
                    className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Available Units / Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Description & Specifications</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Condition, horsepower, implements included..."
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-xs"
                >
                  {creating ? "Submitting..." : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};