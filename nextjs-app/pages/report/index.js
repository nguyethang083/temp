import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Search, Filter, ChevronDown } from "lucide-react";

// Import các components
import AttendanceChart from "@/components/report/AttendanceChart";
import Statistics from "@/components/report/Statistics";
import AssignmentTable from "@/components/report/AssignmentTable";

export default function Report() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    let userData = null;

    if (loggedInUser) {
      try {
        userData = JSON.parse(loggedInUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }

    if (status === "authenticated" && session?.user) {
      const sessionUser = {
        userId: session.user.userId || session.user.id || session.user.email,
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.avatar || session.user.image,
        roles: session.user.roles || ["Student"],
      };

      localStorage.setItem("user", JSON.stringify(sessionUser));
      setUser(sessionUser);
    }

    if (!userData && status !== "loading" && status !== "authenticated") {
      router.push("/login");
    }
  }, [router, session, status]);

  if (status === "loading" || (!user && status === "authenticated")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user && status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Report Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Report</h1>
          <button className="flex items-center gap-1 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border shadow-sm hover:bg-gray-50">
            Share
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
            </svg>
          </button>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Left Section - 4/7 width */}
          <div className="lg:col-span-4 space-y-6">
            <AttendanceChart />
          </div>

          {/* Right Section - 3/7 width */}
          <div className="lg:col-span-3 space-y-6">
            <Statistics />
          </div>
        </div>

        {/* Assignments and Exams Section */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            {/* Assignment and Search Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <h2 className="text-lg font-semibold">Assignment and Exams</h2>

              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-grow md:flex-grow-0">
                  <input
                    type="text"
                    placeholder="Search here"
                    className="pl-8 pr-4 py-1.5 rounded-lg border border-gray-200 w-full md:w-60 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                <button className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg text-gray-700 hover:bg-gray-50">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>

                <div className="relative">
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg text-gray-700 hover:bg-gray-50">
                    <span>Sort by: Latest</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Assignments Table */}
            <AssignmentTable />
          </div>
        </div>
      </div>
    </div>
  );
}
