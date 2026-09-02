import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../../lib/prisma";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Magpie Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "bigbossMat" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Check for the hardcoded Admin username/password (for initial setup)
        // or check the database for the user 'bigbossMat'
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials?.username },
              { name: credentials?.username } // Match 'bigbossMat' accurately
            ]
          }
        });

        if (user && user.password === credentials?.password) {
          // Verify role is strictly ADMIN
          if (user.role !== 'ADMIN') {
            throw new Error("Accès refusé. Seul l'administrateur a accès au portail.");
          }
          return user;
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecretmagpiekey",
});

export { handler as GET, handler as POST };
