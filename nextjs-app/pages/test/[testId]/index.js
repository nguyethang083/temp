"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import slugify from "slugify";
import TestLoading from "@/components/test/test-description/test-loading";
import TestInformation from "@/components/test/test-description/test-info";
import PreviousAttempts from "@/components/test/test-description/attempts";
import { getButtonText } from "@/utils/test-utils";
import { useTestDetails } from "@/hooks/useTestDetails";

export default function TestDescription() {
  const router = useRouter();
  const { id } = router.query;
  const { test, loading, error } = useTestDetails(id);
  const [attempts, setAttempts] = useState([]);

  const navigateToAttemptResult = (attemptId) => {
    const slugifiedTitle = slugify(test.title, {
      lower: true,
      strict: true,
      locale: "vi", // For Vietnamese character support
    });

    router.push(`/test/${slugifiedTitle}/test-result?attempt_id=${attemptId}`);
  };

  if (loading) {
    return <TestLoading />;
  }

  if (error) {
    // Display error message and link back if fetching failed
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <p className="text-red-600 mb-4 text-lg">Error loading test:</p>
        <p className="text-red-500 mb-6">{error}</p>
        <Link href="/test?mode=practice-test" passHref>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Practice Tests
          </Button>
        </Link>
      </div>
    );
  }

  if (!test) return null;

  const slugifiedTitle = slugify(test.title, {
    lower: true,
    strict: true,
    locale: "vi", // For Vietnamese character support
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
            <div className="prose max-w-none">{test.instructions}</div>
          </div>

          {attempts.length > 0 && (
            <div className="mb-8">
              <PreviousAttempts
                attempts={attempts}
                onAttemptClick={navigateToAttemptResult}
              />
            </div>
          )}

          <div className="flex justify-center mt-8">
            <Button
              className="px-8 py-6 text-lg"
              onClick={() =>
                router.push(`/test/${slugifiedTitle}/test-detail?id=${test.id}`)
              }
            >
              <Play className="h-5 w-5 mr-2" />
              {getButtonText(test.status)}
            </Button>
          </div>
        </div>

        <div>
          <TestInformation test={test} />
        </div>
      </div>
    </div>
  );
}
