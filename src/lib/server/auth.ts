import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import PostgresAdapter from "@auth/pg-adapter";
import { getPool, isDatabaseConfigured, query } from "./db";
import { smtpConnectionUrl } from "./smtp";
import { emailInput } from "./validation";

export type Role = "CLIENT" | "CONSULTANT" | "ADMIN";
export type CurrentUser = { id: string; name: string | null; email: string; role: Role };
export function isAuthConfigured() {
  return isDatabaseConfigured() && Boolean(process.env.AUTH_SECRET && process.env.EMAIL_SERVER && process.env.EMAIL_FROM && process.env.AUTH_URL);
}
function configuredAdmin(email: string) {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: isDatabaseConfigured() ? PostgresAdapter(getPool()) : undefined,
  providers: isAuthConfigured() ? [Nodemailer({
    server: smtpConnectionUrl(),
    from: process.env.EMAIL_FROM,
    maxAge: 15 * 60,
    normalizeIdentifier(identifier) { return emailInput.parse(identifier); },
  })] : [],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "database", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/sign-in", verifyRequest: "/sign-in?sent=1", error: "/sign-in" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
    async redirect({ url, baseUrl }) {
      const origin = process.env.AUTH_URL ? new URL(process.env.AUTH_URL).origin : baseUrl;
      if (url.startsWith("/") && !url.startsWith("//")) return `${origin}${url}`;
      try { if (new URL(url).origin === origin) return url; } catch { /* use safe default */ }
      return `${origin}/my-questions`;
    },
  },
  logger: {
    error() { console.error("Authentication request failed. Check provider and database configuration."); },
    warn(code) { console.warn("Authentication warning:", code); },
  },
});
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isAuthConfigured()) return null;
  const session = await auth();
  if (!session?.user?.id) return null;
  const result = await query<{ id: string; name: string | null; email: string; role: Role; emailVerified: Date | null }>(
    'SELECT id, name, email, role, "emailVerified" FROM users WHERE id = $1', [session.user.id],
  );
  const user = result.rows[0];
  if (!user?.emailVerified) return null;
  return { id: user.id, name: user.name, email: user.email, role: configuredAdmin(user.email) ? "ADMIN" : user.role };
}
export function isStaff(user: CurrentUser | null): boolean {
  return Boolean(user && (user.role === "CONSULTANT" || user.role === "ADMIN"));
}
