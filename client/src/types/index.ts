export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "FARMER" | "SELLER" | "ADMIN";
  villageOrTown?: string;
  district?: string;
  state?: string;
  isEmailVerified: boolean;
  sellerProfile?: SellerProfile;
  addresses?: Address[];
}

export interface SellerProfile {
  id: string;
  businessName: string;
  farmOrShopAddress: string;
  district: string;
  state: string;
  pincode: string;
  isVerified: boolean;
  gstinOrAadhaar?: string;
  pesticideLicenseNo?: string;
  fertilizerLicenseNo?: string;
  payoutUpiId?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  villageTown: string;
  district: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  titleMr?: string;
  description: string;
  descriptionMr?: string;
  type: "RENTAL" | "SALE" | "SUPPLY";
  subCategory?: string;
  targetCrops?: string;
  suitableSoil?: string;
  targetPestOrDisease?: string;
  maharashtraRegion?: string;
  pricePaise: number;
  hourlyRatePaise?: number;
  perAcreRatePaise?: number;
  securityDepositPaise?: number;
  stock: number;
  condition?: string;
  modelYear?: number;
  horsepower?: number;
  safetyWarning?: string;
  toxicityColor?: string;
  cibRegistrationNo?: string;
  activeIngredients?: string;
  dosageRecommendation?: string;
  waitingPeriodDays?: number;
  villageTown: string;
  district: string;
  state: string;
  deliveryAvailable: boolean;
  deliveryFeePaise: number;
  images: string[];
  specifications?: Record<string, string>;
  avgRating?: number;
  reviewCount?: number;
  seller?: {
    id: string;
    businessName: string;
    district: string;
    state: string;
    isVerified: boolean;
  };
  bookedPeriods?: { startDate: string; endDate: string }[];
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  isRental: boolean;
  rentalStartDate?: string;
  rentalEndDate?: string;
  rentalRateUnit?: "HOUR" | "DAY" | "ACRE";
  rentalUnits?: number;
  calculatedTotalPaise: number;
}

export interface CartSummary {
  itemCount: number;
  subtotalPaise: number;
  deliveryFeePaise: number;
  taxPaise: number;
  totalPaise: number;
}