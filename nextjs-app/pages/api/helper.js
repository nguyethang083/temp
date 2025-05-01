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
    throw new Error("Authentication required."); // Or handle appropriately
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
    // Add data (request body) if present in options
    data: options.body || undefined,
    // Include other Axios config options if needed from 'options'
    // e.g., params: options.params
  };

  // 3. Make the Axios request
  try {
    console.log(
      `Making authenticated ${axiosConfig.method} request to: ${backendUrl}${path}`
    );
    const response = await axios(axiosConfig);

    // 4. Return the data from the response on success (Axios puts it in `response.data`)
    return response.data;
  } catch (error) {
    console.error("API Request Error:", error);

    // Axios throws errors for non-2xx responses.
    // The error object often contains response details.
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
      console.error("Error Response Headers:", error.response.headers);

      // Extract message from backend error response if possible, otherwise use default
      const errorMessage =
        error.response.data?.message ||
        error.message ||
        `Request failed with status ${error.response.status}`;
      // Throw a new error with a potentially more specific message
      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error("Error Request:", error.request);
      throw new Error(
        "No response received from server. Check network connection or backend status."
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error Message:", error.message);
      throw new Error(`Error setting up request: ${error.message}`);
    }
  }
}
