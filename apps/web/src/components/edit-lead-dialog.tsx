import { useCallback, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	convertFromDateInputFormat,
	convertToDateInputFormat,
	getMonthFromDate,
} from "@/lib/date-utils";

interface Lead {
	id: number;
	month: string | null;
	date: string;
	name: string | null;
	phoneNumber: string | null;
	platform: string | null;
	status: string | null;
	sales: number | null;
	remark: string | null;
	trainerHandle: string | null;
	closedDate: string | null;
	closedMonth: string | null;
	closedYear: string | null;
	createdAt: string | null;
	nextFollowUpDate: string | null;
	lastActivityDate: string | null;
}

interface Platform {
	id: number;
	name: string;
}

interface Trainer {
	id: number;
	handle: string;
	name: string | null;
}

interface EditLeadDialogProps {
	lead: Lead | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (leadId: number, updates: Partial<Lead>) => void;
}

interface Options {
	status: string[];
	platforms: Platform[];
	trainers: Trainer[];
}

export function EditLeadDialog({ lead, open, onOpenChange, onSave }: EditLeadDialogProps) {
	const nameId = useId();
	const phoneId = useId();
	const platformFieldId = useId();
	const statusId = useId();
	const salesId = useId();
	const dateId = useId();
	const closedDateId = useId();
	const trainerFieldId = useId();
	const remarkId = useId();

	const [name, setName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [platformId, setPlatformId] = useState<number | null>(null);
	const [status, setStatus] = useState("New");
	const [sales, setSales] = useState("");
	const [date, setDate] = useState("");
	const [month, setMonth] = useState("");

	const [remark, setRemark] = useState("");
	const [trainerId, setTrainerId] = useState<number | null>(null);
	const [closedDate, setClosedDate] = useState("");
	const [options, setOptions] = useState<Options>({
		status: [],
		platforms: [],
		trainers: [],
	});
	const [loading, setLoading] = useState(false);

	const fetchOptions = useCallback(async () => {
		try {
			// Fetch master data with IDs
			const [masterResponse, filterResponse] = await Promise.all([
				fetch("/api/analytics/master-data"),
				fetch("/api/analytics/leads/filter-options"),
			]);

			const masterData = await masterResponse.json();
			const filterData = await filterResponse.json();

			setOptions({
				status: filterData.statuses || [],
				platforms: masterData.platforms || [],
				trainers: masterData.trainers || [],
			});
		} catch (error) {
			console.error("Failed to fetch options:", error);
			// Fallback to text-based options if master data fails
			try {
				const response = await fetch("/api/analytics/leads/filter-options");
				const data = await response.json();
				setOptions({
					status: data.statuses || [],
					platforms: data.platforms?.map((p: string, idx: number) => ({ id: idx, name: p })) || [],
					trainers:
						data.trainers?.map((t: string, idx: number) => ({ id: idx, handle: t, name: null })) ||
						[],
				});
			} catch (fallbackError) {
				console.error("Failed to fetch fallback options:", fallbackError);
			}
		}
	}, []);

	useEffect(() => {
		if (lead) {
			setName(lead.name || "");
			setPhoneNumber(lead.phoneNumber || "");
			// Will be set after options are loaded
			setPlatformId(null);
			setStatus(lead.status || "New");
			setSales(lead.sales?.toString() || "");
			const dateValue = convertToDateInputFormat(lead.date);
			setDate(dateValue);
			setMonth(lead.month || getMonthFromDate(dateValue));
			const closedDateValue = convertToDateInputFormat(lead.closedDate);
			setClosedDate(closedDateValue);

			setRemark(lead.remark || "");
			// Will be set after options are loaded
			setTrainerId(null);
		}
	}, [lead]);

	useEffect(() => {
		if (lead && options.platforms.length > 0) {
			const leadPlatform = lead.platform || "";
			const platform = options.platforms.find((p) => p.name === leadPlatform);
			setPlatformId(platform?.id || null);
		}
	}, [lead, options.platforms]);

	useEffect(() => {
		if (lead && options.trainers.length > 0) {
			const leadTrainer = lead.trainerHandle || "";
			const trainer = options.trainers.find((t) => t.handle === leadTrainer);
			setTrainerId(trainer?.id || null);
		}
	}, [lead, options.trainers]);

	useEffect(() => {
		if (open) {
			fetchOptions();
		}
	}, [open, fetchOptions]);

	// Auto-update month when date changes
	useEffect(() => {
		if (date) {
			const monthName = getMonthFromDate(date);
			if (monthName) {
				setMonth(monthName);
			}
		}
	}, [date]);

	// Auto-update status when sales changes
	useEffect(() => {
		const salesValue = sales ? Number.parseInt(sales, 10) : 0;

		if (salesValue > 0 && status !== "Closed Won" && status !== "Closed Lost") {
			setStatus("Closed Won");
			// Set closed date to current date if not already set
			if (!closedDate) {
				const today = new Date().toISOString().split("T")[0];
				setClosedDate(today);
			}
		}
	}, [sales, status, closedDate]);

	// Auto-clear sales when "Closed Lost" selected
	useEffect(() => {
		if (status === "Closed Lost") {
			setSales("0");
			// Clear closed date when closed lost
			setClosedDate("");
		}
	}, [status]);

	const handleSave = async () => {
		if (!lead) return;

		// Validation
		if (!date) {
			alert("Date is required");
			return;
		}

		if (status === "Closed Won" && (!sales || Number.parseInt(sales, 10) <= 0)) {
			alert("Sales amount is required for Closed Won status");
			return;
		}

		setLoading(true);
		try {
			const finalPlatform = platformId
				? options.platforms.find((p) => p.id === platformId)?.name || ""
				: "";
			const finalTrainer = trainerId
				? options.trainers.find((t) => t.id === trainerId)?.handle || ""
				: "";

			const updates = {
				name,
				phoneNumber,
				platformId,
				platform: finalPlatform,
				status: status || "New",
				sales: sales ? Number.parseInt(sales, 10) : null,
				date: convertFromDateInputFormat(date),
				month,
				closedDate: convertFromDateInputFormat(closedDate),
				lastActivityDate: (() => {
					const now = new Date();
					const myTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); // GMT+8
					return `${myTime.toISOString().slice(0, -1)}+08:00`;
				})(),
				remark,
				trainerId,
				trainerHandle: finalTrainer,
			};

			await onSave(lead.id, updates);
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to save:", error);
		} finally {
			setLoading(false);
		}
	};

	if (!lead) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Edit Lead</DialogTitle>
					<p className="text-sm text-muted-foreground">Update lead information in the system</p>
				</DialogHeader>

				<Card>
					<CardHeader>
						<CardTitle>Lead Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Name */}
						<div className="space-y-2">
							<Label htmlFor={nameId}>Name</Label>
							<Input
								id={nameId}
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter full name"
							/>
						</div>

						{/* Phone Number */}
						<div className="space-y-2">
							<Label htmlFor={phoneId}>
								Phone Number <span className="text-sm text-muted-foreground">(optional)</span>
							</Label>
							<Input
								id={phoneId}
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
								placeholder="Enter phone number"
							/>
						</div>

						{/* Platform */}
						<div className="space-y-2">
							<Label htmlFor={platformFieldId}>Platform</Label>
							<Select
								value={platformId?.toString() || ""}
								onValueChange={(val) => setPlatformId(Number(val))}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select platform" />
								</SelectTrigger>
								<SelectContent>
									{options.platforms.map((p) => (
										<SelectItem key={p.id} value={p.id.toString()}>
											{p.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Status */}
						<div className="space-y-2">
							<Label htmlFor={statusId}>Status</Label>
							<Select value={status} onValueChange={setStatus}>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									{options.status.map((s) => (
										<SelectItem key={s} value={s}>
											{s}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Notes */}
						<div className="space-y-2">
							<Label htmlFor={remarkId}>
								Notes <span className="text-sm text-muted-foreground">(optional)</span>
							</Label>
							<Textarea
								id={remarkId}
								value={remark}
								onChange={(e) => setRemark(e.target.value)}
								placeholder="Enter notes"
								rows={3}
							/>
						</div>

						{/* Advanced Fields (Hidden by default to match design) */}
						<details className="space-y-4">
							<summary className="cursor-pointer text-sm font-medium">Advanced Options</summary>
							<div className="mt-4 space-y-4">
								{/* Sales */}
								<div className="space-y-2">
									<Label htmlFor={salesId}>
										Sales (RM) <span className="text-sm text-muted-foreground">(optional)</span>
									</Label>
									<Input
										id={salesId}
										type="number"
										value={sales}
										onChange={(e) => setSales(e.target.value)}
										placeholder="Enter sales amount"
										min="0"
									/>
								</div>

								{/* Date */}
								<div className="space-y-2">
									<Label htmlFor={dateId}>Date</Label>
									<Input
										id={dateId}
										type="date"
										value={date}
										onChange={(e) => setDate(e.target.value)}
										required
									/>
								</div>

								{/* Closed Date */}
								<div className="space-y-2">
									<Label htmlFor={closedDateId}>
										Closed Date <span className="text-sm text-muted-foreground">(optional)</span>
									</Label>
									<Input
										id={closedDateId}
										type="date"
										value={closedDate}
										onChange={(e) => setClosedDate(e.target.value)}
									/>
								</div>

								{/* Trainer */}
								<div className="space-y-2">
									<Label htmlFor={trainerFieldId}>
										Trainer Handle <span className="text-sm text-muted-foreground">(optional)</span>
									</Label>
									<Select
										value={trainerId?.toString() || "none"}
										onValueChange={(val) => setTrainerId(val === "none" ? null : Number(val))}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select trainer" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">None</SelectItem>
											{options.trainers.map((t) => (
												<SelectItem key={t.id} value={t.id.toString()}>
													{t.handle} {t.name && `(${t.name})`}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</details>

						<Button
							onClick={handleSave}
							disabled={loading}
							className="w-full bg-red-600 hover:bg-red-700"
						>
							{loading ? "Saving..." : "Save Changes"}
						</Button>
					</CardContent>
				</Card>
			</DialogContent>
		</Dialog>
	);
}
