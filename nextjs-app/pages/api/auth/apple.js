/**
 * API route for Apple authentication
 */

import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { code, state } = req.query;

    // Nếu code và state tồn tại (callback từ Apple), chuyển tiếp đến Frappe
    if (code && state) {
      const redirectUrl = `${process.env.NEXT_PUBLIC_FRAPPE_URL}/api/method/frappe.integrations.oauth2_logins.login_via_apple?code=${code}&state=${state}`;
      return res.redirect(302, redirectUrl);
    }

    // Nếu không có code và state, bắt đầu quá trình xác thực
    else {
      const redirectUrl = `${process.env.NEXT_PUBLIC_FRAPPE_URL}/api/method/frappe.integrations.oauth2_logins.login_via_apple`;
      return res.redirect(302, redirectUrl);
    }
  } catch (error) {
    console.error("Apple auth error:", error.message);
    return res
      .status(500)
      .json({ message: "An error occurred during Apple authentication" });
  }
}
