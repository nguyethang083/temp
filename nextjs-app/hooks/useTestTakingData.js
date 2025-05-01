import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/pages/api/helper";

/**
 * Custom hook to fetch the data needed to start taking a specific test.
 * Fetches test metadata and sanitized questions (no answers).
 * @param {string | undefined | null} testId - The ID of the test to fetch.
 * @returns {{ testData: object | null, loading: boolean, error: string | null }}
 */
export function useTestTakingData(testId) {
  // State holds the combined test metadata and sanitized questions list
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTestDataForAttempt = async () => {
      // Don't fetch if ID is not valid or available yet
      if (!testId || typeof testId !== "string") {
        console.log(
          "useTestTakingData: Test ID is not valid or available yet.",
          testId
        );
        setLoading(true); // Keep loading if no valid ID
        return;
      }

      setLoading(true);
      setError(null);
      console.log(
        `useTestTakingData: Attempting to fetch test data for attempt: ${testId}`
      );

      try {
        // Call the backend endpoint to get test data for taking UI
        const fetchedData = await fetchWithAuth(
          `/tests/${testId}/data-for-taking`
        );
        console.log("useTestTakingData: Fetched data:", fetchedData);

        if (
          !fetchedData ||
          typeof fetchedData !== "object" ||
          !Array.isArray(fetchedData.questions)
        ) {
          throw new Error("Received invalid data format for test attempt.");
        }

        setTestData(fetchedData); // Set the combined metadata and questions
      } catch (err) {
        console.error("useTestTakingData: Failed to fetch test data:", err);
        let errorMessage = err.message || "Could not load test data.";
        if (err.message?.toLowerCase().includes("not found")) {
          errorMessage = `Test with ID ${testId} not found or is inactive.`;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
        console.log("useTestTakingData: Finished fetching test data.");
      }
    };

    loadTestDataForAttempt();
  }, [testId]); // Rerun effect if the testId changes

  // Return the state variables
  return { testData, loading, error };
}
