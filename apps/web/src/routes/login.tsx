import { useEffect } from "react";
import { useNavigate } from "react-router";
import Loader from "@/components/loader";
import SignInForm from "@/components/sign-in-form";
import { authClient } from "@/lib/auth-client";

export default function Login() {
	const navigate = useNavigate();
	const { data: session, isLoading, error } = authClient.useSession();

	useEffect(() => {
		console.log("Login component state:", {
			isLoading,
			hasSession: !!session,
			error: error?.message,
		});

		// Only redirect if we have a confirmed session and loading is complete
		if (!isLoading && session?.user) {
			console.log("User is authenticated, redirecting to leads");
			navigate("/leads", { replace: true });
		}
	}, [session, isLoading, navigate, error]);

	// Add timeout for login page loading as well
	useEffect(() => {
		const timeout = setTimeout(() => {
			console.log("Login page timeout reached");
		}, 3000);

		return () => clearTimeout(timeout);
	}, []);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}

	if (session) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}

	return <SignInForm />;
}
