// components/test/test-results/test-result-header.js
"use client";

import Link from "next/link";
import { CheckCircle, XCircle, Clock, Hourglass, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Displays the header for the test result page, including title, breadcrumbs,
 * and a status indicator based on the attempt's final state.
 *
 * @param {object} props - Component props.
 * @param {string} props.title - The title of the test.
 * @param {string | null} props.status - The status of the test attempt (e.g., 'graded', 'completed', 'timed_out', 'in_progress').
 * @param {boolean | null} props.passed - Whether the user passed the test (true, false, or null if not applicable/graded).
 * @param {Array<{label: string, href?: string}>} [props.breadcrumbs=[]] - Array for breadcrumb navigation.
 */
export default function TestResultHeader({
  title,
  status,
  passed,
  breadcrumbs = [],
}) {
  // Helper function to render the status badge consistently
  const renderStatusIndicator = () => {
    const normalizedStatus = status?.toLowerCase();

    // Define common badge classes for reuse
    const baseBadgeClass = "text-xs font-medium px-2.5 py-0.5 rounded-full"; // Smaller badge

    switch (normalizedStatus) {
      case "graded":
      case "completed":
        if (passed === true) {
          return (
            <Badge
              variant="default"
              className={`${baseBadgeClass} bg-green-100 text-green-800 border border-green-300`}
            >
              <CheckCircle className="h-3 w-3 mr-1" /> Passed
            </Badge>
          );
        } else if (passed === false) {
          return (
            <Badge
              variant="destructive"
              className={`${baseBadgeClass} bg-red-100 text-red-800 border border-red-300`}
            >
              <XCircle className="h-3 w-3 mr-1" /> Failed
            </Badge>
          );
        } else {
          return (
            <Badge
              variant="secondary"
              className={`${baseBadgeClass} bg-blue-100 text-blue-800 border border-blue-300`}
            >
              <Award className="h-3 w-3 mr-1" /> Completed
            </Badge>
          );
        }
      case "timed_out":
        if (passed === true) {
          return (
            <Badge
              variant="default"
              className={`${baseBadgeClass} bg-green-100 text-green-800 border border-green-300`}
            >
              <CheckCircle className="h-3 w-3 mr-1" /> Passed (Timed Out)
            </Badge>
          );
        } else if (passed === false) {
          return (
            <Badge
              variant="destructive"
              className={`${baseBadgeClass} bg-red-100 text-red-800 border border-red-300`}
            >
              <XCircle className="h-3 w-3 mr-1" /> Failed (Timed Out)
            </Badge>
          );
        } else {
          return (
            <Badge
              variant="secondary"
              className={`${baseBadgeClass} bg-yellow-100 text-yellow-800 border border-yellow-300`}
            >
              <Clock className="h-3 w-3 mr-1" /> Timed Out
            </Badge>
          );
        }
      case "in_progress":
        return (
          <Badge
            variant="outline"
            className={`${baseBadgeClass} text-blue-600 border-blue-300`}
          >
            <Hourglass className="h-3 w-3 mr-1 animate-spin" /> In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className={baseBadgeClass}>
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-2">
      {" "}
      {/* Add space between breadcrumbs and title/badge */}
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">&gt;</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-blue-600 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Title */}
      <h1 className="text-xl font-sora font-bold text-gray-800 dark:text-gray-100">
        {title || "Test Result"}
      </h1>
      {/* Status Badge (on its own line) */}
      <div className="mt-1">
        {" "}
        {/* Add small margin-top */}
        {renderStatusIndicator()}
      </div>
    </div>
  );
}
