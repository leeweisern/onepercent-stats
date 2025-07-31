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

// Helper function to format month display
const formatMonthDisplay = (monthString: string) => {
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
	const monthIndex = parseInt(month) - 1;
	const monthName = monthNames[monthIndex] || month;
	return `${monthName} ${year}`;
};

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

interface PlatformBreakdownProps {
	selectedMonth?: string;
}

export default function PlatformBreakdown({
	selectedMonth,
}: PlatformBreakdownProps) {
	const [data, setData] = useState<PlatformBreakdownResponse | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchBreakdown();
	}, [selectedMonth]);

	const fetchBreakdown = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (selectedMonth) params.append("month", selectedMonth);

			const response = await fetch(
				`/api/analytics/leads/platform-breakdown?${params}`,
			);
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
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BarChart3 className="h-5 w-5" />
					Platform Breakdown - {formatMonthDisplay(data?.month || "All months")}
					{data && (
						<Badge variant="secondary" className="ml-auto">
							Total Sales: {formatCurrency(data.totals.totalSales)}
						</Badge>
					)}
				</CardTitle>{" "}
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
	);
}
