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
import { CheckCircle, Edit, MoreHorizontal, Phone, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { DataTableColumnHeader } from "./data-table/column-header";
import { DataTable } from "./data-table/data-table";
import { DataTablePagination } from "./data-table/pagination";
import { DataTableToolbar } from "./data-table/toolbar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
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
	isClosed: boolean | null;
	status: string | null;
	sales: number | null;
	remark: string | null;
	trainerHandle: string | null;
	closedDate: string | null;
	closedMonth: string | null;
	closedYear: string | null;
	createdAt: string;
}

export function LeadsDataTable({ data, isLoading }: { data: Lead[]; isLoading?: boolean }) {
	const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const columns: ColumnDef<Lead>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
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
				const isClosed = row.original.isClosed;

				return status ? (
					<Badge
						variant={isClosed ? "default" : "secondary"}
						className={isClosed ? "bg-green-100 text-green-800" : ""}
					>
						{status}
					</Badge>
				) : null;
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
			accessorKey: "isClosed",
			header: ({ column }) => <DataTableColumnHeader column={column} title="Closed" />,
			cell: ({ row }) => {
				const isClosed = row.getValue("isClosed") as boolean;
				return (
					<div className="flex w-[70px] items-center">
						{isClosed ? (
							<Badge variant="default" className="bg-green-100 text-green-800">
								<CheckCircle className="mr-1 h-3 w-3" />
								Closed
							</Badge>
						) : (
							<Badge variant="secondary">
								<XCircle className="mr-1 h-3 w-3" />
								Open
							</Badge>
						)}
					</div>
				);
			},
			filterFn: (row, id, value) => {
				const isClosed = row.getValue(id);
				return value.includes(String(isClosed));
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
			columnId: "isClosed",
			title: "Status",
			options: [
				{ label: "Closed", value: "true", icon: CheckCircle },
				{ label: "Open", value: "false", icon: XCircle },
			],
		},
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
