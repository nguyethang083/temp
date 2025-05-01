"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
// Assume slugify is imported if used: import slugify from 'slugify'; // Example import

// --- UI Components ---
import { TestHeader } from "@/components/test/test-detail/TestHeader";
import { ProgressBarDisplay } from "@/components/test/test-detail/ProgressBar";
import { QuestionNavigator } from "@/components/test/test-detail/QuestionNavigator";
import { QuestionCard } from "@/components/test/test-detail/QuestionCard";
import { TestNavigation } from "@/components/test/test-detail/TestNavigation";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { NoTestDataScreen } from "@/components/test/test-detail/NoTestData";
import { Button } from "@/components/ui/button";

// --- Hooks ---
import { useTimer } from "@/hooks/useTimer";
// import { useTestTakingData } from "@/hooks/useTestTakingData"; // Consider removing if redundant
import { useTestAttempt } from "@/hooks/useTestAttempt";
import { useTestAnswers } from "@/hooks/useTestAnswers";
import { useTestNavigation } from "@/hooks/useTestNavigation";

// --- Utils & Services ---
import { formatTime } from "@/utils/timeUtils";
import { fetchWithAuth } from "@/pages/api/helper"; // Make sure path is correct
import { useDebouncedCallback } from "use-debounce";

// Utility function (if not imported)
const slugify = (str, options) => {
  // Basic slugify, replace with a robust library like 'slugify' if needed
  return str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

export default function TestDetail() {
  const router = useRouter();
  const { id: testId } = router.query; // Use testId consistently

  const loadingInitialTestData = false; // Placeholder if hook removed
  const initialTestDataError = null; // Placeholder if hook removed

  // --- Attempt Management ---
  const isReadyToStartAttempt = !!testId; // Attempt hook needs testId to be ready
  const { attemptStartData, loadingAttempt, attemptError } = useTestAttempt(
    testId,
    isReadyToStartAttempt
  );

  // --- Derive State from attemptStartData (once loaded) ---
  const testData = attemptStartData?.test; // Use test data from attempt RPC response
  const questions = useMemo(
    () => attemptStartData?.questions ?? [],
    [attemptStartData?.questions]
  ); // Memoize questions array
  const totalQuestions = questions.length;
  const testAttemptId = attemptStartData?.attempt?.id; // Get attempt ID from response
  const initialSavedAnswers = attemptStartData?.savedAnswers; // Get saved answers from response
  const initialRemainingTime = attemptStartData?.attempt?.remainingTimeSeconds; // Get remaining time
  const initialLastViewedId =
    attemptStartData?.attempt?.lastViewedTestQuestionId; // Get last viewed question ID

  // --- Navigation ---
  const initialQuestionIndex = useMemo(() => {
    if (initialLastViewedId && questions.length > 0) {
      const idx = questions.findIndex(
        (q) => q.testQuestionId === initialLastViewedId
      );
      return idx !== -1 ? idx : 0;
    }
    return 0;
  }, [initialLastViewedId, questions]);

  const {
    currentQuestionIndex,
    showQuestionNav,
    handlers: navHandlers,
    setCurrentQuestionIndexDirectly,
  } = useTestNavigation(totalQuestions, initialQuestionIndex);

  // --- Answers & Status ---
  const {
    multipleChoiceAnswers,
    shortAnswers,
    longAnswers,
    canvasStates,
    completedQuestions,
    markedForReview,
    savedStatus,
    handlers: answerHandlers,
    getAnswersForSubmission,
  } = useTestAnswers();
  const { initializeAnswers } = answerHandlers;
  const { setSavedStatus } = answerHandlers;
  const { handleQuestionChange } = answerHandlers;
  const AUTO_SAVE_INTERVAL_MS = 30000; // Save every 30 seconds
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestionData = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex]
  );
  const currentTestQuestionId = currentQuestionData?.testQuestionId;

  useEffect(() => {
    if (
      initialSavedAnswers &&
      typeof initialSavedAnswers === "object" &&
      Array.isArray(questions) &&
      questions.length > 0
    ) {
      initializeAnswers(initialSavedAnswers, questions);
    }
  }, [initialSavedAnswers, questions, initializeAnswers]);

  // --- Timer ---
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (initialRemainingTime !== undefined && initialRemainingTime !== null) {
      setTimeLeft(initialRemainingTime);
    } else if (testData?.timeLimitMinutes) {
      // Ensure we're dealing with a number
      const minutes = Number(testData.timeLimitMinutes);

      if (!isNaN(minutes) && minutes > 0) {
        const seconds = minutes * 60;
        setTimeLeft(seconds);
      } else {
        setTimeLeft(null);
      }
    } else {
      setTimeLeft(null);
    }
  }, [initialRemainingTime, testData?.timeLimitMinutes]);
  const countdown = useTimer(timeLeft !== null ? timeLeft : 0); // Pass 0 if null initially

  // --- Save Progress Logic ---
  // Use useCallback to ensure the function reference is stable
  // Use Debounce to prevent spamming the save function if called rapidly
  const debouncedSaveProgress = useDebouncedCallback(
    async (reason = "auto") => {
      if (
        !testAttemptId ||
        isSaving ||
        submitting ||
        savedStatus === "saving"
      ) {
        console.warn(/* ... */);
        return;
      }
      if (!currentQuestionData?.testQuestionId) {
        console.warn(/* ... */);
        return;
      }

      setIsSaving(true);
      setSavedStatus("saving");
      const currentAnswersForSave = getAnswersForSubmission(questions);

      // *** Correction Here: Use 'countdown' state variable ***
      const progressData = {
        lastViewedTestQuestionId: currentQuestionData.testQuestionId,
        // Get the current value from the useTimer hook's state variable
        remainingTimeSeconds: countdown, // <--- Use countdown directly
        answers: currentAnswersForSave,
      };

      console.log("Saving progress data:", progressData);
      try {
        await fetchWithAuth(`/test-attempts/${testAttemptId}/save-progress`, {
          method: "PATCH",
          body: progressData,
        });
        console.log(`Progress saved successfully (${reason}).`);
        setSavedStatus("saved");
      } catch (error) {
        console.error(`Error saving progress (${reason}):`, error);
        setSavedStatus("error");
      } finally {
        setIsSaving(false);
        setTimeout(() => {
          // Check current status before resetting to idle
          setSavedStatus((current) => (current === "saved" ? "idle" : current));
        }, 3000);
      }
    },
    500 // Debounce time
  );
  // --- Auto-Save Trigger: Interval ---
  useEffect(() => {
    if (!testAttemptId || !currentQuestionData?.testQuestionId) {
      // Don't start interval until essential data is loaded
      return;
    }

    console.log("Setting up auto-save interval...");
    const intervalId = setInterval(() => {
      // Call the debounced save function
      debouncedSaveProgress("interval");
    }, AUTO_SAVE_INTERVAL_MS);

    // Cleanup on unmount or when attemptId/currentQuestionId changes
    return () => {
      console.log("Clearing auto-save interval.");
      clearInterval(intervalId);
      // Optionally trigger one last save on cleanup *if needed*
      // debouncedSaveProgress.flush(); // If you want to ensure last call executes
    };
    // Add dependencies: debouncedSaveProgress function, attemptId, and crucially currentQuestionData
    // This ensures the interval restarts if the attempt/question context changes,
    // and the save function always has access to the *latest* currentQuestionData.
  }, [debouncedSaveProgress, testAttemptId, currentQuestionData]);

  // --- Auto-Save Trigger: Page Visibility Change ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.log("Page hidden, triggering save progress...");
        // Call the debounced save function - it will save if enough time passed
        // Or use flush() to force immediate execution if needed:
        // debouncedSaveProgress.flush();
        debouncedSaveProgress("visibility");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Optionally trigger one last save when navigating away *cleanly*
      // Note: This might still race with component unmount/browser closing.
      // if (testAttemptId) { // Check if we have an attempt to save for
      //   debouncedSaveProgress.flush();
      // }
    };
    // Dependency: the debounced save function itself
  }, [debouncedSaveProgress, testAttemptId]);

  // --- Submission State ---
  const [submitting, setSubmitting] = useState(false);

  // --- Combined Loading/Error States ---
  const isLoading = loadingInitialTestData || loadingAttempt; // Adjust if useTestTakingData removed
  const errorOccurred = initialTestDataError || attemptError; // Adjust if useTestTakingData removed

  // Effect to notify the answers hook when the question changes
  useEffect(() => {
    // Only call the handler if the ID is valid (not null/undefined)
    // This prevents issues during initial load or if data is momentarily missing
    if (currentTestQuestionId) {
      console.log(
        `TestDetail: Question changed to ${currentTestQuestionId}. Notifying useTestAnswers.`
      );
      handleQuestionChange(currentTestQuestionId);
    } else {
      console.log(
        `TestDetail: Current question ID is invalid (${currentTestQuestionId}). Not calling handleQuestionChange.`
      );
    }

    // Optional cleanup: If the component unmounts while a timer is active
    // return () => {
    //   // Call with null to potentially record the time of the last viewed question before unmount
    //   handleQuestionChange(null);
    // };
  }, [currentTestQuestionId, handleQuestionChange]);

  const handleMarkCompleteToggle = useCallback(() => {
    if (!currentTestQuestionId) return;
    answerHandlers.markQuestionCompleted(
      currentTestQuestionId,
      !completedQuestions[currentTestQuestionId]
    );
  }, [currentTestQuestionId, completedQuestions, answerHandlers]);

  const handleSubmitTest = async () => {
    // ... (handleSubmitTest logic remains the same - ensure RPC payload/endpoint match backend)
    if (!testAttemptId || submitting) return;

    const completedCount =
      Object.values(completedQuestions).filter(Boolean).length;
    const unansweredCount = totalQuestions - completedCount;
    const confirmMessage =
      unansweredCount > 0
        ? `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
        : "Are you sure you want to submit your test? You cannot make changes after submission.";

    if (!window.confirm(confirmMessage)) return;

    answerHandlers.setSavedStatus("saving");
    setSubmitting(true);
    const answersPayload = getAnswersForSubmission(questions);
    const submissionPayload = {
      answers: answersPayload,
      timeLeft: countdown,
      lastViewedTestQuestionId: currentTestQuestionId,
    };
    console.log(
      "Submitting Payload to RPC:",
      JSON.stringify(submissionPayload, null, 2)
    );

    try {
      const result = await fetchWithAuth(
        `/test-attempts/${testAttemptId}/submit`,
        {
          // Verify endpoint
          method: "POST",
          body: submissionPayload,
        }
      );
      console.log("Test submitted successfully, API Result:", result);
      const finalAttemptId = result?.id || testAttemptId; // Use returned ID if possible
      const testSlug = slugify(testData?.title || "test");
      router.push(`/test/${testSlug}/test-result?attempt_id=${finalAttemptId}`); // Verify route
    } catch (error) {
      console.error("Error submitting test:", error);
      alert(
        `Error submitting test: ${
          error.message || "An unknown error occurred."
        }`
      );
      answerHandlers.setSavedStatus("error");
      setSubmitting(false);
    }
  };

  // --- Render Logic ---
  if (isLoading)
    return (
      <LoadingScreen
        message={
          loadingAttempt ? "Starting test attempt..." : "Loading test data..."
        } // Adjust message
      />
    );

  if (errorOccurred)
    return (
      <ErrorScreen error={errorOccurred} onRetry={() => router.reload()} />
    );

  // Check if attempt data failed specifically
  if (!loadingAttempt && !attemptStartData) {
    return (
      <ErrorScreen
        error={attemptError || new Error("Failed to load test attempt data.")} // Ensure error is an Error object
        onRetry={() => router.reload()}
      />
    );
  }

  // Check for consistent test data AFTER attempt data should be loaded
  if (!testData || !Array.isArray(questions) || questions.length === 0)
    return <NoTestDataScreen />;

  // Ensure testAttemptId is loaded before rendering main UI
  if (!testAttemptId) {
    // This state might be brief if attemptStartData loads quickly
    return <LoadingScreen message="Initializing attempt..." />;
  }

  // Get current question AFTER checking questions array has loaded
  const questionContent = questions[currentQuestionIndex];
  const completedCount =
    Object.values(completedQuestions).filter(Boolean).length;
  const currentDisplayNumber = currentQuestionIndex + 1;

  // Handle case where index might be out of bounds (shouldn't happen with checks, but defensive)
  if (!questionContent) {
    console.error(
      `Attempted to render question at index ${currentQuestionIndex}, but it's undefined. Questions array length: ${questions.length}`
    );
    return (
      <ErrorScreen
        error={
          new Error(
            `Could not load question ${currentDisplayNumber}. Index might be out of bounds.`
          )
        }
        onRetry={() => {
          setCurrentQuestionIndexDirectly(0); // Reset to first question
          // Consider if reload is needed or just resetting index is enough
          // router.reload();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 container mx-auto px-4 py-6">
        <TestHeader
          title={testData.title}
          timeLeft={timeLeft !== null ? countdown : null}
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
            onClick={navHandlers.toggleNavigator}
          >
            {showQuestionNav ? "Hide" : "Show"} Question Navigator
          </Button>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          {showQuestionNav && (
            <div className="lg:w-1/4 order-2 lg:order-1">
              {" "}
              {/* Example structure */}
              <QuestionNavigator
                totalQuestions={totalQuestions}
                currentQuestionIndex={currentQuestionIndex}
                markedForReview={markedForReview}
                completedQuestions={completedQuestions}
                onNavigate={navHandlers.navigateToQuestion}
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
              key={questionContent.testQuestionId} // Use unique ID for key
              currentQuestionIndex={currentQuestionIndex} // Still useful for numbering?
              questions={questions} // Pass full array
              markedForReview={markedForReview} // Pass review state object
              completedQuestions={completedQuestions} // Pass completion state object
              onToggleMarkForReview={answerHandlers.toggleMarkForReview} // Pass handler
              onMarkComplete={handleMarkCompleteToggle} // Pass handler
              // Pass specific answer for the current question
              multipleChoiceAnswer={
                multipleChoiceAnswers[questionContent.testQuestionId]
              }
              shortAnswer={shortAnswers[questionContent.testQuestionId]}
              longAnswer={longAnswers[questionContent.testQuestionId]}
              canvasState={canvasStates[questionContent.testQuestionId]}
              // Pass change handlers
              onMultipleChoiceChange={answerHandlers.handleMultipleChoiceChange}
              onShortAnswerChange={answerHandlers.handleShortAnswerChange}
              onLongAnswerChange={answerHandlers.handleLongAnswerChange}
              setCanvasStates={answerHandlers.handleSetCanvasStates}
              // Pass the specific ID the card relates to
              testQuestionId={questionContent.testQuestionId}
            />
            <TestNavigation
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              onPrevQuestion={navHandlers.handlePrevQuestion}
              onNextQuestion={navHandlers.handleNextQuestion}
              onSubmitTest={handleSubmitTest}
              onNavigate={navHandlers.navigateToQuestion} // If needed for jump-to-end etc.
              savedStatus={savedStatus}
              submitting={submitting}
              completedQuestions={completedQuestions} // Pass for display/logic
              markedForReview={markedForReview} // Pass for display/logic
              questions={questions} // Pass for display/logic
            />
          </div>
        </div>
      </main>
    </div>
  );
}
