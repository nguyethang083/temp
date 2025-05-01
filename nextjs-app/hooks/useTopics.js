import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/pages/api/helper";
import { getTopicColor } from "@/lib/utils"; // Adjust path if needed

/**
 * Custom hook to fetch topics, handle loading/error states,
 * and assign colors.
 * @returns {{ topics: Array, loading: boolean, error: string|null }}
 */
export function useTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component

    const loadTopics = async () => {
      // Reset states on new fetch attempt
      setLoading(true);
      setError(null);
      console.log("useTopics: Attempting to fetch topics...");

      try {
        // Fetch topics from the backend API
        const fetchedTopics = await fetchWithAuth("/topics"); // Use your authenticated fetch
        console.log("useTopics: Fetched topics data:", fetchedTopics);

        if (!isMounted) return; // Exit if component unmounted during fetch

        if (!Array.isArray(fetchedTopics)) {
          throw new Error("Received invalid data format for topics.");
        }

        // Add color property to each topic
        const topicsWithColor = fetchedTopics.map((topic) => ({
          ...topic,
          color: getTopicColor(topic.name), // Assign color using utility function
        }));

        setTopics(topicsWithColor);
        console.log("useTopics: Topics state updated with color.");
      } catch (err) {
        console.error("useTopics: Failed to fetch topics:", err);
        if (isMounted) {
          setError(err.message || "Could not load topics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("useTopics: Finished fetching topics.");
        }
      }
    };

    loadTopics();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Return the state variables needed by the component
  return { topics, loading, error };
}
