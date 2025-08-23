import AdvertisingCostsManagement from "@/components/advertising-costs-management";
import { ProtectedRoute } from "@/components/protected-route";

export default function Advertising() {
	return (
		<ProtectedRoute>
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
				<AdvertisingCostsManagement />
			</div>
		</ProtectedRoute>
	);
}
