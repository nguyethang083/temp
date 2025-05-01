"use client";

import { Badge } from "@/components/ui/badge"; // Adjust path
import { Button } from "@/components/ui/button"; // Adjust path
import { Switch } from "@/components/ui/switch"; // Adjust path
import { Clock, ChevronRight } from "lucide-react";

// Expects props: title, timeLeft, formatTime
export function TestHeader({ title, timeLeft, formatTime }) {
  // Format time safely, handle null timeLeft
  const formattedTime = timeLeft !== null ? formatTime(timeLeft) : "--:--";

  return (
    <>
      {/* Breadcrumbs (Consider making dynamic or removing if not needed) */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Button
          variant="link"
          className="p-0 h-auto text-indigo-600 hover:text-indigo-800"
        >
          Dashboard
        </Button>
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
        <Button
          variant="link"
          className="p-0 h-auto text-indigo-600 hover:text-indigo-800"
        >
          Tests
        </Button>
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
        <span className="text-gray-700 font-medium">Practice Test</span>
      </div>

      {/* Test header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 pb-4 border-b">
        <div className="max-w-full md:max-w-[60%]">
          {" "}
          {/* Adjusted max-width */}
          {/* Display the test title passed as prop */}
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 break-words">
            {title || "Loading Test..."}
          </h1>
        </div>
        {/* Timer and Auto-Save */}
        <div className="flex items-center gap-4">
          {/* Timer Display */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700 text-lg tabular-nums">
              {formattedTime}
            </span>
          </div>

          {/* Auto-Save Toggle (Functionality needs implementation) */}
          <div className="flex items-center gap-1.5">
            <Switch id="auto-save" defaultChecked disabled />
            <label
              htmlFor="auto-save"
              className="text-sm text-gray-500 cursor-not-allowed"
            >
              Auto-save
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
