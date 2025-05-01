import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { fetchWithAuth } from "@/pages/api/helper"; // Ensure correct path

export function useTestDetails(testId) {
  const [test, setTest] = useState(null);
  const [attemptStatus, setAttemptStatus] = useState(null);
  const [attempts, setAttempts] = useState([]); // State for attempts list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptsError, setAttemptsError] = useState(null); // Specific error for attempts fetch

  // Use useCallback to memoize the fetch function
  const loadData = useCallback(async () => {
    // Use an AbortController to handle component unmounting during fetch
    const controller = new AbortController();
    const signal = controller.signal;

    if (!testId || typeof testId !== "string") {
      setLoading(false); // Stop loading if no ID
      setTest(null);
      setAttemptStatus(null);
      setAttempts([]);
      setError(null);
      setAttemptsError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setAttemptsError(null); // Reset errors
    setTest(null); // Reset data on new fetch
    setAttemptStatus(null);
    setAttempts([]);
    console.log(
      `useTestDetails: Fetching details, status & attempts for ID: ${testId}`
    );

    try {
      // --- 1. Fetch Test Details ---
      console.log(`useTestDetails: Fetching test details for ID: ${testId}`);
      const fetchedTestData = await fetchWithAuth(`/tests/${testId}`, {
        signal,
      });
      console.log("useTestDetails: Fetched test details:", fetchedTestData);
      if (!fetchedTestData || typeof fetchedTestData !== "object") {
        throw new Error("Received invalid data for test details.");
      }
      setTest(fetchedTestData);

      // --- 2. Fetch Attempt Status ---
      try {
        console.log(
          `useTestDetails: Fetching attempt status for test ID: ${testId}`
        );
        const statusData = await fetchWithAuth(`/tests/${testId}/status`, {
          signal,
        });
        if (statusData && statusData.status) {
          console.log(
            "useTestDetails: Fetched attempt status:",
            statusData.status
          );
          setAttemptStatus(statusData.status);
        } else {
          console.warn(
            "useTestDetails: Received invalid status data, defaulting to 'not_started'.",
            statusData
          );
          setAttemptStatus("not_started");
        }
      } catch (statusError) {
        // Don't throw here, just log and set status to error
        console.error(
          "useTestDetails: Failed to fetch attempt status:",
          statusError
        );
        setAttemptStatus("error");
        setError((prevError) =>
          prevError
            ? `${prevError} Also failed to load attempt status.`
            : "Could not load attempt status."
        );
      }

      // --- 3. Fetch Previous Attempts ---
      // Only fetch attempts if the main test details loaded successfully
      try {
        console.log(
          `useTestDetails: Fetching previous attempts for test ID: ${testId}`
        );
        // *** Calls the new backend endpoint ***
        // Adjust URL if your API prefix is different (e.g., /api/v1)
        const fetchedAttempts = await fetchWithAuth(
          `/test-attempts/test/${testId}`,
          { signal }
        );
        console.log(
          "useTestDetails: Fetched previous attempts:",
          fetchedAttempts
        );
        // Ensure it's an array before setting
        setAttempts(Array.isArray(fetchedAttempts) ? fetchedAttempts : []);
      } catch (attError) {
        // Log specific error for attempts, don't overwrite main error unless desired
        console.error(
          "useTestDetails: Failed to fetch previous attempts:",
          attError
        );
        setAttemptsError("Could not load previous attempts."); // Set specific attempts error
        setAttempts([]); // Ensure attempts is empty on error
      }
    } catch (err) {
      // Handle errors from fetching Test Details primarily
      if (err.name === "AbortError") {
        console.log("useTestDetails: Fetch aborted.");
        return; // Don't update state if fetch was aborted
      }
      console.error("useTestDetails: Failed during data loading:", err);
      let errorMessage = err.message || "Could not load test data.";
      // Example: Check for specific error types if your fetchWithAuth throws them
      if (
        err.status === 404 ||
        err.message?.toLowerCase().includes("not found")
      ) {
        errorMessage = `Test with ID ${testId} not found.`;
      }
      setError(errorMessage);
      setTest(null); // Clear data on error
      setAttemptStatus(null);
      setAttempts([]);
    } finally {
      // Check if the signal was aborted before setting loading to false
      if (!signal.aborted) {
        setLoading(false); // Stop loading
        console.log("useTestDetails: Finished fetching attempts.");
      }
    }
  }, [testId]); // Dependency array includes testId

  useEffect(() => {
    loadData();

    // Cleanup function to abort fetch if component unmounts or testId changes
    const controller = new AbortController(); // Create controller instance locally for cleanup reference
    return () => {
      console.log("useTestDetails: Cleanup, aborting potential fetch.");
      controller.abort(); // Abort any ongoing fetch associated with this effect instance
    };
  }, [loadData]); // Run effect when loadData function changes (due to testId change)

  // Return all relevant states
  return { test, attemptStatus, attempts, loading, error, attemptsError };
}
