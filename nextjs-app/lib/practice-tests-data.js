export const practiceTestsData = [
  {
    id: "pt-1",
    name: "Kỳ thi khảo sát chất lượng lớp 9 THCS năm học 2022 – 2023 | Sở Giáo dục và Đào tạo Hưng Yên",
    difficulty: "Beginner",
    duration: "30 min",
    questionsCount: 15,
    passingScore: 70,
    passingScoreRaw: {
      required: 11,
      total: 15,
    },
    topics: ["Equations", "Inequalities", "Functions"],
    status: "completed", // completed, in-progress, not-started
    attempts: [
      {
        date: "2023-05-15T10:30:00Z",
        score: 85,
        timeTaken: "25:42",
        status: "passed",
        correctAnswers: 13,
        totalQuestions: 15,
      },
      {
        date: "2023-04-10T14:15:00Z",
        score: 60,
        timeTaken: "28:15",
        status: "failed",
        correctAnswers: 9,
        totalQuestions: 15,
      },
    ],
    detailedDescription: `This practice test covers fundamental algebraic concepts that are essential for success in higher-level mathematics. 

You'll be tested on:
- Solving linear equations and inequalities
- Working with functions and their graphs
- Simplifying algebraic expressions
- Solving systems of equations

This test is designed for students who have completed basic algebra coursework and want to ensure they have a solid foundation before moving on to more advanced topics.`,
  },
  {
    id: "pt-2",
    name: "Đề thi thử THPT Quốc gia năm 2023 môn Toán | Trường THPT Chuyên Nguyễn Huệ - Hà Nội",
    difficulty: "Intermediate",
    duration: "45 min",
    questionsCount: 20,
    passingScore: 65,
    passingScoreRaw: {
      required: 13,
      total: 20,
    },
    topics: ["Angles", "Triangles", "Circles", "Coordinate Geometry"],
    status: "in-progress",
    attempts: [
      {
        date: "2023-05-20T09:45:00Z",
        score: null, // null score indicates in-progress
        timeTaken: "15:30", // time spent so far
        status: "in-progress",
        correctAnswers: 8,
        totalQuestions: 20,
      },
    ],
    detailedDescription: `This comprehensive geometry practice test will assess your understanding of essential geometric concepts and problem-solving skills.

Topics covered include:
- Properties of angles and triangles
- Circle theorems and properties
- Coordinate geometry and transformations
- Area and volume calculations
- Geometric proofs

This test is suitable for students who have completed a geometry course and want to test their knowledge and application skills.`,
  },
  {
    id: "pt-3",
    name: "Đề kiểm tra giữa kỳ II lớp 9 năm học 2022-2023 môn Toán | Trường THCS Nguyễn Du",
    difficulty: "Advanced",
    duration: "60 min",
    questionsCount: 25,
    passingScore: 60,
    passingScoreRaw: {
      required: 15,
      total: 25,
    },
    topics: ["Limits", "Derivatives", "Integration"],
    status: "completed",
    attempts: [
      {
        date: "2023-05-18T13:20:00Z",
        score: 72,
        timeTaken: "55:10",
        status: "passed",
        correctAnswers: 18,
        totalQuestions: 25,
      },
    ],
    detailedDescription: `This advanced practice test serves as an introduction to calculus concepts and will help you assess your readiness for a full calculus course.

The test covers:
- Understanding and evaluating limits
- Basic derivative rules and applications
- Fundamental integration techniques
- Applications of derivatives and integrals
- Related rates and optimization problems

This test is designed for students who have completed pre-calculus and are preparing to begin calculus studies.`,
  },
  {
    id: "pt-4",
    name: "Đề thi học kỳ II lớp 9 năm học 2022-2023 môn Toán | Sở Giáo dục và Đào tạo Hà Nội",
    difficulty: "Intermediate",
    duration: "40 min",
    questionsCount: 18,
    passingScore: 65,
    passingScoreRaw: {
      required: 12,
      total: 18,
    },
    topics: ["Data Analysis", "Probability", "Statistical Inference"],
    status: "not-started",
    attempts: [],
    detailedDescription: `This statistics practice test will evaluate your understanding of fundamental statistical concepts and methods.

Areas covered include:
- Descriptive statistics and data visualization
- Probability theory and distributions
- Sampling methods and experimental design
- Hypothesis testing and confidence intervals
- Correlation and regression analysis

This test is appropriate for students who have completed an introductory statistics course and want to assess their knowledge and skills.`,
  },
  {
    id: "pt-5",
    name: "Đề kiểm tra định kỳ số 2 học kỳ II lớp 9 năm học 2022-2023 môn Toán | Trường THCS Lê Quý Đôn",
    difficulty: "Intermediate",
    duration: "35 min",
    questionsCount: 16,
    passingScore: 70,
    passingScoreRaw: {
      required: 11,
      total: 16,
    },
    topics: ["Trigonometric Functions", "Identities", "Applications"],
    status: "completed",
    attempts: [
      {
        date: "2023-05-12T10:15:00Z",
        score: 50,
        timeTaken: "32:45",
        status: "failed",
        correctAnswers: 8,
        totalQuestions: 16,
      },
      {
        date: "2023-05-14T11:30:00Z",
        score: 75,
        timeTaken: "30:20",
        status: "passed",
        correctAnswers: 12,
        totalQuestions: 16,
      },
    ],
    detailedDescription: `This trigonometry practice test will challenge your understanding of trigonometric concepts and their applications.

The test includes:
- Trigonometric functions and their graphs
- Trigonometric identities and equations
- Applications in geometry and physics
- Inverse trigonometric functions
- Polar coordinates and complex numbers

This test is designed for students who have completed a trigonometry course and want to solidify their understanding before moving on to pre-calculus or calculus.`,
  },
];
