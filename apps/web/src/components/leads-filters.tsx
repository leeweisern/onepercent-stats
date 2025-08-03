import { Filter, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";

// Helper function to get display text for month filter
const getMonthDisplayText = (month: string | null) => {
	if (!month) return "All months";
	return month; // Month names are stored directly in the database
};

interface FilterOptions {
	months: string[];
	years: string[];
	platforms: string[];
	statuses: string[];
	trainers: string[];
}

interface LeadsFiltersProps {
	onFiltersChange: (filters: FilterState) => void;
	totalResults: number;
}

export interface FilterState {
	search: string;
	month: string;
	year: string;
	platform: string;
	status: string;
	trainer: string;
	isClosed: string;
	closedDate: string;
}

export function LeadsFilters({
	onFiltersChange,
	totalResults,
}: LeadsFiltersProps) {
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

	const [options, setOptions] = useState<FilterOptions>({
		months: [],
		years: [],
		platforms: [],
		statuses: [],
		trainers: [],
	});

	const [_loading, setLoading] = useState(false);

	const fetchFilterOptions = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/analytics/leads/filter-options");
			const data = await response.json();
			setOptions(data);
		} catch (error) {
			console.error("Failed to fetch filter options:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchFilterOptions();
	}, [fetchFilterOptions]);

	useEffect(() => {
		onFiltersChange(filters);
	}, [filters, onFiltersChange]);

	const updateFilter = (key: keyof FilterState, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const clearFilters = () => {
		setFilters({
			search: "",
			month: "",
			year: "",
			platform: "",
			status: "",
			trainer: "",
			isClosed: "",
			closedDate: "",
		});
	};

	const hasActiveFilters = Object.values(filters).some((value) => value !== "");

	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Filter className="h-5 w-5" />
					Filters
					{hasActiveFilters && (
						<Button
							variant="ghost"
							size="sm"
							onClick={clearFilters}
							className="ml-auto"
						>
							<X className="mr-1 h-4 w-4" />
							Clear All
						</Button>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
					{/* Search by Name or Phone */}
					<div className="space-y-2">
						<Label htmlFor="search">Search by Name or Phone</Label>
						<div className="relative">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								id="search"
								placeholder="Enter name or phone..."
								value={filters.search}
								onChange={(e) => updateFilter("search", e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>

					{/* Month Filter */}
					<div className="space-y-2">
						<Label htmlFor="month">Month</Label>
						<Select
							value={filters.month || "all"}
							onValueChange={(value) =>
								updateFilter("month", value === "all" ? "" : value)
							}
						>
							<SelectTrigger>
								<span>{getMonthDisplayText(filters.month)}</span>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All months</SelectItem>
								{options.months.map((month) => (
									<SelectItem key={month} value={month}>
										{month}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Year Filter */}
					<div className="space-y-2">
						<Label htmlFor="year">Year</Label>
						<Select
							value={filters.year || "all"}
							onValueChange={(value) =>
								updateFilter("year", value === "all" ? "" : value)
							}
						>
							<SelectTrigger>
								<span>{filters.year || "All years"}</span>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All years</SelectItem>
								{options.years.map((year) => (
									<SelectItem key={year} value={year}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Platform Filter */}
					<div className="space-y-2">
						<Label htmlFor="platform">Platform</Label>
						<Select
							value={filters.platform || "all"}
							onValueChange={(value) =>
								updateFilter("platform", value === "all" ? "" : value)
							}
						>
							<SelectTrigger>
								<span>{filters.platform || "All platforms"}</span>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All platforms</SelectItem>
								{options.platforms.map((platform) => (
									<SelectItem key={platform} value={platform}>
										{platform}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Status Filter */}
					<div className="space-y-2">
						<Label htmlFor="status">Status</Label>
						<Select
							value={filters.status || "all"}
							onValueChange={(value) =>
								updateFilter("status", value === "all" ? "" : value)
							}
						>
							<SelectTrigger>
								<span>{filters.status || "All statuses"}</span>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All statuses</SelectItem>
								{options.statuses.map((status) => (
									<SelectItem key={status} value={status}>
										{status}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Trainer Filter */}
					<div className="space-y-2">
						<Label htmlFor="trainer">Trainer</Label>
						<Select
							value={filters.trainer || "all"}
							onValueChange={(value) =>
								updateFilter("trainer", value === "all" ? "" : value)
							}
						>
							<SelectTrigger>
								<span>{filters.trainer || "All trainers"}</span>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All trainers</SelectItem>
								{options.trainers.map((trainer) => (
									<SelectItem key={trainer} value={trainer}>
										{trainer}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Closed Status Filter */}
					<div className="space-y-2">
						<Label htmlFor="closed">Closed Status</Label>
						<Select
							value={filters.isClosed || "all"}
							onValueChange={(value) =>
								updateFilter("isClosed", value === "all" ? "" : value)
							}
						>
							<SelectTrigger>
								<span>
									{filters.isClosed === "true"
										? "Closed only"
										: filters.isClosed === "false"
											? "Open only"
											: "All leads"}
								</span>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All leads</SelectItem>
								<SelectItem value="true">Closed only</SelectItem>
								<SelectItem value="false">Open only</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Closed Date Filter */}
					<div className="space-y-2">
						<Label htmlFor="closedDate">Closed Date</Label>
						<Input
							id="closedDate"
							type="date"
							value={filters.closedDate}
							onChange={(e) => updateFilter("closedDate", e.target.value)}
						/>
					</div>

					{/* Results Count */}
					<div className="flex items-end space-y-2">
						<div className="text-muted-foreground text-sm">
							<span className="font-medium">{totalResults}</span> results found
							{hasActiveFilters && (
								<div className="mt-1 text-xs">Filters applied</div>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
