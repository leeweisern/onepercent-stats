import { authClient } from "../../lib/auth-client";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../ui/sidebar";

export function LogoHeader() {
	const { data: session } = authClient.useSession();

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" className="cursor-default">
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg">
								<img
									src="/One Percent Fitness Favicon.svg"
									alt="One Percent Fitness"
									className="size-6"
								/>
							</div>
							<div className="grid flex-1 text-start text-sm leading-tight">
								{session?.user && (
									<>
										<span className="truncate text-xs text-sidebar-foreground/70 capitalize">
											{session.user.role || "User"}
										</span>
										<span className="truncate font-semibold">{session.user.name}</span>
									</>
								)}
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
