import {
	BarChart3,
	LayoutDashboard,
	Settings,
	Shield,
	TrendingUp,
	UserPlus,
	Users,
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
	user: {
		role: "Admin User",
		name: "admin@onepercent.com",
		logo: "/One Percent Fitness Favicon.svg",
	},
	teams: [
		{
			name: "OnePercent Stats",
			logo: TrendingUp,
			plan: "Analytics Dashboard",
		},
	],
	navGroups: [
		{
			title: "Analytics",
			items: [
				{
					title: "Dashboard",
					url: "/",
					icon: LayoutDashboard,
				},
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
					title: "Add New Lead",
					url: "/new",
					icon: UserPlus,
				},
				{
					title: "Admin",
					url: "/admin",
					icon: Shield,
				},
			],
		},
		{
			title: "Settings",
			items: [
				{
					title: "Login",
					url: "/login",
					icon: Settings,
				},
			],
		},
	],
};
