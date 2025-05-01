import { getQuestionContent } from "@/lib/question";

// Check if a question is completed based on answer/drawing state
export const isQuestionCompleted = (
  questionNumber,
  completedQuestions,
  multipleChoiceAnswers,
  shortAnswers,
  longAnswers,
  canvasStates
) => {
  // If explicitly marked as completed
  if (completedQuestions[questionNumber]) return true;

  const question = getQuestionContent(questionNumber);

  switch (question.type) {
    case "multiple-choice":
      return !!multipleChoiceAnswers[questionNumber];
    case "short-answer":
      // Check if not null/undefined and not just whitespace
      return shortAnswers[questionNumber]?.trim()?.length > 0;
    case "long-answer":
      // Check if not null/undefined and has substantial content
      return longAnswers[questionNumber]?.trim()?.length > 5;
    case "drawing":
      // Check if there's a saved canvas state (non-empty data URL)
      return (
        !!canvasStates[questionNumber] &&
        canvasStates[questionNumber] !== "data:,"
      ); // Check for non-empty canvas
    default:
      return false;
  }
};

// Get question status class for navigator buttons
export const getQuestionStatusClass = (
  questionNumber,
  markedForReview,
  completedStatus
) => {
  if (markedForReview[questionNumber])
    return "bg-yellow-100 border-yellow-400 hover:bg-yellow-200";
  if (completedStatus)
    return "bg-green-100 border-green-400 hover:bg-green-200";
  return "bg-white border-gray-200 hover:bg-gray-100";
};
