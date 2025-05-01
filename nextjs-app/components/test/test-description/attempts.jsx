import { format } from "date-fns";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Hourglass,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// --- Helper function to format duration in seconds ---
function formatDurationFromSeconds(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0) {
    return "N/A";
  }
  if (totalSeconds === 0) {
    return "0s";
  }
  const seconds = Math.floor(totalSeconds % 60);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  let parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}

function AttemptStatus({ status, passed }) {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case "graded":
    case "completed":
      if (passed === true) {
        // Keep Badge for Passed
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Passed
          </Badge>
        );
      } else if (passed === false) {
        return (
          <div className="flex items-center justify-center text-red-600">
            {" "}
            {/* Added justify-center */}
            <XCircle className="h-4 w-4 mr-1" />{" "}
            {/* Use h-4 w-4 from old code */}
            Failed
          </div>
        );
      } else {
        // Keep Badge for Completed (unknown pass/fail)
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            <Award className="h-3.5 w-3.5 mr-1" /> Completed
          </Badge>
        );
      }
    case "in_progress":
      // Keep Badge for In Progress
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-300">
          <Hourglass className="h-3.5 w-3.5 mr-1 animate-spin" /> In Progress
        </Badge>
      );
    case "timed_out":
      if (passed === true) {
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Passed (Timed Out)
          </Badge>
        );
      } else if (passed === false) {
        return (
          <div className="flex items-center justify-center text-red-600">
            {" "}
            {/* Added justify-center */}
            <XCircle className="h-4 w-4 mr-1" />{" "}
            {/* Use h-4 w-4 from old code */}
            Failed (Timed Out) {/* Add specific text */}
          </div>
        );
      } else {
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
          >
            <Clock className="h-3.5 w-3.5 mr-1" /> Timed Out
          </Badge>
        );
      }
    default:
      return <Badge variant="secondary">{status || "Unknown"}</Badge>;
  }
}

export default function PreviousAttempts({
  attempts = [],
  onAttemptClick,
  totalPossibleScore,
}) {
  return (
    <div className="mb-8">
      {/* Optional: Remove explicit h2 if CardHeader/CardTitle is sufficient */}
      <h2 className="text-xl font-semibold mb-3">Previous Attempts</h2>

      <Card>
        <CardContent className="p-0">
          {attempts && attempts.length > 0 ? (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead className="py-3 px-4">Date Started</TableHead>
                  <TableHead className="py-3 px-4 text-center">Score</TableHead>
                  <TableHead className="py-3 px-4 text-center">
                    Time Taken
                  </TableHead>
                  <TableHead className="py-3 px-4 text-center">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => {
                  const isClickable = attempt.status !== "in_progress";
                  const canCalculatePercentage =
                    attempt.status !== "in_progress" &&
                    attempt.score !== null &&
                    typeof attempt.score === "number" && // Ensure score is a number
                    totalPossibleScore !== null &&
                    totalPossibleScore !== undefined &&
                    typeof totalPossibleScore === "number" && // Ensure total is a number
                    totalPossibleScore > 0; // Avoid division by zero
                  return (
                    <TableRow
                      key={attempt.id}
                      className={
                        isClickable
                          ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          : "opacity-70"
                      }
                      onClick={() => {
                        if (isClickable) {
                          onAttemptClick(attempt.id);
                        }
                      }}
                      aria-disabled={!isClickable}
                      title={
                        isClickable
                          ? "Click to view results"
                          : "Attempt in progress"
                      }
                    >
                      {/* Date Cell */}
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
                          <span>
                            {attempt.start_time
                              ? format(new Date(attempt.start_time), "PP p")
                              : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      {/* Score Cell */}
                      <TableCell className="py-3 px-4 text-center">
                        {canCalculatePercentage ? (
                          <span className="font-medium">
                            {/* Calculate and format percentage (e.g., 85.0%) */}
                            {`${(
                              (attempt.score / totalPossibleScore) *
                              10
                            ).toFixed(1)}`}
                            {/* Optional: Show raw score as well */}
                            {/* <span className="text-xs text-gray-500 ml-1">
                ({attempt.score}/{totalPossibleScore})
              </span> */}
                          </span>
                        ) : attempt.status === "in_progress" ? (
                          // Fallback for 'in_progress'
                          <span className="text-gray-500 italic text-xs">
                            Pending
                          </span>
                        ) : (
                          // Fallback for N/A (score is null, totalPossibleScore missing, etc.)
                          <span className="text-gray-500 text-xs">N/A</span>
                        )}
                      </TableCell>
                      {/* Time Taken Cell */}
                      <TableCell className="py-3 px-4 text-center text-sm">
                        {formatDurationFromSeconds(attempt.time_taken_seconds)}
                      </TableCell>
                      {/* Status Cell */}
                      <TableCell className="py-3 px-4 text-center">
                        {/* Renders based on modified AttemptStatus component */}
                        <AttemptStatus
                          status={attempt.status}
                          passed={attempt.passed}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No previous attempts found for this test.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
