import { useState, useEffect } from "react";
// Ensure this path is correct for your project structure
import { fetchWithAuth } from "@/pages/api/helper";

/**
 * Custom hook to fetch detailed metadata for a single test.
 * @param {string | undefined | null} testId - The ID of the test to fetch.
 * @returns {{ test: object | null, loading: boolean, error: string | null }}
 */
export function useTestDetails(testId) {
  const [test, setTest] = useState(null); // State for the detailed test metadata
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch the test details
    const loadTestDetails = async () => {
      // Don't fetch if ID is not valid or available yet
      if (!testId || typeof testId !== "string") {
        console.log(
          "useTestDetails: Test ID is not valid or available yet.",
          testId
        );
        // Keep loading true until a valid ID is processed or an error occurs.
        // If the ID never becomes valid, it will just stay loading unless handled elsewhere.
        // Consider adding a timeout or specific error if ID remains invalid.
        // For now, we just return and wait for a valid ID.
        setLoading(true); // Ensure loading remains true if no ID
        return;
      }

      setLoading(true); // Set loading true when starting fetch with a valid ID
      setError(null);
      console.log(
        `useTestDetails: Attempting to fetch test details for ID: ${testId}`
      );

      try {
        // Fetch test details (metadata only) from the backend API
        const fetchedTestData = await fetchWithAuth(`/tests/${testId}`);
        console.log(
          "useTestDetails: Fetched test details data:",
          fetchedTestData
        );

        if (!fetchedTestData || typeof fetchedTestData !== "object") {
          // Handle cases where data is null or not an object after a successful fetch
          throw new Error("Received invalid or empty data for test details.");
        }

        setTest(fetchedTestData); // Set the detailed test metadata
      } catch (err) {
        console.error("useTestDetails: Failed to fetch test details:", err);
        let errorMessage = err.message || "Could not load test details.";
        // Handle specific errors like 404 Not Found if needed
        if (err.message?.toLowerCase().includes("not found")) {
          errorMessage = `Test with ID ${testId} not found.`;
        }
        setError(errorMessage);
      } finally {
        setLoading(false); // Stop loading regardless of success or error
        console.log("useTestDetails: Finished fetching test details.");
      }
    };

    loadTestDetails();

    // No cleanup needed here unless there were subscriptions
  }, [testId]); // Rerun the effect ONLY if the testId changes

  // Return the state variables
  return { test, loading, error };
}
