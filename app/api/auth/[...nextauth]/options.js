import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import pool from "@/app/utils/connection";
import { signOut } from "next-auth/react";

export const options = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email", // Requests access to GitHub profile and email
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile", // Ensures email and profile data are accessible
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Check if the user already exists in the database
        const { rows } = await pool.query(
          `SELECT * FROM users WHERE email = $1`,
          [user.email]
        );

        // If user doesn't exist, insert them into the database with provider details
        if (rows.length === 0) {
          await pool.query(
            `INSERT INTO users (email, name, provider, provider_id, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              user.email,
              user.name,
              account.provider,
              account.providerAccountId,
              new Date(),
            ]
          );
        }
        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
};
