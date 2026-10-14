import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌾 Seeding Comprehensive Maharashtra Agriculture Machinery, Implements & Crop Protection...");

  // Clean
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

  // Users
  const adminUser = await prisma.user.create({
    data: {
      name: "Maharashtra Agriculture Department Admin",
      email: "admin@krishirent.in",
      phone: "9876543210",
      role: "ADMIN",
      villageOrTown: "Krishi Bhavan, Shivajinagar",
      district: "Pune",
      state: "Maharashtra",
      isEmailVerified: true,
    }
  });

  const seller1 = await prisma.user.create({
    data: {
      name: "Ramesh Patil",
      email: "patil.agro@krishirent.in",
      phone: "9822012345",
      role: "SELLER",
      villageOrTown: "Baramati",
      district: "Pune",
      state: "Maharashtra",
      isEmailVerified: true,
      sellerProfile: {
        create: {
          businessName: "Patil Krishi Seva Kendra & Tractor Hub",
          farmOrShopAddress: "APMC Market Yard, Baramati",
          district: "Pune",
          state: "Maharashtra",
          pincode: "413102",
          pesticideLicenseNo: "MH/PUN/PEST/2022/9481",
          fertilizerLicenseNo: "MH/PUN/FERT/2021/3309",
          isVerified: true,
          payoutUpiId: "rameshpatil@okaxis",
        }
      }
    },
    include: { sellerProfile: true }
  });

  const seller2 = await prisma.user.create({
    data: {
      name: "Sanjay Deshmukh",
      email: "vidarbha.machinery@krishirent.in",
      phone: "9850123456",
      role: "SELLER",
      villageOrTown: "Akola MIDC",
      district: "Akola",
      state: "Maharashtra",
      isEmailVerified: true,
      sellerProfile: {
        create: {
          businessName: "Vidarbha Cotton & Soybean Farm Mechanization Hub",
          farmOrShopAddress: "National Highway 6, Akola",
          district: "Akola",
          state: "Maharashtra",
          pincode: "444001",
          pesticideLicenseNo: "MH/AKL/PEST/2023/1102",
          fertilizerLicenseNo: "MH/AKL/FERT/2020/5412",
          isVerified: true,
          payoutUpiId: "sanjaydeshmukh@okhdfcbank",
        }
      }
    },
    include: { sellerProfile: true }
  });

  const farmerUser = await prisma.user.create({
    data: {
      name: "Anand Yabaji",
      email: "yabajianand@gmail.com",
      phone: "9356618282",
      role: "FARMER",
      villageOrTown: "Indapur",
      district: "Pune",
      state: "Maharashtra",
      isEmailVerified: true,
      addresses: {
        create: {
          fullName: "Anand Yabaji",
          phone: "9356618282",
          street: "Farm Gat No. 102, Indapur-Akluj Road",
          villageTown: "Indapur",
          district: "Pune",
          state: "Maharashtra",
          pincode: "413106",
          isDefault: true,
        }
      }
    }
  });

  // Categories
  const categories = [
    {
      name: "Tractors & Heavy Machinery",
      nameMr: "ट्रॅक्टर आणि अवजड यंत्रसामग्री",
      slug: "tractors-heavy-machinery",
      type: "RENTAL",
      description: "45HP - 75HP 4WD/2WD Tractors and high efficiency combines."
    },
    {
      name: "Tillage, Plough & Rotavators",
      nameMr: "मशागतीची अवजारे (रोटाव्हेटर / नांगर)",
      slug: "tillage-implements",
      type: "RENTAL",
      description: "Reversible MB Ploughs, Rotavators, Disc Harrows and Cultivators."
    },
    {
      name: "Sowing, Planting & Weeders",
      nameMr: "पेरणी यंत्रे आणि आंतरमशागत अवजारे",
      slug: "sowing-weeders",
      type: "RENTAL",
      description: "Pneumatic Planters, Automatic Seed-cum-Fertilizer Drills & Power Weeders."
    },
    {
      name: "Harvesting & Threshing",
      nameMr: "कापणी आणि मळणी यंत्रे",
      slug: "harvesting-threshing",
      type: "RENTAL",
      description: "Sugarcane Harvesters, Multi-crop Threshers, and Cotton Pickers."
    },
    {
      name: "Specialized Orchard & Boom Sprayers",
      nameMr: "फळबाग फवारणी यंत्रे आणि ट्रॅक्टर स्प्रेअर",
      slug: "sprayers-equipment",
      type: "RENTAL",
      description: "High-pressure Tractor Mounted Boom Sprayers and Orchard Blower Sprayers."
    },
    {
      name: "Certified Agro Chemicals & Pesticides",
      nameMr: "प्रमाणित कीटकनाशके आणि बुरशीनाशके",
      slug: "pesticides-protection",
      type: "SUPPLY",
      description: "CIB-RC registered insecticides, fungicides, and herbicides with safety labels."
    },
    {
      name: "Fertilizers, Micronutrients & Khad",
      nameMr: "रासायनिक व सेंद्रिय खते (खाद)",
      slug: "fertilizers-manure",
      type: "SUPPLY",
      description: "IFFCO Urea, DAP, Potash, 10:26:26, 12:61:00, Zinc & Boron."
    },
    {
      name: "Certified High-Yield Seeds (Biyane)",
      nameMr: "प्रमाणित सुधारित बियाणे",
      slug: "certified-seeds",
      type: "SUPPLY",
      description: "Mahyco, Mahabeej certified Soybean, Cotton, Wheat, Onion, and Sugarcane sets."
    }
  ];

  const catMap = new Map();
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    catMap.set(cat.slug, created.id);
  }

  const s1 = seller1.sellerProfile!.id;
  const s2 = seller2.sellerProfile!.id;

  const catalog = [
    // 1. WESTERN MAHARASHTRA / PUNE: Sugarcane & Heavy Black Soils
    {
      sellerId: s1,
      categoryId: catMap.get("tractors-heavy-machinery"),
      title: "Mahindra 575 DI XP Plus (47 HP) with Dual Clutch",
      titleMr: "महिंद्रा ५७५ डीआय एक्सपी प्लस ट्रॅक्टर (४७ एचपी)",
      description: "Heavy duty 4-cylinder engine designed for deep ploughing and rotavator operations in heavy black cotton soils (काळी कसदार जमीन) of Western Maharashtra. Ideal for sugarcane cultivation, tillage and trolley haulage.",
      descriptionMr: "पश्चिम महाराष्ट्रातील काळ्या कसदार जमिनीतील खोल नांगरणी आणि ऊस शेतीसाठी सर्वोत्तम ४७ एचपी ट्रॅक्टर.",
      type: "RENTAL",
      subCategory: "Tractor",
      targetCrops: "Sugarcane (ऊस), Soybean (सोयाबीन), Wheat (गहू), Jowar (ज्वारी)",
      suitableSoil: "Heavy Black Cotton Soil (काळी कसदार जमीन), Clayey Loam",
      maharashtraRegion: "Western Maharashtra (पुणे, सातारा, कोल्हापूर, सोलापूर)",
      pricePaise: 180000, // ₹1,800/day
      hourlyRatePaise: 35000,
      perAcreRatePaise: 85000,
      securityDepositPaise: 500000,
      stock: 4,
      condition: "USED_EXCELLENT",
      modelYear: 2023,
      horsepower: 47,
      villageTown: "Baramati",
      district: "Pune",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/mahindra-tractor.jpg"]),
      specificationsJson: JSON.stringify({ "Engine": "4 Cylinder, 2979 CC", "Lift Capacity": "1480 kg", "PTO": "42 HP" })
    },
    {
      sellerId: s1,
      categoryId: catMap.get("tillage-implements"),
      title: "Lemken 2-Bottom Hydraulic Reversible MB Plough",
      titleMr: "लेमकेन २-बॉटम हायड्रॉलिक रिव्हर्सिबल नांगर",
      description: "High tensile steel reversible mouldboard plough engineered for deep summer ploughing in hard clayey soils. Inverts deep soil layer, destroys weed roots and sugarcane stubbles.",
      descriptionMr: "ऊस खोडवे काढणे आणि उन्हाळी खोल नांगरणीसाठी अत्यंत मजबूत लेमकेन रिव्हर्सिबल नांगर.",
      type: "RENTAL",
      subCategory: "Plough",
      targetCrops: "Sugarcane (ऊस), Cotton (कापूस), Gram (हरभरा)",
      suitableSoil: "Hard Black Soil, Medium Black Soil",
      maharashtraRegion: "Western Maharashtra (पुणे, सोलापूर, सांगली)",
      pricePaise: 120000,
      hourlyRatePaise: 25000,
      perAcreRatePaise: 75000,
      securityDepositPaise: 300000,
      stock: 2,
      modelYear: 2024,
      villageTown: "Indapur",
      district: "Pune",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/hydraulic-plough.jpg"])
    },

    // 2. NASHIK / MARATHWADA: Grapes, Pomegranate & Onion (Light to Medium Loamy Soil)
    {
      sellerId: s1,
      categoryId: catMap.get("sprayers-equipment"),
      title: "Mitra Airotec 600-Litre Tractor Orchard Blower Sprayer",
      titleMr: "मित्रा एरोटेक ६००-लिटर फळबाग ब्लोअर स्प्रेअर (द्राक्षे, डाळिंब)",
      description: "Advanced orchard mist blower sprayer with 32 Italian brass nozzles for uniform coverage in grape vineyards, pomegranate and citrus orchards. Eliminates manual labor and guarantees 100% spray canopy penetration.",
      descriptionMr: "द्राक्ष, डाळिंब आणि संत्रा बागांसाठी इटालियन नोजल असलेले ६०० लिटर ब्लोअर स्प्रेअर. औषधांची बचत आणि संपूर्ण झाडावर फवारणी.",
      type: "RENTAL",
      subCategory: "Orchard Sprayer",
      targetCrops: "Grapes (द्राक्षे), Pomegranate (डाळिंब), Guava (पेरू), Orange/Citrus (संत्रा)",
      suitableSoil: "Well-drained Red Soil, Sandy Loam (मुरमाड व हलकी जमीन)",
      targetPestOrDisease: "Downy Mildew, Powdery Mildew, Thrips, Bacterial Blight (तेल्या)",
      maharashtraRegion: "Nashik & Marathwada (नाशिक, अहमदनगर, सांगली, सोलापूर)",
      pricePaise: 220000, // ₹2,200/day
      hourlyRatePaise: 40000,
      securityDepositPaise: 600000,
      stock: 3,
      modelYear: 2024,
      villageTown: "Niphad",
      district: "Nashik",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/orchard-sprayer.jpg"])
    },

    // 3. VIDARBHA & MARATHWADA: Cotton & Soybean Belt (Akola, Yavatmal, Nanded, Jalna)
    {
      sellerId: s2,
      categoryId: catMap.get("sowing-weeders"),
      title: "Mahindra 9-Tyne Automatic Seed-cum-Fertilizer Drill",
      titleMr: "९-दाती स्वयंचलित बियाणे व खत पेरणी यंत्र",
      description: "Precision metering mechanism for sowing Soybean, Cotton intercrops, Chickpea and Wheat simultaneously with balanced basal fertilizer dose placement at root level.",
      descriptionMr: "विदर्भातील सोयाबीन व कापूस पिकांसाठी अचूक बियाणे आणि खत एकाच वेळी टाकणारे ९-दाती पेरणी यंत्र.",
      type: "RENTAL",
      subCategory: "Seed Drill",
      targetCrops: "Soybean (सोयाबीन), Cotton (कापूस), Pigeonpea (तूर), Gram (हरभरा)",
      suitableSoil: "Black Cotton Soil (रेगूर माती), Medium Black Soil",
      maharashtraRegion: "Vidarbha & Marathwada (अकोला, यवतमाळ, अमरावती, नांदेड, जालना)",
      pricePaise: 110000, // ₹1,100/day
      perAcreRatePaise: 45000,
      securityDepositPaise: 200000,
      stock: 5,
      modelYear: 2023,
      villageTown: "Akola",
      district: "Akola",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/seed-drill.jpg"])
    },
    {
      sellerId: s2,
      categoryId: catMap.get("harvesting-threshing"),
      title: "Punjab Multi-Crop High-Speed Thresher (Soybean, Gram, Wheat)",
      titleMr: "पंजाब मल्टीक्रॉप मळणी यंत्र (सोयाबीन, हरभरा, गहू)",
      description: "Tractor PTO driven heavy-duty thresher with aspirator fan for zero seed breakage in Soybean, Tur, Urad, Moong, and Chana harvesting. Yields crystal clean grain bags directly into trolleys.",
      descriptionMr: "सोयाबीन, तूर आणि हरभरा मळणीसाठी शून्य दाणा नुकसान (Zero Grain Loss) देणारे मल्टीक्रॉप थ्रेशर.",
      type: "RENTAL",
      subCategory: "Thresher",
      targetCrops: "Soybean (सोयाबीन), Gram (हरभरा), Pigeonpea (तूर), Wheat (गहू)",
      suitableSoil: "All Maharashtra Soils",
      maharashtraRegion: "Vidarbha, Marathwada, Khandesh (अमरावती, बुलढाणा, परभणी, धुळे)",
      pricePaise: 250000, // ₹2,500/day
      hourlyRatePaise: 50000,
      securityDepositPaise: 500000,
      stock: 3,
      modelYear: 2024,
      villageTown: "Yavatmal",
      district: "Yavatmal",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/multicrop-thresher.jpg"])
    },

    // 4. KONKAN REGION: Paddy Fields, Cashew & Mango (Laterite Red Soil)
    {
      sellerId: s1,
      categoryId: catMap.get("tractors-heavy-machinery"),
      title: "VST Shakti 130 DI Power Tiller (13 HP) with Cage Wheels",
      titleMr: "व्हीएसटी शक्ती १३० डीआय पॉवर टिलर (भात खाचरे व कोकणासाठी)",
      description: "Compact 13 HP diesel tiller equipped with water-resistant rotavator and steel cage wheels for paddy wetland puddling, terraced hill farming, and mango/cashew orchard weeding in Konkan.",
      descriptionMr: "कोकणातील भात खाचरे (चिखलणी) आणि काजू, आंबा बागांसाठी हलका व शक्तिशाली व्हीएसटी पॉवर टिलर.",
      type: "RENTAL",
      subCategory: "Power Tiller",
      targetCrops: "Paddy/Rice (भात), Alphonso Mango (हापूस आंबा), Cashew (काजू)",
      suitableSoil: "Laterite Red Soil (जांभा दगड व लाल माती), Coastal Alluvial",
      maharashtraRegion: "Konkan (रत्नागिरी, सिंधुदुर्ग, रायगड, ठाणे)",
      pricePaise: 95000, // ₹950/day
      hourlyRatePaise: 20000,
      securityDepositPaise: 250000,
      stock: 4,
      horsepower: 13,
      villageTown: "Chiplun",
      district: "Ratnagiri",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/vst-power-tiller.jpg"])
    },

    // 5. CROP-SPECIFIC PESTICIDES & FUNGICIDES (Statutory CIB-RC Compliance)
    // A. Cotton Pink Bollworm & Whitefly:
    {
      sellerId: s2,
      categoryId: catMap.get("pesticides-protection"),
      title: "UPL Ulala Insecticide (Flonicamid 50% WG) - 150g",
      titleMr: "यूपीएल उलाला कीटकनाशक (फ्लोनिकामाइड ५०% डब्ल्यूजी) - कापूस मावा, तुडतुडे",
      description: "Targeted systemic insecticide with anti-feeding action against sucking pests (aphids, jassids, whitefly) in Cotton and Chilli. Safe for beneficial pollinators like honeybees.",
      descriptionMr: "कापूस आणि मिरचीवरील रसशोषक किडींवर (मावा, तुडतुडे, पांढरी माशी) १००% प्रभावी सिस्टेमिक कीटकनाशक.",
      type: "SUPPLY",
      subCategory: "Insecticide",
      targetCrops: "Cotton (कापूस), Chilli (मिरची), Paddy (भात)",
      suitableSoil: "All Soils",
      targetPestOrDisease: "Aphids (मावा), Jassids (तुडतुडे), Whitefly (पांढरी माशी)",
      maharashtraRegion: "Vidarbha, Marathwada, Khandesh (जळगाव, यवतमाळ, नांदेड, औरंगाबाद)",
      pricePaise: 115000, // ₹1,150
      stock: 75,
      toxicityColor: "Blue",
      safetyWarning: "Wear safety goggles and gloves. Pre-Harvest Interval (PHI): 15 days.",
      cibRegistrationNo: "CIR-10294/2012-Flonicamid(WG)(332)-18",
      activeIngredients: "Flonicamid 50% WG",
      dosageRecommendation: "60 grams per acre (0.4 g per litre of water)",
      villageTown: "Jalgaon",
      district: "Jalgaon",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/upl-ulala.jpg"])
    },

    // B. Pomegranate & Grape Bacterial Blight / Downy Mildew:
    {
      sellerId: s1,
      categoryId: catMap.get("pesticides-protection"),
      title: "Bayer Aliette Systemic Fungicide (Fosetyl-Al 80% WP) - 500g",
      titleMr: "बायर एलियट बुरशीनाशक (फॉसेटिल-अल ८०% डब्ल्यूपी) - डाळिंब व द्राक्ष",
      description: "Two-way systemic fungicide providing true basipetal and acropetal translocation to control Phytophthora foot rot, gummosis, and Downy Mildew in Grapes, Pomegranate, and Citrus.",
      descriptionMr: "द्राक्षावरील डाऊनी मिल्ड्यू आणि डाळिंबावरील फायटोप्थोरा, डिंक्या रोगावर उत्कृष्ट प्रतिबंधक बुरशीनाशक.",
      type: "SUPPLY",
      subCategory: "Fungicide",
      targetCrops: "Pomegranate (डाळिंब), Grapes (द्राक्षे), Citrus (संत्रा/मोसंबी)",
      suitableSoil: "Red Loamy, Sandy Loam Soils",
      targetPestOrDisease: "Downy Mildew (केवडा), Phytophthora Collar Rot (डिंक्या), Damping Off",
      maharashtraRegion: "Nashik, Solapur, Sangli, Ahmednagar (नाशिक, सोलापूर, सांगली)",
      pricePaise: 142000, // ₹1,420
      stock: 60,
      toxicityColor: "Green",
      safetyWarning: "Do not mix with copper oxychloride or foliar nitrogen fertilizers.",
      cibRegistrationNo: "CIR-1144/90-Fosetyl(WP)-22",
      activeIngredients: "Fosetyl-Al 80% WP",
      dosageRecommendation: "2 grams per litre of water",
      villageTown: "Solapur",
      district: "Solapur",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/bayer-aliette.jpg"])
    },

    // C. Sugarcane Early Shoot Borer & White Grub:
    {
      sellerId: s1,
      categoryId: catMap.get("pesticides-protection"),
      title: "FMC Coragen SC Insecticide (Chlorantraniliprole 18.5% SC) - 150ml",
      titleMr: "एफएमसी कोराजन कीटकनाशक (ऊस कांडी कीड व खोडकीड नियंत्रणासाठी)",
      description: "Rynaxypyr powered anthranilic diamide insecticide giving long-lasting 60-day protection against Early Shoot Borer and Top Borer in Sugarcane, and Pod Borer in Soybean and Bengal Gram.",
      descriptionMr: "ऊस पिकातील खोडकीड व कांडी कीड, तसेच सोयाबीनवरील लष्करी अळीवर ६० दिवसांचे दीर्घकालीन संरक्षण देणारे औषध.",
      type: "SUPPLY",
      subCategory: "Insecticide",
      targetCrops: "Sugarcane (ऊस), Soybean (सोयाबीन), Bengal Gram (हरभरा), Tomato (टोमॅटो)",
      suitableSoil: "Heavy Black Soil, Alluvial Soil",
      targetPestOrDisease: "Early Shoot Borer (खोडकीड), Top Borer, Pod Borer (घाटे अळी)",
      maharashtraRegion: "Western Maharashtra & Marathwada (कोल्हापूर, सांगली, सातारा, पुणे, लातूर)",
      pricePaise: 185000, // ₹1,850
      stock: 90,
      toxicityColor: "Green",
      safetyWarning: "Apply via drenching near sugarcane roots for maximum efficacy.",
      cibRegistrationNo: "CIR-58385/2008-Chlorantraniliprole(SC)(287)-13",
      activeIngredients: "Chlorantraniliprole 18.5% SC",
      dosageRecommendation: "150 ml per acre (Drenching at 30 to 45 days after planting)",
      villageTown: "Kolhapur",
      district: "Kolhapur",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/fmc-coragen.jpg"])
    },

    // 6. FERTILIZERS & SOIL HEALTH (IFFCO, Mahadhan, Water Soluble Fertigation)
    {
      sellerId: s1,
      categoryId: catMap.get("fertilizers-manure"),
      title: "Mahadhan Smarttek NPK 10:26:26 Complex Fertilizer - 50 Kg Bag",
      titleMr: "महाधन स्मार्टटेक १०:२६:२६ ग्रेड खत (५० किलो बॅग)",
      description: "High potash and phosphorus balanced fertilizer customized for Maharashtra's sugarcane, onion, potato, and cotton crops. Formulated with coated sulphur and micronutrients to enhance sugar recovery and bulb size.",
      descriptionMr: "महाराष्ट्रातील ऊस, कांदा व बटाटा पिकांसाठी स्फुरद व पालाशचा सर्वोत्तम डोस देणारे १०:२६:२६ खत.",
      type: "SUPPLY",
      subCategory: "Complex Fertilizer",
      targetCrops: "Sugarcane (ऊस), Onion (कांदा), Cotton (कापूस), Pomegranate (डाळिंब)",
      suitableSoil: "Black Cotton Soil, Red Soil (सर्व प्रकारची जमीन)",
      maharashtraRegion: "All 36 Maharashtra Districts",
      pricePaise: 147000, // ₹1,470
      stock: 200,
      toxicityColor: "Green",
      villageTown: "Pune",
      district: "Pune",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/mahadhan-npk.jpg"])
    },
    {
      sellerId: s1,
      categoryId: catMap.get("fertilizers-manure"),
      title: "IFFCO 100% Water Soluble NPK 12:61:00 (Mono Ammonium Phosphate) - 25 Kg",
      titleMr: "इफको १००% विद्राव्य खत १२:६१:०० (ठिबक सिंचनासाठी)",
      description: "100% water-soluble fertigation fertilizer for early root development, flowering boost, and shoot vigor in drip-irrigated grapes, pomegranates, tomatoes and sugarcane.",
      descriptionMr: "ठिबक सिंचनाद्वारे मुळांची जोमदार वाढ आणि फुलोऱ्यासाठी उपयुक्त १००% पाण्यात विरघळणारे खत.",
      type: "SUPPLY",
      subCategory: "Drip Fertigation",
      targetCrops: "Grapes, Pomegranate, Tomato, Capsicum, Sugarcane",
      suitableSoil: "All Drip Irrigated Soils",
      maharashtraRegion: "Nashik, Pune, Solapur, Sangli, Satara",
      pricePaise: 345000, // ₹3,450
      stock: 110,
      toxicityColor: "Green",
      villageTown: "Baramati",
      district: "Pune",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/iffco-fertilizer.jpg"])
    },

    // 7. CERTIFIED SEEDS (Mahabeej & University Certified Varieties)
    {
      sellerId: s2,
      categoryId: catMap.get("certified-seeds"),
      title: "Mahabeej Certified KDS-726 (Phule Sangam) Soybean Seeds - 30 Kg",
      titleMr: "महाबीज प्रमाणित केडीएस-७२६ (फुले संगम) सोयाबीन बियाणे - ३० किलो",
      description: "Breeder-tested variety developed by MPKV Rahuri University. Highly resistant to stem borer, rust and yellow mosaic virus with unprecedented yield potential of 12-15 quintals per acre.",
      descriptionMr: "महात्मा फुले कृषी विद्यापीठ राहुरी विकसित 'फुले संगम' (केडीएस ७२६) सोयाबीन बियाणे. तांबेरा रोगास प्रतिकारक्षम आणि एकरी १२-१५ क्विंटल उत्पादन.",
      type: "SUPPLY",
      subCategory: "Certified Seed",
      targetCrops: "Soybean (सोयाबीन)",
      suitableSoil: "Medium to Deep Black Soils of Vidarbha & Marathwada",
      maharashtraRegion: "Vidarbha, Marathwada, Western Maharashtra (अमरावती, अकोला, वाशिम, हिंगोली, सातारा)",
      pricePaise: 315000, // ₹3,150
      stock: 150,
      toxicityColor: "Blue",
      safetyWarning: "Chemical seed treated with Thiram. Strictly not for food, feed, or oil purposes.",
      villageTown: "Akola",
      district: "Akola",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/soybean-seeds.jpg"])
    },
    {
      sellerId: s1,
      categoryId: catMap.get("certified-seeds"),
      title: "Prashant Seeds Phule Samarth F1 Hybrid Onion Seeds - 1 Kg",
      titleMr: "प्रशांत सीड्स फुले समर्थ एफ१ संकरित कांदा बियाणे - १ किलो",
      description: "Premier Kharif and Late Kharif dark red onion seed variety with uniform globular bulb shape, excellent storage keeping quality (4-5 months) and high export market value.",
      descriptionMr: "चांगला साठवणूक कालावधी (४-५ महिने) आणि गर्द लाल रंगाचे दर्जेदार कांदा बियाणे. नाशिक, पुणे व सोलापूर जिल्ह्यांसाठी आदर्श.",
      type: "SUPPLY",
      subCategory: "Vegetable Seed",
      targetCrops: "Onion (कांदा)",
      suitableSoil: "Well-drained Sandy Loam to Clay Loam (मध्यम निचऱ्याची जमीन)",
      maharashtraRegion: "Nashik, Pune, Ahmednagar, Solapur (नाशिक, पारनेर, चाकण, बार्शी)",
      pricePaise: 180000, // ₹1,800
      stock: 80,
      toxicityColor: "Green",
      villageTown: "Nashik",
      district: "Nashik",
      state: "Maharashtra",
      imagesJson: JSON.stringify(["/images/products/onion-seeds.jpg"])
    }
  ];

  for (const item of catalog) {
    await prisma.product.create({ data: item });
  }

  console.log(`✅ Successfully seeded comprehensive Maharashtra Agricultural Catalog:`);
  console.log(`🌾 Loaded ${catalog.length} precision machinery implements & regulated crop protection supplies.`);
  console.log(`🗺️ Covers Western Maharashtra, Vidarbha, Marathwada, Khandesh, and Konkan regions.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });