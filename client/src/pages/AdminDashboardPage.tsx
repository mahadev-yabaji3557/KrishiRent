import React, { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Package, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const { user, token } = useApp();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/admin/overview", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOverview(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const verifySeller = async (sellerId: string) => {
    try {
      await axios.patch(
        "http://localhost:5000/api/admin/sellers/${sellerId}/verify",
        { isVerified: true, notes: "Approved by Agricultural Admin Officer." },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Seller verified successfully!");
      fetchAdminData();
    } catch (err) {
      alert("Failed to verify seller");
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-purple-950 text-white p-6 sm:p-8 rounded-2xl shadow-sm flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-purple-300">
            Platform Governance & Moderation
          </span>
          <h1 className="text-2xl font-black mt-1">KrishiRent Marketplace Admin Console</h1>
          <p className="text-xs text-purple-200 mt-1">
            Supervise seller licenses, CIB compliance, audit logs, and transaction volume.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-purple-300 block">Total GMV</span>
          <span className="text-2xl font-black text-amber-300">
            ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{((overview?.stats?.revenuePaise || 0) / 100).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <span className="text-xs text-stone-500">Registered Users</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {overview?.stats?.usersCount || 0}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <span className="text-xs text-stone-500">Agro Merchants</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {overview?.stats?.sellersCount || 0}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <span className="text-xs text-stone-500">Active Listings</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {overview?.stats?.productsCount || 0}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <span className="text-xs text-stone-500">Completed Orders</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {overview?.stats?.ordersCount || 0}
          </span>
        </div>
      </div>

      {/* Pending Sellers Moderation */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>Pending Merchant Verifications</span>
        </h3>

        {overview?.pendingSellers?.length === 0 ? (
          <p className="text-xs text-stone-500 py-4">No pending seller verifications. All merchants active.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {overview?.pendingSellers?.map((s: any) => (
              <div key={s.id} className="py-4 flex justify-between items-center gap-4">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{s.businessName}</h4>
                  <p className="text-xs text-stone-500">
                    Applicant: {s.user?.name} ({s.user?.email} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ {s.user?.phone})
                  </p>
                  <p className="text-xs text-stone-600 mt-1">
                    District: {s.district} | Pesticide Lic: {s.pesticideLicenseNo || "N/A"}
                  </p>
                </div>

                <button
                  onClick={() => verifySeller(s.id)}
                  className="btn-primary text-xs py-2 px-4 shadow-sm"
                >
                  Approve Merchant
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Logs */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-bold text-stone-900 text-base">System Audit Trail</h3>
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
    </div>
  );
};