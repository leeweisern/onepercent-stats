import { LayoutProvider } from "../../context/layout-provider";
import { authClient } from "../../lib/auth-client";
import { getCookie } from "../../lib/cookies";
import { cn } from "../../lib/utils";
import { ProfileDropdown } from "../profile-dropdown";
import { ThemeSwitch } from "../theme-switch";
import {
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarProvider,
	SidebarRail,
} from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { getSidebarData } from "./data/sidebar-data";
import { Header } from "./header";
import { LogoHeader } from "./logo-header";
import { Main } from "./main";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";

type AuthenticatedLayoutProps = {
	children?: React.ReactNode;
};

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
	const defaultOpen = getCookie("sidebar_state") !== "false";
	const { data: session } = authClient.useSession();
	const sidebarData = getSidebarData(session);

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<LayoutProvider>
				<AppSidebar>
					<SidebarHeader>
						<LogoHeader />
					</SidebarHeader>
					<SidebarContent>
						{sidebarData.navGroups.map((props) => (
							<NavGroup key={props.title} {...props} />
						))}
					</SidebarContent>
					<SidebarFooter>
						<NavUser user={sidebarData.user} />
					</SidebarFooter>
					<SidebarRail />
				</AppSidebar>
				<SidebarInset
					className={cn(
						// If layout is fixed, set the height
						// to 100svh to prevent overflow
						"has-[[data-layout=fixed]]:h-svh",

						// If layout is fixed and sidebar is inset,
						// set the height to 100svh - 1rem (total margins) to prevent overflow
						// 'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-1rem)]',
						"peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]",

						// Set content container, so we can use container queries
						"@container/content",
					)}
				>
					<Header>
						<div className="ms-auto flex items-center space-x-4">
							<ThemeSwitch />
							<ProfileDropdown />
						</div>
					</Header>
					<Main>{children}</Main>
				</SidebarInset>
			</LayoutProvider>
		</SidebarProvider>
	);
}
