import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Layout, Search, Settings, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const DashboardNavbar = ({
  toggleSidebar,
  isSidebarOpen,
  setIsSidebarOpen,
  isCollapsed,
}) => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  const handleLogout = async () => {
    // Clear local storage items if needed
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    try {
      await signOut();

      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    if (router.pathname === "/test") {
      setIsSidebarOpen(false);
    }
  }, [router.pathname, setIsSidebarOpen]);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="relative flex items-center h-16 px-4">
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-2 transition-all duration-300 z-50 ${
            isSidebarOpen ? "left-64 md:left-52" : "left-20"
          }`}
        >
          <Layout className="h-6 w-6" />
        </button>

        {/* Left spacing to account for sidebar toggle */}
        <div className="w-24 flex-shrink-0"></div>

        {/* Search Button (Mobile Only) */}
        <button 
          className="md:hidden ml-auto mr-4 text-gray-500 hover:text-gray-700"
          onClick={() => setShowSearchMobile(!showSearchMobile)}
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:block relative flex-1 max-w-lg mx-auto px-2">
          <input
            type="text"
            placeholder="Search topics, lessons..."
            className="w-full py-2 px-4 pl-10 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="h-5 w-5" />
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center space-x-5">
          {/* Settings */}
          <button className="text-gray-500 hover:text-gray-700">
            <Settings className="h-6 w-6" />
          </button>
          {/* Notifications */}
          <button className="text-gray-500 hover:text-gray-700">
            <Bell className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (expandable) */}
      {showSearchMobile && (
        <div className="md:hidden px-4 pb-4 bg-white">
          <div className="relative">
            <input
              type="text"
              placeholder="Search topics, lessons..."
              className="w-full py-2 px-4 pl-10 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar;
