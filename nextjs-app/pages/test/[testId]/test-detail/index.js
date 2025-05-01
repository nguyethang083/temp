// pages/test/[id]/test-detail/index.js
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { TestHeader } from "@/components/test/test-detail/TestHeader"; // Adjust path
import { ProgressBarDisplay } from "@/components/test/test-detail/ProgressBar"; // Adjust path
import { QuestionNavigator } from "@/components/test/test-detail/QuestionNavigator"; // Adjust path
import { QuestionCard } from "@/components/test/test-detail/QuestionCard"; // Adjust path
import { TestNavigation } from "@/components/test/test-detail/TestNavigation"; // Adjust path
import { useTimer } from "@/hooks/useTimer"; // Adjust path
import { formatTime } from "@/utils/timeUtils"; // Adjust path
import { useTestTakingData } from "@/hooks/useTestTakingData"; // Adjust path
import { fetchWithAuth } from "@/pages/api/helper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Loading Component
const LoadingScreen = ({ message = "Loading test..." }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white">
    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
  </div>
);

// Error Component
const ErrorScreen = ({ error, onRetry }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md">
      <p className="font-bold">Error Loading Test</p>
      <p>{error || "An unknown error occurred."}</p>
    </div>
    <button
      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      onClick={onRetry}
    >
      Try Again
    </button>
  </div>
);

// No Test Data Component
const NoTestDataScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
    <p className="font-bold text-lg text-gray-700">Test Data Not Available</p>
    <p className="text-gray-500 mb-4">
      Could not load questions for this test.
    </p>
    <Link href="/test?mode=practice-test" passHref>
      <Button variant="outline">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Tests
      </Button>
    </Link>
  </div>
);

