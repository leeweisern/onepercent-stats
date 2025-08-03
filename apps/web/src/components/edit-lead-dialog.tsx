import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Helper functions to convert between DD/MM/YYYY and YYYY-MM-DD formats
const convertToDateInputFormat = (dateString: string | null): string => {
	if (!dateString) return "";

	// Parse DD/MM/YYYY format and convert to YYYY-MM-DD
	const parts = dateString.split("/");
	if (parts.length === 3) {
		const day = parts[0].padStart(2, "0");
		const month = parts[1].padStart(2, "0");
		const year = parts[2];
		return `${year}-${month}-${day}`;
	}

	return dateString;
};

const convertFromDateInputFormat = (dateString: string): string => {
	if (!dateString) return "";

	// Parse YYYY-MM-DD format and convert to DD/MM/YYYY
	const parts = dateString.split("-");
	if (parts.length === 3) {
		const year = parts[0];
		const month = Number.parseInt(parts[1]).toString(); // Remove leading zero
		const day = Number.parseInt(parts[2]).toString(); // Remove leading zero
		return `${day}/${month}/${year}`;
	}

	return dateString;
};

// Helper function to get month name from date
const getMonthFromDate = (dateString: string): string => {
	if (!dateString) return "";

	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return "";

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

	return monthNames[date.getMonth()];
};

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

export function EditLeadDialog({
	lead,
	open,
	onOpenChange,
	onSave,
}: EditLeadDialogProps) {
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
		const salesValue = sales ? Number.parseInt(sales) : 0;

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
				sales: sales ? Number.parseInt(sales) : null,
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
					<DialogTitle>Edit Lead: {lead.name}</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					{/* Basic Information */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
							<Input
								id="phone"
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
								placeholder="60161111111"
							/>
						</div>
					</div>

					{/* Platform and Status */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="platform">Platform</Label>
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
									id="custom-platform"
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
							<Label htmlFor="status">Status</Label>
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
						<Label htmlFor="sales">Sales (RM)</Label>
						<Input
							id="sales"
							type="number"
							value={sales}
							onChange={(e) => setSales(e.target.value)}
							placeholder="Enter sales amount"
							min="0"
						/>
					</div>

					{/* Date */}
					<div className="space-y-2">
						<Label htmlFor="date">Date</Label>
						<Input
							id="date"
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
						/>
					</div>

					{/* Closed Date */}
					<div className="space-y-2">
						<Label htmlFor="closedDate">Closed Date</Label>
						<Input
							id="closedDate"
							type="date"
							value={closedDate}
							onChange={(e) => setClosedDate(e.target.value)}
						/>
					</div>

					{/* Trainer */}
					<div className="space-y-2">
						<Label htmlFor="trainer">Trainer Handle</Label>
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
						<Label htmlFor="remark">Remark</Label>
						<Textarea
							id="remark"
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
					<Button onClick={handleSave} disabled={loading}>
						{loading ? "Saving..." : "Save"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
