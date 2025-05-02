import React from "react";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button
import { ChevronRight } from "lucide-react";

export default function TopicItem({ topic, onTopicSelect }) {
  // Handle button click to navigate
  const handleSeeTestsClick = () => {
    if (topic && onTopicSelect) {
      onTopicSelect(topic);
    } else {
      console.error("Missing topic data or onTopicSelect handler");
    }
  };

  if (!topic) return null; // Return null if no topic data provided

  return (
    <div
      key={topic.id}
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
    >
      {/* Use the dynamically assigned color */}
      <div
        className="flex flex-col sm:flex-row sm:items-center p-4 border-l-4 gap-4" // Added gap, adjusted flex direction for responsiveness
        style={{ borderLeftColor: topic.color }} // Use assigned color
      >
        <div className="flex-1">
          {/* Use 'name' field from schema */}
          <h4
            className="text-lg font-medium"
            style={{ color: topic.color }} // Use assigned color for text
          >
            {topic.name || "Unnamed Topic"} {/* Fallback for name */}
          </h4>
          {/* Display "Includes:" text and the description */}
          {topic.description && (
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-600">Bao gồm:</span>{" "}
              {topic.description} {/* Use description */}
            </p>
          )}
        </div>
        {/* Use assigned color for button background */}
        <Button
          className="w-full sm:w-auto flex-shrink-0 text-white" // Full width on small screens, auto on larger
          style={{ backgroundColor: topic.color }}
          onClick={handleSeeTestsClick} // Add onClick handler
        >
          See all tests <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
