"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TestRow from "@/components/test/TestRow";
import { usePracticeTests } from "@/hooks/usePracticeTests";

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-2 mt-4">
    <div className="h-12 bg-gray-200 rounded"></div>
    <div className="h-12 bg-gray-200 rounded"></div>
    <div className="h-12 bg-gray-200 rounded"></div>
    <div className="h-12 bg-gray-200 rounded"></div>
  </div>
);

export default function PracticeTestList({
  selectedTopicId,
  selectedTopicName,
  selectedGrade,
}) {
  const { tests, loading, error } = usePracticeTests({
    topicId: selectedTopicId,
    gradeLevel: selectedGrade,
  });

  console.log("Tests fetched:", tests);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">
        {selectedTopicId && selectedTopicName
          ? `${selectedTopicName}`
          : selectedTopicId
          ? `Practice Tests for Selected Topic` // Fallback if name is missing but ID exists
          : "All Practice Tests"}
      </h3>
      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Error State */}
      {error && !loading && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* Success State - Data Loaded */}
      {!loading && !error && (
        <>
          {tests.length === 0 ? (
            <p className="text-gray-500 mt-4">No practice tests found.</p>
          ) : (
            <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[50%] py-3 px-6 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Test
                    </TableHead>
                    <TableHead className="w-[15%] py-3 px-6 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Difficulty
                    </TableHead>
                    <TableHead className="w-[15%] py-3 px-6 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Duration
                    </TableHead>
                    <TableHead className="w-[20%] py-3 px-6 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Questions
                    </TableHead>
                    {/* Removed Status Header */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Map over the tests fetched by the hook */}
                  {tests.map((test) => (
                    <TestRow
                      key={test.id} // Use the actual ID from the database
                      test={test}
                      // Pass helper functions as props if they were kept in TestRow
                      // getDifficultyColor={getDifficultyColor}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
