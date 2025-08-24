import { useCallback, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { convertFromDateInputFormat, getMonthFromDate, getTodayYYYYMMDD } from "@/lib/date-utils";

interface CreateLeadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (leadData: any) => Promise<void>;
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

interface Options {
	status: string[];
	platforms: Platform[];
	trainers: Trainer[];
}

export function CreateLeadDialog({ open, onOpenChange, onSave }: CreateLeadDialogProps) {
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

	const resetForm = useCallback(() => {
		setName("");
		setPhoneNumber("");
		setPlatformId(null);
		setStatus("New");
		setSales("");
		// Set date to today's date in YYYY-MM-DD format (user's local time)
		const todayString = getTodayYYYYMMDD();
		setDate(todayString);
		setMonth(getMonthFromDate(todayString));
		setClosedDate("");

		setRemark("");
		setTrainerId(null);
	}, []);

	useEffect(() => {
		if (open) {
			fetchOptions();
			// Reset form when dialog opens
			resetForm();
		}
	}, [open, fetchOptions, resetForm]);

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
		}
	}, [sales, status]);

	// Auto-clear sales when "Closed Lost" selected
	useEffect(() => {
		if (status === "Closed Lost" && sales !== "0" && sales !== "") {
			setSales("0");
		}
	}, [status, sales]);

	const handleSave = async () => {
		if (!name.trim()) {
			alert("Name is required");
			return;
		}

		if (!platformId) {
			alert("Platform is required");
			return;
		}

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
			const finalPlatform = options.platforms.find((p) => p.id === platformId)?.name || "";
			const finalTrainer = trainerId
				? options.trainers.find((t) => t.id === trainerId)?.handle || ""
				: "";

			const leadData = {
				name: name.trim(),
				phoneNumber: phoneNumber.trim(),
				platformId,
				platform: finalPlatform,
				status,
				sales: sales ? Number.parseInt(sales, 10) : 0,
				date: convertFromDateInputFormat(date),
				month,
				closedDate: closedDate ? convertFromDateInputFormat(closedDate) : "",
				remark: remark.trim(),
				trainerId,
				trainerHandle: finalTrainer,
			};

			await onSave(leadData);
			onOpenChange(false);
			resetForm();
		} catch (error) {
			console.error("Failed to save lead:", error);
			alert("Failed to save lead. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Lead</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-4">
						{/* Name */}
						<div className="space-y-2">
							<Label htmlFor={nameId}>Name</Label>
							<Input
								id={nameId}
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter lead name"
								required
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
					</div>

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={loading}>
							{loading ? "Saving..." : "Save Lead"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
