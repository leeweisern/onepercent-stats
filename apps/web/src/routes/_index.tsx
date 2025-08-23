import { Navigate } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";
import type { Route } from "./+types/_index";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "onepercent-stats" },
		{ name: "description", content: "onepercent-stats is a web application" },
	];
}

export default function Index() {
	return (
		<ProtectedRoute>
			<Navigate to="/leads" replace />
		</ProtectedRoute>
	);
}
