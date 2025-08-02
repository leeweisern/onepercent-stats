import { Navigate } from "react-router";

export default function Dashboard() {
	// Redirect to leads page as the default
	return <Navigate to="/leads" replace />;
}
