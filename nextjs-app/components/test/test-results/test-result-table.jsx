"use client";

import React, { useState, useEffect, useMemo } from "react";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css"; // Ensure this is imported globally or in a layout component

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Filter,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";

// Helper to render potentially complex answer types, including LaTeX
const renderAnswer = (answer) => {
  if (answer === null || answer === undefined) {
    return <span className="text-gray-500 italic">Not Answered</span>;
  }
  if (typeof answer === "object") {
    // Basic handling for object answers (e.g., from canvas)
    // Consider a more specific rendering if needed
    return <span className="text-xs font-mono">[Complex Data]</span>;
  }
  // Check if the string contains LaTeX delimiters
  if (
    typeof answer === "string" &&
    (answer.includes("$") || answer.includes("\\"))
  ) {
    // Use the Latex component, specifying standard delimiters
    return (
      <Latex
        delimiters={[
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ]}
      >
        {answer}
      </Latex>
    );
  }
  // Otherwise, return the string as is
  return answer.toString();
};

// Helper to render question content, including LaTeX
const renderQuestionContent = (content) => {
  if (content === null || content === undefined) return "";
  // Check if the string contains LaTeX delimiters
  if (
    typeof content === "string" &&
    (content.includes("$") || content.includes("\\"))
  ) {
    // Use the Latex component
    return (
      <Latex
        delimiters={[
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ]}
      >
        {content}
      </Latex>
    );
  }
  // Otherwise, return the string as is
  return content;
};

/**
 * Displays the detailed table of questions, answers, status, etc.
 * Handles LaTeX rendering and includes pagination.
 *
 * @param {object} props - Component props.
 * @param {Array} [props.questions=[]] - The array of question/answer objects.
 * @param {string} [props.searchQuery=""] - The search term to filter questions.
 */
