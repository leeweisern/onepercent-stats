import { TrendingDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BRAND_COLORS } from "@/lib/brand-colors";

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

// Canonical lead statuses and their colors
const LEAD_STATUSES = ["New", "Contacted", "Follow Up", "Consulted", "Closed Won", "Closed Lost"];

const getStageColor = (status: string) => {
	switch (status) {
		case "New":
			return "#9CA3AF"; // Gray
		case "Contacted":
			return "#3B82F6"; // Blue
		case "Follow Up":
			return "#F97316"; // Orange
		case "Consulted":
			return "#A855F7"; // Purple
		case "Closed Won":
			return "#10B981"; // Green
		case "Closed Lost":
			return "#EF4444"; // Red
		default:
			return "#6B7280"; // Default gray
	}
};

interface FunnelStageV1 {
	status: string;
	count: number;
	totalSales: number;
	platforms: Record<string, { count: number; totalSales: number }>;
}

interface FunnelStageV2 {
	stage: string;
	reachedCount: number;
	currentCount: number;
	totalSales: number;
	conversionFromPrevious: number;
}

interface FunnelDataV1 {
	funnel: FunnelStageV1[];
	period: {
		dateType?: string;
		month: string;
		year: string;
		platform: string;
	};
}

interface FunnelDataV2 {
	funnel: FunnelStageV2[];
	period: {
		dateType?: string;
		month: string;
		year: string;
		platform: string;
	};
}

interface FunnelChartProps {
	selectedMonth?: string;
	selectedYear?: string;
	selectedPlatform?: string;
	dateType?: "lead" | "closed" | "stage";
}

type FunnelMode = "distribution" | "cumulative";

