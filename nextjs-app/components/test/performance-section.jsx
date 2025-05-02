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
import { useRouter } from "next/router";
import { useTopics } from "@/hooks/useTopics";

export default function PerformanceSection({ userData }) {
  const router = useRouter();
  const { mode: modeFromUrl, topicId: topicIdFromUrl } = router.query;
  const [selectedGrade, setSelectedGrade] = useState("9");
  const [selectedMode, setSelectedMode] = useState("Topics");
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [mathLevel, setMathLevel] = useState(userData.mathLevel);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedTopicName, setSelectedTopicName] = useState(null);

  // Add a new state to track whether to show tests for a topic
  const [showTopicTests, setShowTopicTests] = useState(false);

  const {
    topics: allTopics,
    loading: loadingTopics,
    error: topicsError,
  } = useTopics();

  useEffect(() => {
    // If we have a selected topic ID but no name, try to find the name in topics
    if (
      selectedTopicId &&
      !selectedTopicName &&
      allTopics &&
      allTopics.length > 0
    ) {
      const selectedTopic = allTopics.find((t) => t.id === selectedTopicId);
      if (selectedTopic) {
        setSelectedTopicName(selectedTopic.name);
        console.log(
          "Setting topic name from loaded topics:",
          selectedTopic.name
        );
      }
    }
  }, [selectedTopicId, selectedTopicName, allTopics]);

  // Set the mode from URL parameter if available
  useEffect(() => {
    if (modeFromUrl === "practice-test") {
      // Don't change selectedMode, just set the flag to show tests
      setShowTopicTests(true);

      // If there's a topicId, set it
      if (topicIdFromUrl) {
        setSelectedTopicId(topicIdFromUrl);

        // Find the topic name in the loaded topics
        if (allTopics && allTopics.length > 0) {
          const selectedTopic = allTopics.find((t) => t.id === topicIdFromUrl);
          if (selectedTopic) {
            setSelectedTopicName(selectedTopic.name);
          }
        }
      }
    }
  }, [modeFromUrl, topicIdFromUrl, allTopics]);

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

    // If switching to a mode other than "Topics", clear topic selection
    if (mode !== "Topics") {
      setShowTopicTests(false);
      setSelectedTopicId(null);
      setSelectedTopicName(null);
    }

    console.log("Mode selected:", mode);
  };

  // Update topic selection to set the flag but not change the mode
  const handleTopicSelect = (topic) => {
    if (!topic || !topic.id) return;
    console.log("Topic selected:", topic);

    setSelectedTopicId(topic.id);
    setSelectedTopicName(topic.name);
    setShowTopicTests(true); // Set flag to show tests instead of changing mode

    const newPath = `/test?mode=practice-test&topicId=${topic.id}`;
    router.push(newPath, undefined, { shallow: true });
  };

  const testModes = ["Practice Test", "Full Exam Simulation", "Topics"];

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
      <div className="mt-8">
        {selectedMode === "Practice Test" ||
        (selectedMode === "Topics" && showTopicTests) ? (
          <PracticeTestList
            selectedTopicId={selectedTopicId}
            selectedTopicName={selectedTopicName}
            selectedGrade={selectedGrade}
          />
        ) : selectedMode === "Topics" ? (
          <TopicsSection
            topics={allTopics}
            loading={loadingTopics}
            error={topicsError}
            onTopicSelect={handleTopicSelect}
            selectedGrade={selectedGrade}
          />
        ) : (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400 border rounded-lg bg-gray-50 dark:bg-gray-800/50 mt-6">
            {selectedMode} mode content will be shown here.
          </div>
        )}
      </div>
    </div>
  );
}
