import axios from "axios";
import { signOut } from "next-auth/react";

/**
 * Middleware để tự động thêm token vào API request
 * Hỗ trợ cả session NextAuth và Frappe token
 */
export const authMiddleware = async (req, config = {}) => {
  // Kiểm tra trên localStorage (cookies Frappe)
  const token = localStorage.getItem("token");

  if (token) {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }

  return config;
};

/**
 * Lưu thông tin đăng nhập vào localStorage
 */
export const saveAuthData = (userData, token) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(userData));
};

/**
 * Xử lý đăng nhập từ NextAuth
 */
export const handleNextAuthLogin = async (session) => {
  if (session?.frappeAuthToken) {
    let cookieStr = "";

    // Xử lý token dạng cookie từ Frappe
    if (Array.isArray(session.frappeAuthToken)) {
      cookieStr = session.frappeAuthToken.join("; ");
    } else if (typeof session.frappeAuthToken === "string") {
      cookieStr = session.frappeAuthToken;
    }

    const userData = {
      userId: session.user?.userId || session.user?.id || session.user?.email,
      name: session.user?.name,
      email: session.user?.email,
      avatar: session.user?.avatar || session.user?.image,
      roles: session.user?.roles || session.frappeUser?.roles || ["Student"],
      first_name: session.user?.name?.split(" ")[0] || "",
      last_name: session.user?.name?.split(" ").slice(1).join(" ") || "",
      provider: session.user?.provider || "default",
    };

    // Save user data and token
    saveAuthData(userData, cookieStr);
    return true;
  }
  return false;
};

/**
 * Client API instance kết nối với Frappe
 */
export const frappeAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Quan trọng cho cookies
});

// Thêm interceptor để tự động gửi token
frappeAPI.interceptors.request.use(authMiddleware);

/**
 * Kiểm tra trạng thái đăng nhập
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/**
 * Lấy thông tin người dùng hiện tại
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

/**
 * Đăng xuất
 */
export const logout = async () => {
  // Clear local storage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Try to log out from Frappe backend
  try {
    await frappeAPI.post("/api/method/logout");
  } catch (error) {
    console.error("Frappe logout error:", error);
  }

  // Also sign out from NextAuth (client-side only)
  if (typeof window !== "undefined") {
    try {
      await signOut({ redirect: true, callbackUrl: "/auth/login" });
    } catch (error) {
      console.error("NextAuth signout error:", error);
    }
  }

  // Return true to indicate successful logout
  return true;
};
