import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

type NavUserProps = {
	user: {
		role: string;
		name: string;
		logo: string;
	};
};

export function NavUser({ user }: NavUserProps) {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg">
					<Avatar className="h-8 w-8 rounded-lg">
						<AvatarImage src={user.logo} alt={user.name} />
						<AvatarFallback className="rounded-lg">SN</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 text-start text-sm leading-tight">
						<span className="truncate font-semibold">{user.name}</span>
						<span className="truncate text-xs">{user.role}</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
