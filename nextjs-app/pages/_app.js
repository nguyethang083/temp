import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { AuthProvider } from "@/context/AuthContext";

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const router = useRouter();

  const dashboardRoutes = ["/test", "/report", "/dashboard"];

  const isDashboardRoute = dashboardRoutes.some((route) =>
    router.pathname.startsWith(route)
  );

  const isSidebarCollapsed = router.pathname.startsWith("/test");

  return (
    <SessionProvider session={session}>
      <AuthProvider>
        {isDashboardRoute ? (
          <DashboardLayout isCollapsed={isSidebarCollapsed}>
            <Component {...pageProps} />
          </DashboardLayout>
        ) : (
          <Component {...pageProps} />
        )}
      </AuthProvider>
    </SessionProvider>
  );
}
