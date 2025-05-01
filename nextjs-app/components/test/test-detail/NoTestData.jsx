import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Adjust path
import { ArrowLeft } from "lucide-react";

export const NoTestDataScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
    <p className="font-bold text-lg text-gray-700">Test Data Not Available</p>
    <p className="text-gray-500 mb-4">
      Could not load questions for this test.
    </p>
    <Link href="/test?mode=practice-test" passHref>
      {" "}
      {/* Adjust link as needed */}
      <Button variant="outline">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Tests
      </Button>
    </Link>
  </div>
);
