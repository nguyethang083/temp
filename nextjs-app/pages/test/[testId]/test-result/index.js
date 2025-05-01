"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TestResultHeader from "@/components/test/test-results/test-result-header";
import TestResultSummary from "@/components/test/test-results/test-result-summary";
import TestResultFeedback from "@/components/test/test-results/test-result-feedback";
import TestResultsTable from "@/components/test/test-results/test-result-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw, Download, Search, ArrowRight } from "lucide-react";
import { fetchTestResult } from "@/lib/test-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function TestResultsPage() {
  const searchParams = useSearchParams();
  const testId = searchParams.get("id") || "default";

  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    loadTestResult();
  }, [testId]);

  const loadTestResult = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTestResult(testId);
      setTestResult(result);

      // If the URL has a query parameter to show details, set the active tab
      if (searchParams.get("view") === "details") {
        setActiveTab("details");
      }
    } catch (err) {
      console.error("Failed to fetch test result:", err);
      setError("Failed to load test results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTestResult();
  };

  const handleExport = () => {
    if (!testResult) return;

    // Create CSV content
    const csvContent = `data:text/csv;charset=utf-8,
Test: ${testResult.title}
Score: ${testResult.score}%
Correct Answers: ${testResult.correctAnswers}/${testResult.totalQuestions}
Time Taken: ${testResult.timeTaken}
Date: ${new Date(testResult.date).toLocaleDateString()}
    `;

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `test-result-${testId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  if (!testResult) return null;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <TestResultHeader
          title={testResult.title}
          status={testResult.status}
          breadcrumbs={testResult.breadcrumbs}
        />

        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search results..."
              className="pl-8 w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            title="Export"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="summary"
        className="mb-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Question Details</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Left side: Progress chart */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardContent className="pt-6">
                  <TestResultSummary
                    score={testResult.score}
                    correctAnswers={testResult.correctAnswers}
                    totalQuestions={testResult.totalQuestions}
                    timeTaken={testResult.timeTaken}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Middle: Statistics */}
            <div className="w-full md:w-1/3">
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="h-full flex flex-col justify-center">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-center font-sora text-lg font-medium mb-4">
                        Statistics
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Correct Answers:</span>
                        <span className="font-medium">
                          {testResult.correctAnswers} /{" "}
                          {testResult.totalQuestions}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Accuracy:</span>
                        <span className="font-medium">
                          {testResult.score} %
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Time Taken:</span>
                        <span className="font-medium">
                          {testResult.timeTaken}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side: Action buttons */}
            <div className="w-full md:w-1/3">
              <div className="flex flex-col space-y-4">
                <Button
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 border-blue-100 text-gray-700 justify-between h-14 font-medium"
                  onClick={() => setActiveTab("details")}
                >
                  Review Answers
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  className="bg-amber-50 hover:bg-amber-100 border-amber-100 text-gray-700 justify-between h-14"
                  onClick={testResult.actions.retake}
                >
                  Retake Test
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 border-green-100 text-gray-700 justify-between h-14"
                  onClick={testResult.actions.next}
                >
                  Next Test
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom section: Feedback and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="bg-white shadow-sm">
              <CardContent className="pt-6">
                <TestResultFeedback feedback={testResult.feedback} />
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="pt-6">
                <TestResultFeedback
                  title="Recommendations"
                  feedback={testResult.recommendations}
                  icon="thumbsUp"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <TestResultsTable
            questions={testResult.questions}
            searchQuery={searchQuery}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
