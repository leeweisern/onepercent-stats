import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, Users, DollarSign } from "lucide-react";

interface FunnelStage {
	status: string;
	count: number;
	totalSales: number;
	platforms: Record<string, { count: number; totalSales: number }>;
}

interface FunnelData {
	funnel: FunnelStage[];
	month: string;
	platform: string;
}

interface FunnelChartProps {
	selectedMonth?: string;
	selectedPlatform?: string;
}

export default function FunnelChart({
	selectedMonth,
	selectedPlatform,
}: FunnelChartProps) {
	const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
	const [loading, setLoading] = useState(true);
	const [currentPlatform, setCurrentPlatform] = useState<string>(
		selectedPlatform || "",
	);

	useEffect(() => {
		fetchFunnelData();
	}, [selectedMonth, currentPlatform]);

	const fetchFunnelData = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (selectedMonth) params.append("month", selectedMonth);
			if (currentPlatform) params.append("platform", currentPlatform);

			const response = await fetch(`/api/analytics/leads/funnel?${params}`);
			const data = await response.json();
			setFunnelData(data);
		} catch (error) {
			console.error("Error fetching funnel data:", error);
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return `RM ${amount.toLocaleString()}`;
	};

	const getStageColor = (status: string, index: number) => {
		const colors = [
			"bg-blue-500",
			"bg-yellow-500",
			"bg-green-500",
			"bg-purple-500",
			"bg-red-500",
		];
		return colors[index % colors.length];
	};

	const getStageWidth = (count: number, maxCount: number) => {
		if (maxCount === 0) return 100;
		return Math.max((count / maxCount) * 100, 10); // Minimum 10% width for visibility
	};

	const platforms = ["FB", "IG", "google"];

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
						{[...Array(3)].map((_, i) => (
							<Skeleton key={i} className="h-16 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!funnelData) return null;

	const maxCount = Math.max(...funnelData.funnel.map((stage) => stage.count));
	const totalLeads = funnelData.funnel.reduce(
		(sum, stage) => sum + stage.count,
		0,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingDown className="h-5 w-5" />
					Sales Funnel
					<Badge variant="outline" className="ml-auto">
						{funnelData.month} • {funnelData.platform}
					</Badge>
				</CardTitle>
				<div className="flex gap-2 flex-wrap">
					<select
						value={currentPlatform}
						onChange={(e) => setCurrentPlatform(e.target.value)}
						className="px-3 py-1 border rounded-md text-sm"
					>
						<option value="">All platforms</option>
						{platforms.map((platform) => (
							<option key={platform} value={platform}>
								{platform}
							</option>
						))}
					</select>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{funnelData.funnel.map((stage, index) => {
						const width = getStageWidth(stage.count, maxCount);
						const conversionRate =
							totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0;

						return (
							<div key={stage.status} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Badge variant="outline">{stage.status}</Badge>
										<span className="text-sm text-muted-foreground">
											{conversionRate.toFixed(1)}% of total
										</span>
									</div>
									<div className="flex items-center gap-4 text-sm">
										<div className="flex items-center gap-1">
											<Users className="h-4 w-4 text-muted-foreground" />
											<span className="font-medium">{stage.count}</span>
										</div>
										<div className="flex items-center gap-1">
											<DollarSign className="h-4 w-4 text-muted-foreground" />
											<span className="font-medium">
												{formatCurrency(stage.totalSales)}
											</span>
										</div>
									</div>
								</div>

								<div className="relative">
									<div className="w-full bg-gray-200 rounded-lg h-12 flex items-center">
										<div
											className={`${getStageColor(stage.status, index)} rounded-lg h-full flex items-center justify-center text-white font-medium transition-all duration-300`}
											style={{ width: `${width}%` }}
										>
											<span className="text-sm">{stage.count} leads</span>
										</div>
									</div>
								</div>

								{/* Platform breakdown */}
								{!currentPlatform &&
									Object.keys(stage.platforms).length > 1 && (
										<div className="ml-4 space-y-1">
											{Object.entries(stage.platforms).map(
												([platform, data]) => (
													<div
														key={platform}
														className="flex items-center justify-between text-xs text-muted-foreground"
													>
														<span>
															{platform}: {data.count} leads
														</span>
														<span>{formatCurrency(data.totalSales)}</span>
													</div>
												),
											)}
										</div>
									)}
							</div>
						);
					})}
				</div>

				{funnelData.funnel.length === 0 && (
					<div className="text-center py-8 text-muted-foreground">
						<TrendingDown className="mx-auto h-12 w-12 mb-4 opacity-50" />
						<p>No funnel data available for the selected filters.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