export default function FunnelChart({
	selectedMonth,
	selectedYear,
	selectedPlatform,
	dateType = "lead",
}: FunnelChartProps) {
	const [funnelMode, setFunnelMode] = useState<FunnelMode>("distribution");
	const [funnelDataV1, setFunnelDataV1] = useState<FunnelDataV1 | null>(null);
	const [funnelDataV2, setFunnelDataV2] = useState<FunnelDataV2 | null>(null);
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

			// For v2, use stage dateType for cumulative, otherwise use the provided dateType
			const v1DateType = dateType;
			const v2DateType = funnelMode === "cumulative" ? "stage" : dateType;

			// Fetch both v1 and v2 data
			const [v1Response, v2Response] = await Promise.all([
				fetch(`/api/analytics/leads/funnel?${params}&dateType=${v1DateType}`),
				fetch(`/api/analytics/leads/funnel/v2?${params}&dateType=${v2DateType}`),
			]);

			const v1Data = await v1Response.json();
			const v2Data = await v2Response.json();

			setFunnelDataV1(v1Data);
			setFunnelDataV2(v2Data);
		} catch (error) {
			console.error("Error fetching funnel data:", error);
		} finally {
			setLoading(false);
		}
	}, [selectedMonth, selectedYear, currentPlatform, dateType, funnelMode]);

	const fetchSummaryData = useCallback(async () => {
		try {
			// Build query params for filtering
			const params = new URLSearchParams();
			if (selectedMonth) params.append("month", selectedMonth);
			if (selectedYear) params.append("year", selectedYear);
			if (currentPlatform) params.append("platform", currentPlatform);
			if (dateType) params.append("dateType", dateType);

			// Use the summary endpoint instead of fetching all leads
			const response = await fetch(`/api/analytics/leads/summary?${params}`);
			const summary = await response.json();

			// Calculate summary based on canonical statuses
			const totalLeads = summary.totalLeads || 0;
			const totalConsults = summary.totalConsults || 0; // "Consulted" status
			const totalClosed = summary.totalClosed || 0; // "Closed Won" status
			const totalSales = summary.totalSales || 0;

			setSummaryData({
				totalLeads,
				totalConsults,
				totalClosed,
				totalSales: totalSales.toString(),
			});
		} catch (error) {
			console.error("Error fetching summary data:", error);
		}
	}, [selectedMonth, selectedYear, currentPlatform, dateType]);

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

	const currentData = funnelMode === "cumulative" ? funnelDataV2 : funnelDataV1;
	if (!currentData) return null;

	// Determine which data to display based on mode
	const isV2Mode = funnelMode === "cumulative";
	const displayData = isV2Mode ? funnelDataV2 : funnelDataV1;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingDown className="h-5 w-5" />
					Sales Funnel
					<Badge variant="outline" className="ml-auto">
						{displayData?.period.month || "All months"}
						{displayData?.period.year && displayData.period.year !== "All years"
							? ` ${displayData.period.year}`
							: ""}{" "}
						• {displayData?.period.platform || "All platforms"}
					</Badge>
				</CardTitle>
				<div className="flex flex-wrap items-center gap-2">
					{/* Mode Toggle */}
					<div className="flex gap-1 rounded-lg bg-muted p-1">
						<Button
							variant={funnelMode === "distribution" ? "default" : "ghost"}
							size="sm"
							onClick={() => setFunnelMode("distribution")}
							className="h-7 px-3 text-xs"
						>
							Pipeline Distribution
						</Button>
						<Button
							variant={funnelMode === "cumulative" ? "default" : "ghost"}
							size="sm"
							onClick={() => setFunnelMode("cumulative")}
							className="h-7 px-3 text-xs"
						>
							Cumulative Funnel
						</Button>
					</div>

					{/* Platform Filter */}
					<select
						value={currentPlatform}
						onChange={(e) => setCurrentPlatform(e.target.value)}
						className="h-8 rounded-md border px-3 text-sm"
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
				{/* Full 6-stage funnel visualization */}
				<div className="space-y-6">
					{/* Helper text based on mode */}
					<div className="text-muted-foreground text-sm">
						{funnelMode === "distribution"
							? "Current pipeline distribution by present status"
							: "Cumulative progression through funnel stages"}
					</div>

					{/* Vertical Funnel - excluding Closed Lost from main progression */}
					<div className="flex flex-col items-center space-y-2">
						{(() => {
							if (isV2Mode && funnelDataV2) {
								// Cumulative funnel with v2 data
								// Filter out Closed Lost for the main funnel progression
								const mainFunnelStages = funnelDataV2.funnel.filter(
									(s) => s.stage !== "Closed Lost",
								);
								const closedLostStage = funnelDataV2.funnel.find((s) => s.stage === "Closed Lost");
								const maxCount = Math.max(...mainFunnelStages.map((s) => s.reachedCount));

								return (
									<>
										{/* Main funnel progression */}
										{mainFunnelStages.map((stage, index) => {
											// Each stage width is based on its actual count relative to the max
											const width = maxCount > 0 ? (stage.reachedCount / maxCount) * 100 : 0;

											return (
												<div key={stage.stage} className="w-full flex items-center justify-center">
													<div
														className="relative transition-all duration-500 rounded-lg overflow-hidden"
														style={{
															width: `${Math.max(width, 5)}%`,
															height: "70px",
															backgroundColor: getStageColor(stage.stage),
														}}
													>
														<div className="absolute inset-0 flex items-center justify-center px-4">
															<div className="text-center">
																<div className="font-semibold text-white">{stage.stage}</div>
																<div className="text-sm text-white/90">
																	{stage.reachedCount} reached
																	{stage.currentCount > 0 &&
																		stage.currentCount !== stage.reachedCount && (
																			<span className="ml-1">({stage.currentCount} current)</span>
																		)}
																</div>
															</div>
														</div>
													</div>
													{/* Conversion percentage on the right */}
													{index > 0 && stage.conversionFromPrevious > 0 && (
														<div className="absolute right-4">
															<Badge variant="secondary" className="text-xs whitespace-nowrap">
																{stage.conversionFromPrevious}%
															</Badge>
														</div>
													)}
												</div>
											);
										})}

										{/* Closed Lost shown separately below with total sales */}
										{closedLostStage && (
											<div className="mt-4 pt-4 border-t w-full">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-4">
														<div
															className="px-4 py-2 rounded-lg"
															style={{ backgroundColor: getStageColor("Closed Lost") }}
														>
															<div className="text-white font-semibold">Closed Lost</div>
															<div className="text-white/90 text-sm">
																{closedLostStage.reachedCount} leads
															</div>
														</div>
														{mainFunnelStages.find((s) => s.stage === "Closed Won")?.totalSales >
															0 && (
															<div className="text-muted-foreground text-sm">
																Total Sales:{" "}
																{formatCurrency(
																	mainFunnelStages.find((s) => s.stage === "Closed Won")
																		?.totalSales || 0,
																)}
															</div>
														)}
													</div>
												</div>
											</div>
										)}
									</>
								);
							} else if (funnelDataV1) {
								// Pipeline distribution with v1 data
								const stageData = LEAD_STATUSES.map((status) => {
									const found = funnelDataV1.funnel.find((s) => s.status === status);
									return found || { status, count: 0, totalSales: 0, platforms: {} };
								});

								// Filter out Closed Lost for the main funnel
								const mainFunnelStages = stageData.filter((s) => s.status !== "Closed Lost");
								const closedLostStage = stageData.find((s) => s.status === "Closed Lost");
								const maxCount = Math.max(...mainFunnelStages.map((s) => s.count));

								return (
									<>
										{/* Main funnel progression */}
										{mainFunnelStages.map((stage, _index) => {
											// Each stage width is based on its actual count relative to the max
											const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;

											return (
												<div key={stage.status} className="w-full flex items-center justify-center">
													<div
														className="relative transition-all duration-500 rounded-lg overflow-hidden"
														style={{
															width: `${Math.max(width, 5)}%`,
															height: "70px",
															backgroundColor: getStageColor(stage.status),
														}}
													>
														<div className="absolute inset-0 flex items-center justify-center px-4">
															<div className="text-center">
																<div className="font-semibold text-white">{stage.status}</div>
																<div className="text-sm text-white/90">{stage.count} leads</div>
															</div>
														</div>
													</div>
												</div>
											);
										})}

										{/* Closed Lost shown separately below with total sales */}
										{closedLostStage && (
											<div className="mt-4 pt-4 border-t w-full">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-4">
														<div
															className="px-4 py-2 rounded-lg"
															style={{ backgroundColor: getStageColor("Closed Lost") }}
														>
															<div className="text-white font-semibold">Closed Lost</div>
															<div className="text-white/90 text-sm">
																{closedLostStage.count} leads
															</div>
														</div>
														{mainFunnelStages.find((s) => s.status === "Closed Won")?.totalSales >
															0 && (
															<div className="text-muted-foreground text-sm">
																Total Sales:{" "}
																{formatCurrency(
																	mainFunnelStages.find((s) => s.status === "Closed Won")
																		?.totalSales || 0,
																)}
															</div>
														)}
													</div>
												</div>
											</div>
										)}
									</>
								);
							}
							return null;
						})()}
					</div>

					{/* Overall Conversion Rate */}
					<div className="mt-6 flex items-center justify-between rounded-lg bg-muted/50 p-4">
						<div>
							<div className="font-medium text-sm">Overall Conversion Rate</div>
							<div className="text-muted-foreground text-xs">
								{funnelMode === "cumulative"
									? "Closed Won / Total Reached"
									: "Closed Won / Total Leads"}
							</div>
						</div>
						<div className="text-right">
							{(() => {
								if (isV2Mode && funnelDataV2) {
									const totalReached = funnelDataV2.funnel[0]?.reachedCount || 0;
									const closedWon =
										funnelDataV2.funnel.find((s) => s.stage === "Closed Won")?.reachedCount || 0;
									const rate = totalReached > 0 ? (closedWon / totalReached) * 100 : 0;
									return (
										<div className="font-bold text-2xl" style={{ color: BRAND_COLORS.PRIMARY_RED }}>
											{rate.toFixed(1)}%
										</div>
									);
								} else if (funnelDataV1) {
									const totalLeads = funnelDataV1.funnel.reduce((sum, s) => sum + s.count, 0);
									const closedWon =
										funnelDataV1.funnel.find((s) => s.status === "Closed Won")?.count || 0;
									const rate = totalLeads > 0 ? (closedWon / totalLeads) * 100 : 0;
									return (
										<div className="font-bold text-2xl" style={{ color: BRAND_COLORS.PRIMARY_RED }}>
											{rate.toFixed(1)}%
										</div>
									);
								}
								return null;
							})()}
						</div>
					</div>

					{/* Summary Statistics - Simplified 3-stage view */}
					{summaryData && (
						<div className="mt-8">
							<h4 className="mb-4 font-medium text-sm">Quick Summary</h4>
							<div className="grid grid-cols-3 gap-4">
								<div className="rounded-lg bg-muted/50 p-4 text-center">
									<div className="font-bold text-2xl">{summaryData.totalLeads}</div>
									<div className="text-muted-foreground text-sm">Total Leads</div>
								</div>
								<div className="rounded-lg bg-muted/50 p-4 text-center">
									<div className="font-bold text-2xl">{summaryData.totalConsults}</div>
									<div className="text-muted-foreground text-sm">Consulted</div>
								</div>
								<div className="rounded-lg bg-muted/50 p-4 text-center">
									<div className="font-bold text-2xl">{summaryData.totalClosed}</div>
									<div className="text-muted-foreground text-sm">Closed Won</div>
									{summaryData.totalSales > 0 && (
										<div className="mt-1 text-xs" style={{ color: BRAND_COLORS.PRIMARY_RED }}>
											{formatCurrency(Number.parseInt(summaryData.totalSales, 10))}
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</div>

				{!displayData && (
					<div className="py-8 text-center text-muted-foreground">
						<TrendingDown className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p>No funnel data available for the selected filters.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
