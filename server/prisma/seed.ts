import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding authentic Indian agricultural data for KrishiRent & AgroMart...");

  // 1. Clean existing seed data
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.rentalBooking.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.otpChallenge.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // 2. Demo Users (Admin, Certified Seller, Local Farmer)
  const adminUser = await prisma.user.create({
    data: {
      name: "Krishi Admin Officer",
      email: "admin@krishirent.in",
      phone: "9876543210",
      role: "ADMIN",
      villageOrTown: "Pune Krishi Bhavan",
      district: "Pune",
      state: "Maharashtra",
      isEmailVerified: true,
    }
  });

  const sellerUser = await prisma.user.create({
    data: {
      name: "Ramesh Patil",
      email: "seller@krishirent.in",
      phone: "9822012345",
      role: "SELLER",
      villageOrTown: "Baramati",
      district: "Pune",
      state: "Maharashtra",
      isEmailVerified: true,
      sellerProfile: {
        create: {
          businessName: "Patil Krishi Seva Kendra & Machinery Rentals",
          farmOrShopAddress: "Shop No. 4, APMC Market Yard, Baramati",
          district: "Pune",
          state: "Maharashtra",
          pincode: "413102",
          gstinOrAadhaar: "27AABCP1234F1Z5",
          pesticideLicenseNo: "MH/PUN/PEST/2022/9481",
          fertilizerLicenseNo: "MH/PUN/FERT/2021/3309",
          isVerified: true,
          verificationNotes: "Verified via Maharashtra State Agriculture Department License records.",
          payoutUpiId: "rameshpatil@okaxis",
        }
      }
    },
    include: { sellerProfile: true }
  });

  const farmerUser = await prisma.user.create({
    data: {
      name: "Tukaram Shinde",
      email: "farmer@krishirent.in",
      phone: "9423188899",
      role: "FARMER",
      villageOrTown: "Indapur",
      district: "Pune",
      state: "Maharashtra",
      isEmailVerified: true,
      addresses: {
        create: {
          fullName: "Tukaram Shinde",
          phone: "9423188899",
          street: "Gat No 142, Indapur-Akluj Road",
          villageTown: "Indapur",
          district: "Pune",
          state: "Maharashtra",
          pincode: "413106",
          isDefault: true,
        }
      }
    }
  });

  // 3. Categories
  const categories = [
    {
      name: "Tractors & Heavy Machinery",
      nameMr: "ट्रॅक्टर आणि अवजड यंत्रसामग्री",
      slug: "tractors-heavy-machinery",
      type: "RENTAL",
      description: "45HP - 75HP 4WD/2WD Tractors and high efficiency combines."
    },
    {
      name: "Tillage & Implements",
      nameMr: "मशागतीची अवजारे (रोटाव्हेटर / नांगर)",
      slug: "tillage-implements",
      type: "RENTAL",
      description: "Rotavators, MB Ploughs, Disc Harrows and Cultivators."
    },
    {
      name: "Harvesting & Threshing",
      nameMr: "कापणी आणि मळणी यंत्रे",
      slug: "harvesting-threshing",
      type: "RENTAL",
      description: "Multi-crop threshers, sugarcane harvesters and straw reapers."
    },
    {
      name: "Used & New Equipment Sales",
      nameMr: "नवीन आणि जुनी शेती अवजारे विक्री",
      slug: "equipment-sales",
      type: "SALE",
      description: "Certified tractors, power tillers, sprayers and pumps for sale."
    },
    {
      name: "Fertilizers & Manure (Khad)",
      nameMr: "खते आणि सेंद्रिय खत",
      slug: "fertilizers-manure",
      type: "SUPPLY",
      description: "IFFCO Urea, DAP, NPK 10:26:26, Potash, Vermicompost and Bio-fertilizers."
    },
    {
      name: "Certified Seeds (Biyane)",
      nameMr: "प्रमाणित बियाणे",
      slug: "certified-seeds",
      type: "SUPPLY",
      description: "High yield soybean, cotton, wheat, onion and vegetable seeds."
    },
    {
      name: "Pesticides & Crop Protection",
      nameMr: "कीटकनाशके आणि पीक संरक्षण",
      slug: "pesticides-protection",
      type: "SUPPLY",
      description: "CIB-registered insecticides, fungicides, herbicides and organic neem sprays."
    },
    {
      name: "Irrigation & Solar Pumps",
      nameMr: "ठिबक सिंचन आणि सौर पंप",
      slug: "irrigation-solar",
      type: "SUPPLY",
      description: "Drip irrigation sets, sprinkler kits and submersible pumps."
    }
  ];

  const catMap = new Map();
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    catMap.set(cat.slug, created.id);
  }

  // 4. Products & Machinery Listings
  const sellerId = sellerUser.sellerProfile!.id;

  const productsData = [
    // Rental 1: Mahindra 575 DI Tractor
    {
      sellerId,
      categoryId: catMap.get("tractors-heavy-machinery"),
      title: "Mahindra 575 DI XP Plus Tractor (47 HP)",
      titleMr: "महिंद्रा ५७५ डीआय एक्सपी प्लस ट्रॅक्टर (४७ एचपी भाड्याने)",
      description: "Reliable 47 HP Mahindra tractor equipped with power steering and dual clutch. Ideal for heavy ploughing, rotavator operations, trolley haulage and puddling.",
      descriptionMr: "४७ एचपी क्षमतेचा अत्यंत इंधन-बचत करणारा महिंद्रा ट्रॅक्टर. नांगरणी, रोटाव्हेटर, ट्रेलर वाहतूक आणि फवारणीसाठी उपलब्ध.",
      type: "RENTAL",
      subCategory: "Tractor",
      pricePaise: 180000, // ₹1,800/day
      hourlyRatePaise: 35000, // ₹350/hour
      perAcreRatePaise: 85000, // ₹850/acre ploughing
      securityDepositPaise: 500000, // ₹5,000 refundable
      stock: 3,
      condition: "USED_EXCELLENT",
      modelYear: 2023,
      horsepower: 47,
      villageTown: "Baramati",
      district: "Pune",
      state: "Maharashtra",
      deliveryAvailable: true,
      deliveryFeePaise: 25000,
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800",
        "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800"
      ]),
      specificationsJson: JSON.stringify({
        "Fuel Type": "Diesel",
        "Cylinders": 4,
        "PTO Power": "42 HP",
        "Hydraulics Lift": "1480 kg",
        "Driver Provided": "Yes (Upon Request)"
      })
    },
    // Rental 2: Shaktiman Rotary Tiller
    {
      sellerId,
      categoryId: catMap.get("tillage-implements"),
      title: "Shaktiman Regular Series 7-Feet Rotavator",
      titleMr: "शक्तिमान ७-फूट रोटाव्हेटर (जमीन मशागत)",
      description: "High durability 48 L-type blade rotary tiller for fine seedbed preparation in single pass. Compatible with 45+ HP tractors.",
      descriptionMr: "एकाच फेरीत उत्तम मशागत करणारे शक्तिमान ४८ ब्लेड रोटाव्हेटर. ४५+ एचपी ट्रॅक्टरसाठी योग्य.",
      type: "RENTAL",
      pricePaise: 90000, // ₹900/day
      hourlyRatePaise: 20000, // ₹200/hour
      perAcreRatePaise: 50000, // ₹500/acre
      securityDepositPaise: 250000,
      stock: 2,
      condition: "USED_EXCELLENT",
      modelYear: 2024,
      villageTown: "Baramati",
      district: "Pune",
      state: "Maharashtra",
      deliveryAvailable: true,
      deliveryFeePaise: 15000,
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1589876735824-3437c355fb50?w=800"
      ]),
      specificationsJson: JSON.stringify({
        "Working Width": "7 Feet (2.1 m)",
        "No. of Blades": 48,
        "Gearbox": "Multi-speed 4-speed",
        "Hitch Type": "Category-II 3 Point"
      })
    },
    // Rental 3: Claas Multi-crop Combine Harvester
    {
      sellerId,
      categoryId: catMap.get("harvesting-threshing"),
      title: "Claas Crop Tiger 30 Terra Trac Combine Harvester",
      titleMr: "क्लास क्रॉप टायगर ३० कम्बाईन हार्वेस्टर (कापणी व मळणी)",
      description: "Rubber tracked harvester ideal for wet fields and muddy soils. Highly efficient harvesting for paddy, wheat, soybean and gram with minimal grain loss.",
      descriptionMr: "भात, सोयाबीन, गहू आणि हरभरा कापणीसाठी उत्कृष्ट रबर-ट्रॅक हार्वेस्टर. चिखलातही उत्तम काम करते.",
      type: "RENTAL",
      pricePaise: 1200000, // ₹12,000/day
      hourlyRatePaise: 180000, // ₹1,800/hr
      perAcreRatePaise: 220000, // ₹2,200/acre
      securityDepositPaise: 1500000,
      stock: 1,
      condition: "USED_GOOD",
      modelYear: 2022,
      horsepower: 60,
      villageTown: "Baramati",
      district: "Pune",
      state: "Maharashtra",
      deliveryAvailable: true,
      deliveryFeePaise: 50000,
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800"
      ]),
      specificationsJson: JSON.stringify({
        "Grain Tank Capacity": "1200 Litres",
        "Cutting Width": "2.1 Metres",
        "Track Width": "Rubber Terra Trac"
      })
    },
    // Sale 1: Sonalika DI 745 III Tractor (Certified Used)
    {
      sellerId,
      categoryId: catMap.get("equipment-sales"),
      title: "Sonalika DI 745 III Sikander (50 HP) - Certified Used",
      titleMr: "सोनालिका डीआय ७४५ सिकंदर (५० एचपी) - सर्टिफाईड सेकंड हँड",
      description: "Fully inspected and serviced 2021 model Sonalika 50HP tractor. Clean engine condition, 85% tyre tread remaining, clear RTO documents and single owner.",
      descriptionMr: "२०२१ चे मॉडेल, केवळ १४०० तास चाललेला एकच मालक असलेला ट्रॅक्टर. आरटीओ पेपर पूर्ण आणि टायर्स ८५% शिल्लक.",
      type: "SALE",
      pricePaise: 42500000, // ₹4,25,000
      stock: 1,
      condition: "USED_EXCELLENT",
      modelYear: 2021,
      horsepower: 50,
      villageTown: "Indapur",
      district: "Pune",
      state: "Maharashtra",
      deliveryAvailable: true,
      deliveryFeePaise: 0,
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800"
      ]),
      specificationsJson: JSON.stringify({
        "Hours Run": "1,420 Hours",
        "RTO Passing": "MH-42 (Pune)",
        "Battery": "New Exide 12V 88Ah with warranty",
        "Insurance": "Valid till Dec 2026"
      })
    },
    // Supply 1: IFFCO DAP Fertilizer (Khad)
    {
      sellerId,
      categoryId: catMap.get("fertilizers-manure"),
      title: "IFFCO Di-Ammonium Phosphate (DAP 18:46:0) - 50 Kg Bag",
      titleMr: "इफको डीएपी खत (१८:४६:०) - ५० किलो पोते",
      description: "Subsidized high-grade phosphatic fertilizer providing 18% Nitrogen and 46% Phosphorus. Essential for root proliferation and early plant vigor in all field crops.",
      descriptionMr: "१८% नत्र आणि ४६% स्फुरद देणारे उच्च दर्जाचे खत. पिकांची मुळे मजबूत करण्यासाठी आणि लवकर वाढीसाठी आवश्यक.",
      type: "SUPPLY",
      subCategory: "Chemical Fertilizer",
      pricePaise: 135000, // ₹1,350 MRP per official govt guideline
      stock: 120,
      safetyWarning: "Keep in cool, dry place. Wash hands after handling. Do not mix directly with zinc fertilizers.",
      toxicityColor: "Green",
      villageTown: "Baramati",
      district: "Pune",
      state: "Maharashtra",
      deliveryAvailable: true,
      deliveryFeePaise: 5000,
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800"
      ]),
      specificationsJson: JSON.stringify({
        "Brand": "IFFCO",
        "Weight": "50 Kilograms",
        "Composition": "N: 18%, P2O5: 46%",
        "State of Form": "Granular"
      })
    },
    // Supply 2: Mahyco Soybean Seeds
    {
      sellerId,
      categoryId: catMap.get("certified-seeds"),
      title: "Mahyco Certified JS-335 Soybean Seeds (30 Kg Bag)",
      titleMr: "माहिको प्रमाणित जेएस-३३५ सोयाबीन बियाणे (३० किलो बॅग)",
      description: "Govt certified high-germination seed bag (above 85% germination rate). Disease resistant variety with high oil content and 95-100 day maturity duration.",
      descriptionMr: "८५% पेक्षा जास्त उगवण क्षमता असलेले प्रमाणित सोयाबीन बियाणे. कीड व रोगास प्रतिकारक्षम.",
      type: "SUPPLY",
      subCategory: "Certified Seed",
      pricePaise: 285000, // ₹2,850
      stock: 80,
      safetyWarning: "Treated with Thiram & Carbendazim fungicide. Do not use for human or animal consumption.",
      toxicityColor: "Blue",
      villageTown: "Baramati",
      district: "Pune",
      state: "Maharashtra",
      deliveryAvailable: true,
      deliveryFeePaise: 4000,
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800"
      ]),
      specificationsJson: JSON.stringify({
        "Variety": "JS-335",
        "Germination": "85%+",
        "Purity": "98%",
        "Net Weight": "30 Kg"
      })
    },
    // Supply 3: Bayer Confidor Insecticide (Pesticide)
    {
      sellerId,
      categoryId: catMap.get("pesticides-protection"),
      title: "Bayer Confidor Insecticide (Imidacloprid 17.8% SL) - 250ml",
      titleMr: "बायर कॉन्फिडॉर कीटकनाशक (इमिडाक्लोप्रिड १७.८% एसएल) - २५० मिली",
      description: "Systemic insecticide for quick knockdown and long-lasting control of sucking pests like aphids, jassids, thrips and whiteflies in cotton, chilli, paddy and sugarcane.",
      descriptionMr: "मावा, तुडतुडे, फुलकिडे आणि पांढरी माशी यांच्या प्रभावी नियंत्रणासाठी सिस्टेमिक कीटकनाशक.",
      type: "SUPPLY",
      subCategory: "Insecticide",
      pricePaise: 89000, // ₹890
      stock: 45,
      safetyWarning: "DANGER / POISON: Use protective gloves and face mask during spraying. Keep away from water bodies and domestic pets.",
      toxicityColor: "Yellow", // Highly Toxic label
      cibRegistrationNo: "CIR-1823/2001-Imidacloprid(SL)(212)-104",
      activeIngredients: "Imidacloprid 17.8% w/w",
      dosageRecommendation: "0.5 ml to 1 ml per litre of water",
      villageTown: "Baramati",
      district: "Pune",
      state: "Maharashtra",
      deliveryAvailable: true,
      deliveryFeePaise: 3000,
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800"
      ]),
      specificationsJson: JSON.stringify({
        "Brand": "Bayer CropScience",
        "Active Ingredient": "Imidacloprid 17.8% SL",
        "Volume": "250 ml",
        "Target Crops": "Cotton, Chilli, Paddy, Mango, Tomato"
      })
    },
    // Supply 4: Jain Irrigation Drip Kit
    {
      sellerId,
      categoryId: catMap.get("irrigation-solar"),
      title: "Jain Irrigation 1-Acre Inline Drip Kit (16mm, 40cm spacing)",
      titleMr: "जैन इरिगेशन १-एकर ठिबक सिंचन किट (१६ मिमी)",
      description: "Complete water-saving micro-irrigation package for 1 acre orchard or row crop farming. Includes Screen Filter, Mainline, Submain, Venturi injector and 16mm inline lateral tubes.",
      descriptionMr: "१ एकर शेतीसाठी पूर्ण ठिबक सिंचन संच. पाणी व खतांची ६०% पर्यंत बचत.",
      type: "SUPPLY",
      subCategory: "Micro Irrigation",
      pricePaise: 1850000, // ₹18,500
      stock: 15,
      villageTown: "Baramati",
      district: "Pune",
      state: "Maharashtra",
      deliveryAvailable: true,
      deliveryFeePaise: 15000,
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800"
      ]),
      specificationsJson: JSON.stringify({
        "Coverage": "1 Acre",
        "Tube Diameter": "16 mm",
        "Dripper Spacing": "40 cm",
        "Filter Type": "2 Inch Screen Filter with Pressure Gauge"
      })
    }
  ];

  for (const prod of productsData) {
    await prisma.product.create({ data: prod });
  }

  console.log(`✅ Seed successfully completed!`);
  console.log(`👤 Admin Account: admin@krishirent.in (Any OTP code verified via DB or console)`);
  console.log(`👨‍🌾 Farmer Account: farmer@krishirent.in`);
  console.log(`🏬 Seller Account: seller@krishirent.in`);
  console.log(`🌾 Loaded ${categories.length} categories and ${productsData.length} rich agri equipment listings.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });