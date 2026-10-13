import React from "react";
import { Link } from "react-router-dom";
import { PhoneCall, Mail, MapPin, ShieldAlert, FileText, HelpCircle } from "lucide-react";

export const LegalAndInfoPages: React.FC<{ type: "terms" | "privacy" | "refund" | "shipping" | "faq" | "contact" | "how-it-works" }> = ({ type }) => {
 return (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
   {type === "faq" && (
    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
     <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
      <HelpCircle className="w-6 h-6 text-emerald-700" />
      Frequently Asked Questions (FAQ)
     </h1>
     <div className="space-y-4 text-sm divide-y divide-stone-100">
      <div className="pt-3">
       <h4 className="font-bold text-stone-900">How does machinery rental booking work on KrishiRent?</h4>
       <p className="text-stone-600 mt-1">
        Farmers choose their machinery, specify the required start and end dates on the live calendar, and pay through Razorpay UPI. Our collision detection engine ensures the tractor is guaranteed reserved for you.
       </p>
      </div>
      <div className="pt-3">
       <h4 className="font-bold text-stone-900">How is the refundable security deposit handled?</h4>
       <p className="text-stone-600 mt-1">
        For high-value equipment like combine harvesters and tractors, a refundable deposit is charged upfront. Once the machinery is inspected and returned in good condition, the deposit is refunded back to your source UPI account.
       </p>
      </div>
      <div className="pt-3">
       <h4 className="font-bold text-stone-900">Are the fertilizers and seeds genuine and compliant?</h4>
       <p className="text-stone-600 mt-1">
        Yes. All listed fertilizers, seeds, and pesticides come from verified merchants licensed by the State Agriculture Department and compliant with the Central Insecticides Board (CIB).
       </p>
      </div>
      <div className="pt-3">
       <h4 className="font-bold text-stone-900">Can I pay using Google Pay, PhonePe or Paytm?</h4>
       <p className="text-stone-600 mt-1">
        Yes! We support all official UPI applications directly through our integrated Razorpay payment gateway.
       </p>
      </div>
     </div>
    </div>
   )}

   {type === "refund" && (
    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6 text-sm text-stone-700 leading-relaxed">
     <h1 className="text-2xl font-black text-stone-900">Cancellation & Refund Policy</h1>
     <p>
      At KrishiRent & AgroMart, we recognize that agricultural operations are weather and climate sensitive.
     </p>
     <h3 className="font-bold text-stone-900 text-base">1. Machinery Rental Cancellations</h3>
     <p>
       Cancellations made 24 hours prior to the scheduled booking start time receive a 100% full refund back to the original UPI payment method.
       Cancellations made within 24 hours of dispatch may incur a nominal logistics mobilization charge not exceeding 10% of the daily rate.
     </p>
     <h3 className="font-bold text-stone-900 text-base">2. Refund Timeline</h3>
     <p>
      UPI refunds are initiated programmatically via the Razorpay refund API and typically reflect back in the customer bank account within 2 to 4 business hours.
     </p>
    </div>
   )}

   {type === "shipping" && (
    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6 text-sm text-stone-700 leading-relaxed">
     <h1 className="text-2xl font-black text-stone-900">Machinery Transport & Shipping Policy</h1>
     <p>
      Heavy farm machinery is delivered directly to the designated field coordinates or village Gat number provided during checkout.
     </p>
     <ul className="list-disc pl-5 space-y-2">
      <li>Delivery time: Machinery is dispatched 2 hours before the scheduled rental time window.</li>
      <li>Operator option: Where requested, a trained tractor operator is provided for field leveling, rotavator runs, and haulage.</li>
      <li>Supplies (Khad & Seeds): Dispatched from the nearest APMC hub with tracking updates sent to your registered email and mobile number.</li>
     </ul>
    </div>
   )}

   {type === "contact" && (
    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
     <h1 className="text-2xl font-black text-stone-900">Kisan Contact & APMC Centers</h1>
     <p className="text-sm text-stone-600">
      Have questions about equipment rates, rental schedules, or bulk fertilizer orders? Connect with our dedicated Kisan support team.
     </p>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs">
      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
       <PhoneCall className="w-5 h-5 text-emerald-700 mb-2" />
       <strong className="block text-stone-900 text-sm">Toll-Free Helpline</strong>
       <p className="text-stone-600 mt-1">1800-180-1551 (6 AM - 10 PM)</p>
      </div>
      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
       <Mail className="w-5 h-5 text-emerald-700 mb-2" />
       <strong className="block text-stone-900 text-sm">Official Email</strong>
       <p className="text-stone-600 mt-1">support@krishirent.in</p>
      </div>
      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
       <MapPin className="w-5 h-5 text-emerald-700 mb-2" />
       <strong className="block text-stone-900 text-sm">Regional Office</strong>
       <p className="text-stone-600 mt-1">APMC Krishi Bhavan, Pune - 411002</p>
      </div>
     </div>
    </div>
   )}

   {(type === "terms" || type === "privacy" || type === "how-it-works") && (
    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6 text-sm text-stone-700 leading-relaxed">
     <h1 className="text-2xl font-black text-stone-900 capitalize">
      {type.replace("-", " ")}
     </h1>
     <p>
      KrishiRent & AgroMart complies strictly with the Information Technology Act, 2000, Consumer Protection (E-Commerce) Rules, 2020, and the Insecticides Act, 1968.
     </p>
     <p>
      Farmers and merchants are protected through cryptographic email OTP verification, server-side UPI transaction validation, and transparent pricing with zero undisclosed brokerage.
     </p>
    </div>
   )}
  </div>
 );
};