import { Navigate } from "react-router";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "onepercent-stats" },
		{ name: "description", content: "onepercent-stats is a web application" },
	];
}

export default function Index() {
	return <Navigate to="/dashboard" replace />;
}
