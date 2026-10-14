import React, { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../utils/config";
import { 
 Tractor, 
 Calendar, 
 Clock, 
 Package, 
 MapPin, 
 CreditCard, 
 AlertCircle,
 FileText
} from "lucide-react";

export const CustomerDashboardPage: React.FC = () => {
 const { user, token } = useApp();
 const [activeTab, setActiveTab] = useState<"rentals" | "orders" | "profile">("rentals");
 const [rentals, setRentals] = useState<any[]>([]);
 const [orders, setOrders] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  async function loadData() {
   if (!token) return;
   try {
    const [rentalRes, orderRes] = await Promise.all([
     axios.get(`${API_BASE_URL}/api/customer/rentals`, {
      headers: { Authorization: `Bearer ${token}` }
     }),
     axios.get(`${API_BASE_URL}/api/customer/orders`, {
      headers: { Authorization: `Bearer ${token}` }
     }),
    ]);
    if (rentalRes.data.success) setRentals(rentalRes.data.data);
    if (orderRes.data.success) setOrders(orderRes.data.data);
   } catch (err) {
    console.error(err);
   } finally {
    setLoading(false);
   }
  }
  loadData();
 }, [token]);

 if (!user) {
  return <div className="p-12 text-center text-sm text-stone-500">Please sign in to view your dashboard.</div>;
 }

 return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
   {/* Top Banner Profile Summary */}
   <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
     <div className="flex items-center gap-2">
      <h1 className="text-2xl font-black text-stone-900">{user.name}</h1>
      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
       {user.role}
      </span>
     </div>
     <p className="text-xs text-stone-500 mt-1">
      {user.email} {user.phone} {user.villageOrTown}, {user.district} ({user.state})
     </p>
    </div>

    <div className="flex gap-2">
     <div className="bg-stone-50 px-4 py-2 rounded-xl border border-stone-200 text-center">
      <span className="block text-lg font-black text-emerald-700">{rentals.length}</span>
      <span className="text-[11px] text-stone-500">Rentals</span>
     </div>
     <div className="bg-stone-50 px-4 py-2 rounded-xl border border-stone-200 text-center">
      <span className="block text-lg font-black text-amber-700">{orders.length}</span>
      <span className="text-[11px] text-stone-500">Purchases</span>
     </div>
    </div>
   </div>

   {/* Tabs */}
   <div className="flex border-b border-stone-200 gap-6 text-sm font-semibold">
    <button
     onClick={() => setActiveTab("rentals")}
     className={`pb-3 transition flex items-center gap-2 ${
      activeTab === "rentals"
       ? "border-b-2 border-emerald-600 text-emerald-800"
       : "text-stone-500 hover:text-stone-900"
     }`}
    >
     <Tractor className="w-4 h-4" />
     <span>My Machinery Rentals ({rentals.length})</span>
    </button>
    <button
     onClick={() => setActiveTab("orders")}
     className={`pb-3 transition flex items-center gap-2 ${
      activeTab === "orders"
       ? "border-b-2 border-emerald-600 text-emerald-800"
       : "text-stone-500 hover:text-stone-900"
     }`}
    >
     <Package className="w-4 h-4" />
     <span>Purchase History ({orders.length})</span>
    </button>
   </div>

   {/* RENTALS TAB */}
   {activeTab === "rentals" && (
    <div className="space-y-4">
     {rentals.length === 0 ? (
      <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-500 text-sm">
       You do not have any active or past machinery rentals yet.
      </div>
     ) : (
      rentals.map((r) => (
       <div key={r.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
        <div className="flex gap-4 items-center">
         <img
          src={r.product?.images?.[0] || "/images/products/mahindra-tractor.jpg"}
          alt={r.product?.title}
          className="w-20 h-20 rounded-xl object-cover bg-stone-100 shrink-0"
         />
         <div>
          <div className="flex items-center gap-2">
           <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
            {r.status}
           </span>
           <span className="text-xs text-stone-400">ID: {r.id.slice(0, 8)}</span>
          </div>
          <h3 className="font-bold text-stone-900 text-base mt-1">{r.product?.title}</h3>
          <p className="text-xs text-stone-500">
           Owner: {r.product?.seller?.businessName} ({r.product?.seller?.district})
          </p>
          <div className="mt-2 text-xs text-stone-700 flex items-center gap-2">
           <Calendar className="w-3.5 h-3.5 text-emerald-600" />
           <span>
            {new Date(r.startDate).toLocaleDateString()} to {new Date(r.endDate).toLocaleDateString()}
           </span>
          </div>
         </div>
        </div>

        <div className="text-right flex flex-col items-end w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
         <span className="text-xs text-stone-500">Total Rental Paid</span>
         <span className="text-lg font-black text-emerald-800">
          {(r.totalPaise / 100).toLocaleString("en-IN")}
         </span>
         {r.depositPaise > 0 && (
          <span className="text-[11px] text-amber-700">
           Incl. {r.depositPaise / 100} refundable deposit
          </span>
         )}
         <span className="mt-2 text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded-lg">
          Status: {r.status}
         </span>
        </div>
       </div>
      ))
     )}
    </div>
   )}

   {/* ORDERS TAB */}
   {activeTab === "orders" && (
    <div className="space-y-4">
     {orders.length === 0 ? (
      <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-500 text-sm">
       You do not have any equipment or agro supply purchases yet.
      </div>
     ) : (
      orders.map((o) => (
       <div key={o.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-center pb-3 border-b border-stone-100 gap-2">
         <div>
          <span className="text-xs text-stone-400">Order #{o.orderNumber}</span>
          <span className="block text-xs text-stone-500">
           Placed on {new Date(o.createdAt).toLocaleString()}
          </span>
         </div>
         <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
           {o.status}
          </span>
          <span className="font-extrabold text-stone-900 text-base">
           {(o.totalPaise / 100).toLocaleString("en-IN")}
          </span>
         </div>
        </div>

        <div className="space-y-2">
         {o.items?.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center text-xs">
           <span className="text-stone-800 font-medium">
            {item.product?.title} (x{item.quantity})
           </span>
           <span className="font-semibold text-stone-900">
            {(item.totalPaise / 100).toLocaleString("en-IN")}
           </span>
          </div>
         ))}
        </div>

        <div className="pt-2 flex justify-between items-center text-xs text-stone-500">
         <span>Payment Gateway: Razorpay UPI (Verified)</span>
         <span className="text-emerald-700 font-medium">Verified Server Confirmation</span>
        </div>
       </div>
      ))
     )}
    </div>
   )}
  </div>
 );
};