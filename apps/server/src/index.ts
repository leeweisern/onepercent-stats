// import { env } from "cloudflare:workers";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createAuth } from "./lib/auth";

type Env = {
	DB: D1Database;
	ASSETS: Fetcher;
	CORS_ORIGIN: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: (origin, c) => {
			// Parse allowed origins from environment
			const allowedOrigins = (c.env.CORS_ORIGIN || "")
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);

			// Get the current request's origin (self-origin)
			const selfOrigin = new URL(c.req.url).origin;

			// If no Origin header, don't set CORS headers (not a CORS request)
			if (!origin) {
				return null;
			}

			// Always allow same-origin requests explicitly
			if (origin === selfOrigin) {
				return origin;
			}

			// Check if origin is in allowlist
			if (allowedOrigins.includes(origin)) {
				return origin;
			}

			// Reject all other origins
			return null;
		},
		allowMethods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
		exposeHeaders: ["Content-Type", "Set-Cookie"],
		credentials: true,
		maxAge: 86400, // Cache preflight for 24 hours
	}),
);

// Explicit OPTIONS handler for all API routes (handled by CORS middleware)
app.options("/api/*", (c) => {
	// CORS middleware already sets headers, just return 204
	return c.text(null, 204);
});

app.on(["POST", "GET"], "/api/auth/**", async (c) => {
	try {
		const auth = createAuth(c.env);
		console.log("Auth instance created successfully");

		const response = await auth.handler(c.req.raw);
		console.log("Auth handler completed");

		return response;
	} catch (error) {
		console.error("Auth error:", error);
		console.error("Error stack:", error.stack);
		return c.json(
			{
				error: "Authentication error",
				details: error.message,
				stack: error.stack?.split("\n").slice(0, 5),
			},
			500,
		);
	}
});

import adminRouter from "./routers/admin";
import analyticsRouter from "./routers/analytics";

app.route("/api/analytics", analyticsRouter);
app.route("/api/admin", adminRouter);

// Serve static assets for all non-API routes
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
