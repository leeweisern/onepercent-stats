import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const [hasChecked, setHasChecked] = useState(false);
	const [timeoutReached, setTimeoutReached] = useState(false);
	const { data: session, isPending, error } = authClient.useSession();

	useEffect(() => {
		if (!isPending) {
			setHasChecked(true);
		}
	}, [isPending]);

	// Failsafe timeout – only while still loading
	useEffect(() => {
		if (isPending) {
			const id = setTimeout(() => {
				console.log("Auth timeout reached, redirecting to login");
				setTimeoutReached(true);
			}, 5000);
			return () => clearTimeout(id);
		}
	}, [isPending]);

	// Debug logging
	useEffect(() => {
		console.log("ProtectedRoute state:", {
			isPending,
			hasChecked,
			timeoutReached,
			hasSession: !!session,
			error: error?.message,
		});
	}, [isPending, hasChecked, timeoutReached, session, error]);

	// Show loading while checking session (but only for a reasonable time)
	if ((isPending || !hasChecked) && !timeoutReached) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}

	// If there's an error, timeout reached, or no session, redirect to login
	if (error || timeoutReached || (!session && hasChecked)) {
		console.log("Redirecting to login:", {
			error: error?.message,
			timeoutReached,
			hasSession: !!session,
			hasChecked,
		});
		return <Navigate to="/login" replace />;
	}

	// Render protected content
	return <>{children}</>;
}
