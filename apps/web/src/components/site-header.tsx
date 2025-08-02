import { useLocation } from "react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";

const getPageTitle = (pathname: string) => {
	switch (pathname) {
		case "/leads":
			return "Leads";
		case "/analytics":
			return "Analytics";
		case "/advertising":
			return "Advertising Costs";
		default:
			return "Dashboard";
	}
};

export function SiteHeader() {
	const location = useLocation();
	const pageTitle = getPageTitle(location.pathname);

	return (
		<header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
			<SidebarTrigger className="-ml-1" />
			<div className="flex items-center gap-2">
				<h1 className="font-semibold text-lg">{pageTitle}</h1>
			</div>
		</header>
	);
}
