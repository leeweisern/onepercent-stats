import { BarChart3, DollarSign, Target, TrendingUp, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ROASData {
	roas: number;
	totalSales: number;
	totalAdCost: number;
	totalLeads: number;
	closedLeads: number;
	costPerLead: number;
	costPerAcquisition: number;
	conversionRate: number;
	period: {
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
		<>
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
						<CardTitle className="text-sm font-medium">ROAS</CardTitle>
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
						<CardTitle className="text-sm font-medium">Conversion</CardTitle>
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
						<CardTitle className="text-sm font-medium">Cost/Lead</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(data.costPerLead)}</div>
						<p className="text-xs text-muted-foreground">Per lead acquisition</p>
					</CardContent>
				</Card>

				{/* Cost Per Sale */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Cost/Sale</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(data.costPerAcquisition)}</div>
						<p className="text-xs text-muted-foreground">Per sale acquisition</p>
					</CardContent>
				</Card>

				{/* Total Leads */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Leads</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.totalLeads}</div>
						<p className="text-xs text-muted-foreground">Leads generated</p>
					</CardContent>
				</Card>

				{/* Closed Leads */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Closed Leads</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.closedLeads}</div>
						<p className="text-xs text-muted-foreground">Successful conversions</p>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
