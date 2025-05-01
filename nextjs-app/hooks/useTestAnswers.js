// hooks/useTestAnswers.js
import { useState, useCallback } from "react";

export function useTestAnswers() {
  // State objects are now keyed by testQuestionId
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState({});
  const [shortAnswers, setShortAnswers] = useState({});
  const [longAnswers, setLongAnswers] = useState({});
  const [canvasStates, setCanvasStates] = useState({});
  const [completedQuestions, setCompletedQuestions] = useState({}); // For UI state
  const [markedForReview, setMarkedForReview] = useState({}); // For UI state
  const [savedStatus, setSavedStatus] = useState("saved"); // 'saved', 'unsaved', 'saving', 'error'

  // --- Initialization Function ---
  // Accepts savedAnswers object (from backend) and the questions array (for type checking)
  const initializeAnswers = useCallback((savedAnswers, questions) => {
    // Reset state before initialization
    setMultipleChoiceAnswers({});
    setShortAnswers({});
    setLongAnswers({});
    setCanvasStates({});
    setCompletedQuestions({});
    setMarkedForReview({}); // Reset review marks unless you want to preserve them

    // Input validation
    if (
      !savedAnswers ||
      typeof savedAnswers !== "object" ||
      !Array.isArray(questions)
    ) {
      console.warn(
        "useTestAnswers: Invalid input for initialization. Skipping.",
        { savedAnswers, questions }
      );
      setSavedStatus("saved"); // Still consider it 'saved' as it's the initial load state
      return;
    }

    console.log(
      "useTestAnswers: Initializing with saved answers:",
      savedAnswers
    );

    // Create a map for quick question lookup by testQuestionId
    const questionsMap = questions.reduce((map, q) => {
      if (q && q.testQuestionId) {
        map[q.testQuestionId] = q;
      }
      return map;
    }, {});

    const initialMC = {};
    const initialShort = {};
    const initialLong = {};
    const initialCanvas = {};
    const initialCompleted = {};
    // const initialReview = {}; // Uncomment if you load review status from backend

    for (const testQuestionId in savedAnswers) {
      const answerData = savedAnswers[testQuestionId];
      const question = questionsMap[testQuestionId];

      // Check if we have corresponding question data and an actual answer
      if (
        question &&
        answerData &&
        answerData.userAnswer !== undefined &&
        answerData.userAnswer !== null
      ) {
        const answer = answerData.userAnswer;
        initialCompleted[testQuestionId] = true; // Mark as completed if answer exists

        // Assign answer to the correct state based on questionType
        switch (question.questionType) {
          case "multiple_choice":
          case "multiple_select": // Assuming single string/value selection for now
            initialMC[testQuestionId] = answer;
            break;
          case "short_answer":
            initialShort[testQuestionId] = answer;
            break;
          case "long_answer":
            // Store as is (might be string or other type if backend handles JSON)
            initialLong[testQuestionId] = answer;
            break;
          case "drawing": // Match your specific type name
            // Attempt to parse if it's a string, otherwise store as is
            try {
              initialCanvas[testQuestionId] =
                typeof answer === "string" ? JSON.parse(answer) : answer;
            } catch (e) {
              console.error(
                `Failed to parse canvas state for ${testQuestionId}:`,
                answer,
                e
              );
              initialCanvas[testQuestionId] = null; // Or some default empty state
            }
            break;
          default:
            console.warn(
              `Unknown question type "${question.questionType}" during initialization for ${testQuestionId}`
            );
        }

        // Example: Load review status if included in answerData
        // if (answerData.isMarked) {
        //   initialReview[testQuestionId] = true;
        // }
      }
    }

    // Set the states after processing all saved answers
    setMultipleChoiceAnswers(initialMC);
    setShortAnswers(initialShort);
    setLongAnswers(initialLong);
    setCanvasStates(initialCanvas);
    setCompletedQuestions(initialCompleted);
    // setMarkedForReview(initialReview); // Set if loading review status

    setSavedStatus("saved"); // Initial state is considered saved
    console.log("useTestAnswers: Initialization complete.");
  }, []); // No dependencies, relies on arguments passed when called

  // --- State Update Handlers (using testQuestionId) ---
  const updateAnswerState = useCallback((setter, testQuestionId, value) => {
    if (!testQuestionId) {
      console.warn("updateAnswerState called with invalid testQuestionId");
      return;
    }
    setter((prev) => ({ ...prev, [testQuestionId]: value }));
    setSavedStatus("unsaved");
  }, []);

  const markQuestionCompleted = useCallback(
    (testQuestionId, completed = true) => {
      if (!testQuestionId) return;
      setCompletedQuestions((prev) => {
        // Only update and change save status if the value actually changes
        if (!!prev[testQuestionId] !== completed) {
          setSavedStatus("unsaved");
          return { ...prev, [testQuestionId]: completed };
        }
        return prev;
      });
    },
    []
  );

  // Handlers now accept testQuestionId
  const handleMultipleChoiceChange = useCallback(
    (testQuestionId, value) => {
      updateAnswerState(setMultipleChoiceAnswers, testQuestionId, value);
      markQuestionCompleted(testQuestionId, true); // Auto-mark MC as completed
    },
    [updateAnswerState, markQuestionCompleted]
  );

  const handleShortAnswerChange = useCallback(
    (testQuestionId, value) => {
      updateAnswerState(setShortAnswers, testQuestionId, value);
      // Mark completed if non-empty (adjust logic if needed)
      markQuestionCompleted(testQuestionId, value.trim().length > 0);
    },
    [updateAnswerState, markQuestionCompleted]
  );

  const handleLongAnswerChange = useCallback(
    (testQuestionId, value) => {
      updateAnswerState(setLongAnswers, testQuestionId, value);
      // Mark completed if non-empty (adjust logic if needed)
      markQuestionCompleted(testQuestionId, value.trim().length > 0);
    },
    [updateAnswerState, markQuestionCompleted]
  );

  const handleSetCanvasStates = useCallback(
    (testQuestionId, newState) => {
      updateAnswerState(setCanvasStates, testQuestionId, newState);
      // Mark complete if there's *any* non-null state? Adjust as needed.
      markQuestionCompleted(
        testQuestionId,
        newState !== null && newState !== undefined
      );
    },
    [updateAnswerState, markQuestionCompleted]
  );

  const toggleMarkForReview = useCallback((testQuestionId) => {
    if (!testQuestionId) return;
    setMarkedForReview((prev) => {
      const newState = { ...prev, [testQuestionId]: !prev[testQuestionId] };
      // Toggling review should mark state as unsaved if needed for save progress
      setSavedStatus("unsaved");
      return newState;
    });
  }, []);

  // --- Payload Generation for Submission (RPC Format) ---
  const getAnswersForSubmission = useCallback(
    (questions) => {
      // Expects questions array containing { testQuestionId, questionType, ... }
      const answersToSubmit = {};
      if (!Array.isArray(questions)) {
        console.error(
          "getAnswersForSubmission: Invalid questions array received."
        );
        return answersToSubmit;
      }

      questions.forEach((q) => {
        const tqId = q?.testQuestionId;
        if (!tqId) {
          console.warn(
            "getAnswersForSubmission: Skipping question with missing testQuestionId",
            q
          );
          return; // Skip if question or ID is invalid
        }

        let userAnswer = null; // Default to null
        const questionType = q.questionType;

        // Retrieve the current answer from state based on type
        switch (questionType) {
          case "multiple_choice":
          case "multiple_select": // Assuming stored as string/value
            userAnswer = multipleChoiceAnswers[tqId] ?? null;
            break;
          case "short_answer":
            userAnswer = shortAnswers[tqId] ?? null;
            break;
          case "long_answer":
            userAnswer = longAnswers[tqId] ?? null;
            break;
          case "drawing": // Match your specific type name
            const canvasState = canvasStates[tqId];
            // Backend RPC expects JSON or JSON string? Assuming JSON object/null.
            // Stringify *here* if the RPC function specifically needs a string.
            // Example: userAnswer = canvasState ? JSON.stringify(canvasState) : null;
            userAnswer = canvasState ?? null;
            break;
          default:
            console.warn(
              `Unknown question type "${questionType}" during submission preparation for ${tqId}`
            );
            userAnswer = null; // Send null for unknown types
        }

        // Add to payload object: { [testQuestionId]: { userAnswer: ... } }
        answersToSubmit[tqId] = { userAnswer: userAnswer };
      });

      console.log(
        "Generated answers for submission (RPC format):",
        answersToSubmit
      );
      return answersToSubmit;
    },
    // Dependencies include all the answer state objects
    [multipleChoiceAnswers, shortAnswers, longAnswers, canvasStates]
  );

  return {
    // State variables
    multipleChoiceAnswers,
    shortAnswers,
    longAnswers,
    canvasStates,
    completedQuestions, // Keep for UI
    markedForReview, // Keep for UI
    savedStatus,
    // Handlers and functions
    handlers: {
      initializeAnswers, // Expose the initialization function
      handleMultipleChoiceChange,
      handleShortAnswerChange,
      handleLongAnswerChange,
      handleSetCanvasStates,
      toggleMarkForReview,
      markQuestionCompleted, // Expose if needed directly by components
      setSavedStatus, // Allow external control
    },
    getAnswersForSubmission, // Expose the specific submission payload function
  };
}
