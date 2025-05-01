import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "!!! Supabase environment variables (URL, Anon Key) are missing. Auth will fail."
  );
}

const supabaseAdmin = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Supabase",
      credentials: {
        accessToken: { label: "Supabase Access Token", type: "text" },
      },
      async authorize(credentials, req) {
        if (!supabaseAdmin) {
          console.error("Supabase client not initialized in authorize.");
          return null;
        }
        if (!credentials?.accessToken) {
          console.error("No access token provided in credentials.");
          return null;
        }
        try {
          const {
            data: { user },
            error,
          } = await supabaseAdmin.auth.getUser(credentials.accessToken);
          if (error) {
            console.error("Supabase token verification error:", error.message);
            return null;
          }
          if (user) {
            const userName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email;
            const userImage =
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              null;
            return {
              id: user.id,
              email: user.email,
              name: userName,
              image: userImage,
            };
          }
          return null;
        } catch (e) {
          console.error("Error in Supabase authorize callback:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
      } else {
        console.error("Session callback - No token or user present.");
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`;
        return redirectUrl;
      }

      const parsedUrl = new URL(url);
      if (parsedUrl.origin === baseUrl) {
        if (parsedUrl.pathname === "/" || parsedUrl.pathname === "") {
          const dashboardUrl = `${baseUrl}/dashboard`;
          return dashboardUrl;
        }
        return url;
      }

      const defaultRedirectUrl = `${baseUrl}/dashboard`;
      return defaultRedirectUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-super-secret-key",
  // debug: process.env.NODE_ENV === 'development',
});
