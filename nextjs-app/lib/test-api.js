// Mock data for test results
const testResults = {
  default: {
    id: "default",
    title: "Exponents, roots, and logarithms",
    status: "passed",
    score: 60,
    correctAnswers: 3,
    totalQuestions: 5,
    timeTaken: "08:15",
    date: "2023-05-15T10:30:00Z",
    breadcrumbs: [
      { label: "Test", href: "/test" },
      { label: "Grade 9", href: "/test/grade-9" },
      { label: "Practice Test", href: "/test/grade-9/practice" },
      { label: "Results" },
    ],
    feedback: [
      "Foundational understanding achieved.",
      "Some key areas require more attention and practice.",
      "Carefully review incorrect answers and explanations.",
    ],
    recommendations: [
      "Dedicate specific practice time to the types of problems answered incorrectly (e.g., simplifying complex roots, applying logarithm rules).",
      "Go back to the lesson videos or notes covering the topics you struggled with. Pay close attention to examples.",
      "Use the 'Review Answers' button to understand the step-by-step solutions for missed questions.",
    ],
    actions: {
      retake: () => console.log("Retake test"),
      next: () => console.log("Next test"),
    },
    questions: [
      {
        id: 1,
        question: "Simplify: (2^3)^2",
        topic: "Exponents",
        isCorrect: true,
        userAnswer: "64",
        correctAnswer: "64",
        explanation:
          "When raising a power to another power, multiply the exponents: (2^3)^2 = 2^(3×2) = 2^6 = 64",
        timeSpent: "01:20",
      },
      {
        id: 2,
        question: "Find the value of log₂(32)",
        topic: "Logarithms",
        isCorrect: true,
        userAnswer: "5",
        correctAnswer: "5",
        explanation:
          "log₂(32) means 'to what power must 2 be raised to get 32?' Since 2^5 = 32, log₂(32) = 5",
        timeSpent: "01:45",
      },
      {
        id: 3,
        question: "Simplify: √75",
        topic: "Roots",
        isCorrect: false,
        userAnswer: "8.66",
        correctAnswer: "5√3",
        explanation: "√75 = √(25 × 3) = √25 × √3 = 5√3 ≈ 8.66",
        timeSpent: "02:10",
      },
      {
        id: 4,
        question: "Solve for x: 3^x = 81",
        topic: "Exponents",
        isCorrect: true,
        userAnswer: "4",
        correctAnswer: "4",
        explanation: "3^x = 81 means 3^x = 3^4, so x = 4",
        timeSpent: "01:30",
      },
      {
        id: 5,
        question: "Simplify: log₃(27) - log₃(9)",
        topic: "Logarithms",
        isCorrect: false,
        userAnswer: "1",
        correctAnswer: "0.5",
        explanation:
          "Using the logarithm subtraction rule: log₃(27) - log₃(9) = log₃(27/9) = log₃(3) = 1",
        timeSpent: "01:30",
      },
    ],
  },
  // Add a failed test example
  "failed-test": {
    id: "failed-test",
    title: "Algebra basics",
    status: "failed",
    score: 40,
    correctAnswers: 2,
    totalQuestions: 5,
    timeTaken: "10:25",
    date: "2023-05-16T14:20:00Z",
    breadcrumbs: [
      { label: "Test", href: "/test" },
      { label: "Grade 9", href: "/test/grade-9" },
      { label: "Practice Test", href: "/test/grade-9/practice" },
      { label: "Results" },
    ],
    feedback: [
      "Basic understanding of concepts needs improvement.",
      "More practice with equation solving is needed.",
      "Review fundamental algebraic operations.",
    ],
    recommendations: [
      "Focus on practicing step-by-step equation solving techniques.",
      "Review the lessons on algebraic expressions and operations.",
      "Try simpler problems first to build confidence.",
    ],
    actions: {
      retake: () => console.log("Retake test"),
      next: () => console.log("Next test"),
    },
    questions: [
      // Questions would be here
    ],
  },
};

// Simulate API call with delay
export async function fetchTestResult(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const result = testResults[id];
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Test result not found"));
      }
    }, 1000);
  });
}

// Simulate API call to export test results
export async function exportTestResult(id, format = "csv") {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const result = testResults[id];
      if (result) {
        resolve({
          data: result,
          format,
          filename: `test-result-${id}.${format}`,
        });
      } else {
        reject(new Error("Test result not found"));
      }
    }, 500);
  });
}
