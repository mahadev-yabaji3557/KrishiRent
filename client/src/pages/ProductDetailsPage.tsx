import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Product } from "../types";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../utils/config";
import { 
  Tractor, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Truck, 
  CreditCard,
  ChevronRight
} from "lucide-react";

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language, addToCart } = useApp();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Rental booking parameters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rateUnit, setRateUnit] = useState<"HOUR" | "DAY" | "ACRE">("DAY");
  const [rentalUnits, setRentalUnits] = useState(1);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Sale quantity
  const [saleQuantity, setSaleQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
          if (res.data.data.images?.length > 0) {
            setSelectedImage(res.data.data.images[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start date and end date first.");
      return;
    }
    setIsCheckingAvailability(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/availability`, {
        params: {
          productId: id,
          startDate,
          endDate,
        }
      });
      setIsAvailable(res.data.available);
      setAvailabilityMessage(res.data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to check calendar");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleBookingOrBuy = async () => {
    if (!product) return;

    if (product.type === "RENTAL") {
      if (!startDate || !endDate) {
        alert("Please select rental start and end dates.");
        return;
      }
      if (isAvailable === false) {
        alert("Machinery is booked for these dates. Please choose another slot.");
        return;
      }

      const success = await addToCart({
        productId: product.id,
        quantity: 1,
        isRental: true,
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        rentalRateUnit: rateUnit,
        rentalUnits: Number(rentalUnits),
      });

      if (success) {
        navigate("/cart");
      }
    } else {
      const success = await addToCart({
        productId: product.id,
        quantity: saleQuantity,
        isRental: false,
      });

      if (success) {
        navigate("/cart");
      }
    }
  };

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-stone-500 text-sm mt-3">Loading product details...</p>
      </div>
    );
  }

  const title = language === "mr" && product.titleMr ? product.titleMr : product.title;
  const description = language === "mr" && product.descriptionMr ? product.descriptionMr : product.description;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <span>Marketplace</span>
        <ChevronRight className="w-3 h-3" />
        <span>{product.type}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-stone-900 font-medium truncate max-w-xs">{title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Photos & Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
            <img
              src={selectedImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${
                    selectedImage === img ? "border-emerald-600 ring-2 ring-emerald-600/20" : "border-stone-200"
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description & Technical Specs */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Description</h3>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Specifications Table */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">{t.specifications}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <span className="block text-xs font-medium text-stone-500">{key}</span>
                      <span className="block text-sm font-semibold text-stone-900 mt-0.5">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regulatory & Safety Warnings (Indian CIB & Dept of Ag regulations) */}
            {product.safetyWarning && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-amber-900 block">{t.safetyAlert}</span>
                  <p className="text-amber-800">{product.safetyWarning}</p>
                  {product.cibRegistrationNo && (
                    <span className="text-[11px] text-amber-700 block font-mono">
                      Govt CIB Reg No: {product.cibRegistrationNo}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Booking/Buy Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
            {/* Title & Badge */}
            <div>
              <div className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md mb-2">
                {product.type === "RENTAL" ? "Machinery Rental" : product.type === "SALE" ? "Equipment Sale" : "Agri Supply"}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
                {title}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{product.villageTown}, {product.district}, {product.state}</span>
              </div>
            </div>

            {/* Price section */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
              <div className="text-3xl font-black text-stone-900">
                ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{(product.pricePaise / 100).toLocaleString("en-IN")}
                <span className="text-sm font-normal text-stone-500 ml-1">
                  {product.type === "RENTAL" ? `/${t.perDay}` : ""}
                </span>
              </div>
              {product.type === "RENTAL" && (
                <div className="mt-2 space-y-1 text-xs text-stone-600">
                  {product.hourlyRatePaise && (
                    <div className="flex justify-between">
                      <span>Hourly Rate:</span>
                      <strong className="text-stone-900">ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{product.hourlyRatePaise / 100} / hour</strong>
                    </div>
                  )}
                  {product.perAcreRatePaise && (
                    <div className="flex justify-between">
                      <span>Per-Acre Contract Rate:</span>
                      <strong className="text-stone-900">ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{product.perAcreRatePaise / 100} / acre</strong>
                    </div>
                  )}
                  {product.securityDepositPaise && (
                    <div className="flex justify-between pt-1 border-t border-stone-200 text-amber-800 font-medium">
                      <span>{t.securityDeposit}:</span>
                      <strong>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{product.securityDepositPaise / 100} (100% Refundable)</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RENTAL CALENDAR & DOUBLE-BOOKING PREVENTION SECTION */}
            {product.type === "RENTAL" ? (
              <div className="space-y-4 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Rental Booking Dates</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-600 mb-1">{t.startDate}</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setIsAvailable(null);
                        setAvailabilityMessage(null);
                      }}
                      className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">{t.endDate}</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setIsAvailable(null);
                        setAvailabilityMessage(null);
                      }}
                      className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Rate Unit Selector */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRateUnit("DAY")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                      rateUnit === "DAY" ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-stone-700 border-stone-200"
                    }`}
                  >
                    Daily Basis
                  </button>
                  {product.hourlyRatePaise && (
                    <button
                      type="button"
                      onClick={() => setRateUnit("HOUR")}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                        rateUnit === "HOUR" ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-stone-700 border-stone-200"
                      }`}
                    >
                      Hourly Basis
                    </button>
                  )}
                  {product.perAcreRatePaise && (
                    <button
                      type="button"
                      onClick={() => setRateUnit("ACRE")}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                        rateUnit === "ACRE" ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-stone-700 border-stone-200"
                      }`}
                    >
                      Per Acre
                    </button>
                  )}
                </div>

                {/* Check Calendar Availability Button */}
                <button
                  type="button"
                  onClick={checkAvailability}
                  disabled={isCheckingAvailability}
                  className="w-full btn-outline text-xs py-2 bg-stone-50 hover:bg-stone-100"
                >
                  {isCheckingAvailability ? "Checking Schedule..." : t.checkAvailability}
                </button>

                {availabilityMessage && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    isAvailable ? "bg-green-50 text-green-900 border border-green-200" : "bg-red-50 text-red-900 border border-red-200"
                  }`}>
                    {isAvailable ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                    <span>{availabilityMessage}</span>
                  </div>
                )}
              </div>
            ) : (
              /* SALE QUANTITY SELECTOR */
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-700">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSaleQuantity(Math.max(1, saleQuantity - 1))}
                    className="w-9 h-9 rounded-lg border border-stone-300 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-stone-800">{saleQuantity}</span>
                  <button
                    onClick={() => setSaleQuantity(Math.min(product.stock, saleQuantity + 1))}
                    className="w-9 h-9 rounded-lg border border-stone-300 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                  <span className="text-xs text-stone-500">
                    ({product.stock} units available in stock)
                  </span>
                </div>
              </div>
            )}

            {/* Main Action Button */}
            <button
              onClick={handleBookingOrBuy}
              className="w-full btn-primary text-base py-3 shadow-md"
            >
              {product.type === "RENTAL" ? "Book & Pay via UPI" : "Add to Cart & Checkout"}
            </button>

            {/* Verified Merchant Details */}
            {product.seller && (
              <div className="pt-4 border-t border-stone-100 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {product.seller.businessName[0]}
                </div>
                <div>
                  <span className="text-xs text-stone-500 block">Listed by Verified Merchant:</span>
                  <h4 className="font-bold text-stone-900 text-sm">{product.seller.businessName}</h4>
                  <p className="text-xs text-stone-600">{product.seller.district}, {product.seller.state}</p>
                </div>
              </div>
            )}

            <div className="bg-stone-50 p-3 rounded-xl text-xs text-stone-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Doorstep farm delivery available across district</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                <span>Zero convenience fees on direct UPI app payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};