import AdvertisingCostsManagement from "@/components/advertising-costs-management";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Advertising() {
	return (
		<SidebarProvider>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
							<AdvertisingCostsManagement />
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
