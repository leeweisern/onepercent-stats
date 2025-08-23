import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { BarChart3 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableColumnHeader } from "./data-table/column-header";
import { DataTable } from "./data-table/data-table";
import { DataTablePagination } from "./data-table/pagination";

// Helper function to format month display
const _formatMonthDisplay = (monthString: string) => {
	if (monthString === "All months" || !monthString) return monthString || "All months";

	// If it's already a month name (like "May"), return it as is
	if (monthString.includes("-")) {
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
	}

	// If it's just a month name, return it as is
	return monthString;
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
	year: string;
}

interface PlatformBreakdownProps {
	selectedMonth?: string;
	selectedYear?: string;
}

export default function PlatformBreakdown({ selectedMonth, selectedYear }: PlatformBreakdownProps) {
	const [data, setData] = useState<PlatformBreakdownResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [sorting, setSorting] = useState<SortingState>([]);

	const fetchBreakdown = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (selectedMonth) params.append("month", selectedMonth);
			if (selectedYear) params.append("year", selectedYear);

			const response = await fetch(`/api/analytics/leads/platform-breakdown?${params}`);
			const breakdownData = await response.json();
			setData(breakdownData);
		} catch (error) {
			console.error("Error fetching platform breakdown:", error);
		} finally {
			setLoading(false);
		}
	}, [selectedMonth, selectedYear]);

	useEffect(() => {
		fetchBreakdown();
	}, [fetchBreakdown]);

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

	// Define table columns
	const columns: ColumnDef<PlatformBreakdownData>[] = [
		{
			accessorKey: "platform",
			header: ({ column }) => <DataTableColumnHeader column={column} title="Platform" />,
			cell: ({ row }) => {
				const platform = row.original.platform;
				return (
					<div className="flex items-center gap-2">
						<Badge variant={getPlatformVariant(platform)}>{platform?.toUpperCase() || "N/A"}</Badge>
						<span className="text-muted-foreground">({row.original.totalLeads})</span>
					</div>
				);
			},
		},
		{
			accessorKey: "closedLeads",
			header: ({ column }) => <DataTableColumnHeader column={column} title="Close" />,
			cell: ({ row }) => <div className="text-center font-medium">{row.original.closedLeads}</div>,
		},
		{
			accessorKey: "notClosedLeads",
			header: ({ column }) => <DataTableColumnHeader column={column} title="No Close" />,
			cell: ({ row }) => (
				<div className="text-center font-medium">{row.original.notClosedLeads}</div>
			),
		},
		{
			accessorKey: "totalSales",
			header: ({ column }) => <DataTableColumnHeader column={column} title="Total Sales" />,
			cell: ({ row }) => (
				<div className="text-right font-medium text-green-600">
					{formatCurrency(row.original.totalSales)}
				</div>
			),
		},
	];

	const table = useReactTable({
		data: data?.breakdown || [],
		columns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BarChart3 className="h-5 w-5" />
					Platform Breakdown - {data?.month || "All months"}
					{data?.year && data.year !== "All years" ? ` ${data.year}` : ""}
					{data && (
						<Badge variant="secondary" className="ml-auto">
							Total Sales: {formatCurrency(data.totals.totalSales)}
						</Badge>
					)}
				</CardTitle>{" "}
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<DataTable
						columns={columns}
						data={data?.breakdown || []}
						state={{ sorting }}
						onSortingChange={setSorting}
						isLoading={loading}
					/>
					{data?.breakdown && data.breakdown.length > 0 && <DataTablePagination table={table} />}
				</div>

				{/* Totals Row */}
				{data && !loading && (
					<div className="mt-4 rounded-md border bg-muted/25 p-4">
						<div className="grid grid-cols-4 gap-4">
							<div className="font-bold">
								<span>Total</span>
								<span className="text-muted-foreground ml-2">({data.totals.totalLeads})</span>
							</div>
							<div className="text-center font-bold">{data.totals.closedLeads}</div>
							<div className="text-center font-bold">{data.totals.notClosedLeads}</div>
							<div className="text-right font-bold text-green-600">
								{formatCurrency(data.totals.totalSales)}
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
