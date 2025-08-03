import { useCallback, useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import FunnelChart from "@/components/funnel-chart";
import MonthlyLeadsChart from "@/components/monthly-leads-chart";
import MonthlySalesChart from "@/components/monthly-sales-chart";
import PlatformBreakdown from "@/components/platform-breakdown";
import { ProtectedRoute } from "@/components/protected-route";
import ROASMetrics from "@/components/roas-metrics";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Analytics() {
	const [availableMonths, setAvailableMonths] = useState<string[]>([]);
	const [availableYears, setAvailableYears] = useState<string[]>([]);
	const [selectedMonth, setSelectedMonth] = useState<string>("");
	const [selectedYear, setSelectedYear] = useState<string>("");
	const [dateType, setDateType] = useState<"lead" | "closed">("lead");

	const fetchAvailableMonths = useCallback(async () => {
		try {
			const response = await fetch("/api/analytics/leads/months");
			const months = await response.json();
			setAvailableMonths(months);
		} catch (error) {
			console.error("Error fetching months:", error);
		}
	}, []);

	const fetchAvailableYears = useCallback(async () => {
		try {
			const response = await fetch("/api/analytics/leads/filter-options");
			const data = await response.json();
			setAvailableYears(data.years || []);
		} catch (error) {
			console.error("Error fetching years:", error);
		}
	}, []);

	useEffect(() => {
		fetchAvailableMonths();
		fetchAvailableYears();
	}, [fetchAvailableMonths, fetchAvailableYears]);

	return (
		<ProtectedRoute>
			<SidebarProvider>
				<AppSidebar variant="inset" />
				<SidebarInset>
					<SiteHeader />
					<div className="flex flex-1 flex-col">
						<div className="flex flex-1 flex-col gap-2">
							<div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
								{/* Global Filters */}
								<div className="mb-6 flex flex-wrap items-center gap-4">
									<div className="flex items-center gap-2">
										<span className="font-medium text-sm">Date type:</span>
										<select
											value={dateType}
											onChange={(e) =>
												setDateType(e.target.value as "lead" | "closed")
											}
											className="rounded-md border bg-white px-3 py-2 text-sm"
										>
											<option value="lead">Lead Date</option>
											<option value="closed">Sale Date</option>
										</select>
									</div>
									<div className="flex items-center gap-2">
										<span className="font-medium text-sm">
											Filter by month:
										</span>
										<select
											value={selectedMonth}
											onChange={(e) => setSelectedMonth(e.target.value)}
											className="rounded-md border bg-white px-3 py-2 text-sm"
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
										<span className="font-medium text-sm">Filter by year:</span>
										<select
											value={selectedYear}
											onChange={(e) => setSelectedYear(e.target.value)}
											className="rounded-md border bg-white px-3 py-2 text-sm"
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
								<div className="space-y-6">
									<ROASMetrics
										selectedMonth={selectedMonth}
										selectedYear={selectedYear}
									/>

									{/* Monthly Charts */}
									<div className="grid gap-6 md:grid-cols-2">
										<MonthlyLeadsChart
											selectedYear={selectedYear}
											dateType={dateType}
										/>
										<MonthlySalesChart
											selectedYear={selectedYear}
											dateType={dateType}
										/>
									</div>

									<PlatformBreakdown
										selectedMonth={selectedMonth}
										selectedYear={selectedYear}
									/>
									<FunnelChart
										selectedMonth={selectedMonth}
										selectedYear={selectedYear}
									/>
								</div>{" "}
							</div>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</ProtectedRoute>
	);
}
