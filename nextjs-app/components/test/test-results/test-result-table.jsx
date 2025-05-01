"use client";

import React from "react";

import { useState } from "react";
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
} from "lucide-react";

export default function TestResultsTable({ questions, searchQuery }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter questions based on search query and filter status
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.topic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "correct" && question.isCorrect) ||
      (filterStatus === "incorrect" && !question.isCorrect);

    return matchesSearch && matchesFilter;
  });

  // Sort questions based on sort config
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-sora font-medium">Question Details</h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter:{" "}
              {filterStatus === "all"
                ? "All"
                : filterStatus === "correct"
                ? "Correct"
                : "Incorrect"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>
              All Questions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("correct")}>
              Correct Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("incorrect")}>
              Incorrect Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-12">No.</TableHead>
              <TableHead className="w-[45%]">Question</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort("topic")}
              >
                <div className="flex items-center">
                  Topic {getSortIcon("topic")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort("isCorrect")}
              >
                <div className="flex items-center">
                  Status {getSortIcon("isCorrect")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => requestSort("timeSpent")}
              >
                <div className="flex items-center justify-end">
                  Time {getSortIcon("timeSpent")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedQuestions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No questions found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              sortedQuestions.map((question, index) => (
                <React.Fragment key={question.id}>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRow(question.id)}
                      >
                        {expandedRows[question.id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{question.id}</TableCell>
                    <TableCell>{question.question}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        {question.topic}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {question.isCorrect ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span>Correct</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          <span>Incorrect</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {question.timeSpent}
                    </TableCell>
                  </TableRow>

                  {expandedRows[question.id] && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={6} className="p-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-1">Your Answer:</h4>
                            <p
                              className={
                                question.isCorrect
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {question.userAnswer}
                            </p>
                          </div>

                          {!question.isCorrect && (
                            <div>
                              <h4 className="font-medium mb-1">
                                Correct Answer:
                              </h4>
                              <p className="text-green-600">
                                {question.correctAnswer}
                              </p>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium mb-1">Explanation:</h4>
                            <p>{question.explanation}</p>
                          </div>
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
    </div>
  );
}
