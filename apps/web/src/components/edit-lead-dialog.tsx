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

interface EditLeadDialogProps {
	lead: Lead | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (leadId: number, updates: Partial<Lead>) => void;
}

interface Options {
	status: string[];
	platform: string[];
	trainerHandle: string[];
	isClosed: boolean[];
}

export function EditLeadDialog({ lead, open, onOpenChange, onSave }: EditLeadDialogProps) {
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
	const [status, setStatus] = useState("");
	const [isClosed, setIsClosed] = useState(false);
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
		isClosed: [true, false],
	});
	const [loading, setLoading] = useState(false);

	const fetchOptions = useCallback(async () => {
		try {
			const response = await fetch("/api/analytics/leads/options");
			const data = await response.json();
			setOptions(data);
		} catch (error) {
			console.error("Failed to fetch options:", error);
		}
	}, []);

	useEffect(() => {
		if (lead) {
			setName(lead.name || "");
			setPhoneNumber(lead.phoneNumber || "");
			const leadPlatform = lead.platform || "";
			setPlatform(leadPlatform);
			setCustomPlatform(leadPlatform);
			setStatus(lead.status || "");
			setIsClosed(lead.isClosed || false);
			setSales(lead.sales?.toString() || "");
			const dateValue = convertToDateInputFormat(lead.date);
			setDate(dateValue);
			setMonth(lead.month || getMonthFromDate(dateValue));
			const closedDateValue = convertToDateInputFormat(lead.closedDate);
			setClosedDate(closedDateValue);

			setRemark(lead.remark || "");
			setTrainerHandle(lead.trainerHandle || "");
		}
	}, [lead]);

	useEffect(() => {
		if (lead && options.platform.length > 0) {
			const leadPlatform = lead.platform || "";
			const isExistingPlatform = options.platform.includes(leadPlatform);
			setIsCustomPlatform(!isExistingPlatform && leadPlatform !== "");
		}
	}, [lead, options.platform]);

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

	// Auto-update closed, status, and closed date when sales changes
	useEffect(() => {
		const salesValue = sales ? Number.parseInt(sales, 10) : 0;

		if (salesValue > 0) {
			setIsClosed(true);
			setStatus("Consult");
			// Set closed date to current date if not already set
			if (!closedDate) {
				const today = new Date().toISOString().split("T")[0];
				setClosedDate(today);
			}
		} else {
			setIsClosed(false);
			// Clear closed date when no sales
			setClosedDate("");
		}
	}, [sales, closedDate]);

	const handleSave = async () => {
		if (!lead) return;

		setLoading(true);
		try {
			const updates = {
				name,
				phoneNumber,
				platform: isCustomPlatform ? customPlatform : platform,
				status,
				isClosed,
				sales: sales ? Number.parseInt(sales, 10) : null,
				date: convertFromDateInputFormat(date),
				month,
				closedDate: convertFromDateInputFormat(closedDate),

				remark,
				trainerHandle,
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

						{/* Email (placeholder field) */}
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" placeholder="Enter email address" />
						</div>

						{/* Phone (placeholder field) */}
						<div className="space-y-2">
							<Label htmlFor="phone">Phone</Label>
							<Input id="phone" type="tel" placeholder="Enter phone number" />
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
							<Label htmlFor={statusId}>
								Status <span className="text-sm text-muted-foreground">(optional)</span>
							</Label>
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
									<Label htmlFor={dateId}>
										Date <span className="text-sm text-muted-foreground">(optional)</span>
									</Label>
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
									<Label htmlFor={closedDateId}>Closed Date</Label>
									<Input
										id={closedDateId}
										type="date"
										value={closedDate}
										onChange={(e) => setClosedDate(e.target.value)}
									/>
								</div>

								{/* Trainer */}
								<div className="space-y-2">
									<Label htmlFor={trainerId}>Trainer Handle</Label>
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
