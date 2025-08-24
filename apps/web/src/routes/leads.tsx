import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateLeadDialog } from "../components/create-lead-dialog";
import { type Lead, LeadsDataTable } from "../components/leads-data-table";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function LeadsPage() {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	// Fetch leads from API
	useEffect(() => {
		const loadLeads = async () => {
			setIsLoading(true);
			try {
				// Fetch leads
				const leadsResponse = await fetch("/api/analytics/leads");
				if (!leadsResponse.ok) throw new Error("Failed to fetch leads");
				const leadsData = await leadsResponse.json();

				setLeads(leadsData);
			} catch (error) {
				console.error("Error loading leads:", error);
				toast.error("Failed to load leads. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		loadLeads();
	}, []);

	// Refresh data function
	const refreshData = async () => {
		try {
			const leadsResponse = await fetch("/api/analytics/leads");

			if (leadsResponse.ok) {
				const leadsData = await leadsResponse.json();
				setLeads(leadsData);
			}
		} catch (error) {
			console.error("Error refreshing data:", error);
		}
	};

	// Handle creating a new lead
	const handleCreateLead = async (leadData: any) => {
		try {
			const response = await fetch("/api/analytics/leads", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(leadData),
			});

			if (!response.ok) {
				throw new Error("Failed to create lead");
			}

			// Refresh data after creation
			await refreshData();

			toast.success("Lead created successfully!");
		} catch (error) {
			console.error("Error creating lead:", error);
			throw error; // Re-throw to let the dialog handle the error display
		}
	};

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Leads</h1>
					<p className="text-muted-foreground">Manage your leads and track conversions</p>
				</div>
				<Button onClick={() => setIsCreateDialogOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Lead
				</Button>
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
					<LeadsDataTable data={leads} isLoading={isLoading} onLeadUpdate={refreshData} />
				</CardContent>
			</Card>

			{/* Create Lead Dialog */}
			<CreateLeadDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onSave={handleCreateLead}
			/>
		</div>
	);
}
