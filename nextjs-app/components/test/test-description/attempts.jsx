import { format } from "date-fns";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PreviousAttempts({ attempts, onAttemptClick }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-3">Previous Attempts</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="py-3">Date</TableHead>
                <TableHead className="py-3">Score</TableHead>
                <TableHead className="py-3">Time Taken</TableHead>
                <TableHead className="py-3">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((attempt, idx) => (
                <TableRow
                  key={idx}
                  className={
                    attempt.status !== "In Progress"
                      ? "hover:bg-gray-50 cursor-pointer"
                      : ""
                  }
                  onClick={() => {
                    if (attempt.status !== "In Progress") {
                      onAttemptClick(attempt.date);
                    }
                  }}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {attempt.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    {attempt.score !== null ? (
                      <span className="font-medium">{attempt.score}</span>
                    ) : (
                      <span className="text-gray-500">In progress</span>
                    )}
                  </TableCell>
                  <TableCell>{attempt.time_taken}</TableCell>

                  <TableCell>
                    {attempt.is_passed === 1 ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Passed
                      </div>
                    ) : attempt.is_passed === 0 ? (
                      <div className="flex items-center text-red-600">
                        <XCircle className="h-4 w-4 mr-1" />
                        Failed
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600">
                        <Clock className="h-4 w-4 mr-1" />
                        In Progress
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
