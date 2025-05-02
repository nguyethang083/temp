import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/pages/api/helper"; // Adjust path as needed

/**
 * Custom hook to fetch tests, optionally filtered by topicId and gradeLevel.
 * Fetches 'Assessment' type tests if topicId is provided, otherwise fetches 'Practice' type tests.
 * Handles loading and error states.
 *
 * @param {object} [filters={}] - Optional filter parameters.
 * @param {string|number|null} [filters.topicId] - The ID of the topic to filter by.
 * @param {string|null} [filters.gradeLevel] - The grade level to filter by.
 * @returns {{ tests: Array, loading: boolean, error: string|null }}
 */
export function usePracticeTests(filters = {}) {
  const { topicId, gradeLevel } = filters; // Destructure filters

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true); // Start loading initially
  const [error, setError] = useState(null);

  // Re-fetch whenever topicId or gradeLevel filter changes
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component

    const loadPracticeTests = async () => {
      setLoading(true);
      setError(null);
      setTests([]); // Clear previous results on new fetch
      console.log(
        "usePracticeTests: Attempting to fetch tests with filters:",
        filters
      );

      try {
        // Build query parameters string dynamically
        const queryParams = new URLSearchParams();

        // *** Determine testType based on topicId ***
        const testTypeToFetch = topicId ? "Assessment" : "Practice";
        queryParams.append("testType", testTypeToFetch);
        // *******************************************

        if (topicId) {
          // Ensure topicId is appended if it exists
          queryParams.append("topicId", String(topicId));
        }
        if (gradeLevel) {
          queryParams.append("gradeLevel", gradeLevel); // Add gradeLevel if provided
        }
        // Add other filters here if needed

        const queryString = queryParams.toString();
        const apiUrl = `/tests${queryString ? `?${queryString}` : ""}`; // Append query string

        console.log(`usePracticeTests: Calling API: ${apiUrl}`);
        const fetchedTests = await fetchWithAuth(apiUrl); // Fetch with filters

        console.log("usePracticeTests: Fetched tests data:", fetchedTests);

        if (!isMounted) return;

        if (!Array.isArray(fetchedTests)) {
          console.warn(
            "usePracticeTests: Received non-array data for tests, setting to empty array."
          );
          setTests([]);
        } else {
          setTests(fetchedTests);
        }

        console.log("usePracticeTests: Tests state updated.");
      } catch (err) {
        console.error("usePracticeTests: Failed to fetch tests:", err);
        if (isMounted) {
          setError(err.message || "Could not load practice tests.");
          setTests([]); // Ensure tests are cleared on error
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
    // Dependency array includes filter values
  }, [topicId, gradeLevel]); // Re-run effect if topicId or gradeLevel changes

  // Return the state variables needed by the component
  return { tests, loading, error };
}
