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
			const allowedOrigin = c.env.CORS_ORIGIN;
			if (!origin || origin === allowedOrigin) {
				return allowedOrigin;
			}
			return null;
		},
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET", "OPTIONS"], "/api/auth/**", async (c) => {
	try {
		const auth = createAuth(c.env);
		const response = await auth.handler(c.req.raw);
		return response;
	} catch (error) {
		console.error("Auth error:", error);
		return c.json({ error: "Authentication error", details: error.message }, 500);
	}
});

import adminRouter from "./routers/admin";
import analyticsRouter from "./routers/analytics";

app.route("/api/analytics", analyticsRouter);
app.route("/api/admin", adminRouter);

// Serve static assets for all non-API routes
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
