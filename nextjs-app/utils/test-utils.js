/**
 * Return appropriate color class based on difficulty level
 */
export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
    case "dễ":
      return "bg-green-100 text-green-800";
    case "medium":
    case "trung bình":
      return "bg-blue-100 text-blue-800";
    case "hard":
    case "khó":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Return button text based on test status
 */
export const getButtonText = (status) => {
  switch (status) {
    case "in-progress":
      return "Continue Test";
    case "completed":
      return "Retake Test";
    default:
      return "Start Test";
  }
};
