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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";

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
	followUp: string | null;
	appointment: string | null;
	remark: string | null;
	trainerHandle: string | null;
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
	month: string[];
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
	const [status, setStatus] = useState("");
	const [isClosed, setIsClosed] = useState(false);
	const [sales, setSales] = useState("");
	const [month, setMonth] = useState("");
	const [date, setDate] = useState("");
	const [followUp, setFollowUp] = useState("");
	const [appointment, setAppointment] = useState("");
	const [remark, setRemark] = useState("");
	const [trainerHandle, setTrainerHandle] = useState("");
	const [options, setOptions] = useState<Options>({
		status: [],
		platform: [],
		month: [],
		trainerHandle: [],
		isClosed: [true, false],
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (lead) {
			setName(lead.name || "");
			setPhoneNumber(lead.phoneNumber || "");
			setPlatform(lead.platform || "");
			setStatus(lead.status || "");
			setIsClosed(lead.isClosed || false);
			setSales(lead.sales?.toString() || "");
			setMonth(lead.month || "");
			setDate(lead.date || "");
			setFollowUp(lead.followUp || "");
			setAppointment(lead.appointment || "");
			setRemark(lead.remark || "");
			setTrainerHandle(lead.trainerHandle || "");
		}
	}, [lead]);

	useEffect(() => {
		if (open) {
			fetchOptions();
		}
	}, [open]);

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
		if (!lead) return;

		setLoading(true);
		try {
			const updates = {
				name,
				phoneNumber,
				platform,
				status,
				isClosed,
				sales: sales ? parseInt(sales) : null,
				month,
				date,
				followUp,
				appointment,
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
			<DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
								placeholder="Enter phone number"
							/>
						</div>
					</div>

					{/* Platform and Status */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="platform">Platform</Label>
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
							/>
						</div>
					</div>

					{/* Month and Date */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="month">Month</Label>
							<Select value={month} onValueChange={setMonth}>
								<SelectTrigger>
									<span>{month || "Select month"}</span>
								</SelectTrigger>
								<SelectContent>
									{options.month.map((m) => (
										<SelectItem key={m} value={m}>
											{m}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="date">Date</Label>
							<Input
								id="date"
								type="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
							/>
						</div>
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
							<Input
								id="followUp"
								value={followUp}
								onChange={(e) => setFollowUp(e.target.value)}
								placeholder="Enter follow up details"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="appointment">Appointment</Label>
							<Input
								id="appointment"
								value={appointment}
								onChange={(e) => setAppointment(e.target.value)}
								placeholder="Enter appointment details"
							/>
						</div>
					</div>

					{/* Remark */}
					<div className="space-y-2">
						<Label htmlFor="remark">Remark</Label>
						<Input
							id="remark"
							value={remark}
							onChange={(e) => setRemark(e.target.value)}
							placeholder="Enter remarks"
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
