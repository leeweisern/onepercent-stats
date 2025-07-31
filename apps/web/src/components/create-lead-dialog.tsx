import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";

// Helper function to convert from YYYY-MM-DD to DD/MM/YYYY format
const convertFromDateInputFormat = (dateString: string): string => {
	if (!dateString) return "";

	// Parse YYYY-MM-DD format and convert to DD/MM/YYYY
	const parts = dateString.split("-");
	if (parts.length === 3) {
		const year = parts[0];
		const month = parseInt(parts[1]).toString(); // Remove leading zero
		const day = parseInt(parts[2]).toString(); // Remove leading zero
		return `${day}/${month}/${year}`;
	}

	return dateString;
};

// Helper function to get month name from date
const getMonthFromDate = (dateString: string): string => {
	if (!dateString) return "";

	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "";

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

export function CreateLeadDialog({
	open,
	onOpenChange,
	onSave,
}: CreateLeadDialogProps) {
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
	const [followUp, setFollowUp] = useState("");
	const [appointment, setAppointment] = useState("");
	const [remark, setRemark] = useState("");
	const [trainerHandle, setTrainerHandle] = useState("");
	const [options, setOptions] = useState<Options>({
		status: [],
		platform: [],
		trainerHandle: [],
		isClosed: [true, false],
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (open) {
			fetchOptions();
			// Reset form when dialog opens
			resetForm();
		}
	}, [open]);

	// Auto-update month when date changes
	useEffect(() => {
		if (date) {
			const monthName = getMonthFromDate(date);
			if (monthName) {
				setMonth(monthName);
			}
		}
	}, [date]);

	const resetForm = () => {
		setName("");
		setPhoneNumber("");
		setPlatform("");
		setCustomPlatform("");
		setIsCustomPlatform(false);
		setStatus("");
		setIsClosed(false);
		setSales("");
		setDate("");
		setMonth("");
		setFollowUp("");
		setAppointment("");
		setRemark("");
		setTrainerHandle("");
	};

	const fetchOptions = async () => {
		try {
			const response = await fetch("/api/analytics/leads/options");
			const data = await response.json();
			setOptions(data);
		} catch (error) {
			console.error("Failed to fetch options:", error);
		}
	};

	const handleSave = async () => {
		if (!name.trim()) {
			alert("Name is required");
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
				sales: sales ? parseInt(sales) : 0,
				date: convertFromDateInputFormat(date),
				month: month,
				followUp: followUp.trim(),
				appointment: appointment.trim(),
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
			<DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Lead</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					{/* Basic Information */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name *</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter name"
								required
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
									className="text-xs h-6 px-2"
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

					{/* Closed and Sales */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="closed">Closed</Label>
							<Select
								value={isClosed.toString()}
								onValueChange={(value) => setIsClosed(value === "true")}
							>
								<SelectTrigger>
									<span>{isClosed ? "Yes" : "No"}</span>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="true">Yes</SelectItem>
									<SelectItem value="false">No</SelectItem>
								</SelectContent>
							</Select>
						</div>
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

					{/* Follow Up and Appointment */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="followUp">Follow Up</Label>
							<Textarea
								id="followUp"
								value={followUp}
								onChange={(e) => setFollowUp(e.target.value)}
								placeholder="Enter follow up details"
								rows={3}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="appointment">Appointment</Label>
							<Textarea
								id="appointment"
								value={appointment}
								onChange={(e) => setAppointment(e.target.value)}
								placeholder="Enter appointment details"
								rows={3}
							/>
						</div>
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
					<Button onClick={handleSave} disabled={loading || !name.trim()}>
						{loading ? "Creating..." : "Create Lead"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
