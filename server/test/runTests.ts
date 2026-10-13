import { PrismaClient } from "@prisma/client";
import { generateCryptoOtp, hashOtp, verifyOtpHash } from "../src/utils/otp";

const prisma = new PrismaClient();

async function runTests() {
  console.log("🚜 Starting KrishiRent & AgroMart Automated Backend Test Suite...\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Test OTP Cryptographic generation & verification
  try {
    const rawOtp = generateCryptoOtp();
    assert(rawOtp.length === 6 && /^\d{6}$/.test(rawOtp), "OTP generator creates 6-digit numeric code");
    const hashed = hashOtp(rawOtp);
    assert(verifyOtpHash(rawOtp, hashed), "Hash check verifies valid OTP");
    assert(!verifyOtpHash("000000", hashed), "Hash check rejects incorrect OTP");
  } catch (err: any) {
    console.error("Test 1 error:", err);
    failed++;
  }

  // 2. Test Rental Booking Overlap collision prevention
  try {
    const tractor = await prisma.product.findFirst({ where: { type: "RENTAL" } });
    if (!tractor) throw new Error("No rental product found");

    const user = await prisma.user.findFirst({ where: { role: "FARMER" } });
    if (!user) throw new Error("No user found");

    // Clean any prior test bookings
    await prisma.rentalBooking.deleteMany({ where: { productId: tractor.id } });

    // Create booking for Oct 20 to Oct 25
    const b1Start = new Date("2026-10-20T00:00:00Z");
    const b1End = new Date("2026-10-25T23:59:59Z");

    await prisma.rentalBooking.create({
      data: {
        userId: user.id,
        productId: tractor.id,
        startDate: b1Start,
        endDate: b1End,
        rentalFeePaise: 180000,
        totalPaise: 180000,
        status: "CONFIRMED",
      }
    });

    // Test collision scenario: Oct 22 to Oct 24 (inside booking)
    const overlap1 = await prisma.rentalBooking.findFirst({
      where: {
        productId: tractor.id,
        status: { in: ["CONFIRMED", "ACTIVE"] },
        AND: [
          { startDate: { lte: new Date("2026-10-24T23:59:59Z") } },
          { endDate: { gte: new Date("2026-10-22T00:00:00Z") } }
        ]
      }
    });
    assert(Boolean(overlap1), "Overlapping date check detects collision for internal dates");

    // Test non-overlapping scenario: Oct 28 to Oct 30 (after booking)
    const overlap2 = await prisma.rentalBooking.findFirst({
      where: {
        productId: tractor.id,
        status: { in: ["CONFIRMED", "ACTIVE"] },
        AND: [
          { startDate: { lte: new Date("2026-10-30T23:59:59Z") } },
          { endDate: { gte: new Date("2026-10-28T00:00:00Z") } }
        ]
      }
    });
    assert(!overlap2, "Non-overlapping date range passes availability check");
  } catch (err: any) {
    console.error("Test 2 error:", err);
    failed++;
  }

  // 3. Test Product & Pricing consistency
  try {
    const products = await prisma.product.findMany();
    assert(products.length >= 8, `Product database contains ${products.length} agricultural items`);
    const allValidPrices = products.every(p => p.pricePaise > 0);
    assert(allValidPrices, "All products have valid positive integer paise pricing");
  } catch (err: any) {
    console.error("Test 3 error:", err);
    failed++;
  }

  console.log(`\n===========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log(`===========================================\n`);

  await prisma.$disconnect();

  if (failed > 0) process.exit(1);
}

runTests();