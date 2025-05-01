import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { signOut as nextAuthSignOut } from "next-auth/react";
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  PieChart,
} from "lucide-react";

const SettingsSidebar = ({ isCollapsed /* user */ }) => {
  const router = useRouter();
  const { signOut: supabaseSignOut } = useAuth();

  const handleLogout = async () => {
    try {
      if (supabaseSignOut) {
        await supabaseSignOut();
        console.log("Supabase sign out successful.");
      } else {
        console.warn("Supabase signOut function not available in AuthContext.");
      }

      await nextAuthSignOut({ redirect: false }); // Prevent default redirect, handle manually
      console.log("NextAuth sign out successful.");

      router.push("/auth/login");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
    { label: "Learn", href: "/learn", icon: <GraduationCap /> },
    { label: "Test", href: "/test", icon: <FileText /> },
    { label: "Report", href: "/report", icon: <PieChart /> },
    { label: "Analytics", href: "/analytics", icon: <BarChart3 /> },
  ];

  const settingsItems = [
    { label: "Settings", href: "/settings", icon: <Settings /> },
    {
      label: "Logout",
      onClick: handleLogout,
      icon: <LogOut />,
      className: "text-red-500 hover:bg-red-50 hover:text-red-600", // Adjusted hover color
    },
  ];

  return (
    <aside className="h-full flex flex-col bg-white border-r border-gray-200">
      {" "}
      {/* Optional: add border */}
      <div className="flex-grow p-3 overflow-y-auto">
        {" "}
        {/* Added overflow */}
        <div className="mb-8">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center ${
                    isCollapsed ? "justify-center" : "px-4"
                  } py-2.5 rounded-lg transition-all duration-200 ${
                    // Check if the current path starts with the item's href for active state
                    router.pathname.startsWith(item.href)
                      ? "bg-indigo-50 text-indigo-600 shadow-sm" // Removed redundant font-medium
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  title={isCollapsed ? item.label : ""} // Add tooltip when collapsed
                >
                  <span>
                    {React.cloneElement(item.icon, {
                      className: `w-5 h-5 flex-shrink-0 ${
                        // Added flex-shrink-0
                        router.pathname.startsWith(item.href)
                          ? "stroke-indigo-600" // Use stroke for Lucide icons generally
                          : "stroke-gray-500" // Adjusted non-active color
                      }`,
                      strokeWidth: router.pathname.startsWith(item.href)
                        ? 2.5
                        : 2, // Example: thicker stroke when active
                    })}
                  </span>
                  {!isCollapsed && (
                    <span className="ml-3 font-medium text-sm truncate">
                      {" "}
                      {/* Added truncate */}
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Push settings to the bottom */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <ul className="space-y-2">
            {settingsItems.map((item, index) => (
              <li key={index}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`flex items-center ${
                      isCollapsed ? "justify-center" : "px-4"
                    } py-2.5 rounded-lg transition-all duration-200 ${
                      router.pathname.startsWith(item.href)
                        ? "bg-indigo-50 text-indigo-600 font-medium shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } ${item.className || ""}`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <span>
                      {React.cloneElement(item.icon, {
                        className: `w-5 h-5 flex-shrink-0 ${
                          router.pathname.startsWith(item.href)
                            ? item.className
                              ? "stroke-current"
                              : "stroke-indigo-600" // Handle logout color
                            : item.className
                            ? "stroke-current"
                            : "stroke-gray-500"
                        }`,
                        strokeWidth: router.pathname.startsWith(item.href)
                          ? 2.5
                          : 2,
                      })}
                    </span>
                    {!isCollapsed && (
                      <span
                        className={`ml-3 font-medium text-sm truncate ${
                          item.className ? "text-red-500" : ""
                        }`}
                      >
                        {" "}
                        {/* Handle logout text color */}
                        {item.label}
                      </span>
                    )}
                  </Link>
                ) : (
                  // Logout Button
                  <button
                    onClick={item.onClick}
                    className={`flex items-center ${
                      isCollapsed ? "justify-center" : "px-4"
                    } py-2.5 rounded-lg transition-all duration-200 w-full text-left ${
                      item.className ||
                      "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <span>
                      {React.cloneElement(item.icon, {
                        className: `w-5 h-5 flex-shrink-0 ${
                          item.className ? "stroke-red-500" : "stroke-gray-500"
                        }`,
                      })}
                    </span>
                    {!isCollapsed && (
                      <span
                        className={`ml-3 font-medium text-sm truncate ${
                          item.className ? "text-red-500" : ""
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default SettingsSidebar;
