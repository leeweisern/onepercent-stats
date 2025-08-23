type User = {
	role: string;
	name: string;
	logo: string;
};

type BaseNavItem = {
	title: string;
	badge?: string;
	icon?: React.ElementType;
};

type NavLink = BaseNavItem & {
	url: string;
	items?: never;
};

type NavCollapsible = BaseNavItem & {
	items: (BaseNavItem & { url: string })[];
	url?: never;
};

type NavItem = NavCollapsible | NavLink;

type NavGroup = {
	title: string;
	items: NavItem[];
};

type SidebarData = {
	user: User;
	navGroups: NavGroup[];
};

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink };
