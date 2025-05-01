// pages/test/[testId]/index.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import slugify from "slugify"; // Make sure slugify is installed and imported
import TestLoading from "@/components/test/test-description/test-loading";
import TestInformation from "@/components/test/test-description/test-info";
import PreviousAttempts from "@/components/test/test-description/attempts";
// Remove import for getButtonText utility if logic is moved into component
// import { getButtonText } from "@/utils/test-utils";
import { useTestDetails } from "@/hooks/useTestDetails"; // Use the updated hook

export default function TestDescription() {
  const router = useRouter();
  const { id } = router.query; // Get test ID from route query

  // Use the updated hook to get test details and attempt status
  const { test, attemptStatus, loading, error } = useTestDetails(id);

  // State for previous attempts (assuming fetched separately if needed for display)
  const [attempts, setAttempts] = useState([]);
  // TODO: Implement fetching for 'attempts' if PreviousAttempts component is used

  const navigateToAttemptResult = (attemptId) => {
    if (!test || !test.title) return; // Guard against missing test data
    const slugifiedTitle = slugify(test.title, {
      lower: true,
      strict: true,
      locale: "vi",
    });
    router.push(`/test/${slugifiedTitle}/test-result?attempt_id=${attemptId}`);
  };

  // --- Button Text Logic ---
  const getButtonText = (status) => {
    switch (status) {
      case "in_progress":
        return "Continue Test";
      case "completed":
        // Determine desired action: Review latest? Start new?
        return "Review Results"; // Or 'Start Again' / 'Retake Test'
      case "not_started":
        return "Start Test";
      case "error": // If status check fails, allow user to try starting
        return "Start Test";
      case null: // Still loading status
      default:
        return "Loading..."; // Indicate loading status
    }
  };

  // --- Button Click Handler ---
  const handlePlayButtonClick = () => {
    if (!test || !test.id || !test.title) {
      console.error("Cannot start test, test data is missing.");
      return; // Guard against missing data
    }

    const slugifiedTitle = slugify(test.title, {
      lower: true,
      strict: true,
      locale: "vi",
    });

    // UX Decision: If completed, where should the button lead?
    // Option A: Always go to test-detail (simplest, handles resume/start)
    router.push(`/test/${slugifiedTitle}/test-detail?id=${test.id}`);

    // Option B: Go to results if completed (requires finding the latest attemptId)
    // if (attemptStatus === 'completed') {
    //    // Need logic here to find the relevant attemptId (e.g., from 'attempts' state)
    //    const latestCompletedAttempt = attempts.find(a => a.status === 'completed'); // Requires sorting/fetching logic
    //    if (latestCompletedAttempt) {
    //       navigateToAttemptResult(latestCompletedAttempt.id);
    //    } else {
    //       console.warn("Completed status detected, but no completed attempt found to link to results.");
    //       // Fallback to test-detail?
    //       router.push(`/test/${slugifiedTitle}/test-detail?id=${test.id}`);
    //    }
    // } else {
    //    router.push(`/test/${slugifiedTitle}/test-detail?id=${test.id}`);
    // }
  };

  // --- Render Logic ---
  if (loading && !test) {
    // Show loading only if test data isn't available yet
    return <TestLoading />;
  }

  // Show error if the main test fetch failed
  if (error && !test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <p className="text-red-600 mb-4 text-lg">Error loading test:</p>
        <p className="text-red-500 mb-6">{error}</p>
        <Link href="/test?mode=practice-test" passHref>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Practice Tests
          </Button>
        </Link>
      </div>
    );
  }

  // If loading is finished, but test is still null (should be caught by error)
  if (!test) {
    console.warn("Test data is unexpectedly null after loading.");
    return <div>Test data not found.</div>; // Fallback message
  }

  // Test data is available, proceed with rendering
  const slugifiedTitle = slugify(test.title, {
    lower: true,
    strict: true,
    locale: "vi",
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/test?mode=practice-test"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Practice Tests
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-4 font-sora">{test.title}</h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            {/* Use dangerouslySetInnerHTML only if test.instructions is trusted HTML, otherwise use a safer rendering method */}
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: test.instructions || "" }}
            />
          </div>

          {/* Display previous attempts if data is available */}
          {/* {attempts.length > 0 && (
            <div className="mb-8">
              <PreviousAttempts
                attempts={attempts}
                onAttemptClick={navigateToAttemptResult}
              />
            </div>
          )} */}

          <div className="flex justify-center items-center mt-8">
            <Button
              className="px-8 py-6 text-lg"
              onClick={handlePlayButtonClick}
              // Disable button if status is still loading (null) or if main data is loading
              disabled={loading || attemptStatus === null}
            >
              <Play className="h-5 w-5 mr-2" />
              {/* Use the function to get dynamic button text */}
              {getButtonText(attemptStatus)}
            </Button>
            {/* Optional: Display a subtle message if status check failed */}
            {attemptStatus === "error" &&
              !error && ( // Show only if main fetch succeeded but status failed
                <p
                  className="text-xs text-yellow-600 ml-4 self-center tooltip"
                  title="Could not verify previous attempt status."
                >
                  Status Unavailable
                </p>
              )}
          </div>
        </div>

        {/* Pass test data to the information component */}
        <div>
          <TestInformation test={test} />
        </div>
      </div>
    </div>
  );
}
