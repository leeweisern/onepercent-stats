import { LogOut, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

type NavUserProps = {
	user: {
		role: string;
		name: string;
		logo: string;
	};
};

export function NavUser({ user }: NavUserProps) {
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
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.logo} alt={user.name} />
								<AvatarFallback className="rounded-lg">SN</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-start text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
								<span className="truncate text-xs">{user.role}</span>
							</div>
							<MoreHorizontal className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side="bottom"
						align="end"
						sideOffset={4}
					>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSignOut} className="gap-2 text-red-600">
							<LogOut className="h-4 w-4" />
							Sign out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
