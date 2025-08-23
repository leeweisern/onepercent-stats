import { BarChart3, DollarSign, Settings, Users } from "lucide-react";
import { Link, useLocation } from "react-router";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

interface AppSidebarProps {
	variant?: "sidebar" | "floating" | "inset";
}

const menuItems = [
	{
		title: "Leads",
		icon: Users,
		url: "/leads",
	},
	{
		title: "Analytics",
		icon: BarChart3,
		url: "/analytics",
	},
	{
		title: "Advertising Costs",
		icon: DollarSign,
		url: "/advertising",
	},
];

export function AppSidebar({
	variant = "sidebar",
	...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
	const location = useLocation();
	const { data: session } = authClient.useSession();

	return (
		<Sidebar collapsible="icon" variant={variant} {...props}>
			<SidebarHeader>
				<div className="flex h-16 items-center px-6 border-b border-sidebar-border group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
					<img src="/One Percent Fitness Favicon.svg" alt="One Percent Stats" className="h-8 w-8" />
				</div>
			</SidebarHeader>
			<SidebarContent className="px-3 py-4">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu className="space-y-1">
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.url}>
									<SidebarMenuButton
										asChild
										isActive={location.pathname === item.url}
										className="sidebar-menu-button"
									>
										<Link
											to={item.url}
											data-active={location.pathname === item.url}
											className="sidebar-menu-button"
										>
											<item.icon className="h-5 w-5" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
							{session?.user && (
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										isActive={location.pathname === "/admin"}
										className="sidebar-menu-button"
									>
										<Link
											to="/admin"
											data-active={location.pathname === "/admin"}
											className="sidebar-menu-button"
										>
											<Settings className="h-5 w-5" />
											<span>Admin</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
