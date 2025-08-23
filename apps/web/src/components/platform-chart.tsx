import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_COLORS } from "@/lib/brand-colors";

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

export default function PlatformChart({ data, totalSales }: PlatformChartProps) {
	const formatCurrency = (amount: number) => {
		return `RM${amount.toLocaleString()}`;
	};

	const getPlatformColor = (_platform: string | null) => {
		// Using brand colors consistently - red for closed, black for not closed
		return { close: "[&]:bg-[#e41e26]", noClose: "[&]:bg-black" };
	};

	const maxLeads = Math.max(...data.map((d) => d.totalLeads));

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Total Sales {formatCurrency(totalSales)}</span>
					<div className="flex items-center gap-4 text-sm">
						<div className="flex items-center gap-2">
							<div
								className="h-4 w-4 rounded"
								style={{ backgroundColor: BRAND_COLORS.PRIMARY_RED }}
							/>
							<span>Close</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-4 w-4 rounded" style={{ backgroundColor: BRAND_COLORS.BLACK }} />
							<span>No Close</span>
						</div>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{data.map((item) => {
						const colors = getPlatformColor(item.platform);
						const closedHeight = maxLeads > 0 ? (item.closedLeads / maxLeads) * 200 : 0;
						const notClosedHeight = maxLeads > 0 ? (item.notClosedLeads / maxLeads) * 200 : 0;

						return (
							<div key={item.platform || crypto.randomUUID()} className="flex items-end gap-2">
								<div className="flex min-h-[220px] flex-1 items-end justify-center gap-1">
									{/* Closed leads bar */}
									<div className="flex flex-col items-center">
										<div
											className={`${colors.close} min-w-[40px] rounded-t transition-all duration-300`}
											style={{ height: `${Math.max(closedHeight, 4)}px` }}
										/>
									</div>
									{/* Not closed leads bar */}
									<div className="flex flex-col items-center">
										<div
											className={`${colors.noClose} min-w-[40px] rounded-t transition-all duration-300`}
											style={{ height: `${Math.max(notClosedHeight, 4)}px` }}
										/>
									</div>
								</div>
								<div className="min-w-[100px] text-center">
									<div className="mb-1 font-medium text-sm">
										<Badge variant="secondary">
											{item.platform?.toUpperCase() || "N/A"} ({item.totalLeads})
										</Badge>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Y-axis labels */}
				<div className="mt-4 flex justify-between border-t pt-2 text-muted-foreground text-xs">
					<span>0</span>
					<span className="text-center">Platform</span>
					<span>{maxLeads}</span>
				</div>
			</CardContent>
		</Card>
	);
}
