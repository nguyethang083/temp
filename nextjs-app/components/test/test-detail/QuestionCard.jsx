// components/test/test-detail/QuestionCard.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react"; // Added useEffect, useMemo
import { Card } from "@/components/ui/card"; // Adjust path if needed
import { Badge } from "@/components/ui/badge"; // Adjust path if needed
import { Button } from "@/components/ui/button"; // Adjust path if needed
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lightbulb, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { AnswerInput } from "./AnswerInput"; // Adjust path if needed
import { DrawingArea } from "./DrawingArea"; // Adjust path if needed

// Import KaTeX for LaTeX rendering
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

// LaTeX Parser Function (keep as is from previous version)
const parseLatex = (text) => {
  if (!text) return null;
  // Regex to find delimiters: \(...\), \[...\], $$...$$, $...$
  const parts = text.split(/(\\\(.*?\\\)|\\\[.*?\\\]|\$\$.*?\$\$|\$.*?\$)/gs);
  return parts.map((part, index) => {
    try {
      if (part.startsWith("\\(") && part.endsWith("\\)"))
        return (
          <InlineMath key={index} math={part.substring(2, part.length - 2)} />
        );
      if (part.startsWith("\\[") && part.endsWith("\\]"))
        return (
          <BlockMath key={index} math={part.substring(2, part.length - 2)} />
        );
      if (part.startsWith("$$") && part.endsWith("$$"))
        return (
          <BlockMath key={index} math={part.substring(2, part.length - 2)} />
        );
      // Be careful with single $: check it's not just currency before rendering as math
      if (
        part.startsWith("$") &&
        part.endsWith("$") &&
        part.length > 2 &&
        !part.match(/^\$\d+(\.\d{1,2})?$/)
      ) {
        return (
          <InlineMath key={index} math={part.substring(1, part.length - 1)} />
        );
      }
    } catch (error) {
      console.error("Error rendering LaTeX:", error, part);
      return (
        <span key={index} className="text-red-500 font-mono">
          {part}
        </span>
      ); // Show error inline
    }
    // Replace newline characters with <br /> for proper display in HTML
    return part.split("\n").map((line, lineIndex) => (
      <React.Fragment key={`${index}-${lineIndex}`}>
        {lineIndex > 0 && <br />}
        {line}
      </React.Fragment>
    ));
  });
};

