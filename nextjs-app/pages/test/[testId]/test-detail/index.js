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

  // --- Data Fetching ---
  // Consider removing useTestTakingData if useTestAttempt provides everything needed.
  // For now, assuming useTestAttempt is the primary source after start/resume.
  // const {
  //   testData: initialTestData,
  //   loading: loadingInitialTestData,
  //   error: initialTestDataError,
  // } = useTestTakingData(testId);
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
  console.log("test data:", testData);
  const totalQuestions = questions.length;
  const testAttemptId = attemptStartData?.attempt?.id; // Get attempt ID from response
  console.log("time limit:", testData?.timeLimitMinutes);
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
    handlers: answerHandlers, // Contains initializeAnswers
    getAnswersForSubmission,
  } = useTestAnswers();
  const { initializeAnswers } = answerHandlers; // Destructure for clarity

  // ========================================================================
  // *** FIXED: Initialize answers when attempt data (answers AND questions) is loaded ***
  // ========================================================================
  useEffect(() => {
    // Check if BOTH initialSavedAnswers object AND questions array are ready
    // (Ensure questions is a non-empty array as initializeAnswers relies on it)
    if (
      initialSavedAnswers &&
      typeof initialSavedAnswers === "object" &&
      Array.isArray(questions) &&
      questions.length > 0
    ) {
      console.log(
        "TestDetail: Calling initializeAnswers with:", // Log before calling
        initialSavedAnswers,
        questions // Log both arguments
      );
      // Pass BOTH arguments to the hook's initialization function
      initializeAnswers(initialSavedAnswers, questions);
    } else {
      // Log if prerequisites aren't met yet
      console.log(
        "TestDetail: Waiting for initialSavedAnswers (object) and non-empty questions (array) to initialize answers...",
        {
          hasSavedAnswers: !!initialSavedAnswers,
          hasQuestions: Array.isArray(questions) && questions.length > 0,
        }
      );
    }
    // Add ALL dependencies used in the effect:
    // initialSavedAnswers, questions, and the initializeAnswers function reference
  }, [initialSavedAnswers, questions, initializeAnswers]);
  // ========================================================================
  // *** End of Fix ***
  // ========================================================================

  // --- Timer ---
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    console.log("Timer debug - initialRemainingTime:", initialRemainingTime);
    console.log("Timer debug - testData:", testData);
    console.log("Timer debug - timeLimitMinutes:", testData?.timeLimitMinutes);
    console.log("Timer debug - type:", typeof testData?.timeLimitMinutes);
    console.log("Timer debug - calculation:", testData?.timeLimitMinutes * 60);

    if (initialRemainingTime !== undefined && initialRemainingTime !== null) {
      console.log("Setting timer from attempt data:", initialRemainingTime);
      setTimeLeft(initialRemainingTime);
    } else if (testData?.timeLimitMinutes) {
      console.log(
        "Setting timer from test data limit:",
        testData.timeLimitMinutes
      );

      // Ensure we're dealing with a number
      const minutes = Number(testData.timeLimitMinutes);
      console.log("Converted minutes:", minutes);

      if (!isNaN(minutes) && minutes > 0) {
        const seconds = minutes * 60;
        console.log("Setting timer to seconds:", seconds);
        setTimeLeft(seconds);
      } else {
        console.log("Invalid time limit minutes:", minutes);
        setTimeLeft(null);
      }
    } else {
      console.log("No time limit found, setting timer to null.");
      setTimeLeft(null);
    }
  }, [initialRemainingTime, testData?.timeLimitMinutes]);
  const countdown = useTimer(timeLeft !== null ? timeLeft : 0); // Pass 0 if null initially

  // --- Submission State ---
  const [submitting, setSubmitting] = useState(false);

  // --- Combined Loading/Error States ---
  const isLoading = loadingInitialTestData || loadingAttempt; // Adjust if useTestTakingData removed
  const errorOccurred = initialTestDataError || attemptError; // Adjust if useTestTakingData removed

  // --- Specific Handlers ---
  const currentQuestionData = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex]
  );
  const currentTestQuestionId = currentQuestionData?.testQuestionId;

  const handleMarkCompleteToggle = useCallback(() => {
    if (!currentTestQuestionId) return;
    answerHandlers.markQuestionCompleted(
      currentTestQuestionId,
      !completedQuestions[currentTestQuestionId]
    );
  }, [currentTestQuestionId, completedQuestions, answerHandlers]);

  // --- Save and Submit Logic ---
  const saveProgress = async () => {
    // ... (saveProgress logic remains the same - ensure endpoint/payload match backend)
    if (!testAttemptId || !currentTestQuestionId) {
      console.warn("Cannot save progress: Missing attempt or question ID.");
      answerHandlers.setSavedStatus("error");
      return;
    }
    answerHandlers.setSavedStatus("saving");
    const currentAnswersForSave = getAnswersForSubmission(questions);
    const progressData = {
      lastViewedTestQuestionId: currentTestQuestionId,
      remainingTimeSeconds: countdown,
      answers: currentAnswersForSave,
    };
    console.log(
      "Saving Progress Payload:",
      JSON.stringify(progressData, null, 2)
    );
    try {
      await fetchWithAuth(`/test-attempts/${testAttemptId}/save-progress`, {
        // Verify endpoint
        method: "POST",
        body: progressData,
      });
      console.log("Progress saved successfully.");
      answerHandlers.setSavedStatus("saved");
    } catch (error) {
      console.error("Error saving progress:", error);
      answerHandlers.setSavedStatus("error");
      alert(`Error saving progress: ${error.message}`);
    }
  };

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
              onSaveProgress={saveProgress}
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
