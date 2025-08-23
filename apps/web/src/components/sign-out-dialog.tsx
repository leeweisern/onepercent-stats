import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

export function SignOutDialog() {
	const handleSignOut = () => {
		// TODO: Implement sign out functionality
		console.log("Sign out clicked");
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="justify-start gap-2 px-3">
					<LogOut className="h-4 w-4" />
					Sign out
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Sign out</DialogTitle>
					<DialogDescription>Are you sure you want to sign out of your account?</DialogDescription>
				</DialogHeader>
				<div className="flex justify-end gap-3">
					<Button variant="outline">Cancel</Button>
					<Button onClick={handleSignOut}>Sign out</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
