import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
	return (
		<header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
			<SidebarTrigger className="-ml-1" />
			<div className="flex items-center gap-2">
				<h1 className="text-lg font-semibold">Dashboard</h1>
			</div>
		</header>
	);
}
