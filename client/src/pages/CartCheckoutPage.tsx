import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../utils/config";
import { 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  ShieldCheck, 
  MapPin, 
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  AlertTriangle,
  QrCode,
  Smartphone,
  ExternalLink,
  Copy,
  Info
} from "lucide-react";

export const CartCheckoutPage: React.FC = () => {
  const { user, token, cartItems, cartSummary, removeFromCart, fetchCart } = useApp();

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    street: "Gat No. 102, Farm Road",
    villageTown: user?.villageOrTown || "Indapur",
    district: user?.district || "Pune",
    state: user?.state || "Maharashtra",
    pincode: "413106",
  });

  // Direct UPI Payment States
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [directUpiData, setDirectUpiData] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // UTR Submission States
  const [utrNumber, setUtrNumber] = useState("");
  const [payerUpiId, setPayerUpiId] = useState("");
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [utrSubmitted, setUtrSubmitted] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate QR Code whenever directUpiData is ready
  useEffect(() => {
    if (directUpiData?.upiLink) {
      QRCode.toDataURL(directUpiData.upiLink, {
        width: 260,
        margin: 2,
        color: {
          dark: "#14532d", // deep krishi green
          light: "#ffffff",
        }
      }).then(url => {
        setQrCodeDataUrl(url);
      }).catch(err => {
        console.error("QR Code generation error", err);
      });
    }
  }, [directUpiData]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingCart className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Please Sign In to View Your Cart</h2>
        <p className="text-stone-500 text-sm">
          You need an authenticated farmer or merchant account to book equipment and complete orders.
        </p>
        <Link to="/auth?mode=signin" className="btn-primary inline-flex text-sm">
          Sign In with Email OTP
        </Link>
      </div>
    );
  }

  // SCREEN 3: VERIFICATION QUEUE SCREEN (After Customer submits 12-digit UTR)
  if (utrSubmitted && createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-14 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Verification Pending
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Payment Verification in Progress
          </h1>
          <p className="text-stone-600 text-sm max-w-lg mx-auto">
            Order Reference: <strong>{createdOrder.orderNumber}</strong><br />
            Submitted UTR / Bank Reference: <strong className="font-mono text-emerald-800">{utrNumber}</strong>
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-left text-xs space-y-3 max-w-lg mx-auto">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-stone-700">
              <strong>Merchant Bank Verification Rule:</strong> For farmer security and zero-fraud guarantee, your order is not marked as paid based on screenshots alone. Our Krishi admin is verifying the actual credit in the merchant bank account.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-stone-600">
              Confirmation usually completes within <strong>10–30 minutes</strong>. Once confirmed, you will receive a verified tax invoice and machinery dispatch schedule on your email.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-2">
          <Link to="/dashboard" className="btn-primary text-sm px-6">
            View Order Status in Dashboard
          </Link>
          <Link to="/" className="btn-outline text-sm px-6">
            Continue Browsing
          </Link>
        </div>
      </div>
    );
  }

  // SCREEN 2: DYNAMIC AMOUNT-SPECIFIC UPI PAYMENT SCREEN
  if (createdOrder && directUpiData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <button
            onClick={() => setCreatedOrder(null)}
            className="text-xs text-stone-500 hover:text-emerald-700 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Change Address or Items
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Direct Zero-Fee UPI Payment
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Order Reference: <strong>{createdOrder.orderNumber}</strong> • Exact Payable Amount: <strong>₹{directUpiData.amountRupees}</strong>
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Method 1: Scan Dynamic Amount-Specific QR */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-stone-800">
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>Scan with Any UPI App</span>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 inline-block">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Dynamic UPI QR"
                  className="w-56 h-56 mx-auto rounded-lg shadow-xs"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-stone-400">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="text-xs text-stone-600 space-y-1">
              <div className="font-extrabold text-stone-900 text-lg">
                ₹{directUpiData.amountRupees}
              </div>
              <p className="text-[11px] text-stone-500">
                Amount and Order ID are pre-encoded in this QR. No manual amount entry needed.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Merchant VPA:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-stone-800">
                <span>{directUpiData.merchantUpiId}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(directUpiData.merchantUpiId);
                    setCopiedUpi(true);
                    setTimeout(() => setCopiedUpi(false), 2000);
                  }}
                  className="text-emerald-700 hover:text-emerald-800 p-0.5"
                  title="Copy UPI ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {copiedUpi && <span className="text-[10px] text-emerald-700 font-bold">Copied to clipboard!</span>}
          </div>

          {/* Method 2: Mobile Direct UPI Apps Link & Submit UTR */}
          <div className="space-y-6">
            {/* Pay Now Direct App Link */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>Pay directly on your phone</span>
              </div>
              <p className="text-xs text-stone-600">
                If browsing on mobile, tap below to open Google Pay, PhonePe, Paytm, or BHIM directly:
              </p>

              <a
                href={directUpiData.upiLink}
                className="btn-primary w-full py-3.5 text-sm font-bold shadow-md justify-center flex items-center gap-2"
              >
                <span>Pay ₹{directUpiData.amountRupees} via UPI App</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex justify-center gap-3 text-[10px] font-bold text-stone-600 pt-1">
                <span className="bg-stone-100 px-2.5 py-1 rounded">PhonePe</span>
                <span className="bg-stone-100 px-2.5 py-1 rounded">GPay</span>
                <span className="bg-stone-100 px-2.5 py-1 rounded">Paytm</span>
                <span className="bg-stone-100 px-2.5 py-1 rounded">BHIM</span>
              </div>
            </div>

            {/* Step 2: Submit UTR Reference Number */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  Step 2: Submit 12-Digit Bank UTR / RRN
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  After completing payment in your UPI app, enter the 12-digit UTR/Txn number shown on your payment receipt:
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!utrNumber || utrNumber.trim().length < 6) {
                    setErrorMessage("Please enter valid 12-digit UTR / Reference number.");
                    return;
                  }
                  setIsSubmittingUtr(true);
                  setErrorMessage(null);
                  try {
                    const res = await axios.post(
                      `${API_BASE_URL}/api/payments/submit-utr`,
                      {
                        orderId: createdOrder.id,
                        utrNumber: utrNumber.trim(),
                        payerUpiId: payerUpiId.trim() || undefined,
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (res.data.success) {
                      setUtrSubmitted(true);
                      await fetchCart();
                    }
                  } catch (err: any) {
                    setErrorMessage(err.response?.data?.message || "Failed to submit UTR number.");
                  } finally {
                    setIsSubmittingUtr(false);
                  }
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Bank UTR / UPI Reference No. (12 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
                    placeholder="e.g. 428901234567"
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-mono text-sm uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Your UPI ID / Payer VPA (Optional)
                  </label>
                  <input
                    type="text"
                    value={payerUpiId}
                    onChange={(e) => setPayerUpiId(e.target.value)}
                    placeholder="e.g. farmer@oksbi"
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingUtr || utrNumber.length < 6}
                  className="w-full btn-secondary py-3 text-sm font-bold shadow-md justify-center"
                >
                  {isSubmittingUtr ? "Submitting for Verification..." : "Submit UTR for Verification"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 1: CART REVIEW & ADDRESS ENTRY
  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingCart className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Your Agro Cart is Empty</h2>
        <p className="text-stone-500 text-sm">
          Browse our equipment rentals, tractors, certified seeds and fertilizers.
        </p>
        <Link to="/rentals" className="btn-primary inline-flex text-sm">
          Browse Rentals & Machinery
        </Link>
      </div>
    );
  }

  const handleCreateOrder = async () => {
    if (!address.fullName || !address.phone || !address.street || !address.villageTown) {
      alert("Please fill in complete delivery & contact details.");
      return;
    }

    setIsCreatingOrder(true);
    setErrorMessage(null);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/payments/create-order`,
        {
          shippingAddress: address,
          notes: "Farmer field delivery instructions",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setCreatedOrder(res.data.order);
        setDirectUpiData(res.data.directUpi);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to initialize order");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link to="/rentals" className="text-xs text-stone-500 hover:text-emerald-700 flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue Shopping
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Cart & Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Cart Items & Delivery Address */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-bold text-stone-900 text-base">Selected Items ({cartItems.length})</h3>
            <div className="divide-y divide-stone-100">
              {cartItems.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-start">
                  <img
                    src={item.product.images?.[0] || "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800"}
                    alt={item.product.title}
                    className="w-20 h-20 rounded-xl object-cover bg-stone-100 shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-900 text-sm leading-snug">{item.product.title}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Merchant: {item.product.seller?.businessName} • {item.product.villageTown}
                    </p>

                    {item.isRental ? (
                      <div className="mt-2 bg-emerald-50 text-emerald-900 p-2 rounded-lg text-xs flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>
                          Rental: {new Date(item.rentalStartDate!).toLocaleDateString()} to {new Date(item.rentalEndDate!).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-600 mt-1">Quantity: {item.quantity}</p>
                    )}

                    <div className="mt-2 font-bold text-stone-900 text-sm">
                      ₹{(item.calculatedTotalPaise / 100).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-stone-400 hover:text-red-600 p-1 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-base">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Farm Delivery / Machinery Destination Address</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-medium">Farmer / Receiver Name</label>
                <input
                  type="text"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1 font-medium">Mobile Number</label>
                <input
                  type="text"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-stone-600 mb-1 font-medium">Farm Gat / Survey No. & Road</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1 font-medium">Village / Town</label>
                <input
                  type="text"
                  value={address.villageTown}
                  onChange={(e) => setAddress({ ...address, villageTown: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1 font-medium">District</label>
                <input
                  type="text"
                  value={address.district}
                  onChange={(e) => setAddress({ ...address, district: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Summary & Proceed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
            <h3 className="font-bold text-stone-900 text-base">Direct UPI Payment</h3>

            {cartSummary && (
              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cartSummary.itemCount} items):</span>
                  <span className="font-semibold text-stone-900">
                    ₹{(cartSummary.subtotalPaise / 100).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Machinery Logistics / Delivery:</span>
                  <span className="font-semibold text-stone-900">
                    {cartSummary.deliveryFeePaise > 0 
                      ? `₹${(cartSummary.deliveryFeePaise / 100).toLocaleString("en-IN")}` 
                      : "Free Delivery"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Agricultural GST (5%):</span>
                  <span className="font-semibold text-stone-900">
                    ₹{(cartSummary.taxPaise / 100).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-900">Total Payable:</span>
                  <span className="text-2xl font-black text-emerald-800">
                    ₹{(cartSummary.totalPaise / 100).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Zero Commission Direct UPI</span>
              </div>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Pay using <strong>PhonePe, Google Pay, Paytm, BHIM</strong> or any UPI app with dynamic QR code & direct UTR verification.
              </p>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={isCreatingOrder}
              className="w-full btn-primary py-3.5 text-base font-bold shadow-lg"
            >
              {isCreatingOrder ? "Preparing Payment..." : "Proceed to Direct UPI Payment"}
            </button>

            <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Free Peer-to-Merchant Payment • Verified Bank Credit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};