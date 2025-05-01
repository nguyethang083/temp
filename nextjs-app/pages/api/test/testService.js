import { fetchWithAuth } from "@/pages/api/helper";

/**
 * Fetches the detailed results for a specific test attempt.
 *
 * Assumes a backend endpoint exists at GET /test-attempts/{attemptId}/result
 * which returns the comprehensive result data including attempt details,
 * test details, and detailed question/answer information.
 *
 * @param {string} attemptId - The UUID of the test attempt to fetch results for.
 * @returns {Promise<object>} A promise that resolves to the detailed test result object.
 * @throws {Error} Throws an error if the fetch fails or the backend returns an error status.
 */
export async function fetchAttemptResult(attemptId) {
  if (!attemptId) {
    console.error("fetchAttemptResult: attemptId is required.");
    throw new Error("Attempt ID is required to fetch results.");
  }

  // Construct the API endpoint URL
  // Make sure this matches the actual endpoint defined in your NestJS controller
  const apiUrl = `/test-attempts/${attemptId}/result`;

  console.log(`Fetching attempt result from: ${apiUrl}`);

  try {
    // Use the fetchWithAuth helper to make the authenticated GET request
    // fetchWithAuth should handle adding auth tokens and potentially basic error handling
    const resultData = await fetchWithAuth(apiUrl, {
      method: "GET", // Explicitly setting method GET
    });

    // Assuming fetchWithAuth throws an error for non-2xx responses
    // or returns the parsed JSON data on success.
    console.log(`Successfully fetched result data for attempt ${attemptId}`);
    return resultData;
  } catch (error) {
    // Log the specific error encountered during the fetch
    console.error(
      `Error fetching result for attempt ${attemptId} from ${apiUrl}:`,
      error
    );

    // Re-throw the error or throw a more specific one
    // The calling component (TestResultsPage) should handle this error.
    throw new Error(
      `Failed to fetch test result: ${error.message || "Unknown error"}`
    );
  }
}
