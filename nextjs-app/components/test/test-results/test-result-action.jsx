"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function TestResultActions({
  onReviewAnswers,
  onRetakeTest,
  onNextTest,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button
        variant="outline"
        className="bg-blue-50 hover:bg-blue-100 border-blue-100 text-gray-700 justify-between font-medium"
        onClick={onReviewAnswers}
      >
        Review Answers
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>

      <Button
        variant="outline"
        className="bg-amber-50 hover:bg-amber-100 border-amber-100 text-gray-700 justify-between"
        onClick={onRetakeTest}
      >
        Retake Test
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>

      <Button
        variant="outline"
        className="bg-green-50 hover:bg-green-100 border-green-100 text-gray-700 justify-between"
        onClick={onNextTest}
      >
        Next Test
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
