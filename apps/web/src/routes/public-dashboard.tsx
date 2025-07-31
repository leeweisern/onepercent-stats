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
import { Skeleton } from "@/components/ui/skeleton";
import {
	BarChart3,
	Users,
	TrendingUp,
	Calendar,
	Phone,
	CheckCircle,
	XCircle,
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

export default function PublicDashboard() {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("leads");

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
		if (!amount) return "RM0";
		return `RM${amount.toLocaleString()}`;
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString();
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
									<CardTitle>All Leads</CardTitle>
								</CardHeader>
								<CardContent>
									{loading ? (
										<div className="space-y-2">
											{[...Array(5)].map((_, i) => (
												<Skeleton key={i} className="h-12 w-full" />
											))}
										</div>
									) : (
										<div className="overflow-x-auto">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Name</TableHead>
														<TableHead>Phone</TableHead>
														<TableHead>Platform</TableHead>
														<TableHead>Status</TableHead>
														<TableHead>Closed</TableHead>
														<TableHead>Sales</TableHead>
														<TableHead>Trainer</TableHead>
														<TableHead>Date</TableHead>
														<TableHead>Follow Up</TableHead>
														<TableHead>Appointment</TableHead>
														<TableHead>Remark</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{leads.map((lead) => (
														<TableRow key={lead.id}>
															<TableCell className="font-medium">
																{lead.name || "N/A"}
															</TableCell>
															<TableCell>
																<div className="flex items-center">
																	<Phone className="mr-1 h-3 w-3" />
																	{lead.phoneNumber || "N/A"}
																</div>
															</TableCell>
															<TableCell>
																<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
																	{lead.platform || "N/A"}
																</span>
															</TableCell>
															<TableCell>
																<span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
																	{lead.status || "N/A"}
																</span>
															</TableCell>
															<TableCell>
																{lead.isClosed ? (
																	<CheckCircle className="h-4 w-4 text-green-600" />
																) : (
																	<XCircle className="h-4 w-4 text-red-600" />
																)}
															</TableCell>
															<TableCell className="font-medium">
																{formatCurrency(lead.sales)}
															</TableCell>
															<TableCell>
																{lead.trainerHandle || "N/A"}
															</TableCell>
															<TableCell>{formatDate(lead.date)}</TableCell>
															<TableCell>{lead.followUp || "N/A"}</TableCell>
															<TableCell>{lead.appointment || "N/A"}</TableCell>
															<TableCell className="max-w-xs truncate">
																{lead.remark || "N/A"}
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
		</div>
	);
}
