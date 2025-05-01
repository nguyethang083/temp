export const getQuestionContent = (questionNumber = currentQuestion) => {
  switch (questionNumber) {
    case 1:
      return {
        topic: "Exponents, roots, and logarithms",
        color: "bg-purple-500",
        type: "multiple-choice",
        question: "Simplify the expression: √(27) × ∛(8)",
        options: [
          { id: "a", text: "6" },
          { id: "b", text: "6√3" },
          { id: "c", text: "3√6" },
          { id: "d", text: "9" },
        ],
        correctAnswer: "b",
        hint: "Think about how to express these roots using exponents. Remember that √(27) can be written as 27^(1/2) and ∛(8) as 8^(1/3).",
        explanation:
          "To simplify this expression, we need to convert the roots to exponential form.\n\n√(27) = 27^(1/2) = (3^3)^(1/2) = 3^(3/2) = 3√3\n\n∛(8) = 8^(1/3) = (2^3)^(1/3) = 2^1 = 2\n\nSo, √(27) × ∛(8) = 3√3 × 2 = 6√3",
      };
    case 2:
      return {
        topic: "Geometry and spatial reasoning",
        color: "bg-green-500",
        type: "short-answer",
        question:
          "Find the surface area of a sphere with radius 6 cm. Express your answer in terms of π.",
        correctAnswer: "144π",
        hint: "Remember the formula for the surface area of a sphere is 4πr².",
        explanation:
          "The formula for the surface area of a sphere is 4πr².\n\nSubstituting r = 6 cm:\nSurface area = 4π(6)²\n= 4π × 36\n= 144π cm²",
      };
    case 3:
      return {
        topic: "Percents",
        color: "bg-red-400",
        type: "multiple-choice",
        question:
          "A shirt originally priced at $45 is on sale for 30% off. What is the sale price?",
        options: [
          { id: "a", text: "$13.50" },
          { id: "b", text: "$31.50" },
          { id: "c", text: "$30.00" },
          { id: "d", text: "$15.00" },
        ],
        correctAnswer: "b",
        hint: "Calculate 30% of the original price, then subtract from the original.",
        explanation:
          "To find the sale price, we need to subtract the discount from the original price.\n\nDiscount = 30% of $45\n= 0.3 × $45\n= $13.50\n\nSale price = Original price - Discount\n= $45 - $13.50\n= $31.50",
      };
    case 4:
      return {
        topic: "Number theory",
        color: "bg-amber-500",
        type: "drawing",
        question:
          "Find the GCF and LCM of 24 and 36. Show your work using the drawing area.",
        hint: "Try finding the prime factorization of each number first.",
        explanation:
          "First, let's find the prime factorization of each number:\n\n24 = 2³ × 3\n36 = 2² × 3²\n\nFor the GCF, we take the common prime factors with the lowest exponent:\nGCF = 2² × 3 = 4 × 3 = 12\n\nFor the LCM, we take each prime factor with the highest exponent:\nLCM = 2³ × 3² = 8 × 9 = 72",
      };
    case 5:
      return {
        topic: "Functions and equations",
        color: "bg-teal-500",
        type: "long-answer",
        question:
          "Write an equation for a linear function with a slope of 2 and y-intercept of -3. Then explain what the slope and y-intercept represent in a real-world context.",
        hint: "Use the slope-intercept form: y = mx + b",
        explanation:
          "The slope-intercept form of a linear equation is y = mx + b, where m is the slope and b is the y-intercept.\n\nGiven:\n- Slope (m) = 2\n- y-intercept (b) = -3\n\nSubstituting these values into the slope-intercept form:\ny = 2x + (-3)\ny = 2x - 3\n\nIn a real-world context, this could represent the cost of a taxi ride where the initial fee is $3 (the negative y-intercept) and the rate is $2 per mile (the slope).",
      };
    default:
      return {
        topic: "Exponents, roots, and logarithms",
        color: "bg-purple-500",
        type: "multiple-choice",
        question: "Simplify the expression: √(27) × ∛(8)",
        options: [
          { id: "a", text: "6" },
          { id: "b", text: "6√3" },
          { id: "c", text: "3√6" },
          { id: "d", text: "9" },
        ],
        correctAnswer: "b",
        hint: "Think about how to express these roots using exponents.",
        explanation:
          "To simplify this expression, we need to convert the roots to exponential form.",
      };
  }
};
