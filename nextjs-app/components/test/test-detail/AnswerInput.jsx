// components/test/test-detail/AnswerInput.jsx
"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Adjust path
import { Label } from "@/components/ui/label"; // Adjust path
import { Input } from "@/components/ui/input"; // Adjust path
import { Textarea } from "@/components/ui/textarea"; // Adjust path
import "katex/dist/katex.min.css";

// Assuming parseLatex is passed as a prop if needed for options
// import { parseLatex } from '@/utils/latexParser'; // Example import

export function AnswerInput({
  questionContent,
  multipleChoiceAnswer,
  shortAnswer,
  longAnswer,
  onMultipleChoiceChange,
  onShortAnswerChange,
  onLongAnswerChange,
  parseLatex, // Receive the parser function as a prop
}) {
  const questionId = questionContent?.id;

  if (!questionContent || !questionId) {
    console.warn("AnswerInput: Missing questionContent or questionId");
    return (
      <div className="p-4 text-gray-500">Answer input cannot be displayed.</div>
    );
  }

  switch (questionContent.type) {
    case "multiple_choice":
      const options = Array.isArray(questionContent.options)
        ? questionContent.options
        : [];

      return (
        <div className="space-y-3 mt-6">
          <RadioGroup
            value={multipleChoiceAnswer || ""}
            // --- DEBUG: Log the value received directly from onValueChange ---
            onValueChange={(selectedValue) => {
              console.log(
                `AnswerInput (RadioGroup): onValueChange received: Value='${selectedValue}', Type=${typeof selectedValue}`
              ); // Log received value
              if (onMultipleChoiceChange) {
                // Pass the received selectedValue (should be option.id) and the questionId
                onMultipleChoiceChange(questionId, selectedValue);
              }
            }}
            // --- END DEBUG ---
            aria-label={`Answer options for question ${questionId}`}
          >
            {options.map((option) => (
              <Label
                key={option.id}
                htmlFor={`option-${questionId}-${option.id}`}
                className={`flex items-start p-3 sm:p-4 rounded-lg border transition-colors cursor-pointer ${
                  multipleChoiceAnswer === option.id
                    ? `bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400`
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <RadioGroupItem
                  value={option.id} // This is the value emitted by onValueChange when selected
                  id={`option-${questionId}-${option.id}`}
                  className="border-gray-400 data-[state=checked]:border-indigo-600 data-[state=checked]:text-indigo-600 mt-0.5 mr-3 flex-shrink-0"
                  aria-label={`Option ${option.id.toUpperCase()}`}
                />
                <span className="flex-1 text-sm prose prose-sm max-w-none">
                  <strong className="mr-1">{option.id?.toUpperCase()}.</strong>
                  {/* Use parseLatex prop if provided */}
                  {typeof parseLatex === "function"
                    ? parseLatex(option.text)
                    : option.text}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      );

    case "short-answer":
      return (
        <div className="space-y-2 mt-6">
          <Label
            htmlFor={`short-answer-${questionId}`}
            className="block font-medium text-gray-700"
          >
            {" "}
            Your Answer{" "}
          </Label>
          <Input
            id={`short-answer-${questionId}`}
            placeholder="Type your answer here..."
            value={shortAnswer || ""}
            onChange={(e) =>
              onShortAnswerChange &&
              onShortAnswerChange(questionId, e.target.value)
            }
            className="w-full"
            aria-label="Short answer input"
          />
        </div>
      );

    case "long-answer":
      return (
        <div className="space-y-2 mt-6">
          <Label
            htmlFor={`long-answer-${questionId}`}
            className="block font-medium text-gray-700"
          >
            {" "}
            Your Answer{" "}
          </Label>
          <Textarea
            id={`long-answer-${questionId}`}
            placeholder="Type your detailed answer here..."
            value={longAnswer || ""}
            onChange={(e) =>
              onLongAnswerChange &&
              onLongAnswerChange(questionId, e.target.value)
            }
            className="w-full min-h-[150px] sm:min-h-[200px]"
            aria-label="Long answer input"
          />
        </div>
      );

    case "drawing":
    default:
      return null;
  }
}
