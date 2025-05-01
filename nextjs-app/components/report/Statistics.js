import { User, FileText, Clock } from "lucide-react";

const CircularProgress = ({ percentage, color }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-52 h-52">
      {/* Background Circle */}
      <svg className="w-full h-full" viewBox="0 0 190 190">
        <circle
          cx="95"
          cy="95"
          r={radius}
          fill="white"
          stroke="#F0F0F0"
          strokeWidth="16"
        />
        <circle
          cx="95"
          cy="95"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 95 95)"
          strokeLinecap="round"
        />
      </svg>

      {/* Percentage Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-bold text-emerald-500">
          {percentage}%
        </span>
        <span className="text-sm text-gray-500 mt-1">Grades Completed</span>
      </div>
    </div>
  );
};

const StatItem = ({ icon, title, value }) => {
  return (
    <div className="flex items-center">
      <div className="mr-3">{icon}</div>
      <div>
        <p className="text-gray-500 text-xs">{title}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
};

const Statistics = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Statistics</h2>
        <p className="text-xs text-gray-500">Januari - June 2021</p>
      </div>

      {/* Main Content Row - Stats side by side with Circle */}
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* Left side - Stats Items with increased spacing */}
        <div className="flex flex-col justify-between md:py-8 space-y-10">
          <StatItem
            icon={
              <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            }
            title="Average score"
            value="5.6"
          />

          <StatItem
            icon={
              <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
            }
            title="Test"
            value="5 times/day"
          />

          <StatItem
            icon={
              <div className="bg-orange-400 rounded-full w-10 h-10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
            }
            title="Screen time"
            value="30 minutes"
          />
        </div>

        {/* Right side - Circle Chart - centered and larger */}
        <div className="flex-1 flex items-center justify-center py-2">
          <CircularProgress percentage={75} color="#4ADE80" />
        </div>
      </div>

      {/* Question Pace - keeping at bottom */}
      <div className="mt-auto bg-gray-50 p-4 rounded-lg">
        <p className="text-xs text-gray-500 mb-2">
          Average Question Pace: 0:00
        </p>

        <div className="h-3 bg-white rounded-full overflow-hidden flex">
          <div className="bg-red-400 h-full w-1/4 rounded-l-full"></div>
          <div className="bg-yellow-300 h-full w-1/2 relative">
            <div className="absolute left-1/2 top-0 h-full w-1 bg-black transform -translate-x-1/2"></div>
          </div>
          <div className="bg-green-400 h-full w-1/4 rounded-r-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
