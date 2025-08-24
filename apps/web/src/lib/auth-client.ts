import { customSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL =
	import.meta.env.VITE_SERVER_URL?.trim() ||
	(typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

console.log("Auth client baseURL:", baseURL);

export const authClient = createAuthClient({
	baseURL,
	plugins: [customSessionClient()],
	fetchOptions: {
		credentials: "include",
	},
});
