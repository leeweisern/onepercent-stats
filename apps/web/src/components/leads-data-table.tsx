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
	const [sorting, setSorting] = useState<SortingState>([]);
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
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	return (
		<div className="space-y-4">
			<DataTableToolbar table={table} searchKey="name" searchPlaceholder="Filter by name..." />
			<DataTable
				columns={columns}
				data={data}
				state={{
					sorting,
					columnFilters,
					columnVisibility,
					rowSelection,
				}}
				onSortingChange={setSorting}
				onColumnFiltersChange={setColumnFilters}
				onColumnVisibilityChange={setColumnVisibility}
				onRowSelectionChange={setRowSelection}
				isLoading={isLoading}
			/>
			<DataTablePagination table={table} />
		</div>
	);
}
