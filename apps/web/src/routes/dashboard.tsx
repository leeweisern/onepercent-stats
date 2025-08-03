import { Navigate } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";

export default function Dashboard() {
	return (
		<ProtectedRoute>
			<Navigate to="/leads" replace />
		</ProtectedRoute>
	);
}
