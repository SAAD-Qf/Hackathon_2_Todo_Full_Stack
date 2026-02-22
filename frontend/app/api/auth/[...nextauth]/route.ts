import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }
        const res = await fetch("http://localhost:8000/token", {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        if (!res.ok) {
          return null;
        }

        const user = await res.json();

        if (user) {
          return user;
        } else {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    }
  }
});

export { handler as GET, handler as POST }
