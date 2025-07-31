import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	BarChart3,
	Users,
	TrendingUp,
	Calendar,
	Phone,
	CheckCircle,
	XCircle,
	Copy,
	Edit,
	Trash2,
	ChevronUp,
	ChevronDown,
	Plus,
	DollarSign,
} from "lucide-react";
import PlatformBreakdown from "@/components/platform-breakdown";
import FunnelChart from "@/components/funnel-chart";
import AdvertisingCosts from "@/components/advertising-costs";
import AdvertisingCostsManagement from "@/components/advertising-costs-management";
import { EditLeadDialog } from "@/components/edit-lead-dialog";
import { CreateLeadDialog } from "@/components/create-lead-dialog";
import { LeadsFilters, type FilterState } from "@/components/leads-filters";

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
	followUp: string | null;
	appointment: string | null;
	remark: string | null;
	trainerHandle: string | null;
	createdAt: string | null;
}

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

export default function Dashboard() {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("leads");
	const [editLead, setEditLead] = useState<Lead | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
	const [platformData, setPlatformData] =
		useState<PlatformBreakdownResponse | null>(null);
	const [availableMonths, setAvailableMonths] = useState<string[]>([]);
	const [availableYears, setAvailableYears] = useState<string[]>([]);
	const [selectedMonth, setSelectedMonth] = useState<string>("");
	const [selectedYear, setSelectedYear] = useState<string>("");
	const [filters, setFilters] = useState<FilterState>({
		search: "",
		month: "",
		year: "",
		platform: "",
		status: "",
		trainer: "",
		isClosed: "",
	});
	const [sortField, setSortField] = useState<string>("");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	useEffect(() => {
		console.log("Dashboard component mounted");
		fetchAvailableMonths();
		fetchAvailableYears();
		fetchLeads();
		if (activeTab === "analytics") {
			fetchPlatformBreakdown();
		}
	}, [activeTab]);

	useEffect(() => {
		if (activeTab === "analytics") {
			fetchPlatformBreakdown();
		}
	}, [selectedMonth, selectedYear]);

	useEffect(() => {
		applyFilters();
	}, [leads, filters, sortField, sortDirection]);

	const applyFilters = useCallback(() => {
		let filtered = [...leads];

		// Search by name
		if (filters.search) {
			filtered = filtered.filter((lead) =>
				lead.name?.toLowerCase().includes(filters.search.toLowerCase()),
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
				} else {
					// For strings and numbers
					if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
					if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
					return 0;
				}
			});
		}

		setFilteredLeads(filtered);
	}, [leads, filters, sortField, sortDirection]);

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

	const fetchAvailableMonths = async () => {
		try {
			const response = await fetch("/api/analytics/leads/months");
			const months = await response.json();
			setAvailableMonths(months);
			if (months.length > 0 && !selectedMonth) {
				setSelectedMonth(months[0]);
			}
		} catch (error) {
			console.error("Error fetching months:", error);
		}
	};

	const fetchAvailableYears = async () => {
		try {
			const response = await fetch("/api/analytics/leads/filter-options");
			const data = await response.json();
			setAvailableYears(data.years || []);
		} catch (error) {
			console.error("Error fetching years:", error);
		}
	};

	const fetchPlatformBreakdown = async () => {
		try {
			const params = new URLSearchParams();
			if (selectedMonth) params.append("month", selectedMonth);
			if (selectedYear) params.append("year", selectedYear);

			const response = await fetch(
				`/api/analytics/leads/platform-breakdown?${params}`,
			);
			const data = await response.json();
			setPlatformData(data);
		} catch (error) {
			console.error("Error fetching platform breakdown:", error);
		}
	};

	const formatCurrency = (amount: number | null) => {
		if (!amount) return "RM 0";
		return `RM ${amount.toLocaleString()}`;
	};

	const parseDate = (dateString: string) => {
		// Parse DD/MM/YYYY format
		const parts = dateString.split("/");
		if (parts.length === 3) {
			const day = parseInt(parts[0], 10);
			const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
			const year = parseInt(parts[2], 10);
			return new Date(year, month, day);
		}
		return new Date(0);
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
		<div className="flex h-screen bg-gray-50">
			{/* Sidebar */}
			<div className="w-64 bg-white shadow-sm border-r">
				<div className="p-6">
					<h2 className="text-xl font-bold text-gray-800">One Percent Stats</h2>
				</div>
				<nav className="mt-6">
					<div className="px-3">
						<Button
							variant={activeTab === "leads" ? "default" : "ghost"}
							className="w-full justify-start mb-2"
							onClick={() => setActiveTab("leads")}
						>
							<Users className="mr-2 h-4 w-4" />
							Leads
						</Button>
						<Button
							variant={activeTab === "analytics" ? "default" : "ghost"}
							className="w-full justify-start mb-2"
							onClick={() => setActiveTab("analytics")}
						>
							<BarChart3 className="mr-2 h-4 w-4" />
							Analytics
						</Button>
						<Button
							variant={activeTab === "advertising" ? "default" : "ghost"}
							className="w-full justify-start mb-2"
							onClick={() => setActiveTab("advertising")}
						>
							<DollarSign className="mr-2 h-4 w-4" />
							Advertising Costs
						</Button>
					</div>
				</nav>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto">
				<div className="p-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
						<p className="text-gray-600">
							Overview of your leads and performance
						</p>
					</div>

					{activeTab === "leads" && (
						<div>
							{/* Filters */}
							<div className="mb-6">
								<LeadsFilters
									onFiltersChange={handleFiltersChange}
									totalResults={filteredLeads.length}
								/>
							</div>

							{/* Summary Cards */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Total Leads
										</CardTitle>
										<Users className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{filteredLeads.length}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Closed Leads
										</CardTitle>
										<CheckCircle className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{filteredLeads.filter((lead) => lead.isClosed).length}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Total Sales
										</CardTitle>
										<TrendingUp className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
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
										<CardTitle className="text-sm font-medium">
											Conversion Rate
										</CardTitle>
										<BarChart3 className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
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
											<Plus className="h-4 w-4 mr-1" />
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
																className="h-full w-full justify-start px-4 py-3 font-medium hover:bg-muted/50 text-left"
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
																className="h-full w-full justify-end px-4 py-3 font-medium hover:bg-muted/50 text-right"
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
																className="h-full w-full justify-start px-4 py-3 font-medium hover:bg-muted/50 text-left"
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
														<TableHead className="w-[80px]">
															Follow Up
														</TableHead>
														<TableHead className="w-[80px]">
															Appointment
														</TableHead>
														<TableHead className="w-[100px]">Remark</TableHead>
														<TableHead className="w-[60px]"></TableHead>
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
																	<div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
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
																			className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
																			<span className="text-xs text-green-600 font-medium">
																				Yes
																			</span>
																		</div>
																	) : (
																		<div className="flex items-center gap-1">
																			<XCircle className="h-4 w-4 text-red-600" />
																			<span className="text-xs text-red-600 font-medium">
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
																<div className="max-w-[80px] truncate">
																	<span
																		className={`text-sm ${lead.followUp && lead.followUp !== "N/A" ? "text-foreground" : "text-muted-foreground"}`}
																	>
																		{lead.followUp || "N/A"}
																	</span>
																</div>
															</TableCell>
															<TableCell>
																<div className="max-w-[80px] truncate">
																	<span
																		className={`text-sm ${lead.appointment && lead.appointment !== "N/A" ? "text-foreground" : "text-muted-foreground"}`}
																	>
																		{lead.appointment || "N/A"}
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
																		className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
																		className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
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
					)}

					{activeTab === "analytics" && (
						<div className="space-y-6">
							{/* Global Month and Year Filters */}
							<div className="flex items-center gap-4 mb-6">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">Filter by month:</span>
									<select
										value={selectedMonth}
										onChange={(e) => setSelectedMonth(e.target.value)}
										className="px-3 py-2 border rounded-md text-sm bg-white"
									>
										<option value="">All months</option>
										{availableMonths.map((month) => (
											<option key={month} value={month}>
												{month}
											</option>
										))}
									</select>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">Filter by year:</span>
									<select
										value={selectedYear}
										onChange={(e) => setSelectedYear(e.target.value)}
										className="px-3 py-2 border rounded-md text-sm bg-white"
									>
										<option value="">All years</option>
										{availableYears.map((year) => (
											<option key={year} value={year}>
												{year}
											</option>
										))}
									</select>
								</div>
							</div>

							<AdvertisingCosts
								selectedMonth={selectedMonth}
								selectedYear={selectedYear}
							/>
							<PlatformBreakdown
								selectedMonth={selectedMonth}
								selectedYear={selectedYear}
							/>
							<FunnelChart
								selectedMonth={selectedMonth}
								selectedYear={selectedYear}
							/>
						</div>
					)}

					{activeTab === "advertising" && <AdvertisingCostsManagement />}
				</div>
			</div>

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
						<p className="text-sm text-muted-foreground">
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
		</div>
	);
}
