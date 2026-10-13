import crypto from "crypto";

export function generateCryptoOtp(): string {
  // 6 digits (100000 - 999999) using cryptographic random bytes
  const min = 100000;
  const max = 999999;
  const range = max - min + 1;
  const randomBytes = crypto.randomBytes(4);
  const randomInt = randomBytes.readUInt32BE(0);
  const otp = min + (randomInt % range);
  return otp.toString();
}

export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function verifyOtpHash(otp: string, storedHash: string): boolean {
  const hash = hashOtp(otp);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}