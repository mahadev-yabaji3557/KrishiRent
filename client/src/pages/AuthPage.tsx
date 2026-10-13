import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../utils/config";
import { Tractor, Mail, ShieldCheck, CheckCircle2, Terminal } from "lucide-react";

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken, fetchUser } = useApp();

  const [mode, setMode] = useState<"signin" | "register">(
    searchParams.get("mode") === "register" ? "register" : "signin"
  );

  // Form inputs
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [villageOrTown, setVillageOrTown] = useState("");
  const [district, setDistrict] = useState("Pune");
  const [state, setState] = useState("Maharashtra");
  const [role, setRole] = useState<"FARMER" | "SELLER">("FARMER");

  // OTP flow state
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Initiate Registration or Sign In
  const handleInitiateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setDevOtpHint(null);

    try {
      if (mode === "register") {
        const res = await axios.post(`${API_BASE_URL}/api/auth/register/init`, {
          name,
          email,
          phone,
          villageOrTown,
          district,
          state,
          role,
        });
        if (res.data.success) {
          setOtpStep(true);
          setStatusMessage(res.data.message);
          if (res.data.devOtp) setDevOtpHint(res.data.devOtp);
          setCooldown(45);
        }
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/auth/signin/init`, {
          email,
        });
        if (res.data.success) {
          setOtpStep(true);
          setStatusMessage(res.data.message);
          if (res.data.devOtp) setDevOtpHint(res.data.devOtp);
          setCooldown(45);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to send OTP. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  // Verify Single-use Cryptographic OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMessage("Please enter complete 6-digit OTP code.");
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        email,
        otp,
        purpose: mode === "register" ? "REGISTRATION" : "SIGNIN",
      });

      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        await fetchUser();
        navigate(res.data.user.role === "SELLER" ? "/seller-dashboard" : "/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Brand icon */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Tractor className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-stone-900">
          {otpStep 
            ? "Enter Verification OTP" 
            : mode === "signin" 
              ? "Farmer & Merchant Sign In" 
              : "Register Farmer or Seller Account"}
        </h1>
        <p className="text-xs text-stone-500">
          {otpStep
            ? `A 6-digit single-use OTP was dispatched to ${email}`
            : "Cryptographic email OTP verification for instant security."}
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        {/* Toggle Mode buttons */}
        {!otpStep && (
          <div className="flex border border-stone-200 rounded-xl p-1 bg-stone-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode("signin"); setErrorMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition ${
                mode === "signin" ? "bg-white text-emerald-800 shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Sign In (Email OTP)
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setErrorMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition ${
                mode === "register" ? "bg-white text-emerald-800 shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              New Registration
            </button>
          </div>
        )}

        {statusMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Development Helper Badge */}
        {devOtpHint && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Dev Terminal Fallback OTP: <strong>{devOtpHint}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setOtp(devOtpHint)}
              className="bg-amber-600 text-white px-2 py-0.5 rounded text-[11px] font-bold"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl">
            {errorMessage}
          </div>
        )}

        {!otpStep ? (
          /* STEP 1: Email & Details Form */
          <form onSubmit={handleInitiateOtp} className="space-y-4 text-xs">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tukaram Shinde"
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Mobile Number (10 Digits)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9822012345"
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Village / Town</label>
                    <input
                      type="text"
                      required
                      value={villageOrTown}
                      onChange={(e) => setVillageOrTown(e.target.value)}
                      placeholder="e.g. Indapur"
                      className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">District</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Pune"
                      className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Account Purpose</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("FARMER")}
                      className={`p-2 rounded-lg border font-medium ${
                        role === "FARMER" ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-stone-200"
                      }`}
                    >
                      ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â¡Ãƒâ€¦Ã¢â‚¬Å“ Farmer (Rent & Buy)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("SELLER")}
                      className={`p-2 rounded-lg border font-medium ${
                        role === "SELLER" ? "border-amber-600 bg-amber-50 text-amber-900" : "border-stone-200"
                      }`}
                    >
                      ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€šÃ‚ÂÃƒâ€šÃ‚Â¬ Machinery Owner / Seller
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. farmer@krishirent.in"
                  className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm font-bold shadow-md"
            >
              {loading ? "Sending Cryptographic OTP..." : "Send Verification OTP"}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢"
                className="w-full text-center tracking-[12px] text-2xl font-black py-3 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-emerald-600"
              />
              <p className="text-[11px] text-stone-500 mt-1.5 text-center">
                Valid for 5 minutes. Check console logs if testing in development mode.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full btn-primary py-3 text-sm font-bold shadow-md"
            >
              {loading ? "Verifying Token..." : "Verify & Sign In"}
            </button>

            <div className="pt-2 flex items-center justify-between text-xs text-stone-600">
              <button
                type="button"
                onClick={() => setOtpStep(false)}
                className="hover:text-stone-900 underline"
              >
                Change Email
              </button>
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={handleInitiateOtp}
                className="text-emerald-700 hover:text-emerald-800 font-medium disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SHA-256 Hashed OTP ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ 5-Minute Auto-Expiry ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Abuse Guarded</span>
        </div>
      </div>
    </div>
  );
};