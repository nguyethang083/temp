// hooks/useTestDetails.js
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/pages/api/helper"; // Ensure correct path

export function useTestDetails(testId) {
  const [test, setTest] = useState(null);
  // State for attempt status: 'not_started', 'in_progress', 'completed', null (loading), 'error'
  const [attemptStatus, setAttemptStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Flag to prevent state updates if component unmounts during async ops
    let isMounted = true;

    const loadData = async () => {
      if (!testId || typeof testId !== "string") {
        // Only reset if component is still mounted
        if (isMounted) {
          setLoading(true);
          setTest(null);
          setAttemptStatus(null);
          setError(null);
        }
        return; // Wait for a valid ID
      }

      // Set loading state only if mounted
      if (isMounted) {
        setLoading(true);
        setError(null);
        setTest(null);
        setAttemptStatus(null);
        console.log(
          `useTestDetails: Fetching details & status for ID: ${testId}`
        );
      }

      let fetchedTestData = null;

      try {
        // 1. Fetch Test Details (Metadata)
        fetchedTestData = await fetchWithAuth(`/tests/${testId}`);
        if (!isMounted) return; // Exit if unmounted during fetch

        console.log("useTestDetails: Fetched test details:", fetchedTestData);
        if (!fetchedTestData || typeof fetchedTestData !== "object") {
          throw new Error("Received invalid data for test details.");
        }
        setTest(fetchedTestData); // Set test details state

        // 2. Fetch Attempt Status (Now that we have valid test details)
        try {
          console.log(
            `useTestDetails: Fetching attempt status for test ID: ${testId}`
          );
          // *** Calls the new backend endpoint ***
          const statusData = await fetchWithAuth(`/tests/${testId}/status`);
          if (!isMounted) return; // Exit if unmounted

          if (statusData && statusData.status) {
            console.log(
              "useTestDetails: Fetched attempt status:",
              statusData.status
            );
            setAttemptStatus(statusData.status); // Set status state
          } else {
            // If endpoint returns empty or invalid data, assume 'not_started'
            console.warn(
              "useTestDetails: Received invalid status data, defaulting to 'not_started'.",
              statusData
            );
            setAttemptStatus("not_started");
          }
        } catch (statusError) {
          if (!isMounted) return; // Exit if unmounted
          console.error(
            "useTestDetails: Failed to fetch attempt status:",
            statusError
          );
          setAttemptStatus("error"); // Indicate status fetch failed
          // Optionally add to the main error state or keep separate
          setError((prevError) =>
            prevError
              ? `${prevError} Also failed to load attempt status.`
              : "Could not load attempt status."
          );
        }
      } catch (err) {
        if (!isMounted) return; // Exit if unmounted
        // Error fetching main test details
        console.error("useTestDetails: Failed to fetch test details:", err);
        let errorMessage = err.message || "Could not load test details.";
        if (err.message?.toLowerCase().includes("not found")) {
          errorMessage = `Test with ID ${testId} not found.`;
        }
        setError(errorMessage);
        setTest(null);
        setAttemptStatus(null); // Reset status on main error
      } finally {
        if (isMounted) {
          setLoading(false); // Stop loading
          console.log("useTestDetails: Finished fetching.");
        }
      }
    };

    loadData();

    // Cleanup function to set isMounted to false when the component unmounts
    return () => {
      isMounted = false;
    };
  }, [testId]); // Rerun only if testId changes

  // Return the state variables including attemptStatus
  return { test, attemptStatus, loading, error };
}
