import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function SignOutButton() {
	const navigate = useNavigate();

	const handleSignOut = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate("/login");
				},
			},
		});
	};

	return (
		<Button variant="ghost" onClick={handleSignOut} className="gap-2">
			<LogOut className="h-4 w-4" />
			Sign out
		</Button>
	);
}
