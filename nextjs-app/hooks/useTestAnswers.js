// hooks/useTestAnswers.js
import { useState, useCallback, useRef, useEffect } from "react";

export function useTestAnswers() {
  // --- Answer State ---
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState({});
  const [shortAnswers, setShortAnswers] = useState({});
  const [longAnswers, setLongAnswers] = useState({});
  const [canvasStates, setCanvasStates] = useState({});

  // --- UI/Meta State ---
  const [completedQuestions, setCompletedQuestions] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [savedStatus, setSavedStatus] = useState("saved"); // 'saved', 'unsaved', 'saving', 'error'

  // --- Time Tracking State ---
  const [questionTimeSpent, setQuestionTimeSpent] = useState({}); // Stores total seconds per testQuestionId { [tqId]: number }
  const [activeQuestionId, setActiveQuestionId] = useState(null); // ID of the currently timed question
  const [currentQuestionStartTime, setCurrentQuestionStartTime] =
    useState(null); // Timestamp (Date.now()) when activeQuestionId started

  // Using refs for state that changes frequently inside callbacks but shouldn't trigger re-renders itself
  const activeQuestionIdRef = useRef(activeQuestionId);
  const currentQuestionStartTimeRef = useRef(currentQuestionStartTime);

  // Update refs whenever state changes
  // This helps get the latest value inside callbacks without adding the state itself as a dependency
  // which could cause infinite loops or unwanted re-creations of callbacks.
  useEffect(() => {
    activeQuestionIdRef.current = activeQuestionId;
  }, [activeQuestionId]);

  useEffect(() => {
    currentQuestionStartTimeRef.current = currentQuestionStartTime;
  }, [currentQuestionStartTime]);

  // --- Initialization Function ---
  const initializeAnswers = useCallback((savedAnswers, questions) => {
    // Reset answer state
    setMultipleChoiceAnswers({});
    setShortAnswers({});
    setLongAnswers({});
    setCanvasStates({});
    setCompletedQuestions({});
    setMarkedForReview({});

    // Reset time tracking state
    setQuestionTimeSpent({});
    setActiveQuestionId(null); // Ensure no question is active initially
    setCurrentQuestionStartTime(null); // Ensure no start time is set

    // Reset refs
    activeQuestionIdRef.current = null;
    currentQuestionStartTimeRef.current = null;

    if (
      !savedAnswers ||
      typeof savedAnswers !== "object" ||
      !Array.isArray(questions)
    ) {
      console.warn(
        "useTestAnswers: Invalid input for initialization. Skipping.",
        { savedAnswers, questions }
      );
      setSavedStatus("saved");
      return;
    }

    console.log(
      "useTestAnswers: Initializing with saved answers:",
      savedAnswers
    );
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
    const initialTimeSpent = {}; // Initialize time spent if backend provided it (optional)

    for (const testQuestionId in savedAnswers) {
      const answerData = savedAnswers[testQuestionId];
      const question = questionsMap[testQuestionId];

      if (question && answerData) {
        // Initialize time if provided (e.g., from a previous save progress)
        // Adjust 'timeSpentSeconds' to match the actual field name from your backend if necessary
        if (typeof answerData.timeSpentSeconds === "number") {
          initialTimeSpent[testQuestionId] = answerData.timeSpentSeconds;
        }

        // Initialize answers (existing logic)
        if (
          answerData.userAnswer !== undefined &&
          answerData.userAnswer !== null
        ) {
          const answer = answerData.userAnswer;
          initialCompleted[testQuestionId] = true;
          switch (question.questionType) {
            // ... (cases for multiple_choice, short_answer, long_answer, drawing - same as before)
            case "multiple_choice":
            case "multiple_select":
              initialMC[testQuestionId] = answer;
              break;
            case "short_answer":
              initialShort[testQuestionId] = answer;
              break;
            case "long_answer":
              initialLong[testQuestionId] = answer;
              break;
            case "drawing":
              try {
                initialCanvas[testQuestionId] =
                  typeof answer === "string" ? JSON.parse(answer) : answer;
              } catch (e) {
                console.error(
                  `Failed to parse canvas state for ${testQuestionId}:`,
                  answer,
                  e
                );
                initialCanvas[testQuestionId] = null;
              }
              break;
            default:
              console.warn(
                `Unknown question type "${question.questionType}" during initialization for ${testQuestionId}`
              );
          }
        }
        // ... (load review status if needed)
      }
    }

    setMultipleChoiceAnswers(initialMC);
    setShortAnswers(initialShort);
    setLongAnswers(initialLong);
    setCanvasStates(initialCanvas);
    setCompletedQuestions(initialCompleted);
    setQuestionTimeSpent(initialTimeSpent); // Set initial times if loaded

    setSavedStatus("saved");
    console.log("useTestAnswers: Initialization complete.");
  }, []); // Keep dependencies minimal for init

  // --- Time Tracking Handler ---
  // ** This MUST be called from the parent component (TestDetail) via useEffect when the current question changes **
  const handleQuestionChange = useCallback((newTestQuestionId) => {
    const previousQuestionId = activeQuestionIdRef.current;
    const previousStartTime = currentQuestionStartTimeRef.current;
    const now = Date.now();

    // Stop timer for the *previous* question and update its total time
    if (previousQuestionId && previousStartTime) {
      const durationSeconds = (now - previousStartTime) / 1000;
      setQuestionTimeSpent((prev) => ({
        ...prev,
        [previousQuestionId]: (prev[previousQuestionId] || 0) + durationSeconds,
      }));
      console.log(
        `useTestAnswers: Recorded ${durationSeconds.toFixed(
          2
        )}s for ${previousQuestionId}`
      );
    }

    // Start timer for the *new* question
    if (newTestQuestionId) {
      setActiveQuestionId(newTestQuestionId);
      setCurrentQuestionStartTime(now);
      console.log(
        `useTestAnswers: Started timer for ${newTestQuestionId} at ${now}`
      );
    } else {
      // If newTestQuestionId is null (e.g., navigating away), clear active timer
      setActiveQuestionId(null);
      setCurrentQuestionStartTime(null);
      console.log(`useTestAnswers: No new question. Timer stopped.`);
    }
  }, []); // No dependencies needed as it uses refs and setters

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
        if (!!prev[testQuestionId] !== completed) {
          setSavedStatus("unsaved");
          return { ...prev, [testQuestionId]: completed };
        }
        return prev;
      });
    },
    []
  );

  // Handlers (MC, Short, Long, Canvas) remain largely the same...
  const handleMultipleChoiceChange = useCallback(
    (testQuestionId, value) => {
      updateAnswerState(setMultipleChoiceAnswers, testQuestionId, value);
      markQuestionCompleted(testQuestionId, true);
    },
    [updateAnswerState, markQuestionCompleted]
  );

  const handleShortAnswerChange = useCallback(
    (testQuestionId, value) => {
      updateAnswerState(setShortAnswers, testQuestionId, value);
      markQuestionCompleted(testQuestionId, value.trim().length > 0);
    },
    [updateAnswerState, markQuestionCompleted]
  );

  const handleLongAnswerChange = useCallback(
    (testQuestionId, value) => {
      updateAnswerState(setLongAnswers, testQuestionId, value);
      markQuestionCompleted(testQuestionId, value.trim().length > 0);
    },
    [updateAnswerState, markQuestionCompleted]
  );

  const handleSetCanvasStates = useCallback(
    (testQuestionId, newState) => {
      updateAnswerState(setCanvasStates, testQuestionId, newState);
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
      setSavedStatus("unsaved");
      return newState;
    });
  }, []);

  // --- Payload Generation for Submission (Includes Time Spent) ---
  const getAnswersForSubmission = useCallback(
    (questions) => {
      const answersToSubmit = {};
      if (!Array.isArray(questions)) {
        console.error(
          "getAnswersForSubmission: Invalid questions array received."
        );
        return answersToSubmit;
      }

      // --- Calculate final time for the currently active question ---
      let finalTimeSpent = { ...questionTimeSpent }; // Copy current times
      const lastActiveId = activeQuestionIdRef.current; // Get ID that was active right before submitting
      const lastStartTime = currentQuestionStartTimeRef.current; // Get its start time

      if (lastActiveId && lastStartTime) {
        const durationSeconds = (Date.now() - lastStartTime) / 1000;
        finalTimeSpent[lastActiveId] =
          (finalTimeSpent[lastActiveId] || 0) + durationSeconds;
        console.log(
          `getAnswersForSubmission: Added final ${durationSeconds.toFixed(
            2
          )}s for last active question ${lastActiveId}`
        );
      }
      // --- End final time calculation ---

      questions.forEach((q) => {
        const tqId = q?.testQuestionId;
        if (!tqId) {
          console.warn(
            "getAnswersForSubmission: Skipping question with missing testQuestionId",
            q
          );
          return;
        }

        let userAnswer = null;
        const questionType = q.questionType;

        // Retrieve answer (existing logic)
        switch (questionType) {
          case "multiple_choice":
          case "multiple_select":
            userAnswer = multipleChoiceAnswers[tqId] ?? null;
            break;
          case "short_answer":
            userAnswer = shortAnswers[tqId] ?? null;
            break;
          case "long_answer":
            userAnswer = longAnswers[tqId] ?? null;
            break;
          case "drawing":
            const canvasState = canvasStates[tqId];
            userAnswer = canvasState ?? null; // Assuming backend expects object/null
            break;
          default:
            console.warn(
              `Unknown question type "${questionType}" during submission preparation for ${tqId}`
            );
            userAnswer = null;
        }

        // Retrieve calculated time spent for this question
        const timeSpent = Math.round(finalTimeSpent[tqId] || 0); // Get time from the final calculated map, default 0, round to integer seconds

        // Add to payload object: { [testQuestionId]: { userAnswer: ..., timeSpent: ... } }
        answersToSubmit[tqId] = {
          userAnswer: userAnswer,
          timeSpent: timeSpent, // Add the time spent field
        };
      });

      return answersToSubmit;
    },
    // Dependencies include answer states AND the base questionTimeSpent state
    [
      multipleChoiceAnswers,
      shortAnswers,
      longAnswers,
      canvasStates,
      questionTimeSpent,
    ]
  );

  return {
    // State variables
    multipleChoiceAnswers,
    shortAnswers,
    longAnswers,
    canvasStates,
    completedQuestions,
    markedForReview,
    savedStatus,
    questionTimeSpent, // Expose if needed for display/debug

    // Handlers and functions
    handlers: {
      initializeAnswers,
      handleMultipleChoiceChange,
      handleShortAnswerChange,
      handleLongAnswerChange,
      handleSetCanvasStates,
      toggleMarkForReview,
      markQuestionCompleted,
      setSavedStatus,
      handleQuestionChange, // ** Expose the new handler **
    },
    getAnswersForSubmission,
  };
}
