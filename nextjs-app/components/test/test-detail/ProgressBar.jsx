// components/test/test-detail/ProgressBar.jsx
"use client";

import { Progress } from "@/components/ui/progress"; // Adjust path

// Expects props: currentQuestionDisplayNumber (1-based), totalQuestions, completedCount
export function ProgressBarDisplay({
  currentQuestionDisplayNumber, // Renamed prop
  totalQuestions,
  completedCount,
}) {
  // Calculate progress safely, handle totalQuestions being 0
  const progressPercentage =
    totalQuestions > 0
      ? Math.round((completedCount / totalQuestions) * 100)
      : 0;

  return (
    <div className="mb-6">
      {/* Progress Bar */}
      <Progress value={progressPercentage} className="h-2" />
      {/* Text Indicators */}
      <div className="flex flex-col sm:flex-row justify-between mt-1.5 text-xs sm:text-sm text-gray-600 gap-1">
        {" "}
        {/* Adjusted styling */}
        <span>
          Question {currentQuestionDisplayNumber} of {totalQuestions}
        </span>
        <span>
          {completedCount} of {totalQuestions} completed ({progressPercentage}%)
        </span>
      </div>
    </div>
  );
}
