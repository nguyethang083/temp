"use client";

import { useState, useEffect } from "react";

export default function TestResultSummary({
  score,
  correctAnswers,
  totalQuestions,
  timeTaken,
}) {
  const [mounted, setMounted] = useState(false);

  // This ensures the circle animation only happens client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate the circle's stroke-dasharray and stroke-dashoffset
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full" viewBox="0 0 180 180">
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#f1f1f1"
            strokeWidth="16"
          />

          {/* Progress circle */}
          {mounted && (
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="#ffc107"
              strokeWidth="16"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 90 90)"
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          )}

          {/* Center text */}
          <text
            x="90"
            y="85"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-medium"
            fill="#6b7280"
          >
            Completed
          </text>
          <text
            x="90"
            y="110"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-3xl font-bold"
            fill="#111827"
          >
            {score}%
          </text>
        </svg>
      </div>
    </div>
  );
}
