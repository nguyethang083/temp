import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/pages/api/helper"; // Assuming your helper exists

export function useTestAttempt(testId, isReadyToStart) {
  const [attemptStartData, setAttemptStartData] = useState(null);
  const [loadingAttempt, setLoadingAttempt] = useState(true);
  const [attemptError, setAttemptError] = useState(null);

  useEffect(() => {
    // Only run when ID is available and the component signals readiness
    if (!testId || !isReadyToStart) {
      setLoadingAttempt(false); // Not ready to load yet or ID missing
      return;
    }

    let isMounted = true;
    setLoadingAttempt(true);
    setAttemptError(null);
    setAttemptStartData(null); // Reset previous data on new trigger

    const startOrResume = async () => {
      console.log(
        `useTestAttempt: Calling start/resume endpoint for testId: ${testId}`
      );
      try {
        const responseData = await fetchWithAuth(
          `/tests/${testId}/attempts/start`,
          {
            method: "POST",
          }
        );

        // Assuming fetchWithAuth throws on non-2xx or returns parsed JSON
        if (isMounted) {
          // Validate the structure received from the backend RPC
          if (
            responseData &&
            responseData.attempt &&
            responseData.questions &&
            responseData.savedAnswers
          ) {
            console.log(
              "useTestAttempt: Received start/resume data:",
              responseData
            );
            setAttemptStartData(responseData); // Store the whole { attempt, test, questions, savedAnswers } structure
          } else {
            console.error(
              "useTestAttempt: Invalid data structure received from start/resume endpoint",
              responseData
            );
            setAttemptError(
              "Received invalid data from server when starting attempt."
            );
          }
        }
      } catch (error) {
        console.error(
          "useTestAttempt: Error starting/resuming test attempt:",
          error
        );
        if (isMounted) {
          // Provide a more specific error if possible (e.g., from error.message)
          setAttemptError(
            error.message || "Failed to start or resume test attempt"
          );
        }
      } finally {
        if (isMounted) {
          setLoadingAttempt(false);
        }
      }
    };

    startOrResume();

    return () => {
      isMounted = false; // Cleanup on unmount or dependency change
    };
  }, [testId, isReadyToStart]); // Dependencies

  // Return the state variables including the full data structure
  return { attemptStartData, loadingAttempt, attemptError };
}
