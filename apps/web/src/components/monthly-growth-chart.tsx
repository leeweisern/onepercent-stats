import { Calendar, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlyGrowthData {
	month: string;
	totalLeads: number;
	closedLeads: number;
	totalSales: number;
}

interface MonthlyGrowthResponse {
	data: MonthlyGrowthData[];
	year: string;
}

interface MonthlyGrowthChartProps {
	selectedYear?: string;
}

export default function MonthlyGrowthChart({
	selectedYear,
}: MonthlyGrowthChartProps) {
	const [growthData, setGrowthData] = useState<MonthlyGrowthResponse | null>(
		null,
	);
	const [loading, setLoading] = useState(true);

	const fetchGrowthData = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (selectedYear) params.append("year", selectedYear);

			const response = await fetch(
				`/api/analytics/leads/growth/monthly?${params}`,
			);

			if (!response.ok) {
				console.error(
					"Growth API error:",
					response.status,
					response.statusText,
				);
				setGrowthData(null);
				return;
			}

			const data = await response.json();
			console.log("Growth data received:", data);
			setGrowthData(data);
		} catch (error) {
			console.error("Error fetching monthly growth data:", error);
			setGrowthData(null);
		} finally {
			setLoading(false);
		}
	}, [selectedYear]);

	useEffect(() => {
		fetchGrowthData();
	}, [fetchGrowthData]);

	const formatCurrency = (amount: number) => {
		return `RM ${amount.toLocaleString()}`;
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="rounded-lg border bg-white p-3 shadow-lg">
					<p className="font-medium">{label}</p>
					{payload.map((entry: any, index: number) => (
						<p key={index} style={{ color: entry.color }}>
							{entry.name}:{" "}
							{entry.name === "Total Sales"
								? formatCurrency(entry.value)
								: entry.value}
						</p>
					))}
				</div>
			);
		}
		return null;
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Monthly Growth
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-80 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (!growthData || !growthData.data || growthData.data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Monthly Growth
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p>No monthly growth data available for the selected year.</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					Monthly Growth
					<Badge variant="outline" className="ml-auto">
						{growthData.year}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={growthData.data}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="month"
								tick={{ fontSize: 12 }}
								angle={-45}
								textAnchor="end"
								height={60}
							/>
							<YAxis yAxisId="left" tick={{ fontSize: 12 }} />
							<YAxis
								yAxisId="right"
								orientation="right"
								tick={{ fontSize: 12 }}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							<Bar
								yAxisId="left"
								dataKey="totalLeads"
								fill="#3b82f6"
								name="Total Leads"
								radius={[2, 2, 0, 0]}
							/>
							<Bar
								yAxisId="left"
								dataKey="closedLeads"
								fill="#10b981"
								name="Closed Leads"
								radius={[2, 2, 0, 0]}
							/>
							<Bar
								yAxisId="right"
								dataKey="totalSales"
								fill="#f59e0b"
								name="Total Sales"
								radius={[2, 2, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}
