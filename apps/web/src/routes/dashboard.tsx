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
	Eye,
} from "lucide-react";

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

export default function Dashboard() {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("leads");
	const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	useEffect(() => {
		fetchLeads();
	}, []);

	const fetchLeads = async () => {
		try {
			const response = await fetch("/api/analytics/leads");
			const data = await response.json();
			setLeads(data);
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
		return new Date(dateString).toLocaleDateString();
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
		setSelectedLead(lead);
		setIsDialogOpen(true);
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
							variant={activeTab === "reports" ? "default" : "ghost"}
							className="w-full justify-start mb-2"
							onClick={() => setActiveTab("reports")}
						>
							<TrendingUp className="mr-2 h-4 w-4" />
							Reports
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
										<div className="text-2xl font-bold">{leads.length}</div>
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
											{leads.filter((lead) => lead.isClosed).length}
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
												leads.reduce((sum, lead) => sum + (lead.sales || 0), 0),
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
											{leads.length > 0
												? `${Math.round((leads.filter((lead) => lead.isClosed).length / leads.length) * 100)}%`
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
											{leads.length} total
										</Badge>
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
														<TableHead className="w-[120px]">Name</TableHead>
														<TableHead className="w-[140px]">Phone</TableHead>
														<TableHead className="w-[100px]">
															Platform
														</TableHead>
														<TableHead className="w-[100px]">Status</TableHead>
														<TableHead className="w-[80px] text-center">
															Closed
														</TableHead>
														<TableHead className="w-[100px] text-right">
															Sales
														</TableHead>
														<TableHead className="w-[80px]">Trainer</TableHead>
														<TableHead className="w-[100px]">Date</TableHead>
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
													{leads.map((lead) => (
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
																<Button
																	variant="ghost"
																	size="sm"
																	className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleRowClick(lead);
																	}}
																>
																	<Eye className="h-4 w-4" />
																</Button>
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
						<div className="text-center py-12">
							<BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Analytics Coming Soon
							</h3>
							<p className="text-gray-600">
								Advanced analytics and insights will be available here.
							</p>
						</div>
					)}

					{activeTab === "reports" && (
						<div className="text-center py-12">
							<TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Reports Coming Soon
							</h3>
							<p className="text-gray-600">
								Detailed reports and exports will be available here.
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Lead Details Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
								{(selectedLead?.name || "N")[0].toUpperCase()}
							</div>
							Lead Details - {selectedLead?.name || "N/A"}
						</DialogTitle>
					</DialogHeader>
					{selectedLead && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Name
									</label>
									<p className="text-sm font-medium">
										{selectedLead.name || "N/A"}
									</p>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Phone Number
									</label>
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<p className="text-sm font-mono">
											{selectedLead.phoneNumber || "N/A"}
										</p>
										{selectedLead.phoneNumber && (
											<Button
												variant="ghost"
												size="sm"
												className="h-6 w-6 p-0"
												onClick={() =>
													copyToClipboard(selectedLead.phoneNumber || "")
												}
											>
												<Copy className="h-3 w-3" />
											</Button>
										)}
									</div>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Platform
									</label>
									<Badge variant={getPlatformVariant(selectedLead.platform)}>
										{selectedLead.platform || "N/A"}
									</Badge>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Status
									</label>
									<Badge variant={getStatusVariant(selectedLead.status)}>
										{selectedLead.status || "N/A"}
									</Badge>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Closed
									</label>
									<div className="flex items-center gap-2">
										{selectedLead.isClosed ? (
											<>
												<CheckCircle className="h-4 w-4 text-green-600" />
												<span className="text-sm text-green-600 font-medium">
													Yes
												</span>
											</>
										) : (
											<>
												<XCircle className="h-4 w-4 text-red-600" />
												<span className="text-sm text-red-600 font-medium">
													No
												</span>
											</>
										)}
									</div>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Sales
									</label>
									<p
										className={`text-sm font-medium ${selectedLead.sales && selectedLead.sales > 0 ? "text-green-600" : "text-muted-foreground"}`}
									>
										{formatCurrency(selectedLead.sales)}
									</p>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Trainer
									</label>
									<div className="flex items-center gap-2">
										{selectedLead.trainerHandle ? (
											<>
												<div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
													<span className="text-xs font-medium text-orange-600">
														{selectedLead.trainerHandle[0].toUpperCase()}
													</span>
												</div>
												<p className="text-sm">{selectedLead.trainerHandle}</p>
											</>
										) : (
											<p className="text-sm text-muted-foreground">N/A</p>
										)}
									</div>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Date
									</label>
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<p className="text-sm">{formatDate(selectedLead.date)}</p>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Follow Up
									</label>
									<p
										className={`text-sm ${selectedLead.followUp && selectedLead.followUp !== "N/A" ? "text-foreground" : "text-muted-foreground"}`}
									>
										{selectedLead.followUp || "N/A"}
									</p>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Appointment
									</label>
									<p
										className={`text-sm ${selectedLead.appointment && selectedLead.appointment !== "N/A" ? "text-foreground" : "text-muted-foreground"}`}
									>
										{selectedLead.appointment || "N/A"}
									</p>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Remark
									</label>
									<p
										className={`text-sm ${selectedLead.remark && selectedLead.remark !== "N/A" ? "text-foreground" : "text-muted-foreground"}`}
									>
										{selectedLead.remark || "N/A"}
									</p>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
