// import { env } from "cloudflare:workers";
import { auth } from "./lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

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

// Serve static assets for non-API routes
app.get("*", async (c) => {
	// For non-API routes, serve static assets
	if (!c.req.url.includes("/api/")) {
		return c.env.ASSETS.fetch(c.req.raw);
	}
	return c.text("Not Found", 404);
});

export default app;
