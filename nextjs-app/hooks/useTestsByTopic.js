import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/pages/api/helper";

export function useTestsByTopic(topicId, options = { skip: false }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Fixed: Removed the incorrect TypeScript syntax

  useEffect(() => {
    if (!topicId || options.skip) {
      setTests([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchTests = async () => {
      setLoading(true);
      setError(null);
      setTests([]);
      console.log(
        `useTestsByTopic: Fetching tests using findAllActive for topic ID: ${topicId}`
      );

      try {
        const apiUrl = `/tests?topicId=${encodeURIComponent(topicId)}`;
        const data = await fetchWithAuth(apiUrl, { method: "GET" });

        setTests(data || []);
      } catch (err) {
        console.error(
          `useTestsByTopic: Error fetching tests for topic ${topicId}:`,
          err
        );
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(`Failed to load tests for this topic. ${errorMessage}`);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [topicId, options.skip]);

  return { tests, loading, error };
}
