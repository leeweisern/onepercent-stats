import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type OnChangeFn,
	type Table as ReactTable,
	type RowSelectionState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import { cn } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface DataTableProps<TData, TValue> {
	table?: ReactTable<TData>;
	columns?: ColumnDef<TData, TValue>[];
	data?: TData[];
	state?: {
		sorting?: SortingState;
		columnFilters?: ColumnFiltersState;
		columnVisibility?: VisibilityState;
		rowSelection?: RowSelectionState;
	};
	onSortingChange?: OnChangeFn<SortingState>;
	onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
	onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
	onRowSelectionChange?: OnChangeFn<RowSelectionState>;
	isLoading?: boolean;
	className?: string;
}

export function DataTable<TData, TValue>({
	table: externalTable,
	columns,
	data,
	state,
	onSortingChange,
	onColumnFiltersChange,
	onColumnVisibilityChange,
	onRowSelectionChange,
	isLoading = false,
	className,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>(state?.sorting || []);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		state?.columnFilters || [],
	);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
		state?.columnVisibility || {},
	);
	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
		state?.rowSelection || {},
	);

	const internalTable = useReactTable({
		data: data || [],
		columns: columns || [],
		onSortingChange: onSortingChange || setSorting,
		onColumnFiltersChange: onColumnFiltersChange || setColumnFilters,
		onColumnVisibilityChange: onColumnVisibilityChange || setColumnVisibility,
		onRowSelectionChange: onRowSelectionChange || setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting: state?.sorting || sorting,
			columnFilters: state?.columnFilters || columnFilters,
			columnVisibility: state?.columnVisibility || columnVisibility,
			rowSelection: state?.rowSelection || rowSelection,
		},
	});

	const table = externalTable || internalTable;

	return (
		<div className={cn("space-y-4", className)}>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							// Loading skeleton rows
							Array.from({ length: 5 }).map((_, index) => (
								<TableRow key={`loading-${index}`}>
									{table.getAllColumns().map((_, colIndex) => (
										<TableCell key={`loading-cell-${colIndex}`}>
											<Skeleton className="h-4 w-[100px]" />
										</TableCell>
									))}
								</TableRow>
							))
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => {
								const status = (row.original as any)?.status;
								const isClosedWon = status === "Closed Won";
								return (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										className={isClosedWon ? "bg-green-50/50 hover:bg-green-50/80" : ""}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

export { type Table, useReactTable } from "@tanstack/react-table";
