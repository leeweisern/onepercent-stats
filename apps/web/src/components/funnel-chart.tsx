import { TrendingDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to format month display
const _formatMonthDisplay = (monthString: string) => {
	if (monthString === "All months") return monthString;

	const [year, month] = monthString.split("-");
	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const monthIndex = Number.parseInt(month, 10) - 1;
	const monthName = monthNames[monthIndex] || month;
	return `${monthName} ${year}`;
};

interface FunnelStage {
	status: string;
	count: number;
	totalSales: number;
	platforms: Record<string, { count: number; totalSales: number }>;
}

interface FunnelData {
	funnel: FunnelStage[];
	month: string;
	year: string;
	platform: string;
}

interface FunnelChartProps {
	selectedMonth?: string;
	selectedYear?: string;
	selectedPlatform?: string;
}

export default function FunnelChart({
	selectedMonth,
	selectedYear,
	selectedPlatform,
}: FunnelChartProps) {
	const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
	const [summaryData, setSummaryData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [currentPlatform, setCurrentPlatform] = useState<string>(selectedPlatform || "");
	const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);

	const fetchFunnelData = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (selectedMonth) params.append("month", selectedMonth);
			if (selectedYear) params.append("year", selectedYear);
			if (currentPlatform) params.append("platform", currentPlatform);

			const response = await fetch(`/api/analytics/leads/funnel?${params}`);
			const data = await response.json();
			setFunnelData(data);
		} catch (error) {
			console.error("Error fetching funnel data:", error);
		} finally {
			setLoading(false);
		}
	}, [selectedMonth, selectedYear, currentPlatform]);

	const fetchSummaryData = useCallback(async () => {
		try {
			// Build query params for filtering
			const params = new URLSearchParams();
			if (selectedMonth) params.append("month", selectedMonth);
			if (selectedYear) params.append("year", selectedYear);
			if (currentPlatform) params.append("platform", currentPlatform);

			// Fetch filtered leads data to calculate our own summary
			const response = await fetch(`/api/analytics/leads?${params}`);
			const leads = await response.json();

			// Calculate filtered summary
			const totalLeads = leads.length;
			const totalConsults = leads.filter((lead: any) => lead.status === "Consult").length;
			const totalClosed = leads.filter((lead: any) => lead.isClosed).length;
			const totalSales = leads.reduce((sum: number, lead: any) => sum + (lead.sales || 0), 0);

			setSummaryData({
				totalLeads,
				totalConsults,
				totalClosed,
				totalSales: totalSales.toString(),
			});
		} catch (error) {
			console.error("Error fetching summary data:", error);
		}
	}, [selectedMonth, selectedYear, currentPlatform]);

	const fetchPlatforms = useCallback(async () => {
		try {
			const response = await fetch("/api/analytics/leads/filter-options");
			const data = await response.json();
			setAvailablePlatforms(data.platforms || []);
		} catch (error) {
			console.error("Error fetching platforms:", error);
		}
	}, []);

	useEffect(() => {
		fetchFunnelData();
		fetchSummaryData();
		fetchPlatforms();
	}, [fetchFunnelData, fetchPlatforms, fetchSummaryData]);

	const formatCurrency = (amount: number) => {
		return `RM ${amount.toLocaleString()}`;
	};

	const _getStageColor = (_status: string, index: number) => {
		const colors = ["bg-blue-500", "bg-yellow-500", "bg-green-500", "bg-purple-500", "bg-red-500"];
		return colors[index % colors.length];
	};

	const _getStageWidth = (count: number, maxCount: number) => {
		if (maxCount === 0) return 100;
		return Math.max((count / maxCount) * 100, 10); // Minimum 10% width for visibility
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingDown className="h-5 w-5" />
						Sales Funnel
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 3 }, () => (
							<Skeleton key={crypto.randomUUID()} className="h-16 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!funnelData) return null;

	const _maxCount = Math.max(...funnelData.funnel.map((stage) => stage.count));
	const _totalLeads = funnelData.funnel.reduce((sum, stage) => sum + stage.count, 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingDown className="h-5 w-5" />
					Sales Funnel
					<Badge variant="outline" className="ml-auto">
						{funnelData.month}
						{funnelData.year && funnelData.year !== "All years" ? ` ${funnelData.year}` : ""} •{" "}
						{funnelData.platform}
					</Badge>
				</CardTitle>
				<div className="flex flex-wrap gap-2">
					<select
						value={currentPlatform}
						onChange={(e) => setCurrentPlatform(e.target.value)}
						className="rounded-md border px-3 py-1 text-sm"
					>
						<option value="">All platforms</option>
						{availablePlatforms.map((platform) => (
							<option key={platform} value={platform}>
								{platform}
							</option>
						))}
					</select>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-start justify-between">
					{/* Bar Chart */}
					<div className="flex h-[300px] flex-1 items-end justify-center gap-8 px-8">
						{(() => {
							if (!summaryData) return null;

							// Use the accurate summary data
							const totalLeads = summaryData.totalLeads;
							const totalConsults = summaryData.totalConsults || 0;
							const totalSales = summaryData.totalClosed; // This is the actual closed leads count

							const simplifiedFunnel = [
								{ status: "leads", displayName: "Leads", count: totalLeads },
								{
									status: "consults",
									displayName: "Consult",
									count: totalConsults,
								},
								{ status: "sales", displayName: "Sales", count: totalSales },
							];

							const maxCount = Math.max(...simplifiedFunnel.map((s) => s.count));

							return simplifiedFunnel.map((stage, index) => {
								const height = maxCount > 0 ? (stage.count / maxCount) * 250 : 0;

								return (
									<div key={stage.status} className="flex flex-col items-center gap-3">
										<div className="min-h-[20px] text-center font-medium text-sm">
											{stage.count}
										</div>
										<div
											className="flex w-16 items-end justify-center rounded-t-md bg-blue-500 transition-all duration-500"
											style={{
												height: `${Math.max(height, 20)}px`,
												backgroundColor:
													index === 0 ? "#3b82f6" : index === 1 ? "#93c5fd" : "#1e40af",
											}}
										/>
										<div className="text-center text-muted-foreground text-xs">
											{stage.displayName}
										</div>
									</div>
								);
							});
						})()}
					</div>

					{/* Conversion Rate */}
					<div className="ml-8 text-right">
						{summaryData && (
							<div className="space-y-2">
								<div className="font-bold text-3xl text-blue-600">
									{summaryData.totalLeads > 0
										? ((summaryData.totalClosed / summaryData.totalLeads) * 100).toFixed(1)
										: "0.0"}
									%
								</div>
								<div className="text-muted-foreground text-sm">Total Conversion</div>
							</div>
						)}
					</div>
				</div>

				{/* Summary stats below chart */}
				<div className="mt-8 grid grid-cols-3 gap-4">
					{summaryData &&
						(() => {
							const totalLeads = summaryData.totalLeads;
							const consultCount = summaryData.totalConsults || 0;
							const salesCount = summaryData.totalClosed;
							const totalSalesAmount = summaryData.totalSales;

							const simplifiedStats = [
								{
									status: "leads",
									displayName: "Leads",
									count: totalLeads,
									conversionRate: 100,
									totalSales: 0,
								},
								{
									status: "consults",
									displayName: "Consult",
									count: consultCount,
									conversionRate: totalLeads > 0 ? (consultCount / totalLeads) * 100 : 0,
									totalSales: 0,
								},
								{
									status: "sales",
									displayName: "Sales",
									count: salesCount,
									conversionRate: totalLeads > 0 ? (salesCount / totalLeads) * 100 : 0,
									totalSales: totalSalesAmount,
								},
							];

							return simplifiedStats.map((stage) => (
								<div key={stage.status} className="rounded-lg bg-muted/50 p-4 text-center">
									<div className="font-bold text-2xl">{stage.count}</div>
									<div className="text-muted-foreground text-sm">{stage.displayName}</div>
									<div className="mt-1 text-muted-foreground text-xs">
										{stage.conversionRate.toFixed(1)}%
									</div>
									{stage.totalSales > 0 && (
										<div className="mt-1 text-green-600 text-xs">
											{formatCurrency(Number.parseInt(stage.totalSales, 10))}
										</div>
									)}
								</div>
							));
						})()}
				</div>

				{!summaryData && (
					<div className="py-8 text-center text-muted-foreground">
						<TrendingDown className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p>No funnel data available for the selected filters.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
