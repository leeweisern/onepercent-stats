import { BarChart3, Shield, TrendingUp, Users } from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
	user: {
		role: "Admin User",
		name: "admin@onepercent.com",
		logo: "/One Percent Fitness Favicon.svg",
	},
	navGroups: [
		{
			title: "Analytics",
			items: [
				{
					title: "Analytics",
					url: "/analytics",
					icon: BarChart3,
				},
				{
					title: "Leads",
					url: "/leads",
					icon: Users,
				},
				{
					title: "Advertising",
					url: "/advertising",
					icon: TrendingUp,
				},
			],
		},
		{
			title: "Management",
			items: [
				{
					title: "Admin",
					url: "/admin",
					icon: Shield,
				},
			],
		},
	],
};
