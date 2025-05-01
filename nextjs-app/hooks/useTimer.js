import { useState, useEffect } from "react";

export const useTimer = (initialSeconds) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          // Add logic here if needed when timer reaches 0 (e.g., auto-submit)
          console.log("Timer finished!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup interval on component unmount or when initialSeconds changes
    return () => clearInterval(timer);
  }, [initialSeconds]); // Re-run effect if initialSeconds changes (though unlikely needed here)

  return timeLeft;
};