export function QuestionCard({
  currentQuestionIndex, // Expect 0-based index
  questions = [], // Expect the full array of question objects { id, content, type, options, ... }
  markedForReview = {}, // State keyed by question ID
  completedQuestions = {}, // State keyed by question ID
  onToggleMarkForReview, // Function accepting question ID
  onMarkComplete, // Function accepting question ID and boolean status
  // Answer states keyed by question ID
  multipleChoiceAnswer,
  shortAnswer,
  longAnswer,
  canvasState,
  // Answer change handlers accepting question ID and value/event
  onMultipleChoiceChange,
  onShortAnswerChange,
  onLongAnswerChange,
  setCanvasStates, // Function accepting question ID and new state
}) {
  const [showHint, setShowHint] = useState(false);

  // --- Derive current question data using the index ---
  const questionData = useMemo(() => {
    if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
      return null; // Index out of bounds
    }
    return questions[currentQuestionIndex];
  }, [currentQuestionIndex, questions]);

  const currentQuestionId = questionData?.testQuestionId; // Get the ID of the current question
  const currentDisplayNumber = currentQuestionIndex + 1; // 1-based for display

  // Derive status based on ID
  const isMarkedForReview = !!markedForReview[currentQuestionId];
  const isMarkedComplete = !!completedQuestions[currentQuestionId];

  // Reset hint visibility when question changes
  useEffect(() => {
    setShowHint(false);
  }, [currentQuestionId]);

  // --- Prepare question content for AnswerInput/DrawingArea ---
  const questionContentForDisplay = useMemo(() => {
    if (!questionData) return null;

    // Format options if needed (example assumes object format { A: 'text', ...})
    let formattedOptions = [];
    // --- Add detailed logs ---
    console.log(
      "useMemo: Raw questionData.questionType:",
      questionData?.questionType
    );
    console.log("useMemo: Raw questionData.options:", questionData?.options);
    console.log(
      "useMemo: typeof questionData.options:",
      typeof questionData?.options
    );
    // --- End detailed logs ---
    if (
      questionData.questionType === "multiple_choice" &&
      questionData.options
    ) {
      if (Array.isArray(questionData.options)) {
        // If options are already [{ id: 'A', text: '...' }]
        formattedOptions = questionData.options;
      } else if (typeof questionData.options === "object") {
        // If options are { "A": "text", ... }
        formattedOptions = Object.entries(questionData.options).map(
          ([key, value]) => ({
            id: key,
            text: value,
          })
        );
      }
    }
    console.log("questions options", formattedOptions);
    return {
      id: questionData.testQuestionId,
      type: questionData.questionType || "multiple_choice",
      question: questionData.content || "Question content missing.",
      options: formattedOptions,
      hint: questionData.hint || "",
      explanation: questionData.explanation || "", // Explanation might not be available during test
      points: questionData.point_value || 1,
      color: "bg-indigo-500", // Placeholder color, can be dynamic if needed
    };
  }, [questionData]);

  // --- Event Handlers using ID ---
  const handleToggleReview = () => {
    if (currentQuestionId && onToggleMarkForReview) {
      onToggleMarkForReview(currentQuestionId);
    }
  };

  const handleToggleComplete = () => {
    if (currentQuestionId && onMarkComplete) {
      // Toggle the completion status based on the current state
      onMarkComplete(currentQuestionId, !isMarkedComplete);
    }
  };

  // --- Render Logic ---

  if (!questionData || !questionContentForDisplay) {
    return (
      <Card className="p-6 mb-6 border shadow-sm bg-white text-center">
        <p className="text-gray-500">Loading question data...</p>
      </Card>
    );
  }

  console.log("QuestionData for Display:", questionContentForDisplay);
  const hasDrawingArea = questionContentForDisplay.type === "drawing";

  return (
    <Card
      key={currentQuestionId}
      className="p-4 sm:p-6 mb-6 relative overflow-hidden border shadow-sm bg-white"
    >
      {/* Color indicator bar */}
      <div
        className={`w-1.5 h-full ${questionContentForDisplay.color} absolute left-0 top-0 bottom-0 rounded-l-md`} // Full height bar
        aria-hidden="true"
      ></div>

      <div className="pl-4 sm:pl-6">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 pb-4 border-b">
          {" "}
          {/* Added padding/border */}
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-semibold whitespace-nowrap">
              Question {currentDisplayNumber}
            </h2>
            <Badge
              variant="outline"
              className="font-normal capitalize text-xs sm:text-sm"
            >
              {questionContentForDisplay.type.replace("_", " ")}
            </Badge>
            <Badge
              variant="secondary"
              className="font-normal text-xs sm:text-sm"
            >
              {questionContentForDisplay.points} Point
              {questionContentForDisplay.points !== 1 ? "s" : ""}
            </Badge>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end w-full sm:w-auto">
            {/* Mark for Review Button */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isMarkedForReview ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleReview}
                    className={`transition-colors ${
                      isMarkedForReview
                        ? "bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-yellow-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-pressed={isMarkedForReview}
                  >
                    <AlertCircle
                      className={`h-4 w-4 mr-1 ${
                        isMarkedForReview ? "" : "text-yellow-600"
                      }`}
                    />{" "}
                    Review
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Flag this question to review later</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Mark Complete Button */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isMarkedComplete ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleComplete}
                    className={`transition-colors ${
                      isMarkedComplete
                        ? "bg-green-500 hover:bg-green-600 text-white border-green-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-pressed={isMarkedComplete}
                  >
                    <CheckCircle2
                      className={`h-4 w-4 mr-1 ${
                        isMarkedComplete ? "" : "text-green-600"
                      }`}
                    />
                    {isMarkedComplete ? "Completed" : "Mark Complete"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isMarkedComplete
                      ? "Unmark as completed"
                      : "Mark this question as completed"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Hint Button */}
            {questionContentForDisplay.hint && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHint(!showHint)}
                      className="text-gray-700 hover:bg-gray-50"
                      aria-pressed={showHint}
                    >
                      <Lightbulb className="h-4 w-4 mr-1 text-blue-600" /> Hint
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showHint ? "Hide" : "Show"} hint</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Explanation Button (Consider hiding during test) */}
            {/* {questionContentForDisplay.explanation && ( ... Dialog ... )} */}
          </div>
        </div>
        {/* Question Text - Parsed for LaTeX */}
        <div className="text-base md:text-lg mb-6 leading-relaxed prose prose-sm sm:prose max-w-none">
          {parseLatex(questionContentForDisplay.question)}
        </div>
        {/* Hint Box */}
        {showHint && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">Hint</h3>
            </div>
            <div className="text-sm text-blue-700 prose prose-sm max-w-none">
              {parseLatex(questionContentForDisplay.hint)}
            </div>
          </div>
        )}
        {/* Explanation Dialog (if needed) */}
        {/* Answer Input Area */}
        <AnswerInput
          // Pass data relevant to the current question
          questionContent={questionContentForDisplay}
          // Pass answer state for the current question ID
          multipleChoiceAnswer={multipleChoiceAnswer}
          shortAnswer={shortAnswer}
          longAnswer={longAnswer}
          // Pass handlers that include the current question ID
          // Ensure these handlers exist in the parent component
          onMultipleChoiceChange={onMultipleChoiceChange}
          onShortAnswerChange={onShortAnswerChange}
          onLongAnswerChange={onLongAnswerChange}
          parseLatex={parseLatex} // Pass down the LaTeX parser
        />
        {hasDrawingArea && (
          <DrawingArea
            questionId={currentQuestionId}
            // Pass the specific canvas state received as a prop
            canvasState={canvasState} // Use the singular prop
            // The handler expects (qid, newState)
            setCanvasState={
              (newState) =>
                setCanvasStates && setCanvasStates(currentQuestionId, newState) // Call handler from props
            }
            markAsCompleted={() => {
              if (currentQuestionId && onMarkComplete) {
                onMarkComplete(currentQuestionId, true); // Mark complete on interaction maybe?
              }
            }}
          />
        )}
      </div>
    </Card>
  );
}
