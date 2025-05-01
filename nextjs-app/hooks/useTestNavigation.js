// hooks/useTestNavigation.js
import { useState, useCallback, useEffect } from "react"; // Added useEffect

// Accept initialQuestionIndex, defaulting to 0 if not provided or invalid
export function useTestNavigation(totalQuestions, initialQuestionIndex = 0) {
  // Ensure initial index is within bounds, handle case where totalQuestions might be 0 initially
  const validateIndex = (index, count) => {
    const validIndex = parseInt(index, 10); // Ensure it's a number
    if (isNaN(validIndex) || count <= 0) return 0; // Default to 0 if invalid or no questions
    if (validIndex >= 0 && validIndex < count) {
      return validIndex;
    }
    return 0; // Default to 0 if out of bounds
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() =>
    validateIndex(initialQuestionIndex, totalQuestions)
  );
  const [showQuestionNav, setShowQuestionNav] = useState(true); // Keep default as true or false based on your preference

  // Update current index if initialQuestionIndex or totalQuestions change AFTER initial mount
  // This might happen if initial data loads asynchronously after the hook is first called.
  useEffect(() => {
    setCurrentQuestionIndex((prevIndex) =>
      validateIndex(initialQuestionIndex, totalQuestions)
    );
    // We might want to reconsider if resetting the index based on initialQuestionIndex
    // is always desired if totalQuestions changes drastically later.
    // For now, this ensures the initial index is respected once data is valid.
  }, [initialQuestionIndex, totalQuestions]);

  const navigateToQuestion = useCallback(
    (index) => {
      const validatedIndex = validateIndex(index, totalQuestions);
      setCurrentQuestionIndex(validatedIndex);
    },
    [totalQuestions] // Dependency on totalQuestions
  );

  const handlePrevQuestion = useCallback(() => {
    // Navigate to previous, handles bounds via navigateToQuestion
    navigateToQuestion(currentQuestionIndex - 1);
  }, [currentQuestionIndex, navigateToQuestion]);

  const handleNextQuestion = useCallback(() => {
    // Navigate to next, handles bounds via navigateToQuestion
    navigateToQuestion(currentQuestionIndex + 1);
  }, [currentQuestionIndex, navigateToQuestion]);

  const toggleNavigator = useCallback(() => {
    setShowQuestionNav((prev) => !prev);
  }, []);

  // Function to set index directly, useful for initialization or resets
  // Ensure validation is applied here too.
  const setCurrentQuestionIndexDirectly = useCallback(
    (index) => {
      setCurrentQuestionIndex(validateIndex(index, totalQuestions));
    },
    [totalQuestions]
  );

  return {
    currentQuestionIndex,
    showQuestionNav,
    handlers: {
      navigateToQuestion,
      handlePrevQuestion,
      handleNextQuestion,
      toggleNavigator,
    },
    // Expose the direct setter
    setCurrentQuestionIndexDirectly,
  };
}
