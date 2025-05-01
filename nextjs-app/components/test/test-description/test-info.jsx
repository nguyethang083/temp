import { Clock, BarChart2, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDifficultyColor } from "@/utils/test-utils";

export default function TestInformation({ test }) {
  const questionCount = test.test_questions?.[0].count ?? "N/A";
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Test Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">Difficulty</div>
          <Badge className={`${getDifficultyColor(test.difficulty)} px-3 py-1`}>
            {test.difficulty}
          </Badge>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Duration</div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">{test.time_limit_minutes} mins</span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Questions</div>
          <div className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">{questionCount} questions</span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Passing Score</div>
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">{test.passing_score}/10</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
