import {
	BarChart3,
	Calendar,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Copy,
	Edit,
	Phone,
	Plus,
	Trash2,
	TrendingUp,
	Users,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { CreateLeadDialog } from "@/components/create-lead-dialog";
import { EditLeadDialog } from "@/components/edit-lead-dialog";
import { type FilterState, LeadsFilters } from "@/components/leads-filters";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Lead {
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
	createdAt: string | null;
}

export default function Leads() {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
	const [loading, setLoading] = useState(true);
	const [editLead, setEditLead] = useState<Lead | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
	const [filters, setFilters] = useState<FilterState>({
		search: "",
		month: "",
		year: "",
		platform: "",
		status: "",
		trainer: "",
		isClosed: "",
		closedDate: "",
	});
	const [sortField, setSortField] = useState<string>("date");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	useEffect(() => {
		fetchLeads();
	}, []);

	useEffect(() => {
		applyFilters();
	}, [leads, filters, sortField, sortDirection]);

	const parseDate = useCallback((dateString: string) => {
		// Parse DD/MM/YYYY format
		const parts = dateString.split("/");
		if (parts.length === 3) {
			const day = Number.parseInt(parts[0], 10);
			const month = Number.parseInt(parts[1], 10) - 1; // Month is 0-indexed
			const year = Number.parseInt(parts[2], 10);
			return new Date(year, month, day);
		}
		return new Date(0);
	}, []);

	const applyFilters = useCallback(() => {
		let filtered = [...leads];

		// Search by name or phone number
		if (filters.search) {
			filtered = filtered.filter(
				(lead) =>
					lead.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
					lead.phoneNumber
						?.toLowerCase()
						.includes(filters.search.toLowerCase()),
			);
		}

		// Filter by month
		if (filters.month) {
			filtered = filtered.filter((lead) => {
				// Use the month column directly from the database
				return lead.month === filters.month;
			});
		}

		// Filter by year
		if (filters.year) {
			filtered = filtered.filter((lead) => {
				if (!lead.date) return false;
				// Parse DD/MM/YYYY format to extract year
				const parts = lead.date.split("/");
				if (parts.length === 3) {
					const year = parts[2];
					return year === filters.year;
				}
				return false;
			});
		}

		// Filter by platform
		if (filters.platform) {
			filtered = filtered.filter((lead) => lead.platform === filters.platform);
		}

		// Filter by status
		if (filters.status) {
			filtered = filtered.filter((lead) => lead.status === filters.status);
		}

		// Filter by trainer
		if (filters.trainer) {
			filtered = filtered.filter(
				(lead) => lead.trainerHandle === filters.trainer,
			);
		}

		// Filter by closed status
		if (filters.isClosed !== "") {
			const isClosed = filters.isClosed === "true";
			filtered = filtered.filter((lead) => lead.isClosed === isClosed);
		}

		// Filter by closed date
		if (filters.closedDate) {
			filtered = filtered.filter((lead) => {
				if (!lead.closedDate) return false;
				// Parse DD/MM/YYYY format from database
				const parts = lead.closedDate.split("/");
				if (parts.length === 3) {
					const leadDate = new Date(
						Number.parseInt(parts[2]),
						Number.parseInt(parts[1]) - 1,
						Number.parseInt(parts[0]),
					);
					// Parse YYYY-MM-DD format from filter input
					const filterDate = new Date(filters.closedDate);
					return leadDate.toDateString() === filterDate.toDateString();
				}
				return false;
			});
		}

		// Apply sorting
		if (sortField) {
			filtered.sort((a, b) => {
				let aValue: any;
				let bValue: any;

				switch (sortField) {
					case "name":
						aValue = a.name?.toLowerCase() || "";
						bValue = b.name?.toLowerCase() || "";
						break;
					case "date":
						// Parse DD/MM/YYYY format for proper date comparison
						aValue = a.date ? parseDate(a.date) : new Date(0);
						bValue = b.date ? parseDate(b.date) : new Date(0);
						break;
					case "sales":
						aValue = a.sales || 0;
						bValue = b.sales || 0;
						break;
					default:
						return 0;
				}

				if (sortField === "date") {
					// For dates, compare as Date objects
					const comparison = aValue.getTime() - bValue.getTime();
					return sortDirection === "asc" ? comparison : -comparison;
				}
				// For strings and numbers
				if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
				if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
				return 0;
			});
		}

		setFilteredLeads(filtered);
	}, [leads, filters, sortField, sortDirection, parseDate]);

	const fetchLeads = async () => {
		try {
			const response = await fetch("/api/analytics/leads");
			const data = await response.json();
			setLeads(data);
			setFilteredLeads(data);
		} catch (error) {
			console.error("Error fetching leads:", error);
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number | null) => {
		if (!amount) return "RM 0";
		return `RM ${amount.toLocaleString()}`;
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "N/A";

		// Database stores DD/MM/YYYY format, display as-is
		return dateString;
	};

	const getPlatformVariant = (platform: string | null) => {
		switch (platform?.toLowerCase()) {
			case "facebook":
				return "default";
			case "google":
				return "secondary";
			case "flyer":
				return "outline";
			default:
				return "secondary";
		}
	};

	const getStatusVariant = (status: string | null) => {
		if (!status || status === "N/A") return "outline";
		return "secondary";
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	const handleRowClick = (lead: Lead) => {
		setEditLead(lead);
		setIsEditDialogOpen(true);
	};

	const handleSaveLead = async (leadId: number, updates: Partial<Lead>) => {
		try {
			const response = await fetch(`/api/analytics/leads/${leadId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updates),
			});

			if (response.ok) {
				const updatedLead = await response.json();
				setLeads(
					leads.map((lead) =>
						lead.id === leadId ? { ...lead, ...updatedLead } : lead,
					),
				);
			}
		} catch (error) {
			console.error("Failed to update lead:", error);
		}
	};

	const handleCreateLead = async (leadData: any) => {
		try {
			const response = await fetch("/api/analytics/leads", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(leadData),
			});

			if (response.ok) {
				const newLead = await response.json();
				setLeads([newLead, ...leads]);
			} else {
				throw new Error("Failed to create lead");
			}
		} catch (error) {
			console.error("Failed to create lead:", error);
			throw error;
		}
	};

	const handleFiltersChange = useCallback((newFilters: FilterState) => {
		setFilters(newFilters);
	}, []);

	const handleSort = (field: string) => {
		if (sortField === field) {
			// Toggle direction if same field
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			// Set new field with ascending direction
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const handleDeleteClick = (lead: Lead) => {
		setLeadToDelete(lead);
		setDeleteConfirmOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!leadToDelete) return;

		try {
			const response = await fetch(`/api/analytics/leads/${leadToDelete.id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setLeads(leads.filter((lead) => lead.id !== leadToDelete.id));
				setDeleteConfirmOpen(false);
				setLeadToDelete(null);
			} else {
				console.error("Failed to delete lead");
			}
		} catch (error) {
			console.error("Error deleting lead:", error);
		}
	};

	return (
		<SidebarProvider>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
							{/* Filters */}
							<div className="mb-6">
								<LeadsFilters
									onFiltersChange={handleFiltersChange}
									totalResults={filteredLeads.length}
								/>
							</div>

							{/* Summary Cards */}
							<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Total Leads
										</CardTitle>
										<Users className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">
											{filteredLeads.length}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Closed Leads
										</CardTitle>
										<CheckCircle className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">
											{filteredLeads.filter((lead) => lead.isClosed).length}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Total Sales
										</CardTitle>
										<TrendingUp className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">
											{formatCurrency(
												filteredLeads.reduce(
													(sum, lead) => sum + (lead.sales || 0),
													0,
												),
											)}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Conversion Rate
										</CardTitle>
										<BarChart3 className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">
											{filteredLeads.length > 0
												? `${Math.round((filteredLeads.filter((lead) => lead.isClosed).length / filteredLeads.length) * 100)}%`
												: "0%"}
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Leads Table */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Users className="h-5 w-5" />
										All Leads
										<Badge variant="secondary" className="ml-auto">
											{filteredLeads.length} total
										</Badge>
										<Button
											onClick={() => setIsCreateDialogOpen(true)}
											size="sm"
											className="ml-2"
										>
											<Plus className="mr-1 h-4 w-4" />
											Add Lead
										</Button>
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0">
									{loading ? (
										<div className="space-y-2 p-6">
											{[...Array(5)].map((_, i) => (
												<Skeleton key={i} className="h-12 w-full" />
											))}
										</div>
									) : (
										<div className="rounded-md border">
											<Table>
												<TableHeader>
													<TableRow className="hover:bg-transparent">
														<TableHead className="w-[120px] p-0">
															<Button
																variant="ghost"
																className="h-full w-full justify-start px-4 py-3 text-left font-medium hover:bg-muted/50"
																onClick={() => handleSort("name")}
															>
																<span className="flex items-center">
																	Name
																	{sortField === "name" &&
																		(sortDirection === "asc" ? (
																			<ChevronUp className="ml-1 h-4 w-4" />
																		) : (
																			<ChevronDown className="ml-1 h-4 w-4" />
																		))}
																</span>
															</Button>
														</TableHead>
														<TableHead className="w-[140px]">Phone</TableHead>
														<TableHead className="w-[100px]">
															Platform
														</TableHead>
														<TableHead className="w-[100px]">Status</TableHead>
														<TableHead className="w-[80px] text-center">
															Closed
														</TableHead>
														<TableHead className="w-[100px] p-0">
															<Button
																variant="ghost"
																className="h-full w-full justify-end px-4 py-3 text-right font-medium hover:bg-muted/50"
																onClick={() => handleSort("sales")}
															>
																<span className="flex items-center">
																	Sales
																	{sortField === "sales" &&
																		(sortDirection === "asc" ? (
																			<ChevronUp className="ml-1 h-4 w-4" />
																		) : (
																			<ChevronDown className="ml-1 h-4 w-4" />
																		))}
																</span>
															</Button>
														</TableHead>
														<TableHead className="w-[80px]">Trainer</TableHead>
														<TableHead className="w-[100px] p-0">
															<Button
																variant="ghost"
																className="h-full w-full justify-start px-4 py-3 text-left font-medium hover:bg-muted/50"
																onClick={() => handleSort("date")}
															>
																<span className="flex items-center">
																	Date
																	{sortField === "date" &&
																		(sortDirection === "asc" ? (
																			<ChevronUp className="ml-1 h-4 w-4" />
																		) : (
																			<ChevronDown className="ml-1 h-4 w-4" />
																		))}
																</span>
															</Button>
														</TableHead>
														<TableHead className="w-[100px]">
															Closed Date
														</TableHead>
														<TableHead className="w-[100px]">Remark</TableHead>
														<TableHead className="w-[60px]" />
													</TableRow>
												</TableHeader>
												<TableBody>
													{filteredLeads.map((lead) => (
														<TableRow
															key={lead.id}
															className="group cursor-pointer hover:bg-muted/50"
															onClick={() => handleRowClick(lead)}
														>
															<TableCell className="font-medium">
																<div className="flex items-center gap-2">
																	<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 font-medium text-sm text-white">
																		{(lead.name || "N")[0].toUpperCase()}
																	</div>
																	<span className="truncate">
																		{lead.name || "N/A"}
																	</span>
																</div>
															</TableCell>
															<TableCell>
																<div className="flex items-center gap-2">
																	<Phone className="h-3 w-3 text-muted-foreground" />
																	<span className="font-mono text-sm">
																		{lead.phoneNumber || "N/A"}
																	</span>
																	{lead.phoneNumber && (
																		<Button
																			variant="ghost"
																			size="sm"
																			className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
																			onClick={(e) => {
																				e.stopPropagation();
																				copyToClipboard(lead.phoneNumber || "");
																			}}
																		>
																			<Copy className="h-3 w-3" />
																		</Button>
																	)}
																</div>
															</TableCell>
															<TableCell>
																<Badge
																	variant={getPlatformVariant(lead.platform)}
																>
																	{lead.platform || "N/A"}
																</Badge>
															</TableCell>
															<TableCell>
																<Badge variant={getStatusVariant(lead.status)}>
																	{lead.status || "N/A"}
																</Badge>
															</TableCell>
															<TableCell className="text-center">
																<div className="flex justify-center">
																	{lead.isClosed ? (
																		<div className="flex items-center gap-1">
																			<CheckCircle className="h-4 w-4 text-green-600" />
																			<span className="font-medium text-green-600 text-xs">
																				Yes
																			</span>
																		</div>
																	) : (
																		<div className="flex items-center gap-1">
																			<XCircle className="h-4 w-4 text-red-600" />
																			<span className="font-medium text-red-600 text-xs">
																				No
																			</span>
																		</div>
																	)}
																</div>
															</TableCell>
															<TableCell className="text-right font-medium">
																<span
																	className={
																		lead.sales && lead.sales > 0
																			? "text-green-600"
																			: "text-muted-foreground"
																	}
																>
																	{formatCurrency(lead.sales)}
																</span>
															</TableCell>
															<TableCell>
																<div className="max-w-[80px] truncate">
																	<span
																		className={`text-sm ${lead.trainerHandle && lead.trainerHandle !== "N/A" ? "text-foreground" : "text-muted-foreground"}`}
																	>
																		{lead.trainerHandle || "N/A"}
																	</span>
																</div>
															</TableCell>
															<TableCell>
																<div className="flex items-center gap-1">
																	<Calendar className="h-3 w-3 text-muted-foreground" />
																	<span className="text-sm">
																		{formatDate(lead.date)}
																	</span>
																</div>
															</TableCell>
															<TableCell>
																<div className="flex items-center gap-1">
																	<Calendar className="h-3 w-3 text-muted-foreground" />
																	<span className="text-sm">
																		{formatDate(lead.closedDate)}
																	</span>
																</div>
															</TableCell>

															<TableCell>
																<div className="max-w-[100px] truncate">
																	<span
																		className={`text-sm ${lead.remark && lead.remark !== "N/A" ? "text-foreground" : "text-muted-foreground"}`}
																	>
																		{lead.remark || "N/A"}
																	</span>
																</div>
															</TableCell>
															<TableCell>
																<div className="flex gap-1">
																	<Button
																		variant="ghost"
																		size="sm"
																		className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
																		onClick={(e) => {
																			e.stopPropagation();
																			handleRowClick(lead);
																		}}
																	>
																		<Edit className="h-4 w-4" />
																	</Button>
																	<Button
																		variant="ghost"
																		size="sm"
																		className="h-8 w-8 p-0 text-red-600 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-700 group-hover:opacity-100"
																		onClick={(e) => {
																			e.stopPropagation();
																			handleDeleteClick(lead);
																		}}
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</div>
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</SidebarInset>

			{/* Edit Lead Dialog */}
			<EditLeadDialog
				lead={editLead}
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				onSave={handleSaveLead}
			/>

			{/* Create Lead Dialog */}
			<CreateLeadDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onSave={handleCreateLead}
			/>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Delete Lead</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-muted-foreground text-sm">
							Are you sure you want to delete the lead for{" "}
							<span className="font-medium text-foreground">
								{leadToDelete?.name || "N/A"}
							</span>
							? This action cannot be undone.
						</p>
					</div>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => setDeleteConfirmOpen(false)}
						>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDeleteConfirm}>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</SidebarProvider>
	);
}
