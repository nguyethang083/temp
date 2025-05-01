export const testData = [
  {
    id: "exponents-test",
    title: "Exponents and Logarithms Test",
    topic: "Exponents, roots, and logarithms",
    topicSlug: "exponents",
    timeLimit: 45, // minutes
    questions: [
      {
        id: "exp-q1",
        type: "multiple-choice",
        text: "Find the value of x in the equation 2^x = 32.",
        options: [
          { value: "a", label: "A. 3" },
          { value: "b", label: "B. 4" },
          { value: "c", label: "C. 5" },
          { value: "d", label: "D. 6" },
        ],
        correctAnswer: "c",
        hint: "Remember that 2^5 = 32. You can also use logarithms to solve this equation.",
      },
      {
        id: "exp-q2",
        type: "multiple-choice",
        text: "Simplify the expression: √27 × √3",
        options: [
          { value: "a", label: "A. 3" },
          { value: "b", label: "B. 9" },
          { value: "c", label: "C. √81" },
          { value: "d", label: "D. 9√3" },
        ],
        correctAnswer: "b",
        hint: "√27 = √(3^3) = 3√3, then multiply by √3.",
      },
      {
        id: "exp-q3",
        type: "text-input",
        text: "If log₃(x) = 4, what is the value of x?",
        correctAnswer: "81",
        format: "Enter a number",
        hint: "If log₃(x) = 4, then 3^4 = x.",
      },
      {
        id: "exp-q4",
        type: "multiple-choice",
        text: "Which of the following is equivalent to 5^-2?",
        options: [
          { value: "a", label: "A. -10" },
          { value: "b", label: "B. -1/25" },
          { value: "c", label: "C. 1/25" },
          { value: "d", label: "D. 25" },
        ],
        correctAnswer: "c",
        hint: "Remember that a^-n = 1/a^n",
      },
      {
        id: "exp-q5",
        type: "multiple-choice",
        text: "Simplify the expression: (2^3)^2",
        options: [
          { value: "a", label: "A. 2^5" },
          { value: "b", label: "B. 2^6" },
          { value: "c", label: "C. 2^8" },
          { value: "d", label: "D. 2^9" },
        ],
        correctAnswer: "b",
        hint: "Use the power rule: (a^m)^n = a^(m×n)",
      },
    ],
  },
  {
    id: "geometry-test",
    title: "Geometry and Spatial Reasoning Test",
    topic: "Geometry and spatial reasoning",
    topicSlug: "geometry",
    timeLimit: 60, // minutes
    questions: [
      {
        id: "geo-q1",
        type: "multiple-choice",
        text: "What is the surface area of a cube with side length 4 cm?",
        options: [
          { value: "a", label: "A. 16 cm²" },
          { value: "b", label: "B. 64 cm²" },
          { value: "c", label: "C. 96 cm²" },
          { value: "d", label: "D. 128 cm²" },
        ],
        correctAnswer: "c",
        hint: "The surface area of a cube is 6 × (side length)²",
      },
      {
        id: "geo-q2",
        type: "multiple-choice",
        text: "In a right triangle, if one angle is 30°, what is the other acute angle?",
        options: [
          { value: "a", label: "A. 30°" },
          { value: "b", label: "B. 45°" },
          { value: "c", label: "C. 60°" },
          { value: "d", label: "D. 90°" },
        ],
        correctAnswer: "c",
        hint: "The sum of angles in a triangle is 180°. In a right triangle, one angle is 90°.",
      },
      {
        id: "geo-q3",
        type: "text-input",
        text: "A rectangle has a length of 12 cm and a width of 5 cm. What is its perimeter in cm?",
        correctAnswer: "34",
        format: "Enter a number",
        hint: "Perimeter = 2 × (length + width)",
      },
    ],
  },
  {
    id: "percents-test",
    title: "Percents Test",
    topic: "Percents",
    topicSlug: "percents",
    timeLimit: 30, // minutes
    questions: [
      {
        id: "per-q1",
        type: "multiple-choice",
        text: "If a shirt originally costs $80 and is on sale for 25% off, what is the sale price?",
        options: [
          { value: "a", label: "A. $55" },
          { value: "b", label: "B. $60" },
          { value: "c", label: "C. $65" },
          { value: "d", label: "D. $70" },
        ],
        correctAnswer: "b",
        hint: "25% of $80 is $20. Subtract this from the original price.",
      },
      {
        id: "per-q2",
        type: "text-input",
        text: "If 40% of a number is 60, what is the number?",
        correctAnswer: "150",
        format: "Enter a number",
        hint: "If 40% of x = 60, then 0.4x = 60. Solve for x.",
      },
    ],
  },
];
