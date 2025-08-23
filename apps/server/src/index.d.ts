import { Hono } from "hono";
type Env = {
	DB: D1Database;
	ASSETS: Fetcher;
	CORS_ORIGIN: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
};
declare const app: Hono<
	{
		Bindings: Env;
	},
	import("hono/types").BlankSchema,
	"/"
>;
export default app;
