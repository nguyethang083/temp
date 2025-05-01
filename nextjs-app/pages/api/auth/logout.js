/**
 * API route for user logout
 *
 * This route forwards the logout request to Frappe backend and clears cookies
 */

import axios from "axios";
import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get cookies from request to maintain session with Frappe
    const cookies = req.headers.cookie;

    // Forward request to Frappe backend
    await axios.get(`${process.env.NEXT_PUBLIC_FRAPPE_URL}/api/method/logout`, {
      headers: {
        Cookie: cookies,
      },
    });

    // Clear all cookies
    const cookieNames = [
      "user_id",
      "user_name",
      "sid",
      "system_user",
      "full_name",
      "user_image",
    ];

    cookieNames.forEach((name) => {
      res.setHeader(
        "Set-Cookie",
        cookie.serialize(name, "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: new Date(0),
          sameSite: "strict",
          path: "/",
        })
      );
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.response?.data || error.message);

    // Even if there's an error with Frappe, clear cookies on client side
    const cookieNames = [
      "user_id",
      "user_name",
      "sid",
      "system_user",
      "full_name",
      "user_image",
    ];

    cookieNames.forEach((name) => {
      res.setHeader(
        "Set-Cookie",
        cookie.serialize(name, "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: new Date(0),
          sameSite: "strict",
          path: "/",
        })
      );
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
}
