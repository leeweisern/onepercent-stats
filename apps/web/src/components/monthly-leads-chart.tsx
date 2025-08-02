import { Calendar, Users } from "lucide-react";
import { useEffect, useState } from "react";
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

interface MonthlyLeadsData {
	month: string;
	totalLeads: number;
	closedLeads: number;
}

interface MonthlyLeadsResponse {
	data: MonthlyLeadsData[];
	year: string;
}

interface MonthlyLeadsChartProps {
	selectedYear?: string;
}

export default function MonthlyLeadsChart({
	selectedYear,
}: MonthlyLeadsChartProps) {
	const [leadsData, setLeadsData] = useState<MonthlyLeadsResponse | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchLeadsData();
	}, [fetchLeadsData]);

	const fetchLeadsData = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (selectedYear) params.append("year", selectedYear);

			const response = await fetch(
				`/api/analytics/leads/growth/monthly?${params}`,
			);
			const data = await response.json();
			setLeadsData(data);
		} catch (error) {
			console.error("Error fetching monthly leads data:", error);
		} finally {
			setLoading(false);
		}
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="rounded-lg border bg-white p-3 shadow-lg">
					<p className="font-medium">{label}</p>
					{payload.map((entry: any, index: number) => (
						<p key={index} style={{ color: entry.color }}>
							{entry.name}: {entry.value}
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
						<Users className="h-5 w-5" />
						Monthly Leads
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-80 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (!leadsData || leadsData.data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Monthly Leads
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p>No monthly leads data available for the selected year.</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="h-5 w-5" />
					Monthly Leads
					<Badge variant="outline" className="ml-auto">
						{leadsData.year}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={leadsData.data}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="month"
								tick={{ fontSize: 12 }}
								angle={-45}
								textAnchor="end"
								height={60}
							/>
							<YAxis tick={{ fontSize: 12 }} />
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							<Bar
								dataKey="totalLeads"
								fill="#3b82f6"
								name="Total Leads"
								radius={[2, 2, 0, 0]}
							/>
							<Bar
								dataKey="closedLeads"
								fill="#10b981"
								name="Closed Leads"
								radius={[2, 2, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}
