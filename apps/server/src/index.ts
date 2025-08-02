// import { env } from "cloudflare:workers";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: "*",
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

import analyticsRouter from "./routers/analytics";

app.route("/api/analytics", analyticsRouter);

// Serve static assets for all non-API routes
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
