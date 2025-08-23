import AdvertisingCostsManagement from "@/components/advertising-costs-management";
import { ProtectedRoute } from "@/components/protected-route";

export default function Advertising() {
	return (
		<ProtectedRoute>
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
				{/* Page Header */}
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Advertising</h1>
					<p className="text-muted-foreground">Manage advertising costs and campaign performance</p>
				</div>

				<AdvertisingCostsManagement />
			</div>
		</ProtectedRoute>
	);
}
