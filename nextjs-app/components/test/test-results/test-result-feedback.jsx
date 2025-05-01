"use client";

import { CheckCircle, ThumbsUp } from "lucide-react";

/**
 * Displays a list of feedback items (e.g., overall feedback or recommendations).
 *
 * @param {object} props - Component props.
 * @param {string} [props.title="Feedback Overall"] - The title for the feedback section.
 * @param {string[]} [props.feedback=[]] - An array of feedback strings to display.
 * @param {'checkCircle' | 'thumbsUp'} [props.icon='checkCircle'] - Which icon to display next to the title.
 */
export default function TestResultFeedback({
  title = "Feedback Overall",
  feedback = [], // Default to empty array
  icon = "checkCircle",
}) {
  // Determine the icon component and color based on the icon prop
  const IconComponent = icon === "checkCircle" ? CheckCircle : ThumbsUp;
  const iconColor =
    icon === "checkCircle" ? "text-orange-500" : "text-blue-500"; // Example colors

  // Handle cases where feedback might be null or undefined gracefully
  const feedbackItems = Array.isArray(feedback) ? feedback : [];

  return (
    <div>
      {/* Header section with icon and title */}
      <div className="flex items-center mb-4">
        <IconComponent className={`h-5 w-5 ${iconColor} mr-2 shrink-0`} />{" "}
        {/* Added shrink-0 */}
        <h3 className="text-lg font-sora font-medium">{title}</h3>
      </div>

      {/* List of feedback items */}
      {feedbackItems.length > 0 ? (
        <ul className="space-y-3 pl-1">
          {" "}
          {/* Added slight padding */}
          {feedbackItems.map((item, index) => (
            <li key={index} className="flex items-start text-sm">
              {" "}
              {/* Use items-start for alignment */}
              {/* Numbering with consistent color */}
              <span
                className={`${iconColor} font-medium mr-2 w-5 text-right shrink-0`} // Fixed width and alignment
              >
                {index + 1}.
              </span>
              {/* Feedback text */}
              <span>{item || "N/A"}</span>{" "}
              {/* Display N/A if item is empty/null */}
            </li>
          ))}
        </ul>
      ) : (
        // Display a message if there's no feedback
        <p className="text-sm text-gray-500 pl-7">
          No {title.toLowerCase()} available.
        </p>
      )}
    </div>
  );
}
