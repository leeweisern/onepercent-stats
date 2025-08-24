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
import { convertFromDateInputFormat, getMonthFromDate, getTodayYYYYMMDD } from "@/lib/date-utils";

interface CreateLeadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (leadData: any) => Promise<void>;
}

interface Options {
	status: string[];
	platform: string[];
	trainerHandle: string[];
}

export function CreateLeadDialog({ open, onOpenChange, onSave }: CreateLeadDialogProps) {
	const nameId = useId();
	const phoneId = useId();
	const platformId = useId();
	const customPlatformId = useId();
	const statusId = useId();
	const salesId = useId();
	const dateId = useId();
	const closedDateId = useId();
	const trainerId = useId();
	const remarkId = useId();

	const [name, setName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [platform, setPlatform] = useState("");
	const [customPlatform, setCustomPlatform] = useState("");
	const [isCustomPlatform, setIsCustomPlatform] = useState(false);
	const [status, setStatus] = useState("New");
	const [sales, setSales] = useState("");
	const [date, setDate] = useState("");
	const [month, setMonth] = useState("");

	const [remark, setRemark] = useState("");
	const [trainerHandle, setTrainerHandle] = useState("");
	const [closedDate, setClosedDate] = useState("");
	const [options, setOptions] = useState<Options>({
		status: [],
		platform: [],
		trainerHandle: [],
	});
	const [loading, setLoading] = useState(false);

	const fetchOptions = useCallback(async () => {
		try {
			const response = await fetch("/api/analytics/leads/filter-options");
			const data = await response.json();
			setOptions({
				status: data.statuses || [],
				platform: data.platforms || [],
				trainerHandle: data.trainerHandles || [],
			});
		} catch (error) {
			console.error("Failed to fetch options:", error);
		}
	}, []);

	const resetForm = useCallback(() => {
		setName("");
		setPhoneNumber("");
		setPlatform("");
		setCustomPlatform("");
		setIsCustomPlatform(false);
		setStatus("New");
		setSales("");
		// Set date to today's date in YYYY-MM-DD format (user's local time)
		const todayString = getTodayYYYYMMDD();
		setDate(todayString);
		setMonth(getMonthFromDate(todayString));
		setClosedDate("");

		setRemark("");
		setTrainerHandle("");
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

		if (!platform && !customPlatform.trim()) {
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
			const leadData = {
				name: name.trim(),
				phoneNumber: phoneNumber.trim(),
				platform: isCustomPlatform ? customPlatform.trim() : platform,
				status: status || "New",
				sales: sales ? Number.parseInt(sales, 10) : 0,
				date: convertFromDateInputFormat(date),
				month: month,
				closedDate: convertFromDateInputFormat(closedDate),

				remark: remark.trim(),
				trainerHandle: trainerHandle,
			};

			await onSave(leadData);
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to create lead:", error);
			alert("Failed to create lead. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Add New Lead</DialogTitle>
					<p className="text-sm text-muted-foreground">Create a new lead in the system</p>
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
							<Label htmlFor={platformId}>Platform</Label>
							{isCustomPlatform ? (
								<div className="flex items-center gap-2">
									<Input
										id={customPlatformId}
										value={customPlatform}
										onChange={(e) => setCustomPlatform(e.target.value)}
										placeholder="Enter new platform name"
										className="flex-1"
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => {
											setIsCustomPlatform(false);
											setPlatform(customPlatform);
										}}
										className="px-2 text-xs"
									>
										Select existing
									</Button>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Select value={platform} onValueChange={setPlatform}>
										<SelectTrigger className="flex-1">
											<SelectValue placeholder="Select platform" />
										</SelectTrigger>
										<SelectContent>
											{options.platform.map((p) => (
												<SelectItem key={p} value={p}>
													{p}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => {
											setIsCustomPlatform(true);
											setCustomPlatform(platform);
										}}
										className="px-2 text-xs"
									>
										Add new
									</Button>
								</div>
							)}
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
									<Label htmlFor={trainerId}>
										Trainer Handle <span className="text-sm text-muted-foreground">(optional)</span>
									</Label>
									<Select value={trainerHandle} onValueChange={setTrainerHandle}>
										<SelectTrigger>
											<SelectValue placeholder="Select trainer" />
										</SelectTrigger>
										<SelectContent>
											{options.trainerHandle.map((t) => (
												<SelectItem key={t} value={t}>
													{t}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</details>

						<Button
							onClick={handleSave}
							disabled={loading || !name.trim() || (!platform && !customPlatform.trim()) || !date}
							className="w-full bg-red-600 hover:bg-red-700"
						>
							{loading ? "Creating..." : "Create Lead"}
						</Button>
					</CardContent>
				</Card>
			</DialogContent>
		</Dialog>
	);
}
