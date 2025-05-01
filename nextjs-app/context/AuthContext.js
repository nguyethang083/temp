import React, { createContext, useState, useEffect, useContext } from "react";
// Import the Supabase client instance created in supabaseClient.js
import { supabase } from "@/lib/supabaseClient"; // Adjust path if needed
// Import NextAuth signin/signout
import { signIn, signOut as nextAuthSignOut } from "next-auth/react"; // Renamed signOut import
import { useRouter } from "next/router";

// Basic check if the imported client is valid
if (!supabase) {
  console.error(
    "AuthContext: Supabase client instance is missing. Check supabaseClient.js and environment variables."
  );
  // Optionally throw an error during build/startup if missing
  // throw new Error("Supabase client failed to initialize.");
}

const AuthContext = createContext(null);

// Simple Loading Component (Customize as needed)
const CenteredSpinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional: slight overlay
    }}
  >
    <svg
      className="animate-spin h-10 w-10 text-indigo-600"
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

export const AuthProvider = ({ children }) => {
  // State for Supabase session and user objects
  const [session, setSession] = useState(null); // Supabase session
  const [user, setUser] = useState(null); // Supabase user
  // Loading state for the initial check of the Supabase session
  const [loadingInitial, setLoadingInitial] = useState(true);
  // Loading state specifically for async auth actions like signout or OAuth bridge
  const [loadingAuthAction, setLoadingAuthAction] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the Supabase client is available
    if (!supabase) {
      console.error("AuthProvider useEffect: Supabase client not available.");
      if (loadingInitial) setLoadingInitial(false); // Stop initial loading if client is missing
      return; // Exit effect if no client
    }

    let isMounted = true; // Flag to prevent state updates on unmounted component

    // 1. Attempt to get the initial Supabase session on mount
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        // Only update state if the component is still mounted
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          // Update loading state only if it hasn't been set to false already
          if (loadingInitial) setLoadingInitial(false);
          console.log(
            "AuthContext: Initial Supabase session checked.",
            initialSession
          );
        }
      })
      .catch((error) => {
        console.error(
          "AuthContext: Error getting initial Supabase session:",
          error
        );
        // Ensure loading stops even if there's an error
        if (isMounted && loadingInitial) setLoadingInitial(false);
      });

    // 2. Set up a listener for Supabase auth state changes (SIGNED_IN, SIGNED_OUT, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return; // Exit if component unmounted

        console.log(`Supabase auth event: ${event}`, currentSession);

        // Always update the local Supabase session/user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // --- Handle OAuth Sign In Bridge to NextAuth ---
        // Check if this is a SIGNED_IN event from an OAuth provider
        const provider = currentSession?.user?.app_metadata?.provider;
        if (
          event === "SIGNED_IN" &&
          currentSession?.access_token &&
          (provider === "google" || provider === "apple")
        ) {
          // Prevent duplicate triggers if already processing
          if (loadingAuthAction) return;

          setLoadingAuthAction(true); // Indicate bridging process started
          console.log(
            `OAuth sign in detected (${provider}), attempting NextAuth bridge...`
          );

          try {
            // Lấy avatar và thông tin người dùng từ OAuth provider
            const user = currentSession.user;
            
            // Nếu là Google và có avatar, cập nhật vào metadata của người dùng
            if (provider === 'google') {
              const avatar_url = user.user_metadata?.avatar_url;
              const full_name = user.user_metadata?.full_name;
              
              if (avatar_url || full_name) {
                // Cập nhật metadata của user để lưu avatar URL
                await supabase.auth.updateUser({
                  data: { 
                    avatar_url: avatar_url || user.user_metadata?.picture,
                    full_name: full_name || user.user_metadata?.name
                  }
                });
              }
            }

            // Call NextAuth's signIn function with the 'credentials' provider,
            // passing the Supabase access token. This triggers the authorize callback
            // in [...nextauth].js to verify the token and create a NextAuth session.
            const nextAuthResponse = await signIn("credentials", {
              accessToken: currentSession.access_token,
              // Redirect is handled by the NextAuth redirect callback in [...nextauth].js
            });

            // Log potential errors from the NextAuth sign-in process
            if (nextAuthResponse?.error) {
              console.error(
                `NextAuth sign-in error after Supabase OAuth (${provider}):`,
                nextAuthResponse.error
              );
              // Consider signing out from Supabase if NextAuth bridge fails
              // await supabase.auth.signOut();
            } else {
              // Log success (redirect is handled elsewhere)
              console.log(`NextAuth signIn call completed for ${provider}.`);
            }
          } catch (err) {
            console.error(
              "Error calling NextAuth signIn during OAuth bridge:",
              err
            );
          } finally {
            // Ensure loading state is reset if component is still mounted
            if (isMounted) setLoadingAuthAction(false);
          }
        }

        // Ensure initial loading is marked as false after the first event
        if (loadingInitial) setLoadingInitial(false);
      }
    );

    // Cleanup function: Unsubscribe the listener when the component unmounts
    return () => {
      isMounted = false; // Set flag to false on unmount
      listener?.subscription?.unsubscribe(); // Unsubscribe the listener
    };
    // Dependencies for the effect hook
  }, [supabase, loadingInitial, loadingAuthAction, router]); // Include supabase instance and loading states

  // --- Context Value Definition ---
  // Define the object that will be provided by the context
  const value = {
    supabase, // Provide the initialized Supabase client
    user, // Provide the Supabase user object (may differ slightly from NextAuth session)
    session, // Provide the Supabase session object (contains access_token etc.)
    loadingInitial, // Provide the initial loading state
    loadingAuthAction, // Provide the auth action loading state
    // Provide Supabase auth methods wrapped for convenience
    signUp: (data) => supabase?.auth?.signUp(data),
    signIn: (data) => supabase?.auth?.signInWithPassword(data), // For password login
    // --- Combined SignOut Function ---
    signOut: async () => {
      console.log("Attempting combined sign out...");
      setLoadingAuthAction(true); // Indicate loading
      try {
        // Sign out from Supabase
        if (supabase) {
          const { error: supabaseError } = await supabase.auth.signOut();
          if (supabaseError)
            console.error("Supabase signOut error:", supabaseError);
          else console.log("Supabase signOut successful.");
        }
        // Sign out from NextAuth (clears the session cookie)
        // Redirect is typically handled by middleware or the calling component
        await nextAuthSignOut({ redirect: false });
        console.log("NextAuth signOut successful.");
        // Clear local state immediately for faster UI update
        setUser(null);
        setSession(null);
      } catch (error) {
        console.error("Error during combined signOut:", error);
      } finally {
        setLoadingAuthAction(false); // Reset loading state
      }
    },
  };

  // --- Render Provider ---
  // Render the context provider, showing a spinner during initial load
  return (
    <AuthContext.Provider value={value}>
      {loadingInitial ? <CenteredSpinner /> : children}
    </AuthContext.Provider>
  );
};

// --- Custom Hook ---
// Custom hook to easily consume the AuthContext in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Throw an error if the hook is used outside of an AuthProvider
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
