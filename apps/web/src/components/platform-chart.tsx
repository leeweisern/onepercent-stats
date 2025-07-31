import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlatformBreakdownData {
	platform: string | null;
	totalLeads: number;
	closedLeads: number;
	notClosedLeads: number;
	totalSales: number;
}

interface PlatformChartProps {
	data: PlatformBreakdownData[];
	totalSales: number;
	month: string;
}

export default function PlatformChart({
	data,
	totalSales,
	month,
}: PlatformChartProps) {
	const formatCurrency = (amount: number) => {
		return `RM${amount.toLocaleString()}`;
	};

	const getPlatformColor = (platform: string | null) => {
		switch (platform?.toLowerCase()) {
			case "facebook":
			case "fb":
				return { close: "bg-blue-600", noClose: "bg-orange-500" };
			case "google":
				return { close: "bg-green-600", noClose: "bg-orange-500" };
			case "instagram":
			case "ig":
				return { close: "bg-purple-600", noClose: "bg-orange-500" };
			default:
				return { close: "bg-gray-600", noClose: "bg-orange-500" };
		}
	};

	const maxLeads = Math.max(...data.map((d) => d.totalLeads));

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Total Sales {formatCurrency(totalSales)}</span>
					<div className="flex items-center gap-4 text-sm">
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 bg-blue-600 rounded"></div>
							<span>Close</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 bg-orange-500 rounded"></div>
							<span>No Close</span>
						</div>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{data.map((item, index) => {
						const colors = getPlatformColor(item.platform);
						const closedHeight =
							maxLeads > 0 ? (item.closedLeads / maxLeads) * 200 : 0;
						const notClosedHeight =
							maxLeads > 0 ? (item.notClosedLeads / maxLeads) * 200 : 0;

						return (
							<div key={index} className="flex items-end gap-2">
								<div className="flex-1 flex items-end justify-center gap-1 min-h-[220px]">
									{/* Closed leads bar */}
									<div className="flex flex-col items-center">
										<div
											className={`${colors.close} rounded-t transition-all duration-300 min-w-[40px]`}
											style={{ height: `${Math.max(closedHeight, 4)}px` }}
										></div>
									</div>
									{/* Not closed leads bar */}
									<div className="flex flex-col items-center">
										<div
											className={`${colors.noClose} rounded-t transition-all duration-300 min-w-[40px]`}
											style={{ height: `${Math.max(notClosedHeight, 4)}px` }}
										></div>
									</div>
								</div>
								<div className="text-center min-w-[100px]">
									<div className="font-medium text-sm mb-1">
										<Badge variant="secondary">
											{item.platform?.toUpperCase() || "N/A"} ({item.totalLeads}
											)
										</Badge>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Y-axis labels */}
				<div className="mt-4 flex justify-between text-xs text-muted-foreground border-t pt-2">
					<span>0</span>
					<span className="text-center">Platform</span>
					<span>{maxLeads}</span>
				</div>
			</CardContent>
		</Card>
	);
}
