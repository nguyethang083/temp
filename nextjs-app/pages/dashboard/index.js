import { useSession } from "next-auth/react";
import DashboardContent from "@/components/DashboardContent";
import ProfileSetting from "@/components/ProfileSetting";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <svg
      className="animate-spin -ml-1 mr-3 h-10 w-10 text-indigo-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "authenticated" && session?.user) {
    const user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      // roles: session.user.roles || [],
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardContent user={user} />
        </div>
        <div className="lg:col-span-1">
          <ProfileSetting user={user} />
        </div>
      </div>
    );
  }

  return null;
}
