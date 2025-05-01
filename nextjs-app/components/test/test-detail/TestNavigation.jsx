// components/test/test-detail/TestNavigation.jsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Save, BarChart2 } from "lucide-react";

// Dummy implementations if not imported from utils
const getQuestionStatusClass = (questionId, marked, completed) => {
  if (!questionId) return "bg-gray-100 border-gray-300 text-gray-600";
  if (marked[questionId])
    return "bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200";
  if (completed[questionId])
    return "bg-green-100 border-green-300 text-green-800 hover:bg-green-200";
  return "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200";
};
// Dummy isQuestionCompleted - replace with actual logic if needed elsewhere
const isQuestionCompleted = (questionId, completed) => {
  return !!completed[questionId];
};

export function TestNavigation({
  // Navigation state & handlers
  currentQuestionIndex, // 0-based index
  totalQuestions,
  onPrevQuestion,
  onNextQuestion,
  onNavigate, // Function accepting 0-based index

  // Save/Submit state & handlers
  onSaveProgress, // Function to save progress
  onSubmitTest, // Function to submit final test
  savedStatus, // 'saved', 'saving', 'unsaved', 'error'
  submitting, // boolean

  // State for Summary Modal (keyed by question ID)
  completedQuestions = {},
  markedForReview = {},
  questions = [], // Pass the questions array { id: string, ... }

  // Styling
  buttonColor, // Optional override color class
}) {
  // Set default button color if not provided
  const defaultColor = "bg-indigo-600";
  const activeButtonColor = buttonColor || defaultColor;

  // Calculate counts based on keys in the state objects
  const completedCount =
    Object.values(completedQuestions).filter(Boolean).length;
  const markedForReviewCount =
    Object.values(markedForReview).filter(Boolean).length;
  const notAttemptedCount =
    totalQuestions > 0 ? totalQuestions - completedCount : 0;

  // Display question number (1-based)
  const currentDisplayNumber = currentQuestionIndex + 1;

  // Handler for navigating from summary modal
  const handleNavigateFromSummary = (index) => {
    if (onNavigate) {
      onNavigate(index); // Pass the 0-based index
    }
    // Dialog should close automatically due to DialogClose wrapper
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-6 border-t pt-4">
      {/* Previous Button */}
      <Button
        variant="outline"
        onClick={onPrevQuestion}
        disabled={currentQuestionIndex === 0 || submitting}
        className="flex items-center gap-1 w-full sm:w-auto order-1" // Responsive width
        aria-label="Previous Question"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      {/* Middle Buttons: Summary & Save */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-center order-3 sm:order-2 mt-2 sm:mt-0">
        {" "}
        {/* Center buttons on mobile */}
        {/* Summary Modal */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-1 flex-1 sm:flex-none"
              disabled={submitting}
            >
              <BarChart2 className="h-4 w-4" />
              Summary
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Test Summary</DialogTitle>
              <DialogDescription>
                Review your progress. Click a question number to navigate.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto py-2">
              {/* Grid for question numbers */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
                {Array.from({ length: totalQuestions }, (_, i) => {
                  const questionNumber = i + 1;
                  const questionId = questions[i]?.id;
                  const isCompleted = !!completedQuestions[questionId];
                  const isMarked = !!markedForReview[questionId];
                  const statusClass = getQuestionStatusClass(
                    questionId,
                    markedForReview,
                    completedQuestions
                  );
                  const isCurrent = i === currentQuestionIndex;

                  return (
                    <DialogClose key={questionId || i} asChild>
                      <button
                        className={`w-10 h-10 relative transition-all p-0 text-xs font-medium border rounded-md text-center cursor-pointer ${statusClass} ${
                          isCurrent
                            ? "ring-2 ring-indigo-500 ring-offset-1"
                            : ""
                        }`}
                        onClick={() => handleNavigateFromSummary(i)}
                        aria-label={`Go to Question ${questionNumber}. Status: ${
                          isMarked
                            ? "Marked for review"
                            : isCompleted
                            ? "Completed"
                            : "Not attempted"
                        }`}
                        aria-current={isCurrent ? "step" : undefined}
                      >
                        {questionNumber}
                        {/* Status indicators */}
                        {isMarked && (
                          <span
                            className="absolute -top-1 -right-1 block w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white"
                            title="Marked for review"
                          ></span>
                        )}
                        {isCompleted && !isMarked && (
                          <span
                            className="absolute -top-1 -right-1 block w-2.5 h-2.5 bg-green-500 rounded-full border border-white"
                            title="Completed"
                          ></span>
                        )}
                        {!isCompleted && !isMarked && (
                          <span
                            className="absolute -top-1 -right-1 block w-2.5 h-2.5 bg-gray-300 rounded-full border border-white"
                            title="Not attempted"
                          ></span>
                        )}
                      </button>
                    </DialogClose>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="bg-gray-100 p-4 rounded-md border mt-4">
                {" "}
                {/* Added margin-top */}
                <div className="flex justify-between mb-2 text-sm">
                  <span>Completion:</span>
                  <span className="font-medium">
                    {completedCount} of {totalQuestions} questions
                  </span>
                </div>
                <Progress
                  value={
                    totalQuestions > 0
                      ? (completedCount / totalQuestions) * 100
                      : 0
                  }
                  className="h-2 mb-2"
                  aria-label={`${completedCount} of ${totalQuestions} questions completed`}
                />
                <div className="flex flex-wrap justify-between text-xs gap-x-4 gap-y-1 text-gray-600">
                  <span>Marked for review: {markedForReviewCount}</span>
                  <span>Not attempted: {notAttemptedCount}</span>
                </div>
              </div>
            </div>
            {/* Modal Footer Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <DialogClose asChild>
                <Button variant="outline">Return to Test</Button>
              </DialogClose>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={onSubmitTest}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Test"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Save Progress Button */}
        <Button
          variant="outline"
          onClick={onSaveProgress}
          className="flex items-center gap-1 flex-1 sm:flex-none"
          disabled={savedStatus === "saving" || submitting}
        >
          <Save
            className={`h-4 w-4 ${
              savedStatus === "saving" ? "animate-spin" : ""
            }`}
          />
          {savedStatus === "saving" ? "Saving..." : "Save"}
          {/* Optional: Show save status indicator */}
          {savedStatus === "saved" && (
            <span className="ml-1.5 text-xs text-green-600">(Saved)</span>
          )}
          {savedStatus === "unsaved" && (
            <span className="ml-1.5 text-xs text-orange-500">(Unsaved)</span>
          )}
          {savedStatus === "error" && (
            <span className="ml-1.5 text-xs text-red-500">(Error)</span>
          )}
        </Button>
      </div>

      {/* Next/Submit Button */}
      {/* Show Next button if not the last question */}
      {currentDisplayNumber < totalQuestions ? (
        <Button
          onClick={onNextQuestion}
          className={`flex items-center gap-1 ${activeButtonColor} hover:opacity-90 text-white w-full sm:w-auto order-2 sm:order-3`} // Responsive width and order
          disabled={submitting}
          aria-label="Next Question"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        // Show Submit button on the last question
        <Button
          className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto order-2 sm:order-3" // Responsive width and order
          onClick={onSubmitTest}
          disabled={submitting}
          aria-label="Submit Test"
        >
          {submitting ? "Submitting..." : "Submit Test"}
        </Button>
      )}
    </div>
  );
}
