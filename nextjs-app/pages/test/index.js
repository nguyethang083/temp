"use client";

import { useState } from "react";
import WelcomeSection from "@/components/test/welcome-section";
import PerformanceSection from "@/components/test/performance-section";

export default function Test() {
  const [userData, setUserData] = useState({
    name: "David",
    level: "Novice",
    progress: 20,
    mathLevel: 45,
  });

  return (
    <div className="flex-grow p-6">
      <WelcomeSection userName={userData.name} />
      <PerformanceSection userData={userData} />
    </div>
  );
}
