import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { User, CartItem, CartSummary } from "../types";
import { Language, translations } from "../utils/i18n";

interface AppContextType {
  user: User | null;
  token: string | null;
  language: Language;
  t: typeof translations.en;
  cartItems: CartItem[];
  cartSummary: CartSummary | null;
  loadingAuth: boolean;
  setLanguage: (lang: Language) => void;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  fetchUser: () => Promise<void>;
  fetchCart: () => Promise<void>;
  addToCart: (params: any) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("krishi_jwt"));
  const [language, setLanguageState] = useState<Language>((localStorage.getItem("krishi_lang") as Language) || "en");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const t = translations[language];

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("krishi_lang", lang);
  };

  const setToken = (tok: string | null) => {
    setTokenState(tok);
    if (tok) localStorage.setItem("krishi_jwt", tok);
    else localStorage.removeItem("krishi_jwt");
  };

  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setLoadingAuth(false);
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  const fetchCart = async () => {
    if (!token) {
      setCartItems([]);
      setCartSummary(null);
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCartItems(res.data.items);
        setCartSummary(res.data.summary);
      }
    } catch (err) {
      console.error("Cart fetch error", err);
    }
  };

  const addToCart = async (payload: any): Promise<boolean> => {
    if (!token) {
      alert("Please sign in or register to add equipment/products to cart!");
      return false;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/cart/add", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add to cart");
      return false;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!token) return;
    try {
      await axios.delete("http://localhost:5000/api/cart/item/${itemId}", {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout");
    } catch {}
    setUser(null);
    setToken(null);
    setCartItems([]);
    setCartSummary(null);
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        language,
        t,
        cartItems,
        cartSummary,
        loadingAuth,
        setLanguage,
        setUser,
        setToken,
        fetchUser,
        fetchCart,
        addToCart,
        removeFromCart,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
