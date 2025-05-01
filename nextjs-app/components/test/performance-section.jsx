"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import TopicsSection from "@/components/test/topics-section";
import PracticeTestList from "@/components/test/practice-test-list";
import { useSearchParams } from "next/navigation";

export default function PerformanceSection({ userData }) {
  const searchParams = useSearchParams();
  const modeFromUrl = searchParams.get("mode");

  const [selectedGrade, setSelectedGrade] = useState("9");
  const [selectedMode, setSelectedMode] = useState("");
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [mathLevel, setMathLevel] = useState(userData.mathLevel);

  // Set the mode from URL parameter if available
  useEffect(() => {
    if (modeFromUrl === "practice-test") {
      setSelectedMode("Practice Test");
    }
  }, [modeFromUrl]);

  // Simulate loading data
  useEffect(() => {
    setMathLevel(userData.mathLevel);
  }, [userData.mathLevel]);

  const handleGradeChange = (value) => {
    setSelectedGrade(value);
    // Here you would fetch new data based on the grade
    console.log("Grade changed to:", value);
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setShowModeDropdown(false);
    // Here you would apply the selected mode
    console.log("Mode selected:", mode);
  };

  const testModes = [
    "Practice Test",
    "Full Exam Simulation",
    "Topic - Specific Test",
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-sora font-bold mb-4">Overall math level</h3>

      <div className="relative h-8 bg-gray-200 rounded-full mb-6">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-300 to-blue-500 rounded-full"
          style={{ width: `${mathLevel}%` }}
        />
        <div
          className="absolute top-0 left-0 h-full flex items-center justify-center"
          style={{ left: `${mathLevel}%`, transform: "translateX(-50%)" }}
        >
          <div className="bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center text-white text-xs font-bold">
            {mathLevel}
          </div>
        </div>

        <div className="absolute top-10 left-0 right-0 flex justify-between text-sm text-gray-500">
          <span>0</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
          <span>40</span>
          <span>50</span>
          <span>60</span>
          <span>70</span>
          <span>80</span>
          <span>90</span>
          <span>100</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-12">
        <Select value={selectedGrade} onValueChange={handleGradeChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8">Grade 8</SelectItem>
            <SelectItem value="9">Grade 9</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative">
          <Button
            variant="outline"
            className="w-full sm:w-[180px] justify-between"
            onClick={() => setShowModeDropdown(!showModeDropdown)}
          >
            {selectedMode || "Select Your Mode"}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>

          {showModeDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
              {testModes.map((mode, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleModeSelect(mode)}
                >
                  {mode}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conditionally render content based on selected mode */}
      {selectedMode === "Practice Test" ? (
        <PracticeTestList />
      ) : (
        <TopicsSection />
      )}
    </div>
  );
}
