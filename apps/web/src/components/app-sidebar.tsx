import { BarChart3, DollarSign, Users } from "lucide-react";
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

	return (
		<Sidebar collapsible="icon" variant={variant} {...props}>
			<SidebarHeader>
				<div className="flex items-center justify-center px-2 py-2 group-data-[collapsible=icon]:px-1">
					<img
						src="/One Percent Fitness Favicon.svg"
						alt="One Percent Stats"
						className="h-8 w-auto group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6"
					/>
				</div>
			</SidebarHeader>{" "}
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.url}>
									<SidebarMenuButton
										asChild
										isActive={location.pathname === item.url}
										tooltip={item.title}
									>
										<Link to={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
