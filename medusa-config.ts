import { loadEnv, defineConfig } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000",
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },

  modules: [
    {
      resolve: "./src/modules/restaurant", 
    },
    {
      resolve: "./src/modules/delivery", 
    },
    // ✅ This is the necessary addition.
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
            options: {
              strict: false,
              strategies: [
              {
                resolve: "./src/modules/auth/strategies/emailpass.ts",
              },
              ],
            },
          },
        ],
        strategies: [],
      },
    },
  ],
});