export default function TestDetail() {
  const router = useRouter();
  // Use id consistently
  const { id } = router.query;

  // Fetch test data
  const {
    testData,
    loading: loadingTestData,
    error: testDataError,
  } = useTestTakingData(id);

  console.log(
    "[TestDetail Render] Questions received from hook:",
    JSON.stringify(testData?.questions, null, 2)
  ); // Log here

  // --- State Management ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testAttemptId, setTestAttemptId] = useState(null);
  const [loadingAttempt, setLoadingAttempt] = useState(true);
  const [attemptError, setAttemptError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedStatus, setSavedStatus] = useState("saved");
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState({});
  const [shortAnswers, setShortAnswers] = useState({});
  const [longAnswers, setLongAnswers] = useState({});
  const [canvasStates, setCanvasStates] = useState({});
  const [completedQuestions, setCompletedQuestions] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [showQuestionNav, setShowQuestionNav] = useState(true);

  // --- Timer ---
  const [timeLeft, setTimeLeft] = useState(null);
  const countdown = useTimer(timeLeft !== null ? timeLeft : 0);

  useEffect(() => {
    if (testData?.time_limit_minutes) {
      setTimeLeft(testData.time_limit_minutes * 60);
    } else if (testData) {
      setTimeLeft(null); // No time limit
    }
  }, [testData]);

  // --- Create/Fetch Test Attempt ---
  useEffect(() => {
    const createOrFetchAttempt = async () => {
      if (!id || loadingTestData || !testData) return; // Wait for valid id and loaded testData
      setLoadingAttempt(true);
      setAttemptError(null);
      try {
        const attemptData = await fetchWithAuth(
          `/test-attempts/${id}/attempts`,
          {
            method: "POST",
          }
        );
        if (!attemptData || !attemptData.id)
          throw new Error("Invalid attempt data received from server.");
        setTestAttemptId(attemptData.id);
        console.log("Test attempt active:", attemptData.id);
        // TODO: Load saved progress/answers/status if resuming (check attemptData)
        // TODO: Adjust timeLeft based on attemptData.remaining_time_seconds if resuming
      } catch (err) {
        setAttemptError(err.message || "Failed to start test attempt.");
      } finally {
        setLoadingAttempt(false);
      }
    };
    createOrFetchAttempt();
  }, [id, testData, loadingTestData]); // Dependencies

  // --- Derived State ---
  const questions = testData?.questions ?? [];
  const totalQuestions = questions.length;
  const currentQuestionId = questions[currentQuestionIndex]?.id;
  const currentDisplayNumber = currentQuestionIndex + 1;

  // --- Answer and Status Handlers ---// In TestDetail/index.js
  const updateAnswerState = useCallback((setter, questionId, value) => {
    if (!questionId) return;
    console.log(
      `[TestDetail] updateAnswerState: Intending to set QID ${questionId} to:`,
      value
    );
    setter((prev) => {
      console.log(
        `  [TestDetail] State BEFORE update for ${questionId}:`,
        prev[questionId]
      );
      const newState = { ...prev, [questionId]: value };
      // *** Log the specific value in the NEW state object ***
      console.log(
        `  [TestDetail] State AFTER update for ${questionId}:`,
        newState[questionId]
      );
      console.log(`  [TestDetail] Full NEW state map:`, newState); // Log the whole map
      return newState;
    });
    setSavedStatus("unsaved");
  }, []);

  const markQuestionCompleted = useCallback(
    (questionId, completed = true) => {
      if (!questionId) return;
      // Check current state before updating
      const currentState = completedQuestions[questionId];
      if (completed !== !!currentState) {
        // Only update if status changes
        setCompletedQuestions((prev) => ({ ...prev, [questionId]: completed }));
        setSavedStatus("unsaved");
      }
    },
    [completedQuestions]
  ); // Added completedQuestions dependency

  const handleMultipleChoiceChange = useCallback(
    (questionId, value) => {
      console.log(
        `handleMultipleChoiceChange called for QID: ${questionId}, Value: ${value}, Type: ${typeof value}`
      );
      updateAnswerState(setMultipleChoiceAnswers, questionId, value);
      markQuestionCompleted(questionId, true);
    },
    [updateAnswerState, markQuestionCompleted]
  );

  const handleShortAnswerChange = useCallback(
    (questionId, value) => {
      updateAnswerState(setShortAnswers, questionId, value);
      // Mark complete only if there is content
      markQuestionCompleted(questionId, value.trim().length > 0);
    },
    [updateAnswerState, markQuestionCompleted]
  );

  const handleLongAnswerChange = useCallback(
    (questionId, value) => {
      updateAnswerState(setLongAnswers, questionId, value);
      // Mark complete only if there is substantial content
      markQuestionCompleted(questionId, value.trim().length > 5);
    },
    [updateAnswerState, markQuestionCompleted]
  );

  const handleSetCanvasStates = useCallback(
    (questionId, newState) => {
      updateAnswerState(setCanvasStates, questionId, newState);
      // Optionally mark complete based on drawing state
      // markQuestionCompleted(questionId, !!newState);
    },
    [updateAnswerState]
  );

  const toggleMarkForReview = useCallback((questionId) => {
    if (!questionId) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
    setSavedStatus("unsaved"); // Marking for review means state changed
  }, []); // Removed setter dependencies

  const handleMarkCompleteToggle = useCallback(() => {
    if (!currentQuestionId) return;
    markQuestionCompleted(
      currentQuestionId,
      !completedQuestions[currentQuestionId]
    );
  }, [currentQuestionId, completedQuestions, markQuestionCompleted]);

  // --- Navigation Handlers ---
  const navigateToQuestion = useCallback(
    (index) => {
      if (index >= 0 && index < totalQuestions) {
        setCurrentQuestionIndex(index);
      }
    },
    [totalQuestions]
  ); // Removed setCurrentQuestionIndex dependency

  const handlePrevQuestion = useCallback(() => {
    navigateToQuestion(currentQuestionIndex - 1);
  }, [currentQuestionIndex, navigateToQuestion]);
  const handleNextQuestion = useCallback(() => {
    navigateToQuestion(currentQuestionIndex + 1);
  }, [currentQuestionIndex, navigateToQuestion]);
  const toggleNavigator = useCallback(() => {
    setShowQuestionNav((prev) => !prev);
  }, []);

  // --- Save and Submit Handlers ---
  const saveProgress = async () => {
    if (!testAttemptId) {
      console.warn("Cannot save progress: No active test attempt ID.");
      setSavedStatus("error");
      return;
    }
    setSavedStatus("saving");
    console.log("Attempting to save progress for attempt:", testAttemptId);
    const progressData = {
      currentQuestionIndex,
      timeLeft: countdown,
      answers: {
        mc: multipleChoiceAnswers,
        short: shortAnswers,
        long: longAnswers,
        canvas: canvasStates,
      },
      status: { completed: completedQuestions, review: markedForReview },
    };
    try {
      // TODO: Implement actual API call to POST /test-attempts/:attemptId/save-progress
      await fetchWithAuth(`/test-attempts/${testAttemptId}/save-progress`, {
        method: "POST",
        body: progressData,
      });
      console.log("Progress saved successfully.");
      setSavedStatus("saved");
    } catch (error) {
      console.error("Error saving progress:", error);
      setSavedStatus("error");
      // Consider showing user feedback
      alert(`Error saving progress: ${error.message}`);
    }
  };

  // --- UPDATED: handleSubmitTest ---
  const handleSubmitTest = async () => {
    // 1. Check if ready to submit
    if (!testAttemptId) {
      alert("Cannot submit: Test attempt is not active.");
      return;
    }
    if (submitting) {
      console.log("Submission already in progress.");
      return; // Prevent double submission
    }

    // 2. Confirmation
    const completedCount =
      Object.values(completedQuestions).filter(Boolean).length;
    const unansweredCount = totalQuestions - completedCount;
    let confirmSubmit = window.confirm(
      unansweredCount > 0
        ? `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
        : "Are you sure you want to submit your test? You cannot make changes after submission."
    );
    if (!confirmSubmit) return;

    // 3. Set loading states
    setSavedStatus("saving"); // Show saving indicator during submit
    setSubmitting(true);
    console.log("Attempting to submit test attempt:", testAttemptId);

    // 4. Prepare submission payload matching SubmitTestAttemptDto
    const answersToSubmit = {};
    console.log(
      "[handleSubmitTest] Questions data JUST BEFORE LOOP:",
      JSON.stringify(questions, null, 2) // Use stringify for deep logging
    );
    questions.forEach((q) => {
      const qId = q.id;
      const calculatedType = (q.question_type || "multiple_choice").trim();

      answersToSubmit[qId] = {
        type: calculatedType,
        mcAnswer: multipleChoiceAnswers[qId] || null,
        shortAnswer: shortAnswers[qId] || null,
        longAnswer: longAnswers[qId] || null,
        drawing: canvasStates[qId] || null,
        isCompleted: !!completedQuestions[qId], // Final completion status
        isMarked: !!markedForReview[qId], // Final review status
      };
    });

    const submissionPayload = {
      answers: answersToSubmit,
      timeLeft: countdown, // Send final remaining time
    };
    console.log("--- Final Payload Types ---");
    if (submissionPayload && submissionPayload.answers) {
      Object.entries(submissionPayload.answers).forEach(([qId, answerData]) => {
        // CORRECTED LOG: Access properties from 'answerData'
        console.log(
          `QID: ${qId}, type: ${answerData.type}, mcAnswer: ${answerData.mcAnswer}, shortAnswer: ${answerData.shortAnswer}, isCompleted: ${answerData.isCompleted}`
          // Add other relevant fields from answerData as needed
        );
      });
      // Optional: Log the entire answers object for verification
      console.log(
        "Full answers object:",
        JSON.stringify(submissionPayload.answers, null, 2)
      );
    } else {
      console.log("submissionPayload or answers missing");
    }
    console.log("TimeLeft:", submissionPayload?.timeLeft);
    console.log("--------------------------");

    // Log the *entire* payload being sent just before the fetch call
    console.log(
      "Submitting Payload:",
      JSON.stringify(submissionPayload, null, 2)
    );
    // 5. Make API call
    try {
      // Call the backend endpoint using fetchWithAuth
      const result = await fetchWithAuth(
        `/test-attempts/${testAttemptId}/submit`,
        {
          method: "POST",
          body: submissionPayload, // Axios handles stringify, ensure fetchWithAuth does if needed
        }
      );
      console.log("Test submitted successfully, API Result:", result);

      // 6. Handle success: Navigate to results page
      // Use the attemptId received from the backend if available, otherwise use state
      const finalAttemptId = result?.id || testAttemptId;
      // TODO: Update results page route if necessary
      router.push(`/test/1/test-result/${finalAttemptId}`);
    } catch (error) {
      // 7. Handle errors
      console.error("Error submitting test:", error);
      alert(
        `Error submitting test: ${
          error.message || "An unknown error occurred."
        }`
      );
      setSavedStatus("error"); // Show error status
      setSubmitting(false); // Allow trying again
    }
    // Note: Don't set submitting false here if redirecting on success
  };
  // --- END UPDATED ---

  // --- Render Logic ---
  if (loadingTestData || loadingAttempt) return <LoadingScreen />;
  if (testDataError || attemptError)
    return (
      <ErrorScreen
        error={testDataError || attemptError}
        onRetry={() => router.reload()}
      />
    );
  if (
    !testData ||
    !Array.isArray(testData.questions) ||
    testData.questions.length === 0
  )
    return <NoTestDataScreen />;

  const questionContent = questions[currentQuestionIndex];
  const completedCount =
    Object.values(completedQuestions).filter(Boolean).length;

  if (!questionContent) {
    return (
      <ErrorScreen
        error={`Could not load question ${currentDisplayNumber}.`}
        onRetry={() => router.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 container mx-auto px-4 py-6">
        <TestHeader
          title={testData.title}
          timeLeft={countdown}
          formatTime={formatTime}
        />
        <ProgressBarDisplay
          currentQuestionDisplayNumber={currentDisplayNumber}
          totalQuestions={totalQuestions}
          completedCount={completedCount}
        />
        <div className="flex justify-end mb-4">
          <Button
            variant="link"
            size="sm"
            onClick={toggleNavigator}
            className="text-sm text-indigo-600 hover:text-indigo-800 p-0 h-auto"
            aria-expanded={showQuestionNav}
            aria-controls="question-navigator-sidebar"
          >
            {showQuestionNav
              ? "Hide Question Navigator"
              : "Show Question Navigator"}
          </Button>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          {showQuestionNav && (
            <div
              id="question-navigator-sidebar"
              className="w-full lg:w-1/4 order-2 lg:order-1 animate-in fade-in duration-200"
            >
              <QuestionNavigator
                totalQuestions={totalQuestions}
                currentQuestionIndex={currentQuestionIndex}
                markedForReview={markedForReview}
                completedQuestions={completedQuestions}
                onNavigate={navigateToQuestion}
                questions={questions}
              />
            </div>
          )}
          <div
            className={`w-full order-1 lg:order-2 ${
              showQuestionNav ? "lg:w-3/4" : "lg:w-full"
            }`}
          >
            <QuestionCard
              key={currentQuestionId}
              currentQuestionIndex={currentQuestionIndex}
              questions={questions}
              markedForReview={markedForReview}
              completedQuestions={completedQuestions}
              onToggleMarkForReview={toggleMarkForReview}
              onMarkComplete={handleMarkCompleteToggle}
              // Pass correct singular answer props
              multipleChoiceAnswer={multipleChoiceAnswers[currentQuestionId]}
              shortAnswer={shortAnswers[currentQuestionId]}
              longAnswer={longAnswers[currentQuestionId]}
              canvasState={canvasStates[currentQuestionId]}
              // Pass correct handlers
              onMultipleChoiceChange={handleMultipleChoiceChange}
              onShortAnswerChange={handleShortAnswerChange}
              onLongAnswerChange={handleLongAnswerChange}
              setCanvasStates={handleSetCanvasStates}
            />
            <TestNavigation
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              onPrevQuestion={handlePrevQuestion}
              onNextQuestion={handleNextQuestion}
              onSaveProgress={saveProgress}
              onSubmitTest={handleSubmitTest}
              onNavigate={navigateToQuestion}
              savedStatus={savedStatus}
              submitting={submitting}
              completedQuestions={completedQuestions}
              markedForReview={markedForReview}
              questions={questions}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
