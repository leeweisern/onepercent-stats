import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

export function LogoHeader() {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" className="cursor-default">
					<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
						<img
							src="/One Percent Fitness Favicon.svg"
							alt="One Percent Fitness"
							className="size-6"
						/>
					</div>
					<div className="grid flex-1 text-start text-sm leading-tight">
						<span className="truncate font-semibold">OnePercent Stats</span>
						<span className="truncate text-xs">Analytics Dashboard</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
