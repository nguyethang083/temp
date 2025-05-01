"use client";

import React from "react";
import { Button } from "@/components/ui/button"; // Adjust path if needed

// Status function for background color (based on completion)
const getQuestionStatusClass = (questionId, completed) => {
  if (!questionId) return "bg-gray-100 border-gray-300 text-gray-600";
  if (completed[questionId])
    return "bg-green-100 border-green-300 text-green-800 hover:bg-green-200";
  return "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200";
};

/**
 * Displays a grid of question numbers allowing navigation and showing status.
 */
export function QuestionNavigator({
  totalQuestions,
  currentQuestionIndex, // 0-based index
  markedForReview = {},
  completedQuestions = {},
  onNavigate,
  questions = [],
  id, // id for aria-controls if needed
}) {
  if (!questions || questions.length !== totalQuestions) {
    console.warn("QuestionNavigator: Mismatch/missing questions array.");
    return null;
  }

  return (
    <div
      id={id}
      className="bg-white p-4 rounded-lg border shadow-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex-shrink-0 flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">Question Status</h3>
      </div>

      {/* Grid container - Automatically adjusts height to fit content */}
      <div className="overflow-y-auto p-1">
        <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 pb-1">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const questionNumber = i + 1;
            const questionId = questions[i]?.id;
            const isCompleted = !!completedQuestions[questionId];
            const isMarked = !!markedForReview[questionId];
            const statusClass = getQuestionStatusClass(
              questionId,
              completedQuestions
            );
            const isCurrent = i === currentQuestionIndex;

            return (
              <Button
                key={questionId || i}
                variant="outline"
                size="sm"
                className={`w-10 h-10 relative transition-all p-0 text-xs font-medium border rounded-md text-center cursor-pointer ${statusClass} ${
                  isCurrent
                    ? "ring-2 ring-indigo-500 ring-offset-1" // Add ring for current question
                    : ""
                }`}
                onClick={() => onNavigate(i)}
                aria-label={`Go to Question ${questionNumber}. Status: ${
                  isMarked ? "Marked for review." : ""
                } ${isCompleted ? "Completed." : "Not attempted."}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {questionNumber}
                {isMarked && (
                  <span
                    className="absolute -top-1.5 -right-1.5 block w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-sm"
                    title="Marked for review"
                  ></span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 border-t pt-3 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-green-100 border border-green-300 rounded-sm"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-gray-100 border border-gray-300 rounded-sm"></div>
          <span>Not attempted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white shadow-sm"></div>
          <span>Marked for review</span>
        </div>
      </div>
    </div>
  );
}
