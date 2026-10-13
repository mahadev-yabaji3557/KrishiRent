import React, { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../utils/config";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  QrCode,
  Save,
  Check,
  Search,
  ExternalLink
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const { user, token } = useApp();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAdminData();
  }, [token]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-purple-950 text-white p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-purple-300">
            Platform Governance & Payment Reconciliation
          </span>
          <h1 className="text-2xl font-black mt-1">Admin Payment Verification Console</h1>
          <p className="text-xs text-purple-200 mt-1">
            Verify real bank credits, manage merchant UPI VPAs, and moderate farmers and listings.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-purple-300 block">Pending Bank Verifications</span>
          <span className="text-3xl font-black text-amber-300">
            {overview?.stats?.pendingUtrCount || 0} Orders
          </span>
        </div>
      </div>

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

      {/* SECTION 3: SYSTEM AUDIT LOG */}
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
    </div>
  );
};