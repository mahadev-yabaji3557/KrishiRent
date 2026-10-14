import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../types";
import { MapPin, ShieldCheck, Star, Calendar, Sprout, Layers } from "lucide-react";
import { useApp } from "../context/AppContext";

interface ProductCardProps {
 product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
 const { language, t } = useApp();

 const title = language === "mr" && product.titleMr ? product.titleMr : product.title;
 const image = product.images?.[0] || "/images/products/mahindra-tractor.jpg";
 const priceFormatted = (product.pricePaise / 100).toLocaleString("en-IN");

 const getToxicityBadge = (color?: string) => {
  switch (color?.toLowerCase()) {
   case "red":
    return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded border border-red-300">Extremely Toxic (Red Label)</span>;
   case "yellow":
    return <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">Highly Toxic (Yellow Label)</span>;
   case "blue":
    return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-300">Moderately Toxic (Blue)</span>;
   case "green":
    return <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-300">Slightly Toxic (Green)</span>;
   default:
    return null;
  }
 };

 return (
  <div className="kisan-card flex flex-col group h-full">
   {/* Image Thumbnail */}
   <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
    <img
     src={image}
     alt={title}
     onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = "/images/products/mahindra-tractor.jpg";
     }}
     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
     loading="lazy"
    />
    
    {/* Type Badge */}
    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
     {product.type === "RENTAL" ? (
      <span className="bg-emerald-700 text-white font-semibold text-xs px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
       <Calendar className="w-3 h-3" />
       For Rent
      </span>
     ) : product.type === "SALE" ? (
      <span className="bg-amber-700 text-white font-semibold text-xs px-2.5 py-1 rounded-md shadow-sm">
       Equipment Sale
      </span>
     ) : (
      <span className="bg-blue-700 text-white font-semibold text-xs px-2.5 py-1 rounded-md shadow-sm">
       Agri Supplies
      </span>
     )}

     {product.maharashtraRegion && (
      <span className="bg-stone-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
       {product.maharashtraRegion.split(" ")[0]} Region
      </span>
     )}
    </div>

    {/* Location Badge */}
    <div className="absolute bottom-2.5 left-2.5 bg-stone-900/80 backdrop-blur-sm text-stone-100 text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
     <MapPin className="w-3 h-3 text-emerald-400" />
     <span>{product.villageTown}, {product.district}</span>
    </div>
   </div>

   {/* Content */}
   <div className="p-4 flex flex-col flex-1">
    {/* Rating & Verified Merchant */}
    <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
     <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-stone-800">{product.avgRating || 4.8}</span>
      <span>({product.reviewCount || 12})</span>
     </div>
     {product.seller?.isVerified && (
      <span className="flex items-center gap-1 text-emerald-700 font-medium">
       <ShieldCheck className="w-3.5 h-3.5" />
       Verified Merchant
      </span>
     )}
    </div>

    {/* Title */}
    <Link to={`/product/${product.id}`} className="group-hover:text-emerald-700 transition">
     <h3 className="font-bold text-stone-900 line-clamp-2 text-base leading-snug mb-1.5">
      {title}
     </h3>
    </Link>

    {/* Crop Suitability Badge */}
    {product.targetCrops && (
     <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md mb-2 flex items-center gap-1.5">
      <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span className="truncate"><strong>Crops:</strong> {product.targetCrops}</span>
     </div>
    )}

    {/* Soil Compatibility Badge */}
    {product.suitableSoil && (
     <div className="text-[11px] text-stone-600 mb-2 flex items-center gap-1.5">
      <Layers className="w-3.5 h-3.5 text-stone-400 shrink-0" />
      <span className="truncate"><strong>Soil:</strong> {product.suitableSoil}</span>
     </div>
    )}

    {/* Safety Warning Tag if Pesticide */}
    {product.toxicityColor && (
     <div className="mb-2">
      {getToxicityBadge(product.toxicityColor)}
     </div>
    )}

    {/* Price & Action */}
    <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
     <div>
      <div className="text-lg font-extrabold text-stone-900">
       ₹{priceFormatted}
       <span className="text-xs font-normal text-stone-500 ml-1">
        {product.type === "RENTAL" ? `/${t.perDay}` : ""}
       </span>
      </div>
      {product.type === "RENTAL" && product.hourlyRatePaise && (
       <div className="text-[11px] text-stone-500">
        or ₹{product.hourlyRatePaise / 100}/{t.perHour}
       </div>
      )}
     </div>

     <Link
      to={`/product/${product.id}`}
      className="btn-primary text-xs px-3 py-2 rounded-lg"
     >
      {product.type === "RENTAL" ? t.rentNow : t.buyNow}
     </Link>
    </div>
   </div>
  </div>
 );
};