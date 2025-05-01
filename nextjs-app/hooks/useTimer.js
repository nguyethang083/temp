import { useState, useEffect, useRef } from "react";

export const useTimer = (initialSeconds, options = {}) => {
  const { onComplete } = options; // Destructure onComplete callback from options

  // State to hold the current countdown value
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  // Refs to store the interval ID and the callback without causing effect re-runs
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // Keep the callback ref up-to-date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Main effect to manage the timer interval
  useEffect(() => {
    // --- Reset Logic ---
    // When initialSeconds changes (e.g., from 0 to 7200 after load),
    // reset the internal timeLeft state.
    console.log(
      `useTimer Effect: Received initialSeconds = ${initialSeconds}. Resetting internal state.`
    );
    setTimeLeft(initialSeconds);

    // --- Interval Cleanup ---
    // Always clear any previous interval before potentially starting a new one.
    if (intervalRef.current) {
      console.log(
        "useTimer Effect: Clearing previous interval ID:",
        intervalRef.current
      );
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // --- Interval Start ---
    // Only start a new interval if the initial time is positive.
    if (initialSeconds > 0) {
      console.log(
        `useTimer Effect: Starting new interval for ${initialSeconds} seconds.`
      );
      intervalRef.current = setInterval(() => {
        // Use the functional update form of setState
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Check if the *next* second will be 0
            clearInterval(intervalRef.current); // Stop the interval
            intervalRef.current = null;
            console.log("useTimer Interval: Timer finished!");
            // Execute the callback if it exists
            if (
              onCompleteRef.current &&
              typeof onCompleteRef.current === "function"
            ) {
              console.log("useTimer Interval: Calling onComplete.");
              onCompleteRef.current();
            }
            return 0; // Set final state to 0
          }
          return prev - 1; // Decrement
        });
      }, 1000); // Run every second
      console.log("useTimer Effect: Started interval ID:", intervalRef.current);
    } else {
      console.log(
        "useTimer Effect: initialSeconds <= 0. Not starting interval."
      );
      // Ensure timeLeft is 0 if initialSeconds is 0 or less
      setTimeLeft(0);
    }

    // --- Effect Cleanup ---
    // This cleanup runs when the component unmounts OR when initialSeconds changes (before the effect runs again)
    return () => {
      if (intervalRef.current) {
        console.log(
          "useTimer Cleanup: Clearing interval ID:",
          intervalRef.current
        );
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [initialSeconds]); // *** IMPORTANT: This effect re-runs only when initialSeconds changes ***

  // Return the current time left
  return timeLeft;
};
