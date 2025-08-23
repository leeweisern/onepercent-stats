import { customSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

console.log("Auth client baseURL:", baseURL);

export const authClient = createAuthClient({
	baseURL,
	plugins: [customSessionClient()],
});
