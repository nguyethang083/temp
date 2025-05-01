import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/pages/api/helper";

/**
 * Custom hook to fetch Practice tests, handle loading/error states.
 * @returns {{ tests: Array, loading: boolean, error: string|null }}
 */
export function usePracticeTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component

    const loadPracticeTests = async () => {
      setLoading(true);
      setError(null);
      console.log("usePracticeTests: Attempting to fetch practice tests...");

      try {
        // Fetch tests from the backend API, filtering by test_type=Practice
        // Adjust query parameter name if different in your backend DTO
        const fetchedTests = await fetchWithAuth("/tests?testType=Practice");
        console.log(
          "usePracticeTests: Fetched practice tests data:",
          fetchedTests
        );

        if (!isMounted) return;

        if (!Array.isArray(fetchedTests)) {
          throw new Error("Received invalid data format for tests.");
        }

        setTests(fetchedTests);
        console.log("usePracticeTests: Tests state updated.");
      } catch (err) {
        console.error("usePracticeTests: Failed to fetch tests:", err);
        if (isMounted) {
          setError(err.message || "Could not load practice tests.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("usePracticeTests: Finished fetching tests.");
        }
      }
    };

    loadPracticeTests();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Return the state variables needed by the component
  return { tests, loading, error };
}