export default function TestResultsTable({ questions = [], searchQuery = "" }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: "index",
    direction: "asc",
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const questionsWithIndex = useMemo(
    () => questions.map((q, index) => ({ ...q, index: index + 1 })),
    [questions]
  );

  // Apply filtering first
  const filteredQuestions = useMemo(
    () =>
      questionsWithIndex.filter((question) => {
        const content = question.q_content || "";
        // Basic search - might need adjustment if searching within LaTeX source
        const matchesSearch = content
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const status = question.is_correct;
        const matchesFilter =
          filterStatus === "all" ||
          (filterStatus === "correct" && status === true) ||
          (filterStatus === "incorrect" && status === false) ||
          (filterStatus === "not_graded" && status === null);
        return matchesSearch && matchesFilter;
      }),
    [questionsWithIndex, searchQuery, filterStatus]
  );

  // Apply sorting to the filtered list
  const sortedQuestions = useMemo(
    () =>
      [...filteredQuestions].sort((a, b) => {
        if (!sortConfig.key) return 0;
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle sorting for status
        if (sortConfig.key === "status") {
          const statusOrder = { true: 1, false: 2, null: 3 }; // Correct > Incorrect > Not Graded
          aValue = statusOrder[a.is_correct];
          bValue = statusOrder[b.is_correct];
        }
        // Removed sorting logic for 'time_spent_seconds'

        // Basic comparison
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }),
    [filteredQuestions, sortConfig]
  );

  // --- Pagination Logic ---
  const totalPages = Math.ceil(sortedQuestions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuestions = sortedQuestions.slice(startIndex, endIndex);

  // Effect to reset page if filters change total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
    if (totalPages === 0 && currentPage !== 1) {
      // Reset if no results
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setCurrentPage(1);
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (status) => {
    setCurrentPage(1);
    setFilterStatus(status);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setExpandedRows({}); // Collapse rows when changing page
    }
  };

  // Helper for sort icons
  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return (
        <span className="ml-1 opacity-30 group-hover:opacity-60 transition-opacity">
          ↕
        </span>
      ); // Show on hover
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
      {/* Component Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-5 border-b pb-3">
        Question Details
      </h2>

      {/* Filter Dropdown in a card-like section */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-sm text-gray-500">
          {filteredQuestions.length} questions{" "}
          {searchQuery ? `matching "${searchQuery}"` : ""}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter Status:{" "}
              {filterStatus === "all"
                ? "All"
                : filterStatus === "correct"
                ? "Correct"
                : filterStatus === "incorrect"
                ? "Incorrect"
                : "Not Graded"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleFilterChange("all")}>
              All Questions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange("correct")}>
              Correct Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange("incorrect")}>
              Incorrect Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange("not_graded")}>
              Not Graded Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results Table with white background */}
      <div className="overflow-x-auto border rounded-md">
        <Table className="bg-white">
          <TableHeader className="bg-white border-b">
            <TableRow>
              <TableHead className="w-12 px-2"></TableHead>
              <TableHead
                className="w-16 px-3 py-3 cursor-pointer group"
                onClick={() => requestSort("index")}
              >
                <div className="flex items-center">
                  No. {getSortIcon("index")}
                </div>
              </TableHead>
              <TableHead className="min-w-[300px] px-4 py-3">
                Question
              </TableHead>
              <TableHead
                className="w-36 px-4 py-3 cursor-pointer group"
                onClick={() => requestSort("status")}
              >
                <div className="flex items-center">
                  Status {getSortIcon("status")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuestions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-gray-500"
                >
                  {questions.length === 0
                    ? "No questions in this result."
                    : "No questions found matching your criteria."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedQuestions.map((question) => (
                <React.Fragment key={question.test_question_id}>
                  <TableRow className="hover:bg-gray-50 text-sm border-b">
                    {/* Row cells remain the same */}
                    <TableCell className="px-2 py-2 align-top">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleRow(question.test_question_id)}
                        aria-label={
                          expandedRows[question.test_question_id]
                            ? "Collapse row"
                            : "Expand row"
                        }
                      >
                        {expandedRows[question.test_question_id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium px-3 py-3 align-top">
                      {question.index}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      {renderQuestionContent(question.q_content)}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      {question.is_correct === true ? (
                        <div className="flex items-center text-green-600 font-medium">
                          <CheckCircle className="h-4 w-4 mr-1.5 shrink-0" />
                          <span>Correct</span>
                        </div>
                      ) : question.is_correct === false ? (
                        <div className="flex items-center text-red-600 font-medium">
                          <XCircle className="h-4 w-4 mr-1.5 shrink-0" />
                          <span>Incorrect</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-amber-600 font-medium">
                          <AlertCircle className="h-4 w-4 mr-1.5 shrink-0" />
                          <span>Not Graded</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row Content - changed to white bg */}
                  {expandedRows[question.test_question_id] && (
                    <TableRow className="bg-white hover:bg-gray-50 text-sm">
                      <TableCell
                        colSpan={4}
                        className="p-4 space-y-4 text-xs border-t border-gray-200"
                      >
                        {/* Content remains the same */}
                        <div>
                          <h4 className="font-semibold mb-1.5 text-gray-600">
                            Your Answer:
                          </h4>
                          <div
                            className={`p-3 rounded border text-gray-800 ${
                              question.is_correct === true
                                ? "border-green-300 bg-green-50"
                                : question.is_correct === false
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            {renderAnswer(question.user_answer)}
                          </div>
                        </div>

                        {/* Other expanded content remains the same */}
                        {question.is_correct !== true && (
                          <div>
                            <h4 className="font-semibold mb-1.5 text-gray-600">
                              Correct Answer:
                            </h4>
                            <div className="p-3 rounded border border-blue-200 bg-blue-50 text-gray-800">
                              {renderAnswer(question.correct_answer)}
                            </div>
                          </div>
                        )}

                        {question.explanation && (
                          <div>
                            <h4 className="font-semibold mb-1.5 text-gray-600">
                              Explanation:
                            </h4>
                            <div className="p-3 rounded border border-gray-200 bg-gray-50 prose prose-sm max-w-none">
                              {renderQuestionContent(question.explanation)}
                            </div>
                          </div>
                        )}

                        <div className="text-gray-500 pt-1">
                          Points Awarded:{" "}
                          <span className="font-medium text-gray-700">
                            {question.points_awarded ?? "N/A"} /{" "}
                            {question.point_value}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls with blue buttons */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
            className="text-blue-600 border-blue-300 hover:bg-blue-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-gray-500 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
            className="text-blue-600 border-blue-300 hover:bg-blue-50 disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
