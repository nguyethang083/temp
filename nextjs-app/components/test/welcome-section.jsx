"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function WelcomeSection() {
  const [roomName, setRoomName] = useState("Test Room");

  return (
    <div className="bg-blue-50 rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0 md:mr-6">
          <h2 className="text-3xl font-bold mb-2">
            Welcome to <span className="text-blue-500">{roomName}</span>!
          </h2>
          <p className="text-gray-600 mb-2">
            The{" "}
            <Link href="#" className="text-blue-500 hover:underline">
              Test Room
            </Link>{" "}
            shows what you know and what you're ready to learn next.
          </p>
          <p className="text-gray-600 mb-4">
            Visit the Analysis often to see how your stats change and to get new
            recommendations after finishing the tests!
          </p>

          <div className="bg-white rounded-lg p-4 shadow-sm inline-block">
            <div className="flex items-center mb-2">
              <svg
                className="w-4 h-4 text-blue-500 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">Level:</span>
              <span className="text-sm ml-1">Novice</span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-blue-500 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">Progress:</span>
              <span className="text-sm ml-1">20% completed</span>
            </div>
          </div>
        </div>

        <div className="relative w-full md:w-1/3 h-48 md:h-64">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Math_Elearning-lXtT46HwN4yrEEUJLnF8HZTWUh6sxB.png"
            alt="E-learning illustration"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
