import axios from "axios"; // Import axios
import { supabase } from "@/lib/supabaseClient"; // Your Supabase client

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// Helper function to make authenticated requests to your backend using Axios
export async function fetchWithAuth(path, options = {}) {
  if (!backendUrl) {
    console.error(
      "Backend URL is not defined. Check NEXT_PUBLIC_BACKEND_URL environment variable."
    );
    throw new Error("Backend configuration error.");
  }

  // 1. Get the current Supabase session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Error getting Supabase session:", sessionError);
    throw new Error("Could not retrieve authentication session.");
  }

  if (!session) {
    console.warn("No active session found for authenticated request.");
    throw new Error("Authentication required.");
  }

  const token = session.access_token;

  // 2. Prepare Axios request configuration
  const axiosConfig = {
    baseURL: backendUrl, // Set the base URL for requests
    url: path, // The specific endpoint path
    method: options.method || "GET", // Default to GET if not specified
    headers: {
      "Content-Type": "application/json", // Default Content-Type
      ...options.headers, // Allow overriding headers
      Authorization: `Bearer ${token}`, // Add the Bearer token
    },
    params: options.params || undefined, // Optional query parameters
    data: options.body || undefined, // Request body
    timeout: options.timeout || 10000, // Set a default timeout of 10 seconds
  };

  // 3. Make the Axios request
  try {
    console.log(
      `Making authenticated ${axiosConfig.method} request to: ${axiosConfig.baseURL}${path}`
    );
    const response = await axios(axiosConfig);

    // 4. Return the data from the response on success
    return response.data;
  } catch (error) {
    console.error("API Request Error:", error);

    // Handle Axios errors
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
      console.error("Error Response Headers:", error.response.headers);

      const errorMessage =
        error.response.data?.message ||
        error.message ||
        `Request failed with status ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      console.error("Error Request:", error.request);
      throw new Error(
        "No response received from server. Check network connection or backend status."
      );
    } else {
      // Other errors (e.g., request setup issues)
      console.error("Error Message:", error.message);
      throw new Error(`Error setting up request: ${error.message}`);
    }
  }
}
