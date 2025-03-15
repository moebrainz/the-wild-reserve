import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createGuest, getGuest } from "./data-service";

// const auth = NextAuth();
// const google = Google();

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      // console.log("auth", auth);

      return auth?.user ? true : false;
    },
    async signIn({ user, account, profile }) {
      // console.log("user from sigup", user);
      try {
        const existingGuest = await getGuest(user.email);
        // console.log("existing user", existingGuest);

        if (!existingGuest) {
          const newGuest = await createGuest({
            email: user.email,
            fullName: user.name,
          });
          // console.log("Created new guest:", newGuest);
        }

        return true;
      } catch (error) {
        console.error("Sign-in error:", error);
        // Throw an error message to display to the user
        throw new Error("Sign-in failed. Please try again or contact support.");

        return false;
      }
    },
    async session({ session, user }) {
      // console.log("session:", session);

      const guest = await getGuest(session.user.email);
      session.user.guestId = guest.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
