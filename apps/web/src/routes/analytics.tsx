import { useState, useEffect } from "react";
import PlatformBreakdown from "@/components/platform-breakdown";
import FunnelChart from "@/components/funnel-chart";
import ROASMetrics from "@/components/roas-metrics";
import MonthlyGrowthChart from "@/components/monthly-growth-chart";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Analytics() {
	const [availableMonths, setAvailableMonths] = useState<string[]>([]);
	const [availableYears, setAvailableYears] = useState<string[]>([]);
	const [selectedMonth, setSelectedMonth] = useState<string>("");
	const [selectedYear, setSelectedYear] = useState<string>("");

	useEffect(() => {
		fetchAvailableMonths();
		fetchAvailableYears();
	}, []);

	const fetchAvailableMonths = async () => {
		try {
			const response = await fetch("/api/analytics/leads/months");
			const months = await response.json();
			setAvailableMonths(months);
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

	return (
		<SidebarProvider>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
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
							<div className="space-y-6">
								<ROASMetrics
									selectedMonth={selectedMonth}
									selectedYear={selectedYear}
								/>

								{/* Monthly Growth Chart */}
								<MonthlyGrowthChart selectedYear={selectedYear} />

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
	);
}
