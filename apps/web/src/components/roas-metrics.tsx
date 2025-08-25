import { BarChart3, DollarSign, HelpCircle, Target, TrendingUp, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ROASData {
	roas: number;
	totalSales: number;
	totalAdCost: number;
	totalLeads: number;
	closedLeads: number;
	costPerLead: number;
	costPerAcquisition: number;
	conversionRate: number;
	attribution?: {
		costPerLead: string;
		roas: string;
		costPerAcquisition: string;
	};
	period: {
		dateType?: string;
		month: string;
		year: string;
		platform: string;
	};
}

interface ROASMetricsProps {
	selectedMonth: string;
	selectedYear: string;
	dateType?: "lead" | "closed";
}

export default function ROASMetrics({
	selectedMonth,
	selectedYear,
	dateType = "lead",
}: ROASMetricsProps) {
	const [data, setData] = useState<ROASData | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchROASData = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (selectedMonth) params.append("month", selectedMonth);
			if (selectedYear) params.append("year", selectedYear);
			if (dateType) params.append("dateType", dateType);

			const response = await fetch(`/api/analytics/roas?${params}`);

			if (!response.ok) {
				console.error("ROAS API error:", response.status, response.statusText);
				setData(null);
				return;
			}

			const roasData = await response.json();

			// Validate the response structure
			if (roasData && typeof roasData === "object" && !roasData.error) {
				setData(roasData);
			} else {
				console.error("Invalid ROAS data structure:", roasData);
				setData(null);
			}
		} catch (error) {
			console.error("Error fetching ROAS data:", error);
			setData(null);
		} finally {
			setLoading(false);
		}
	}, [selectedMonth, selectedYear, dateType]);

	useEffect(() => {
		fetchROASData();
	}, [fetchROASData]);

	const formatCurrency = (amount: number) => {
		return `RM ${amount.toLocaleString()}`;
	};

	const formatPercentage = (value: number) => {
		return `${value}%`;
	};

	// Helper to get attribution label
	const getAttributionLabel = (metric: "costPerLead" | "roas" | "costPerAcquisition") => {
		if (!data?.attribution) return "";
		const attribution = data.attribution[metric];
		return attribution === "lead-date" ? "(lead date)" : "(sale date)";
	};

	// Helper to get tooltip content
	const getTooltipContent = (metric: string) => {
		switch (metric) {
			case "roas":
				return "Return on Ad Spend - Total sales divided by advertising cost (always uses sale-date attribution)";
			case "costPerLead":
				return dateType === "lead"
					? "Cost per lead - Ad spend divided by leads created in period (lead-date attribution)"
					: "Cost per lead - Ad spend divided by leads closed in period (sale-date attribution)";
			case "costPerAcquisition":
				return "Cost per closed case - Ad spend divided by successful conversions (sale-date attribution)";
			case "conversionRate":
				return "Percentage of leads that converted to sales in the selected period";
			default:
				return "";
		}
	};

	if (loading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 8 }, () => (
					<Card key={crypto.randomUUID()}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-4" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-24 mb-1" />
							<Skeleton className="h-3 w-32" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!data) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">No data available</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-xs text-muted-foreground">Check your filters</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const periodText = data.period
		? ` - ${data.period.month || "All months"} (${data.period.year || "All years"})`
		: " - All months (All years)";

	return (
		<TooltipProvider>
			{/* Title Section */}
			<div className="mb-4">
				<h2 className="text-2xl font-bold flex items-center gap-2">
					<BarChart3 className="h-6 w-6" />
					ROAS & Performance Metrics{periodText}
				</h2>
			</div>

			{/* Metrics Cards Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{/* ROAS */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium flex items-center gap-1">
							ROAS {getAttributionLabel("roas")}
							<Tooltip>
								<TooltipTrigger asChild>
									<HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-xs">{getTooltipContent("roas")}</p>
								</TooltipContent>
							</Tooltip>
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.roas}x</div>
						<p className="text-xs text-muted-foreground">Return on Ad Spend</p>
					</CardContent>
				</Card>

				{/* Total Sales */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Sales</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(data.totalSales)}</div>
						<p className="text-xs text-muted-foreground">Revenue generated</p>
					</CardContent>
				</Card>

				{/* Ad Spend */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Ad Spend</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(data.totalAdCost)}</div>
						<p className="text-xs text-muted-foreground">Total advertising cost</p>
					</CardContent>
				</Card>

				{/* Conversion Rate */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium flex items-center gap-1">
							Conversion
							<Tooltip>
								<TooltipTrigger asChild>
									<HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-xs">{getTooltipContent("conversionRate")}</p>
								</TooltipContent>
							</Tooltip>
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatPercentage(data.conversionRate)}</div>
						<p className="text-xs text-muted-foreground">Lead to sale rate</p>
					</CardContent>
				</Card>

				{/* Cost Per Lead */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium flex items-center gap-1">
							{dateType === "lead" ? "Cost/Lead" : "Cost/Lead (period)"}
							<Tooltip>
								<TooltipTrigger asChild>
									<HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-xs">{getTooltipContent("costPerLead")}</p>
								</TooltipContent>
							</Tooltip>
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(data.costPerLead)}</div>
						<p className="text-xs text-muted-foreground">
							{dateType === "lead" ? "Per lead created" : "Per lead in period"}
						</p>
					</CardContent>
				</Card>

				{/* Cost Per Sale */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium flex items-center gap-1">
							Cost/Closed Case
							<Tooltip>
								<TooltipTrigger asChild>
									<HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-xs">{getTooltipContent("costPerAcquisition")}</p>
								</TooltipContent>
							</Tooltip>
						</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(data.costPerAcquisition)}</div>
						<p className="text-xs text-muted-foreground">Per successful conversion</p>
					</CardContent>
				</Card>

				{/* Total Leads */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{dateType === "lead" ? "Leads Created" : "Leads (in period)"}
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.totalLeads}</div>
						<p className="text-xs text-muted-foreground">
							{dateType === "lead" ? "New leads generated" : "Leads in sale period"}
						</p>
					</CardContent>
				</Card>

				{/* Closed Leads */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Closed Won</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.closedLeads}</div>
						<p className="text-xs text-muted-foreground">Successful conversions</p>
					</CardContent>
				</Card>
			</div>
		</TooltipProvider>
	);
}
