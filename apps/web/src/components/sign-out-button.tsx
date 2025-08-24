import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { SidebarMenuButton } from "./ui/sidebar";

export function SignOutButton() {
	const navigate = useNavigate();

	const handleSignOut = async () => {
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						navigate("/login", { replace: true });
					},
					onError: (ctx) => {
						console.error("Sign out error:", ctx.error);
						// Still navigate to login even if there's an error
						navigate("/login", { replace: true });
					},
				},
			});
		} catch (error) {
			console.error("Sign out failed:", error);
			// Navigate to login page regardless of error
			navigate("/login", { replace: true });
		}
	};

	return (
		<SidebarMenuButton onClick={handleSignOut} tooltip="Sign out">
			<LogOut className="h-4 w-4" />
			<span>Sign out</span>
		</SidebarMenuButton>
	);
}
