import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Calendar, BarChart3 } from "lucide-react";

interface PlatformBreakdownData {
	platform: string | null;
	totalLeads: number;
	closedLeads: number;
	notClosedLeads: number;
	totalSales: number;
}

interface PlatformBreakdownResponse {
	breakdown: PlatformBreakdownData[];
	totals: {
		totalLeads: number;
		closedLeads: number;
		notClosedLeads: number;
		totalSales: number;
	};
	month: string;
}

export default function PlatformBreakdown() {
	const [data, setData] = useState<PlatformBreakdownResponse | null>(null);
	const [months, setMonths] = useState<string[]>([]);
	const [selectedMonth, setSelectedMonth] = useState<string>("All months");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchMonths();
	}, []);

	useEffect(() => {
		fetchBreakdown();
	}, [selectedMonth]);

	const fetchMonths = async () => {
		try {
			const response = await fetch("/api/analytics/leads/months");
			const monthsData = await response.json();
			setMonths(monthsData);
		} catch (error) {
			console.error("Error fetching months:", error);
		}
	};

	const fetchBreakdown = async () => {
		setLoading(true);
		try {
			const url =
				selectedMonth === "All months"
					? "/api/analytics/leads/platform-breakdown"
					: `/api/analytics/leads/platform-breakdown?month=${encodeURIComponent(selectedMonth)}`;

			const response = await fetch(url);
			const breakdownData = await response.json();
			setData(breakdownData);
		} catch (error) {
			console.error("Error fetching platform breakdown:", error);
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return `RM${amount.toLocaleString()}`;
	};

	const getPlatformVariant = (platform: string | null) => {
		switch (platform?.toLowerCase()) {
			case "facebook":
			case "fb":
				return "default";
			case "google":
				return "secondary";
			case "instagram":
			case "ig":
				return "outline";
			default:
				return "secondary";
		}
	};

	return (
		<div className="space-y-6">
			{/* Month Filter */}
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<Calendar className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium">Filter by month:</span>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="min-w-[150px] justify-between">
							{selectedMonth}
							<ChevronDown className="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="min-w-[150px]">
						<DropdownMenuItem onClick={() => setSelectedMonth("All months")}>
							All months
						</DropdownMenuItem>
						{months.map((month) => (
							<DropdownMenuItem
								key={month}
								onClick={() => setSelectedMonth(month)}
							>
								{month}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Platform Breakdown Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Platform Breakdown - {data?.month || selectedMonth}
						{data && (
							<Badge variant="secondary" className="ml-auto">
								Total Sales: {formatCurrency(data.totals.totalSales)}
							</Badge>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{loading ? (
						<div className="space-y-2 p-6">
							{[...Array(4)].map((_, i) => (
								<Skeleton key={i} className="h-12 w-full" />
							))}
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow className="hover:bg-transparent bg-muted/50">
										<TableHead className="font-semibold">Platform</TableHead>
										<TableHead className="text-center font-semibold">
											Close
										</TableHead>
										<TableHead className="text-center font-semibold">
											No Close
										</TableHead>
										<TableHead className="text-right font-semibold">
											Total Sales
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data?.breakdown.map((row, index) => (
										<TableRow key={index} className="hover:bg-muted/30">
											<TableCell className="font-medium">
												<div className="flex items-center gap-2">
													<Badge variant={getPlatformVariant(row.platform)}>
														{row.platform?.toUpperCase() || "N/A"}
													</Badge>
													<span className="text-muted-foreground">
														({row.totalLeads})
													</span>
												</div>
											</TableCell>
											<TableCell className="text-center font-medium">
												{row.closedLeads}
											</TableCell>
											<TableCell className="text-center font-medium">
												{row.notClosedLeads}
											</TableCell>
											<TableCell className="text-right font-medium text-green-600">
												{formatCurrency(row.totalSales)}
											</TableCell>
										</TableRow>
									))}
									{data && (
										<TableRow className="bg-muted/50 font-semibold hover:bg-muted/50">
											<TableCell className="font-bold">
												<div className="flex items-center gap-2">
													<span>Total</span>
													<span className="text-muted-foreground">
														({data.totals.totalLeads})
													</span>
												</div>
											</TableCell>
											<TableCell className="text-center font-bold">
												{data.totals.closedLeads}
											</TableCell>
											<TableCell className="text-center font-bold">
												{data.totals.notClosedLeads}
											</TableCell>
											<TableCell className="text-right font-bold text-green-600">
												{formatCurrency(data.totals.totalSales)}
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
