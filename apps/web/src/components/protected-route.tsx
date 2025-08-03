import { Navigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const [hasChecked, setHasChecked] = useState(false);
	const [timeoutReached, setTimeoutReached] = useState(false);
	const {
		data: session,
		isLoading,
		error,
	} = authClient.useSession({
		refreshInterval: 300_000, // 5 minutes
	});

	useEffect(() => {
		if (!isLoading) {
			setHasChecked(true);
		}
	}, [isLoading]);

	// Set a timeout to prevent infinite loading
	useEffect(() => {
		const timeout = setTimeout(() => {
			console.log("Auth timeout reached, redirecting to login");
			setTimeoutReached(true);
		}, 5000); // 5 second timeout

		return () => clearTimeout(timeout);
	}, []);

	// Debug logging
	useEffect(() => {
		console.log("ProtectedRoute state:", {
			isLoading,
			hasChecked,
			timeoutReached,
			hasSession: !!session,
			error: error?.message,
		});
	}, [isLoading, hasChecked, timeoutReached, session, error]);

	// Show loading while checking session (but only for a reasonable time)
	if ((isLoading || !hasChecked) && !timeoutReached) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}

	// If there's an error, timeout reached, or no session, redirect to login
	if (error || timeoutReached || !session) {
		console.log("Redirecting to login:", {
			error: error?.message,
			timeoutReached,
			hasSession: !!session,
		});
		return <Navigate to="/login" replace />;
	}

	// Render protected content
	return <>{children}</>;
}
