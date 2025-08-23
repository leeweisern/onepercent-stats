import { BarChart3, Plus, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Lead, LeadsDataTable } from "../components/leads-data-table";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function LeadsPage() {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [summary, setSummary] = useState({
		totalLeads: 0,
		totalClosed: 0,
		totalSales: 0,
	});

	// Fetch leads from API
	useEffect(() => {
		const loadLeads = async () => {
			setIsLoading(true);
			try {
				// Fetch leads
				const leadsResponse = await fetch("/api/analytics/leads");
				if (!leadsResponse.ok) throw new Error("Failed to fetch leads");
				const leadsData = await leadsResponse.json();

				// Fetch summary
				const summaryResponse = await fetch("/api/analytics/leads/summary");
				if (!summaryResponse.ok) throw new Error("Failed to fetch summary");
				const summaryData = await summaryResponse.json();

				setLeads(leadsData);
				setSummary(summaryData);
			} catch (error) {
				console.error("Error loading leads:", error);
				toast.error("Failed to load leads. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		loadLeads();
	}, []);

	// Calculate statistics from summary
	const conversionRate =
		summary.totalLeads > 0 ? Math.round((summary.totalClosed / summary.totalLeads) * 100) : 0;

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Leads</h1>
					<p className="text-muted-foreground">Manage your leads and track conversions</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add Lead
				</Button>
			</div>

			{/* Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Leads</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{summary.totalLeads}</div>
						<p className="text-xs text-muted-foreground">Active leads in pipeline</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Closed Leads</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{summary.totalClosed}</div>
						<p className="text-xs text-muted-foreground">Successfully converted</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Sales</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							RM {(summary.totalSales || 0).toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">Revenue from closed leads</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{conversionRate}%</div>
						<p className="text-xs text-muted-foreground">Leads to customers</p>
					</CardContent>
				</Card>
			</div>

			{/* Data Table */}
			<Card>
				<CardHeader>
					<CardTitle>All Leads</CardTitle>
					<CardDescription>
						A comprehensive list of all leads with advanced filtering and sorting capabilities.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<LeadsDataTable data={leads} isLoading={isLoading} />
				</CardContent>
			</Card>
		</div>
	);
}
