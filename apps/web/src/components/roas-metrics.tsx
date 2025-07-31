import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, Target, Users } from "lucide-react";

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
}

export default function ROASMetrics({
	selectedMonth,
	selectedYear,
}: ROASMetricsProps) {
	const [data, setData] = useState<ROASData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchROASData();
	}, [selectedMonth, selectedYear]);

	const fetchROASData = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (selectedMonth) params.append("month", selectedMonth);
			if (selectedYear) params.append("year", selectedYear);

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
	};

	const formatCurrency = (amount: number) => {
		return `RM ${amount.toLocaleString()}`;
	};

	const formatPercentage = (value: number) => {
		return `${value}%`;
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						ROAS & Performance Metrics
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{[...Array(8)].map((_, i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-8 w-full" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!data) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						ROAS & Performance Metrics
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No data available</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					ROAS & Performance Metrics
					{data.period ? ` - ${data.period.month} (${data.period.year})` : ""}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{/* ROAS */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4 text-green-600" />
							<span className="text-sm font-medium text-muted-foreground">
								ROAS
							</span>
						</div>
						<div className="text-2xl font-bold text-green-600">
							{data.roas}x
						</div>
						<p className="text-xs text-muted-foreground">Return on Ad Spend</p>
					</div>

					{/* Total Sales */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<DollarSign className="h-4 w-4 text-blue-600" />
							<span className="text-sm font-medium text-muted-foreground">
								Total Sales
							</span>
						</div>
						<div className="text-2xl font-bold text-blue-600">
							{formatCurrency(data.totalSales)}
						</div>
						<p className="text-xs text-muted-foreground">Revenue generated</p>
					</div>

					{/* Ad Cost */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Target className="h-4 w-4 text-orange-600" />
							<span className="text-sm font-medium text-muted-foreground">
								Ad Spend
							</span>
						</div>
						<div className="text-2xl font-bold text-orange-600">
							{formatCurrency(data.totalAdCost)}
						</div>
						<p className="text-xs text-muted-foreground">
							Total advertising cost
						</p>
					</div>

					{/* Conversion Rate */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-purple-600" />
							<span className="text-sm font-medium text-muted-foreground">
								Conversion
							</span>
						</div>
						<div className="text-2xl font-bold text-purple-600">
							{formatPercentage(data.conversionRate)}
						</div>
						<p className="text-xs text-muted-foreground">Lead to sale rate</p>
					</div>

					{/* Cost Per Lead */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<DollarSign className="h-4 w-4 text-gray-600" />
							<span className="text-sm font-medium text-muted-foreground">
								Cost/Lead
							</span>
						</div>
						<div className="text-xl font-bold text-gray-600">
							{formatCurrency(data.costPerLead)}
						</div>
						<p className="text-xs text-muted-foreground">
							Per lead acquisition
						</p>
					</div>

					{/* Cost Per Acquisition */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Target className="h-4 w-4 text-red-600" />
							<span className="text-sm font-medium text-muted-foreground">
								Cost/Sale
							</span>
						</div>
						<div className="text-xl font-bold text-red-600">
							{formatCurrency(data.costPerAcquisition)}
						</div>
						<p className="text-xs text-muted-foreground">
							Per sale acquisition
						</p>
					</div>

					{/* Total Leads */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-indigo-600" />
							<span className="text-sm font-medium text-muted-foreground">
								Total Leads
							</span>
						</div>
						<div className="text-xl font-bold text-indigo-600">
							{data.totalLeads}
						</div>
						<p className="text-xs text-muted-foreground">Leads generated</p>
					</div>

					{/* Closed Leads */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-green-600" />
							<span className="text-sm font-medium text-muted-foreground">
								Closed Leads
							</span>
						</div>
						<div className="text-xl font-bold text-green-600">
							{data.closedLeads}
						</div>
						<p className="text-xs text-muted-foreground">
							Successful conversions
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
