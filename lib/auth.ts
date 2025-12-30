import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { v7 as uuidv7 } from "uuid";
import db from "@/db/drizzle";
import { schema } from "@/db/schema";
import { AUTH_CONFIG } from "@/lib/config";

// If database is not available or auth bypass is enabled, create a mock auth object
const createMockAuth = () => {
  return {
    api: {
      getSession: async () => {
        // Return a mock session for local-only mode
        return {
          user: {
            id: 'local-user',
            name: 'Local User',
            email: 'local@localhost',
          },
          session: {
            id: 'local-session',
            userId: 'local-user',
          },
        };
      },
    },
    handler: async (req: Request) => new Response(JSON.stringify({ message: 'Auth disabled' }), { status: 200 }),
  };
};

// Check if we should use mock auth (no database or bypass enabled)
const shouldUseMockAuth = !db || AUTH_CONFIG.BYPASS_AUTH;

// Create real auth only if database is available
const createRealAuth = () => {
  if (!db) {
    throw new Error('Database required for real auth');
  }
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    advanced: {
      database: {
        generateId: () => uuidv7(),
      },
      telemetry: false,
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [nextCookies(), admin()],
  });
};

export const auth = shouldUseMockAuth ? createMockAuth() : createRealAuth();