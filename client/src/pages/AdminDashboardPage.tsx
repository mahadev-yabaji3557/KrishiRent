import React, { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../utils/config";
import { 
 LayoutDashboard, 
 CheckCircle2, 
 XCircle, 
 Clock, 
 QrCode, 
 Save, 
 Check, 
 Search, 
 Plus, 
 Pencil, 
 Trash2, 
 Wrench, 
 Package, 
 Layers, 
 X,
 IndianRupee
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
 const { user, token } = useApp();
 const [activeMainTab, setActiveMainTab] = useState<"CATALOG" | "PAYMENTS" | "AUDIT">("CATALOG");

 const [overview, setOverview] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 // Products & Catalog State
 const [products, setProducts] = useState<any[]>([]);
 const [categories, setCategories] = useState<any[]>([]);
 const [catalogLoading, setCatalogLoading] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
 const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");

 // Modal State for Add / Edit Product
 const [showProductModal, setShowProductModal] = useState(false);
 const [editingProduct, setEditingProduct] = useState<any | null>(null);
 const [savingProduct, setSavingProduct] = useState(false);

 // Product Form State
 const [formTitle, setFormTitle] = useState("");
 const [formTitleMr, setFormTitleMr] = useState("");
 const [formType, setFormType] = useState<"RENTAL" | "SUPPLY">("RENTAL");
 const [formCategoryId, setFormCategoryId] = useState("");
 const [formSubCategory, setFormSubCategory] = useState("");
 const [formPriceRupees, setFormPriceRupees] = useState("");
 const [formHourlyRateRupees, setFormHourlyRateRupees] = useState("");
 const [formSecurityDepositRupees, setFormSecurityDepositRupees] = useState("");
 const [formStock, setFormStock] = useState("1");
 const [formHorsepower, setFormHorsepower] = useState("");
 const [formDistrict, setFormDistrict] = useState("Pune");
 const [formVillageTown, setFormVillageTown] = useState("Baramati");
 const [formRegion, setFormRegion] = useState("Western Maharashtra");
 const [formImageUrl, setFormImageUrl] = useState("/images/products/mahindra-tractor.jpg");
 const [formDescription, setFormDescription] = useState("");
 const [formDescriptionMr, setFormDescriptionMr] = useState("");
 const [formTargetCrops, setFormTargetCrops] = useState("");
 const [formSuitableSoil, setFormSuitableSoil] = useState("");

 // Merchant UPI Configuration State
 const [merchantUpiId, setMerchantUpiId] = useState("");
 const [merchantName, setMerchantName] = useState("");
 const [isSavingUpi, setIsSavingUpi] = useState(false);
 const [upiSaveSuccess, setUpiSaveSuccess] = useState(false);

 // Verification Processing States
 const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
 const [rejectionReasonInput, setRejectionReasonInput] = useState<{ [key: string]: string }>({});

 const fetchAdminData = async () => {
  if (!token) return;
  try {
   const res = await axios.get(`${API_BASE_URL}/api/admin/overview`, {
    headers: { Authorization: `Bearer ${token}` }
   });
   if (res.data.success) {
    setOverview(res.data);
    if (res.data.activeMerchantUpi) {
     setMerchantUpiId(res.data.activeMerchantUpi.upiId || "");
     setMerchantName(res.data.activeMerchantUpi.name || "");
    }
   }
  } catch (err) {
   console.error(err);
  } finally {
   setLoading(false);
  }
 };

 const fetchProductsAndCategories = async () => {
  if (!token) return;
  setCatalogLoading(true);
  try {
   const [prodRes, catRes] = await Promise.all([
    axios.get(`${API_BASE_URL}/api/admin/products`, {
     headers: { Authorization: `Bearer ${token}` }
    }),
    axios.get(`${API_BASE_URL}/api/products/categories`)
   ]);

   if (prodRes.data.success) {
    setProducts(prodRes.data.data || []);
   }
   if (catRes.data.success) {
    setCategories(catRes.data.data || []);
   }
  } catch (err) {
   console.error("Failed to load catalog:", err);
  } finally {
   setCatalogLoading(false);
  }
 };

 useEffect(() => {
  fetchAdminData();
  fetchProductsAndCategories();
 }, [token]);

 const handleOpenAddModal = () => {
  setEditingProduct(null);
  setFormTitle("");
  setFormTitleMr("");
  setFormType("RENTAL");
  setFormCategoryId(categories[0]?.id || "");
  setFormSubCategory("Tractor");
  setFormPriceRupees("");
  setFormHourlyRateRupees("");
  setFormSecurityDepositRupees("");
  setFormStock("1");
  setFormHorsepower("47");
  setFormDistrict("Pune");
  setFormVillageTown("Baramati");
  setFormRegion("Western Maharashtra");
  setFormImageUrl("/images/products/mahindra-tractor.jpg");
  setFormDescription("");
  setFormDescriptionMr("");
  setFormTargetCrops("Sugarcane (ऊस), Soybean (सोयाबीन), Wheat (गहू)");
  setFormSuitableSoil("Heavy Black Cotton Soil (काळी कसदार जमीन)");
  setShowProductModal(true);
 };

 const handleOpenEditModal = (p: any) => {
  setEditingProduct(p);
  setFormTitle(p.title || "");
  setFormTitleMr(p.titleMr || "");
  setFormType(p.type || "RENTAL");
  setFormCategoryId(p.categoryId || categories[0]?.id || "");
  setFormSubCategory(p.subCategory || "");
  setFormPriceRupees(p.pricePaise ? String(p.pricePaise / 100) : "");
  setFormHourlyRateRupees(p.hourlyRatePaise ? String(p.hourlyRatePaise / 100) : "");
  setFormSecurityDepositRupees(p.securityDepositPaise ? String(p.securityDepositPaise / 100) : "");
  setFormStock(String(p.stock || 1));
  setFormHorsepower(p.horsepower ? String(p.horsepower) : "");
  setFormDistrict(p.district || "Pune");
  setFormVillageTown(p.villageTown || "Baramati");
  setFormRegion(p.maharashtraRegion || "Western Maharashtra");
  setFormImageUrl(p.images?.[0] || "/images/products/mahindra-tractor.jpg");
  setFormDescription(p.description || "");
  setFormDescriptionMr(p.descriptionMr || "");
  setFormTargetCrops(p.targetCrops || "");
  setFormSuitableSoil(p.suitableSoil || "");
  setShowProductModal(true);
 };

 const handleSaveProduct = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formTitle || !formPriceRupees || !formCategoryId) {
   alert("Please fill in the equipment title, category, and price.");
   return;
  }

  setSavingProduct(true);
  try {
   const payload = {
    title: formTitle,
    titleMr: formTitleMr || null,
    type: formType,
    categoryId: formCategoryId,
    subCategory: formSubCategory || null,
    pricePaise: Math.round(Number(formPriceRupees) * 100),
    hourlyRatePaise: formHourlyRateRupees ? Math.round(Number(formHourlyRateRupees) * 100) : null,
    securityDepositPaise: formSecurityDepositRupees ? Math.round(Number(formSecurityDepositRupees) * 100) : 0,
    stockQuantity: Number(formStock) || 1,
    hpRating: formHorsepower ? Number(formHorsepower) : null,
    district: formDistrict,
    villageTown: formVillageTown,
    regionMaharashtra: formRegion,
    images: [formImageUrl],
    description: formDescription || formTitle,
    descriptionMr: formDescriptionMr || null,
    targetCrops: formTargetCrops || null,
    suitableSoilTypes: formSuitableSoil || null,
   };

   if (editingProduct) {
    const res = await axios.put(
     `${API_BASE_URL}/api/admin/products/${editingProduct.id}`,
     payload,
     { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data.success) {
     alert("Equipment updated successfully!");
     setShowProductModal(false);
     fetchProductsAndCategories();
    }
   } else {
    const res = await axios.post(
     `${API_BASE_URL}/api/admin/products`,
     payload,
     { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data.success) {
     alert("New equipment created and listed across marketplace!");
     setShowProductModal(false);
     fetchProductsAndCategories();
    }
   }
  } catch (err: any) {
   alert(err.response?.data?.message || "Failed to save equipment.");
  } finally {
   setSavingProduct(false);
  }
 };

 const handleDeleteProduct = async (productId: string, title: string) => {
  if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
   return;
  }
  try {
   const res = await axios.delete(`${API_BASE_URL}/api/admin/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` }
   });
   if (res.data.success) {
    alert("Equipment deleted successfully.");
    fetchProductsAndCategories();
   }
  } catch (err: any) {
   alert(err.response?.data?.message || "Failed to delete equipment.");
  }
 };

 const handleSaveUpiConfig = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!merchantUpiId) {
   alert("Please enter a valid UPI ID (VPA).");
   return;
  }
  setIsSavingUpi(true);
  setUpiSaveSuccess(false);
  try {
   const res = await axios.post(
    `${API_BASE_URL}/api/admin/upi-config`,
    { upiId: merchantUpiId.trim(), name: merchantName.trim() },
    { headers: { Authorization: `Bearer ${token}` } }
   );
   if (res.data.success) {
    setUpiSaveSuccess(true);
    setTimeout(() => setUpiSaveSuccess(false), 3000);
    fetchAdminData();
   }
  } catch (err: any) {
   alert(err.response?.data?.message || "Failed to update UPI settings.");
  } finally {
   setIsSavingUpi(false);
  }
 };

 const handleVerifyOrderPayment = async (orderId: string, decision: "CONFIRM" | "REJECT") => {
  const reason = rejectionReasonInput[orderId];
  if (decision === "REJECT" && !reason) {
   alert("Please enter a reason for rejecting this payment.");
   return;
  }

  const confirmMsg = decision === "CONFIRM"
   ? "Have you verified the actual bank credit in your UPI/Bank statement for this UTR number?"
   : "Are you sure you want to reject this payment submission?";

  if (!window.confirm(confirmMsg)) return;

  setProcessingOrderId(orderId);
  try {
   const res = await axios.post(
    `${API_BASE_URL}/api/admin/orders/${orderId}/verify-payment`,
    { decision, rejectionReason: reason },
    { headers: { Authorization: `Bearer ${token}` } }
   );
   if (res.data.success) {
    alert(res.data.message);
    fetchAdminData();
   }
  } catch (err: any) {
   alert(err.response?.data?.message || "Failed to process verification.");
  } finally {
   setProcessingOrderId(null);
  }
 };

 if (!user || user.role !== "ADMIN") {
  return (
   <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
    <LayoutDashboard className="w-12 h-12 text-stone-400 mx-auto" />
    <h2 className="text-xl font-bold text-stone-900">Admin Governance Portal</h2>
    <p className="text-stone-500 text-sm">
     Strict authorization required. Please sign in with an administrator account (e.g. admin@krishirent.in).
    </p>
   </div>
  );
 }

 const filteredProducts = products.filter((p) => {
  const matchesSearch = 
   p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
   p.titleMr?.includes(searchQuery) ||
   p.district?.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesCategory = 
   selectedCategoryFilter === "ALL" || p.categoryId === selectedCategoryFilter;

  const matchesType = 
   selectedTypeFilter === "ALL" || p.type === selectedTypeFilter;

  return matchesSearch && matchesCategory && matchesType;
 });

 const rentalCount = products.filter(p => p.type === "RENTAL").length;
 const supplyCount = products.filter(p => p.type === "SUPPLY").length;

 return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
   {/* Header */}
   <div className="bg-purple-950 text-white p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
     <span className="text-xs uppercase tracking-wider font-semibold text-purple-300">
      Maharashtra Krishi Directorate & Admin Console
     </span>
     <h1 className="text-2xl font-black mt-1">Platform Control & Machinery Management</h1>
     <p className="text-xs text-purple-200 mt-1">
      Add & edit equipment, tractors, implements, and supplies across Maharashtra. Reconcile direct UPI bank payments.
     </p>
    </div>
    <div className="flex gap-4">
     <div className="bg-purple-900/60 border border-purple-800 p-3 rounded-xl text-center min-w-[100px]">
      <span className="text-[10px] text-purple-300 block">Total Catalog</span>
      <span className="text-xl font-black text-white">{products.length} Items</span>
     </div>
     <div className="bg-purple-900/60 border border-purple-800 p-3 rounded-xl text-center min-w-[100px]">
      <span className="text-[10px] text-purple-300 block">Pending UTRs</span>
      <span className="text-xl font-black text-amber-300">
       {overview?.stats?.pendingUtrCount || 0}
      </span>
     </div>
    </div>
   </div>

   {/* TAB SWITCHER */}
   <div className="flex border-b border-stone-200 gap-2">
    <button
     onClick={() => setActiveMainTab("CATALOG")}
     className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition-colors ${
      activeMainTab === "CATALOG"
       ? "border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-xl"
       : "border-transparent text-stone-500 hover:text-stone-900"
     }`}
    >
     <Wrench className="w-4 h-4" />
     <span>Equipments & Product Catalog</span>
     <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
      {products.length}
     </span>
    </button>

    <button
     onClick={() => setActiveMainTab("PAYMENTS")}
     className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition-colors ${
      activeMainTab === "PAYMENTS"
       ? "border-purple-700 text-purple-900 bg-purple-50/50 rounded-t-xl"
       : "border-transparent text-stone-500 hover:text-stone-900"
     }`}
    >
     <QrCode className="w-4 h-4" />
     <span>Bank UPI & Payment Reconciliation</span>
     {overview?.stats?.pendingUtrCount > 0 && (
      <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">
       {overview?.stats?.pendingUtrCount}
      </span>
     )}
    </button>

    <button
     onClick={() => setActiveMainTab("AUDIT")}
     className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition-colors ${
      activeMainTab === "AUDIT"
       ? "border-stone-800 text-stone-900 bg-stone-100 rounded-t-xl"
       : "border-transparent text-stone-500 hover:text-stone-900"
     }`}
    >
     <Clock className="w-4 h-4" />
     <span>Audit Logs</span>
    </button>
   </div>

   {/* TAB 1: EQUIPMENTS & PRODUCT CATALOG */}
   {activeMainTab === "CATALOG" && (
    <div className="space-y-6">
     {/* Quick Stat Cards */}
     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
       <span className="text-xs text-stone-500 block">Total Equipment & Items</span>
       <span className="text-2xl font-black text-stone-900">{products.length}</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
       <span className="text-xs text-stone-500 block">Machinery For Rent</span>
       <span className="text-2xl font-black text-emerald-700">{rentalCount}</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
       <span className="text-xs text-stone-500 block">Agro Supplies (Seeds/Khad)</span>
       <span className="text-2xl font-black text-blue-700">{supplyCount}</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
       <span className="text-xs text-stone-500 block">Total Units Available</span>
       <span className="text-2xl font-black text-purple-700">
        {products.reduce((acc, p) => acc + (p.stock || 0), 0)}
       </span>
      </div>
     </div>

     {/* Filter and Action Bar */}
     <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
       <div className="relative flex-1">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        <input
         type="text"
         placeholder="Search by equipment, tractor model, or district..."
         value={searchQuery}
         onChange={(e) => setSearchQuery(e.target.value)}
         className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50 focus:bg-white"
        />
       </div>

       <select
        value={selectedTypeFilter}
        onChange={(e) => setSelectedTypeFilter(e.target.value)}
        className="py-2 px-3 border border-stone-300 rounded-lg text-xs bg-stone-50"
       >
        <option value="ALL">All Types</option>
        <option value="RENTAL">Machinery Rentals</option>
        <option value="SUPPLY">Agri Supplies</option>
       </select>

       <select
        value={selectedCategoryFilter}
        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
        className="py-2 px-3 border border-stone-300 rounded-lg text-xs bg-stone-50"
       >
        <option value="ALL">All Categories</option>
        {categories.map((c) => (
         <option key={c.id} value={c.id}>
          {c.name}
         </option>
        ))}
       </select>
      </div>

      <button
       type="button"
       onClick={handleOpenAddModal}
       className="btn-primary bg-emerald-700 hover:bg-emerald-800 text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 whitespace-nowrap shadow-sm w-full md:w-auto justify-center"
      >
       <Plus className="w-4 h-4" />
       <span>Add New Equipment / Product</span>
      </button>
     </div>

     {/* Products Table */}
     <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {catalogLoading ? (
       <div className="p-12 text-center text-xs text-stone-400">Loading catalog items...</div>
      ) : filteredProducts.length === 0 ? (
       <div className="p-12 text-center text-xs text-stone-500">
        No equipment or products found matching your filter criteria.
       </div>
      ) : (
       <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
         <thead>
          <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
           <th className="py-3 px-4">Image</th>
           <th className="py-3 px-4">Equipment / Product</th>
           <th className="py-3 px-4">Category & Type</th>
           <th className="py-3 px-4">Pricing</th>
           <th className="py-3 px-4">Stock & Location</th>
           <th className="py-3 px-4 text-right">Actions</th>
          </tr>
         </thead>
         <tbody className="divide-y divide-stone-100">
          {filteredProducts.map((p) => {
           const img = p.images?.[0] || "/images/products/mahindra-tractor.jpg";
           return (
            <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
             <td className="py-3 px-4 w-16">
              <img
               src={img}
               alt={p.title}
               onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/products/mahindra-tractor.jpg";
               }}
               className="w-14 h-14 rounded-lg object-cover border border-stone-200 bg-stone-100"
              />
             </td>
             <td className="py-3 px-4 max-w-xs">
              <div className="font-bold text-stone-900 text-sm leading-tight">{p.title}</div>
              {p.titleMr && (
               <div className="text-[11px] text-stone-500 mt-0.5">{p.titleMr}</div>
              )}
              {p.horsepower && (
               <span className="inline-block mt-1 text-[10px] font-semibold bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                {p.horsepower} HP Rating
               </span>
              )}
             </td>
             <td className="py-3 px-4">
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
               p.type === "RENTAL"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-blue-100 text-blue-800"
              }`}>
               {p.type === "RENTAL" ? "RENTAL MACHINERY" : "AGRI SUPPLY"}
              </span>
              <div className="text-stone-500 text-[11px] mt-1">{p.category?.name || p.subCategory}</div>
             </td>
             <td className="py-3 px-4">
              <div className="font-bold text-stone-900 text-sm">
               ₹{(p.pricePaise / 100).toLocaleString("en-IN")}
               <span className="text-[10px] font-normal text-stone-500">
                {p.type === "RENTAL" ? "/day" : ""}
               </span>
              </div>
              {p.hourlyRatePaise && (
               <div className="text-[11px] text-stone-500">
                ₹{p.hourlyRatePaise / 100}/hr
               </div>
              )}
             </td>
             <td className="py-3 px-4">
              <div className="font-semibold text-stone-800">
               Stock: <span className="text-emerald-700 font-bold">{p.stock} units</span>
              </div>
              <div className="text-[11px] text-stone-500">
               {p.villageTown}, {p.district}
              </div>
             </td>
             <td className="py-3 px-4 text-right">
              <div className="flex items-center justify-end gap-2">
               <button
                type="button"
                onClick={() => handleOpenEditModal(p)}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                title="Edit Equipment Details"
               >
                <Pencil className="w-4 h-4" />
               </button>
               <button
                type="button"
                onClick={() => handleDeleteProduct(p.id, p.title)}
                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                title="Delete Equipment"
               >
                <Trash2 className="w-4 h-4" />
               </button>
              </div>
             </td>
            </tr>
           );
          })}
         </tbody>
        </table>
       </div>
      )}
     </div>
    </div>
   )}

   {/* TAB 2: BANK UPI & PAYMENT RECONCILIATION */}
   {activeMainTab === "PAYMENTS" && (
    <div className="space-y-6">
     {/* SECTION 1: MERCHANT DIRECT UPI CONFIGURATION */}
     <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-base font-bold text-stone-900">
       <QrCode className="w-5 h-5 text-emerald-700" />
       <span>Configurable Merchant Direct UPI Account</span>
      </div>
      <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
       Payments from customers go <strong>directly into your personal/business UPI account</strong> with 0% gateway commission. Updates to this UPI ID instantly change the dynamic QR code and deep-links across the website.
      </p>

      <form onSubmit={handleSaveUpiConfig} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
       <div>
        <label className="block text-stone-700 font-semibold mb-1">
         Active Merchant UPI ID (VPA) *
        </label>
        <input
         type="text"
         required
         value={merchantUpiId}
         onChange={(e) => setMerchantUpiId(e.target.value)}
         placeholder="e.g. 9356618282@okaxis or business@okhdfcbank"
         className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-mono text-xs focus:bg-white"
        />
       </div>

       <div>
        <label className="block text-stone-700 font-semibold mb-1">
         Merchant Business Name
        </label>
        <input
         type="text"
         value={merchantName}
         onChange={(e) => setMerchantName(e.target.value)}
         placeholder="e.g. KrishiRent AgroMart"
         className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs focus:bg-white"
        />
       </div>

       <div className="flex items-end">
        <button
         type="submit"
         disabled={isSavingUpi}
         className="btn-primary text-xs py-2.5 px-6 rounded-lg w-full sm:w-auto flex items-center justify-center gap-1.5"
        >
         <Save className="w-4 h-4" />
         <span>{isSavingUpi ? "Saving..." : "Save UPI Settings"}</span>
        </button>
       </div>
      </form>

      {upiSaveSuccess && (
       <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
        <Check className="w-4 h-4 text-emerald-600" />
        <span>Merchant UPI settings updated! Dynamic QR codes now link to {merchantUpiId}.</span>
       </div>
      )}
     </div>

     {/* SECTION 2: PENDING ORDERS - ACTUAL BANK CREDIT VERIFICATION QUEUE */}
     <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
       <div className="flex items-center gap-2 text-base font-bold text-stone-900">
        <Clock className="w-5 h-5 text-amber-600" />
        <span>Pending Payment Verification Queue ({overview?.pendingVerificationOrders?.length || 0})</span>
       </div>
       <span className="text-xs text-stone-500">
        Strict Rule: Verify actual bank credit before confirming
       </span>
      </div>

      {overview?.pendingVerificationOrders?.length === 0 ? (
       <div className="p-8 text-center text-xs text-stone-500 border border-dashed border-stone-200 rounded-xl">
        No pending UTR submissions awaiting verification. All orders reconciled!
       </div>
      ) : (
       <div className="divide-y divide-stone-100">
        {overview?.pendingVerificationOrders?.map((ord: any) => (
         <div key={ord.id} className="py-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1.5 flex-1">
           <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-900 text-sm">#{ord.orderNumber}</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
             UTR SUBMITTED
            </span>
            <span className="text-xs text-stone-400">
             {new Date(ord.paymentSubmittedAt).toLocaleString()}
            </span>
           </div>

           <div className="text-xs text-stone-600">
            Farmer: <strong>{ord.user?.name}</strong> ({ord.user?.phone} • {ord.user?.email})
           </div>

           {/* UTR and Payable Amount Box */}
           <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl flex flex-wrap items-center gap-4 text-xs font-mono">
            <div>
             <span className="text-stone-500 block text-[10px]">Submitted Bank UTR / RRN:</span>
             <strong className="text-emerald-800 text-sm tracking-wider">{ord.utrNumber}</strong>
            </div>
            <div className="border-l border-stone-200 pl-4">
             <span className="text-stone-500 block text-[10px]">Expected Credit Amount:</span>
             <strong className="text-stone-900 text-sm">₹{(ord.totalPaise / 100).toLocaleString("en-IN")}</strong>
            </div>
            {ord.payerUpiId && (
             <div className="border-l border-stone-200 pl-4">
              <span className="text-stone-500 block text-[10px]">Payer VPA:</span>
              <strong className="text-stone-700">{ord.payerUpiId}</strong>
             </div>
            )}
           </div>
          </div>

          {/* Admin Actions */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full lg:w-auto">
           <input
            type="text"
            placeholder="Rejection reason if rejected"
            value={rejectionReasonInput[ord.id] || ""}
            onChange={(e) => setRejectionReasonInput({ ...rejectionReasonInput, [ord.id]: e.target.value })}
            className="p-2 border border-stone-300 rounded-lg text-xs bg-stone-50 w-full sm:w-48"
           />
           <div className="flex gap-2 w-full sm:w-auto">
            <button
             type="button"
             disabled={processingOrderId === ord.id}
             onClick={() => handleVerifyOrderPayment(ord.id, "REJECT")}
             className="btn-outline border-red-200 text-red-700 hover:bg-red-50 text-xs py-2 px-3 rounded-lg flex-1 sm:flex-initial"
            >
             <XCircle className="w-4 h-4" />
             Reject
            </button>
            <button
             type="button"
             disabled={processingOrderId === ord.id}
             onClick={() => handleVerifyOrderPayment(ord.id, "CONFIRM")}
             className="btn-primary bg-emerald-700 hover:bg-emerald-800 text-xs py-2 px-4 rounded-lg flex-1 sm:flex-initial"
            >
             <CheckCircle2 className="w-4 h-4" />
             {processingOrderId === ord.id ? "Verifying..." : "Confirm Credit (Mark Paid)"}
            </button>
           </div>
          </div>
         </div>
        ))}
       </div>
      )}
     </div>
    </div>
   )}

   {/* TAB 3: AUDIT TRAIL */}
   {activeMainTab === "AUDIT" && (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
     <h3 className="font-bold text-stone-900 text-base">Payment & System Audit Trail</h3>
     <div className="divide-y divide-stone-100 text-xs">
      {overview?.auditLogs?.map((log: any) => (
       <div key={log.id} className="py-2.5 flex justify-between items-center">
        <div>
         <span className="font-bold text-stone-800">{log.action}</span>
         <span className="text-stone-400 ml-2">by {log.user?.name || "System"}</span>
        </div>
        <span className="text-stone-400">
         {new Date(log.createdAt).toLocaleString()}
        </span>
       </div>
      ))}
     </div>
    </div>
   )}

   {/* ADD / EDIT EQUIPMENT MODAL */}
   {showProductModal && (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
     <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8 shadow-2xl">
      <div className="flex justify-between items-center border-b border-stone-200 pb-3">
       <div>
        <h2 className="text-lg font-black text-stone-900">
         {editingProduct ? "Edit Equipment / Product" : "Add New Equipment or Input"}
        </h2>
        <p className="text-xs text-stone-500">
         Fill in technical details for agricultural machinery or farm supplies.
        </p>
       </div>
       <button
        onClick={() => setShowProductModal(false)}
        className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
       >
        <X className="w-5 h-5" />
       </button>
      </div>

      <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
         <label className="block font-semibold text-stone-700 mb-1">Equipment / Item Name (English) *</label>
         <input
          type="text"
          required
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="e.g. Mahindra 575 DI Tractor (47 HP)"
          className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
         />
        </div>

        <div>
         <label className="block font-semibold text-stone-700 mb-1">नाव (मराठी) - Title in Marathi</label>
         <input
          type="text"
          value={formTitleMr}
          onChange={(e) => setFormTitleMr(e.target.value)}
          placeholder="उदा. महिंद्रा ५७५ डीआय एक्सपी ट्रॅक्टर"
          className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
         />
        </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
         <label className="block font-semibold text-stone-700 mb-1">Listing Type *</label>
         <select
          value={formType}
          onChange={(e) => setFormType(e.target.value as any)}
          className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
         >
          <option value="RENTAL">Machinery Rental</option>
          <option value="SUPPLY">Agricultural Supply</option>
         </select>
        </div>

        <div>
         <label className="block font-semibold text-stone-700 mb-1">Category *</label>
         <select
          value={formCategoryId}
          onChange={(e) => setFormCategoryId(e.target.value)}
          required
          className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
         >
          {categories.map((c) => (
           <option key={c.id} value={c.id}>
            {c.name}
           </option>
          ))}
         </select>
        </div>

        <div>
         <label className="block font-semibold text-stone-700 mb-1">Sub-Category</label>
         <input
          type="text"
          value={formSubCategory}
          onChange={(e) => setFormSubCategory(e.target.value)}
          placeholder="e.g. Tractor, MB Plough, Harvester"
          className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
         />
        </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
         <label className="block font-semibold text-stone-700 mb-1">
          {formType === "RENTAL" ? "Daily Rent Rate (₹/day) *" : "Price (₹) *"}
         </label>
         <div className="relative">
          <span className="absolute left-2.5 top-2.5 text-stone-400">₹</span>
          <input
           type="number"
           required
           min="1"
           value={formPriceRupees}
           onChange={(e) => setFormPriceRupees(e.target.value)}
           placeholder="e.g. 1800"
           className="w-full pl-6 pr-3 py-2.5 border border-stone-300 rounded-lg bg-stone-50 font-bold"
          />
         </div>
        </div>

        {formType === "RENTAL" && (
         <>
          <div>
           <label className="block font-semibold text-stone-700 mb-1">Hourly Rate (₹/hr)</label>
           <div className="relative">
            <span className="absolute left-2.5 top-2.5 text-stone-400">₹</span>
            <input
             type="number"
             value={formHourlyRateRupees}
             onChange={(e) => setFormHourlyRateRupees(e.target.value)}
             placeholder="e.g. 350"
             className="w-full pl-6 pr-3 py-2.5 border border-stone-300 rounded-lg bg-stone-50"
            />
           </div>
          </div>

          <div>
           <label className="block font-semibold text-stone-700 mb-1">Security Deposit (₹)</label>
           <div className="relative">
            <span className="absolute left-2.5 top-2.5 text-stone-400">₹</span>
            <input
             type="number"
             value={formSecurityDepositRupees}
             onChange={(e) => setFormSecurityDepositRupees(e.target.value)}
             placeholder="e.g. 5000"
             className="w-full pl-6 pr-3 py-2.5 border border-stone-300 rounded-lg bg-stone-50"
            />
           </div>
          </div>
         </>
        )}
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
         <label className="block font-semibold text-stone-700 mb-1">Stock / Available Units *</label>
         <input
          type="number"
          required
          min="1"
          value={formStock}
          onChange={(e) => setFormStock(e.target.value)}
          className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
         />
        </div>

        {formType === "RENTAL" && (
         <div>
          <label className="block font-semibold text-stone-700 mb-1">Horsepower (HP)</label>
          <input
           type="number"
           value={formHorsepower}
           onChange={(e) => setFormHorsepower(e.target.value)}
           placeholder="e.g. 47"
           className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
          />
         </div>
        )}

        <div>
         <label className="block font-semibold text-stone-700 mb-1">District (Maharashtra)</label>
         <input
          type="text"
          value={formDistrict}
          onChange={(e) => setFormDistrict(e.target.value)}
          placeholder="e.g. Pune, Akola, Nashik"
          className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
         />
        </div>
       </div>

       {/* IMAGE SELECTION WITH PRESET CHOICES */}
       <div className="space-y-2">
        <label className="block font-semibold text-stone-700">
         Equipment Photo URL (Local High-Resolution Asset) *
        </label>
        <div className="flex gap-2">
         <input
          type="text"
          required
          value={formImageUrl}
          onChange={(e) => setFormImageUrl(e.target.value)}
          className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-mono text-[11px]"
         />
         <img
          src={formImageUrl}
          alt="Preview"
          onError={(e) => {
           e.currentTarget.onerror = null;
           e.currentTarget.src = "/images/products/mahindra-tractor.jpg";
          }}
          className="w-10 h-10 rounded-lg object-cover border border-stone-300 shrink-0 bg-stone-100"
         />
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
         <span className="text-[10px] text-stone-400 py-1">Quick Authentic Photo Presets:</span>
         {[
          { label: "🚜 Tractor", path: "/images/products/mahindra-tractor.jpg" },
          { label: "⚙️ MB Plough", path: "/images/products/hydraulic-plough.jpg" },
          { label: "💨 Orchard Sprayer", path: "/images/products/orchard-sprayer.jpg" },
          { label: "🌱 Seed Drill", path: "/images/products/seed-drill.jpg" },
          { label: "🌾 Harvester/Thresher", path: "/images/products/multicrop-thresher.jpg" },
          { label: "🚜 Power Tiller", path: "/images/products/vst-power-tiller.jpg" },
          { label: "🧪 Insecticide", path: "/images/products/fmc-coragen.jpg" },
          { label: "🧪 Fungicide", path: "/images/products/bayer-aliette.jpg" },
          { label: "📦 NPK Fertilizer", path: "/images/products/mahadhan-npk.jpg" },
          { label: "💧 Water Soluble Khad", path: "/images/products/iffco-fertilizer.jpg" },
          { label: "🫘 Soybean Seeds", path: "/images/products/soybean-seeds.jpg" },
          { label: "🧅 Onion Seeds", path: "/images/products/onion-seeds.jpg" },
         ].map((preset) => (
          <button
           key={preset.path}
           type="button"
           onClick={() => setFormImageUrl(preset.path)}
           className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
            formImageUrl === preset.path
             ? "bg-emerald-700 text-white border-emerald-700 font-bold"
             : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
           }`}
          >
           {preset.label}
          </button>
         ))}
        </div>
       </div>

       <div>
        <label className="block font-semibold text-stone-700 mb-1">Description (English)</label>
        <textarea
         rows={2}
         value={formDescription}
         onChange={(e) => setFormDescription(e.target.value)}
         placeholder="Detailed technical specifications, implement compatibility, and soil suitability..."
         className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
        />
       </div>

       <div>
        <label className="block font-semibold text-stone-700 mb-1">तपशील (मराठी) - Marathi Description</label>
        <textarea
         rows={2}
         value={formDescriptionMr}
         onChange={(e) => setFormDescriptionMr(e.target.value)}
         placeholder="मशिनरीचे कार्य, जोडणी क्षमता आणि शेतकऱ्यांसाठी फायदे..."
         className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
        />
       </div>

       <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
        <button
         type="button"
         onClick={() => setShowProductModal(false)}
         className="py-2.5 px-5 border border-stone-300 text-stone-600 rounded-xl hover:bg-stone-50 font-semibold"
        >
         Cancel
        </button>
        <button
         type="submit"
         disabled={savingProduct}
         className="btn-primary bg-emerald-700 hover:bg-emerald-800 text-xs py-2.5 px-6 rounded-xl font-bold flex items-center gap-1.5"
        >
         <Save className="w-4 h-4" />
         <span>{savingProduct ? "Saving..." : editingProduct ? "Save Changes" : "Create Equipment"}</span>
        </button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
};