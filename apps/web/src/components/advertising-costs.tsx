import { DollarSign } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AdvertisingCost {
	id: number;
	month: number;
	year: number;
	cost: number;
	currency: string;
	createdAt: string;
	updatedAt: string;
}

interface AdvertisingCostsProps {
	selectedMonth?: string;
	selectedYear?: string;
}

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

const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export default function AdvertisingCosts({ selectedMonth, selectedYear }: AdvertisingCostsProps) {
	const _skeletonId = useId();
	const [costs, setCosts] = useState<AdvertisingCost[]>([]);
	const [_leads, setLeads] = useState<Lead[]>([]);
	const [loading, setLoading] = useState(true);
	const [totalCost, setTotalCost] = useState(0);
	const [totalLeads, setTotalLeads] = useState(0);
	const [costPerLead, setCostPerLead] = useState(0);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			// Fetch advertising costs and leads in parallel
			const [costsResponse, leadsResponse] = await Promise.all([
				fetch("/api/analytics/advertising-costs"),
				fetch("/api/analytics/leads"),
			]);

			const costsData = await costsResponse.json();
			const leadsData = await leadsResponse.json();

			setCosts(costsData);
			setLeads(leadsData);

			// Filter costs
			let filteredCosts = [...costsData];
			if (selectedMonth && selectedMonth !== "") {
				const monthIndex = monthNames.indexOf(selectedMonth) + 1;
				if (monthIndex > 0) {
					filteredCosts = filteredCosts.filter((cost) => cost.month === monthIndex);
				}
			}
			if (selectedYear && selectedYear !== "") {
				const year = Number.parseInt(selectedYear, 10);
				filteredCosts = filteredCosts.filter((cost) => cost.year === year);
			}

			// Filter leads
			let filteredLeads = [...leadsData];
			if (selectedMonth && selectedMonth !== "") {
				filteredLeads = filteredLeads.filter((lead) => lead.month === selectedMonth);
			}
			if (selectedYear && selectedYear !== "") {
				filteredLeads = filteredLeads.filter((lead) => {
					if (!lead.date) return false;
					const parts = lead.date.split("/");
					if (parts.length === 3) {
						const year = parts[2];
						return year === selectedYear;
					}
					return false;
				});
			}

			const total = filteredCosts.reduce((sum, cost) => sum + cost.cost, 0);
			const leadCount = filteredLeads.length;
			const costPerLeadValue = leadCount > 0 ? total / leadCount : 0;

			setTotalCost(total);
			setTotalLeads(leadCount);
			setCostPerLead(costPerLeadValue);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	}, [selectedMonth, selectedYear]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);
	const filterCosts = (allCosts: AdvertisingCost[]) => {
		let filtered = [...allCosts];

		// Filter by month if selected
		if (selectedMonth && selectedMonth !== "") {
			const monthIndex = monthNames.indexOf(selectedMonth) + 1;
			if (monthIndex > 0) {
				filtered = filtered.filter((cost) => cost.month === monthIndex);
			}
		}

		// Filter by year if selected
		if (selectedYear && selectedYear !== "") {
			const year = Number.parseInt(selectedYear, 10);
			filtered = filtered.filter((cost) => cost.year === year);
		}

		return filtered;
	};

	const formatCurrency = (amount: number, currency = "RM") => {
		return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	};

	const getFilterDescription = () => {
		if (selectedMonth && selectedYear) {
			return `${selectedMonth} ${selectedYear}`;
		}
		if (selectedMonth) {
			return `${selectedMonth} (all years)`;
		}
		if (selectedYear) {
			return `${selectedYear} (all months)`;
		}
		return "All periods";
	};

	const filteredCosts = filterCosts(costs);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<DollarSign className="h-5 w-5" />
					Advertising Performance - {getFilterDescription()}
					{totalLeads > 0 && (
						<Badge variant="secondary" className="ml-auto">
							{formatCurrency(costPerLead)} per lead
						</Badge>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{Array.from({ length: 3 }, () => (
							<Skeleton key={crypto.randomUUID()} className="h-24 w-full" />
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{/* Total Advertising Cost */}
						<div className="rounded-lg border p-4 text-center">
							<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
								<DollarSign className="h-6 w-6 text-white" />
							</div>
							<div className="space-y-1">
								<div className="font-bold text-2xl text-green-600">{formatCurrency(totalCost)}</div>
								<div className="text-muted-foreground text-sm">Total Leads</div>
								<div className="mt-1 text-muted-foreground text-xs">For selected period</div>
								<div className="mt-1 text-muted-foreground text-xs">
									{filteredCosts.length} cost entr
									{filteredCosts.length === 1 ? "y" : "ies"}
								</div>
							</div>
						</div>

						{/* Total Leads */}
						<div className="rounded-lg border p-4 text-center">
							<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
								<span className="font-semibold text-lg text-white">{totalLeads}</span>
							</div>
							<div className="space-y-1">
								<div className="font-bold text-2xl text-blue-600">{totalLeads}</div>
								<div className="text-muted-foreground text-sm">Total Leads</div>
							</div>
						</div>

						{/* Cost Per Lead */}
						<div className="rounded-lg border bg-gradient-to-br from-orange-50 to-red-50 p-4 text-center">
							<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600">
								<DollarSign className="h-6 w-6 text-white" />
							</div>
							<div className="space-y-1">
								<div className="font-bold text-2xl text-orange-600">
									{totalLeads > 0 ? formatCurrency(costPerLead) : "N/A"}
								</div>
								<div className="text-muted-foreground text-sm">Cost Per Lead</div>
								{totalLeads === 0 && (
									<div className="mt-1 text-orange-600 text-xs">No leads for this period</div>
								)}
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
