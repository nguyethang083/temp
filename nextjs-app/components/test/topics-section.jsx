"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Pagination } from "@/components/test/pagination"; // Adjust path if needed
import { useTopics } from "@/hooks/useTopics"; // Import the custom hook (adjust path)
import TopicItem from "@/pages/test/TopicItem"; // Adjust path if needed

export default function TopicsSection({ onTopicSelect }) {
  // Use the custom hook to get topics, loading state, and error state
  const { topics, loading, error } = useTopics();

  // State for pagination remains in this component
  const [currentPage, setCurrentPage] = useState(1);
  const [topicsPerPage] = useState(5); // Or set to 10 if you want to show all by default

  // Pagination logic
  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  // Slice the topics array provided by the hook
  const currentTopics = topics.slice(indexOfFirstTopic, indexOfLastTopic);

  // Change page function
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading Topics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 mt-8">Topics</h3>

      {topics.length === 0 && !loading ? (
        <p className="text-gray-500">No topics found.</p>
      ) : (
        // Render the list using the TopicItem component
        <div className="space-y-4">
          {currentTopics.map((topic) => (
            // Pass the full topic object (including color) as a prop
            <TopicItem
              key={topic.id}
              topic={topic}
              onTopicSelect={onTopicSelect}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {/* Only show pagination if there are more topics than fit on one page */}
      {topics.length > topicsPerPage && (
        <div className="mt-8">
          <Pagination
            itemsPerPage={topicsPerPage}
            totalItems={topics.length} // Use the total number of topics from the hook
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      )}
    </div>
  );
}
