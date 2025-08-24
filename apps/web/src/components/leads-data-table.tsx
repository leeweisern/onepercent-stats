import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type RowSelectionState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Edit, MoreHorizontal, Phone, Trash2 } from "lucide-react";
import { useState } from "react";
import { DataTableColumnHeader } from "./data-table/column-header";
import { DataTable } from "./data-table/data-table";
import { DataTablePagination } from "./data-table/pagination";
import { DataTableToolbar } from "./data-table/toolbar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export interface Lead {
	id: number;
	month: string | null;
	date: string | null;
	name: string | null;
	phoneNumber: string | null;
	platform: string | null;
	status: string | null;
	sales: number | null;
	remark: string | null;
	trainerHandle: string | null;
	closedDate: string | null;
	closedMonth: string | null;
	closedYear: string | null;
	nextFollowUpDate: string | null;
	lastActivityDate: string | null;
	createdAt: string;
}

export function LeadsDataTable({ data, isLoading }: { data: Lead[]; isLoading?: boolean }) {
	const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const columns: ColumnDef<Lead>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
		},
		{
			accessorKey: "phoneNumber",
			header: "Phone",
			cell: ({ row }) => {
				const phone = row.getValue("phoneNumber") as string;
				return phone ? (
					<div className="flex items-center gap-2">
						<Phone className="h-4 w-4 text-muted-foreground" />
						<span className="font-mono text-sm">{phone}</span>
					</div>
				) : null;
			},
		},
		{
			accessorKey: "platform",
			header: ({ column }) => <DataTableColumnHeader column={column} title="Platform" />,
			cell: ({ row }) => {
				const platform = row.getValue("platform") as string;
				return platform ? <Badge variant="outline">{platform}</Badge> : null;
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "status",
			header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				if (!status) return null;

				// Status color mapping
				const getStatusBadgeProps = (status: string) => {
					switch (status) {
						case "New":
							return { variant: "secondary" as const, className: "bg-gray-100 text-gray-800" };
						case "Contacted":
							return { variant: "secondary" as const, className: "bg-blue-100 text-blue-800" };
						case "Follow Up":
							return { variant: "secondary" as const, className: "bg-orange-100 text-orange-800" };
						case "Consulted":
							return { variant: "secondary" as const, className: "bg-purple-100 text-purple-800" };
						case "Closed Won":
							return { variant: "default" as const, className: "bg-green-100 text-green-800" };
						case "Closed Lost":
							return { variant: "destructive" as const, className: "bg-red-100 text-red-800" };
						default:
							return { variant: "outline" as const };
					}
				};

				const badgeProps = getStatusBadgeProps(status);
				return <Badge {...badgeProps}>{status}</Badge>;
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "sales",
			header: ({ column }) => <DataTableColumnHeader column={column} title="Sales" />,
			cell: ({ row }) => {
				const sales = row.getValue("sales") as number;
				return sales ? <div className="font-medium">RM {sales.toLocaleString()}</div> : null;
			},
		},
		{
			accessorKey: "date",
			header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
			cell: ({ row }) => {
				const date = row.getValue("date") as string;
				return date ? <div className="text-sm text-muted-foreground">{date}</div> : null;
			},
		},
		{
			accessorKey: "nextFollowUpDate",
			header: ({ column }) => <DataTableColumnHeader column={column} title="Next Follow-up" />,
			cell: ({ row }) => {
				const date = row.getValue("nextFollowUpDate") as string;
				if (!date) return null;

				// Check if date is overdue
				const followUpDate = new Date(date);
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				followUpDate.setHours(0, 0, 0, 0);
				const isOverdue = followUpDate < today;

				return (
					<div
						className={`text-sm ${isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}
					>
						{date}
						{isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
					</div>
				);
			},
		},
		{
			accessorKey: "lastActivityDate",
			header: ({ column }) => <DataTableColumnHeader column={column} title="Last Activity" />,
			cell: ({ row }) => {
				const date = row.getValue("lastActivityDate") as string;
				return date ? <div className="text-sm text-muted-foreground">{date}</div> : null;
			},
		},
		{
			accessorKey: "trainerHandle",
			header: ({ column }) => <DataTableColumnHeader column={column} title="Trainer" />,
			cell: ({ row }) => {
				const trainer = row.getValue("trainerHandle") as string;
				return trainer ? <Badge variant="outline">{trainer}</Badge> : null;
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>
								<Edit className="mr-2 h-4 w-4" />
								Edit lead
							</DropdownMenuItem>
							<DropdownMenuItem className="text-destructive">
								<Trash2 className="mr-2 h-4 w-4" />
								Delete lead
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		globalFilterFn: (row, _columnId, filterValue) => {
			const searchValue = filterValue.toLowerCase();
			const name = String(row.getValue("name") || "").toLowerCase();
			const phone = String(row.getValue("phoneNumber") || "").toLowerCase();
			return name.includes(searchValue) || phone.includes(searchValue);
		},
		initialState: {
			pagination: {
				pageSize: 20,
			},
			sorting: [{ id: "date", desc: true }],
		},
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	// Get unique values for filters
	const platforms = Array.from(new Set(data.map((lead) => lead.platform).filter(Boolean))).sort();
	const statuses = Array.from(new Set(data.map((lead) => lead.status).filter(Boolean))).sort();
	const trainers = Array.from(
		new Set(data.map((lead) => lead.trainerHandle).filter(Boolean)),
	).sort();

	const filterOptions = [
		{
			columnId: "platform",
			title: "Platform",
			options: platforms.map((platform) => ({
				label: platform,
				value: platform,
			})),
		},
		{
			columnId: "status",
			title: "Lead Status",
			options: statuses.map((status) => ({
				label: status,
				value: status,
			})),
		},
		...(trainers.length > 0
			? [
					{
						columnId: "trainerHandle",
						title: "Trainer",
						options: trainers.map((trainer) => ({
							label: trainer,
							value: trainer,
						})),
					},
				]
			: []),
	];

	return (
		<div className="w-full space-y-4">
			<DataTableToolbar
				table={table}
				searchPlaceholder="Search by name or phone..."
				filters={filterOptions}
			/>
			<DataTable table={table} isLoading={isLoading} />
			<DataTablePagination table={table} />
		</div>
	);
}
