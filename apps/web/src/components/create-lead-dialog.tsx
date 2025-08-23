import { useCallback, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
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
	isClosed: boolean[];
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

	const resetForm = useCallback(() => {
		setName("");
		setPhoneNumber("");
		setPlatform("");
		setCustomPlatform("");
		setIsCustomPlatform(false);
		setStatus("");
		setIsClosed(false);
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

	// Auto-update closed and status when sales changes
	useEffect(() => {
		const salesValue = sales ? Number.parseInt(sales, 10) : 0;

		if (salesValue > 0) {
			setIsClosed(true);
			setStatus("Consult");
		} else {
			setIsClosed(false);
		}
	}, [sales]);

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

		setLoading(true);
		try {
			const leadData = {
				name: name.trim(),
				phoneNumber: phoneNumber.trim(),
				platform: isCustomPlatform ? customPlatform.trim() : platform,
				status: status,
				isClosed: isClosed,
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
					<DialogTitle>Create New Lead</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					{/* Basic Information */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor={nameId}>Name *</Label>
							<Input
								id={nameId}
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter name"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor={phoneId}>Phone Number</Label>
							<Input
								id={phoneId}
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
								placeholder="60161111111"
							/>
						</div>
					</div>

					{/* Platform and Status */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="flex h-5 items-center justify-between">
								<Label htmlFor={platformId}>Platform *</Label>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => {
										setIsCustomPlatform(!isCustomPlatform);
										if (!isCustomPlatform) {
											setCustomPlatform(platform);
										} else {
											setPlatform(customPlatform);
										}
									}}
									className="h-6 px-2 text-xs"
								>
									{isCustomPlatform ? "Select existing" : "Add new"}
								</Button>
							</div>
							{isCustomPlatform ? (
								<Input
									id={customPlatformId}
									value={customPlatform}
									onChange={(e) => setCustomPlatform(e.target.value)}
									placeholder="Enter new platform name"
								/>
							) : (
								<Select value={platform} onValueChange={setPlatform}>
									<SelectTrigger>
										<span>{platform || "Select platform"}</span>
									</SelectTrigger>
									<SelectContent>
										{options.platform.map((p) => (
											<SelectItem key={p} value={p}>
												{p}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
						<div className="space-y-2">
							<div className="flex h-5 items-center">
								<Label htmlFor={statusId}>Status</Label>
							</div>
							<Select value={status} onValueChange={setStatus}>
								<SelectTrigger>
									<span>{status || "Select status"}</span>
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
					</div>

					{/* Sales */}
					<div className="space-y-2">
						<Label htmlFor={salesId}>Sales (RM)</Label>
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
						<Label htmlFor={dateId}>Date *</Label>
						<Input id={dateId} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
								<span>{trainerHandle || "Select trainer"}</span>
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

					{/* Remark */}
					<div className="space-y-2">
						<Label htmlFor={remarkId}>Remark</Label>
						<Textarea
							id={remarkId}
							value={remark}
							onChange={(e) => setRemark(e.target.value)}
							placeholder="Enter remarks"
							rows={3}
						/>
					</div>
				</div>

				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={loading || !name.trim() || (!platform && !customPlatform.trim()) || !date}
					>
						{loading ? "Creating..." : "Create Lead"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
