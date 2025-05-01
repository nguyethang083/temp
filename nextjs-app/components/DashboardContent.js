import React, { useState } from "react";
import Image from "next/image";

const DashboardContent = ({ user }) => {
  // Mock data
  const leaderboardData = [
    { id: 1, name: user?.name || "Tony Adam", points: 8966, rank: "1ST" },
    { id: 2, name: "John Mick", points: 7550, rank: "2ND", initials: "JM" },
    { id: 3, name: "Hugo Laris", points: 7230, rank: "3RD", initials: "HL" },
    { id: 4, name: "Mudo Sam", points: 6980, rank: "4TH", initials: "MS" },
  ];

  const lessonsProgress = [
    { id: 1, name: "Exponents, roots, and logarithms", progress: 55 },
    { id: 2, name: "Geometry and spatial reasoning", progress: 75 },
    { id: 3, name: "Number theory", progress: 70 },
    { id: 4, name: "Functions and equations", progress: 90 },
  ];

  // Performance data for tabs
  const [activeTab, setActiveTab] = useState("points");

  // Get first name
  const firstName = user?.name ? user.name.split(" ")[0] : "Tony";

  return (
    <div className="h-full">
      {/* Greeting section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          Hello, <span className="text-indigo-600">{firstName}</span>{" "}
          <span className="text-amber-400">👋</span>
        </h1>
        <p className="text-gray-600 text-sm">
          Let's learn something new today!
        </p>
      </div>

      {/* Learning cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Skill Assessment */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 flex items-start space-x-4">
            <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/images/skill1.jpg"
                alt="Skill Assessment"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                Skill Assessment
              </h3>
              <p className="text-xs text-gray-500 mb-2.5">
                Quickly evaluate your current knowledge
              </p>
              <button className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition">
                Start now
              </button>
            </div>
          </div>
        </div>

        {/* Today's Review */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 flex items-start space-x-4">
            <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/images/skill2.jpg"
                alt="Today's Review"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                Today's Review
              </h3>
              <p className="text-xs text-gray-500 mb-2.5">
                Flashcards ready via Spaced Repetition
              </p>
              <button className="text-xs bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg font-medium hover:bg-orange-100 transition">
                Review now
              </button>
            </div>
          </div>
        </div>

        {/* Topic Practice */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 flex items-start space-x-4">
            <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/images/skill3.jpg"
                alt="Topic Practice"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                Topic Practice
              </h3>
              <p className="text-xs text-gray-500 mb-2.5">
                Exercises for specific Grade 9 Math topics
              </p>
              <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition">
                Practice now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard and Performance in same row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Leaderboard section */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-medium uppercase text-gray-400">
              LEADERBOARD
            </h2>
            <button className="text-blue-400 hover:text-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          <h3 className="text-lg font-bold mb-6 text-center text-indigo-600">
            Most Points
          </h3>

          {/* First place user */}
          <div className="mb-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={64}
                      height={64}
                      className="object-cover"
                      unoptimized={user.avatar.includes(
                        "googleusercontent.com"
                      )}
                    />
                  ) : (
                    <Image
                      src="/images/student_image.png"
                      alt="Tony Adam"
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="absolute -right-1 -bottom-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Image
                      src="/images/badge.png"
                      alt="First Place"
                      width={20}
                      height={20}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-medium text-indigo-600">
                {user?.name || "Tony Adam"}
              </h4>
              <p className="text-md font-bold text-indigo-600">
                {leaderboardData[0].points.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Other users */}
          <div className="space-y-3">
            {leaderboardData.slice(1).map((leader, index) => (
              <div
                key={leader.id}
                className="flex items-center justify-between text-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold w-7 text-gray-500">
                    {leader.rank}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs text-gray-500">
                      <span className="text-xs">{leader.initials}</span>
                    </div>
                    <span className="text-sm">{leader.name}</span>
                  </div>
                </div>
                <span className="font-semibold text-sm">
                  {leader.points.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance section */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">
            Performance
          </h2>

          <div className="flex space-x-3 mb-6">
            <button
              className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                activeTab === "points"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              onClick={() => setActiveTab("points")}
            >
              Point Progress
            </button>
            <button
              className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                activeTab === "monthly"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              onClick={() => setActiveTab("monthly")}
            >
              Monthly
            </button>
          </div>

          {/* Circular Progress */}
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
              {/* Circular progress background */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <defs>
                  <linearGradient
                    id="progressGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="6"
                  strokeDasharray="283"
                  strokeDashoffset="45"
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="283"
                    to="45"
                    dur="1.5s"
                    begin="0s"
                    fill="freeze"
                    calcMode="spline"
                    keySplines="0.42 0 0.58 1"
                  />
                </circle>
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">8,966</span>
                <span className="text-xs text-gray-500">Your Points</span>
              </div>
            </div>

            {/* Additional info */}
            <div className="mt-4 text-center">
              <span className="text-sm text-green-600 font-medium flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
                21% from last month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* My lessons */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800 mb-5">My lessons</h2>

        <div className="space-y-4">
          {lessonsProgress.map((lesson) => (
            <div key={lesson.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-700">{lesson.name}</span>
                <span className="font-medium text-gray-800">
                  {lesson.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${
                    lesson.name.includes("Geometry")
                      ? "bg-pink-500"
                      : lesson.name.includes("Exponents")
                      ? "bg-blue-500"
                      : lesson.name.includes("Number")
                      ? "bg-indigo-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${lesson.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-right mt-4">
          <button className="text-gray-400 hover:text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
