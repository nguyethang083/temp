import axios from "axios";

// Configure axios defaults (optional)
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_FRAPPE_URL}/api`,
  withCredentials: true,
});

/**
 * Fetch a complete test with all details
 * @param {string} testId - The ID of the test to fetch
 * @returns {Promise<Object>} - Test data including questions
 */
export async function fetchTest(testId) {
  try {
    const response = await api.get(`/resource/Test/${testId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching test:", error);
    throw error;
  }
}

/**
 * Fetch details of a specific question
 * @param {string} questionId - The ID of the question to fetch
 * @returns {Promise<Object>} - Question data
 */
export async function fetchQuestionDetails(questionId) {
  try {
    const response = await api.get(`/resource/Question/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching question details:", error);
    throw error;
  }
}

/**
 * Save test progress
 * @param {string} testId - The ID of the test
 * @param {Object} testData - The test progress data to save
 * @returns {Promise<Object>} - Response data
 */
export async function saveTestProgress(testId, testData) {
  try {
    const response = await api.post(
      `/method/elearning.api.save_test_progress`,
      {
        test_id: testId,
        progress_data: testData,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving test progress:", error);
    throw error;
  }
}

/**
 * Start a new test attempt using custom API method
 * @param {string} testId - The ID of the test
 * @returns {Promise<Object>} - Test attempt data including ID
 */
export async function startTestAttempt(testId) {
  try {
    // Use the custom method in your Python file
    const response = await api.post(
      `/method/elearning.api.test_api.start_test_attempt`,
      {
        test_id: testId,
      }
    );

    // The server response is in response.data.message for custom methods
    return {
      test_attempt_id: response.data.message.test_attempt_id,
      message:
        response.data.message.message || "Test attempt started successfully",
    };
  } catch (error) {
    console.error("Error starting test attempt:", error);

    // Enhanced error handling
    if (error.response && error.response.data) {
      if (error.response.data._server_messages) {
        try {
          const messages = JSON.parse(error.response.data._server_messages);
          console.error("Server error messages:", messages);
        } catch (e) {
          console.error(
            "Raw server error:",
            error.response.data._server_messages
          );
        }
      }
    }

    throw error;
  }
}

/**
 * Submit completed test answers using the custom API method
 * @param {string} testId - The ID of the test
 * @param {Object} submissionData - The complete test submission data
 * @param {string} testAttemptId - The ID of the test attempt
 * @returns {Promise<Object>} - Response data
 */
export async function submitTest(testId, submissionData, testAttemptId) {
  try {
    // Ensure all IDs are strings
    const testIdStr = String(testId);
    const testAttemptIdStr = String(testAttemptId);

    // Clean up the submission data to ensure it's properly formatted
    const cleanedSubmissionData = {
      multipleChoiceAnswers: {},
      shortAnswers: submissionData.shortAnswers || {},
      longAnswers: submissionData.longAnswers || {},
      questionMapping: submissionData.questionMapping || {},
      time_taken: Number(submissionData.time_taken) || 0,
    };

    // Make sure option IDs are properly formatted (lowercase letters)
    if (submissionData.multipleChoiceAnswers) {
      Object.entries(submissionData.multipleChoiceAnswers).forEach(
        ([key, value]) => {
          if (value) {
            // Ensure the option ID is a lowercase string (a, b, c, d)
            cleanedSubmissionData.multipleChoiceAnswers[key] =
              String(value).toLowerCase();
          }
        }
      );
    }

    // If we have canvas states, include them
    if (submissionData.canvasStates) {
      cleanedSubmissionData.canvasStates = {};

      // Only include non-empty canvas states
      Object.entries(submissionData.canvasStates).forEach(([key, value]) => {
        if (value) {
          cleanedSubmissionData.canvasStates[key] = value;
        }
      });
    }

    // Use the custom API method
    const response = await api.post(
      `/method/elearning.api.test_api.submit_test`,
      {
        test_id: testIdStr,
        test_attempt_id: testAttemptIdStr,
        submission_data: cleanedSubmissionData,
      }
    );

    // Return the data from the response
    return response.data.message || response.data;
  } catch (error) {
    console.error("Error submitting test:", error);

    // Enhanced error handling
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);

      // If there are server messages, parse and log them
      if (error.response.data && error.response.data._server_messages) {
        try {
          const messages = JSON.parse(error.response.data._server_messages);
          console.error("Server error messages:", messages);

          // Extract the actual error message from the server response
          const errorMessages = Array.isArray(messages)
            ? messages
                .map((msg) => {
                  try {
                    return JSON.parse(msg).message || msg;
                  } catch (e) {
                    return msg;
                  }
                })
                .join(", ")
            : "Unknown server error";

          error.serverMessage = errorMessages;
        } catch (e) {
          console.error(
            "Raw server error:",
            error.response.data._server_messages
          );
        }
      }
    }

    throw error;
  }
}
