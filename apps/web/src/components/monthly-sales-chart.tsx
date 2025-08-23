import { Calendar, DollarSign } from "lucide-react";
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

interface MonthlySalesData {
	month: string;
	totalSales: number;
}

interface MonthlySalesResponse {
	data: MonthlySalesData[];
	year: string;
}

interface MonthlySalesChartProps {
	selectedYear?: string;
	dateType?: "lead" | "closed";
}

const formatCurrency = (amount: number) => {
	return `RM${amount.toLocaleString()}`;
};

const CustomSalesTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		return (
			<div className="rounded-lg border bg-white p-3 shadow-lg">
				<p className="font-medium">{label}</p>
				{payload.map((entry: any) => (
					<p key={`${entry.name}-${entry.value}`} style={{ color: entry.color }}>
						{entry.name}: {formatCurrency(entry.value)}
					</p>
				))}
			</div>
		);
	}
	return null;
};

export default function MonthlySalesChart({
	selectedYear,
	dateType = "lead",
}: MonthlySalesChartProps) {
	const [salesData, setSalesData] = useState<MonthlySalesResponse | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchSalesData = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (selectedYear) params.append("year", selectedYear);
			params.append("dateType", dateType);

			const response = await fetch(`/api/analytics/leads/growth/monthly?${params}`);

			if (!response.ok) {
				console.error("Sales API error:", response.status, response.statusText);
				setSalesData(null);
				return;
			}

			const data = await response.json();
			console.log("Sales data received:", data);
			setSalesData(data);
		} catch (error) {
			console.error("Error fetching monthly sales data:", error);
			setSalesData(null);
		} finally {
			setLoading(false);
		}
	}, [selectedYear, dateType]);

	useEffect(() => {
		fetchSalesData();
	}, [fetchSalesData]);

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Monthly Sales
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-80 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (!salesData || !salesData.data || salesData.data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Monthly Sales
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p>No monthly sales data available for the selected year.</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<DollarSign className="h-5 w-5" />
					Monthly Sales {dateType === "closed" ? "(by Sale Date)" : "(by Lead Date)"}
					<Badge variant="outline" className="ml-auto">
						{salesData.year}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={salesData.data}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="month"
								tick={{ fontSize: 12 }}
								angle={-45}
								textAnchor="end"
								height={60}
							/>
							<YAxis tick={{ fontSize: 12 }} />
							<Tooltip content={<CustomSalesTooltip />} />
							<Legend />
							<Bar dataKey="totalSales" fill="#f59e0b" name="Total Sales" radius={[2, 2, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}
