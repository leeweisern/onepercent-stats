import { BarChart3, Users, DollarSign } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
	variant?: "sidebar" | "floating" | "inset";
}

const menuItems = [
	{
		title: "Leads",
		icon: Users,
		value: "leads",
	},
	{
		title: "Analytics",
		icon: BarChart3,
		value: "analytics",
	},
	{
		title: "Advertising Costs",
		icon: DollarSign,
		value: "advertising",
	},
];

export function AppSidebar({
	activeTab,
	onTabChange,
	variant = "sidebar",
	...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar variant={variant} {...props}>
			<SidebarHeader>
				<div className="px-2 py-2">
					<h2 className="text-lg font-semibold text-sidebar-foreground">
						One Percent Stats
					</h2>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.value}>
									<SidebarMenuButton
										isActive={activeTab === item.value}
										onClick={() => onTabChange(item.value)}
									>
										<item.icon />
										<span>{item.title}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
