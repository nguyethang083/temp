import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Predefined color palette
const colors = [
  "#6366f1", // indigo-600
  "#4ade80", // green-400
  "#f97316", // orange-500
  "#fb923c", // amber-400
  "#22d3ee", // cyan-400
  "#a855f7", // violet-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#eab308", // yellow-500
  "#ef4444", // red-500
];

// Simple hash function to get a consistent index based on string
// Ensures the same topic name always gets the same color index.
const simpleHash = (str) => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Assigns a color from the predefined palette based on the topic name.
 * @param {string} topicName - The name of the topic.
 * @returns {string} A hex color code.
 */
export const getTopicColor = (topicName) => {
  const hash = simpleHash(topicName);
  return colors[hash % colors.length];
};
