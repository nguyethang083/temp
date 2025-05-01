import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const AttendanceChart = () => {
  const [year, setYear] = useState(2023);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Data cho biểu đồ - đủ 12 tháng
  const studyData = [
    { month: "Jan", studyPercentage: 85, testPercentage: 15 },
    { month: "Feb", studyPercentage: 75, testPercentage: 25 },
    { month: "Mar", studyPercentage: 95, testPercentage: 5 },
    { month: "Apr", studyPercentage: 70, testPercentage: 30 },
    { month: "May", studyPercentage: 65, testPercentage: 35 },
    { month: "Jun", studyPercentage: 80, testPercentage: 20 },
    { month: "Jul", studyPercentage: 90, testPercentage: 10 },
    { month: "Aug", studyPercentage: 60, testPercentage: 40 },
    { month: "Sep", studyPercentage: 78, testPercentage: 22 },
    { month: "Oct", studyPercentage: 83, testPercentage: 17 },
    { month: "Nov", studyPercentage: 88, testPercentage: 12 },
    { month: "Dec", studyPercentage: 72, testPercentage: 28 },
  ];

  // Tổng chiều cao của các cột
  const maxBarHeight = 200;

  // Các năm có thể chọn
  const availableYears = [2021, 2022, 2023, 2024];

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Attendance</h2>
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center text-sm bg-white px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            onClick={() => setShowYearDropdown(!showYearDropdown)}
          >
            <span>{year}</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>

          {showYearDropdown && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-md z-10 py-1 w-24">
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50"
                  onClick={() => {
                    setYear(yr);
                    setShowYearDropdown(false);
                  }}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
          <span className="text-xs text-gray-500">Study</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span className="text-xs text-gray-500">Online Test</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex justify-between items-end h-64 mt-8 overflow-x-auto pb-2">
        {studyData.map((data, index) => (
          <div key={index} className="flex flex-col items-center min-w-[40px]">
            {/* Bar */}
            <div className="w-8 relative flex flex-col items-center">
              {/* Test section */}
              <div
                className="w-full bg-yellow-400 rounded-t-sm"
                style={{
                  height: `${(data.testPercentage / 100) * maxBarHeight}px`,
                }}
              ></div>

              {/* Study section */}
              <div
                className="w-full bg-cyan-400"
                style={{
                  height: `${(data.studyPercentage / 100) * maxBarHeight}px`,
                }}
              ></div>
            </div>

            {/* Month */}
            <div className="text-xs text-gray-500 mt-2">{data.month}</div>
          </div>
        ))}
      </div>

      {/* Time metrics */}
      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
        <div>
          <p className="text-gray-500 text-xs mb-1">Average In-Time</p>
          <p className="font-bold text-lg">11.56 AM</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Average Out-Time</p>
          <p className="font-bold text-lg">5.15 PM</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;
