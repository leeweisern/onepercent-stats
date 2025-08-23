import { Calendar, DollarSign, Edit, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface AdvertisingCost {
	id: number;
	month: number;
	year: number;
	cost: number;
	currency: string;
	createdAt: string;
	updatedAt: string;
}

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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

export default function AdvertisingCostsManagement() {
	const costInputId = useId();
	const editCostInputId = useId();
	const [costs, setCosts] = useState<AdvertisingCost[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingCost, setEditingCost] = useState<AdvertisingCost | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [costToDelete, setCostToDelete] = useState<AdvertisingCost | null>(null);

	// Form state
	const [formData, setFormData] = useState({
		month: "",
		year: "",
		cost: "",
		currency: "RM",
	});

	const fetchAdvertisingCosts = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/analytics/advertising-costs");
			const data = await response.json();
			setCosts(data);
		} catch (error) {
			console.error("Error fetching advertising costs:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAdvertisingCosts();
	}, [fetchAdvertisingCosts]);

	const formatCurrency = (amount: number, currency = "RM") => {
		return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	};

	const resetForm = () => {
		setFormData({
			month: "",
			year: "",
			cost: "",
			currency: "RM",
		});
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await fetch("/api/analytics/advertising-costs", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					month: Number.parseInt(formData.month, 10),
					year: Number.parseInt(formData.year, 10),
					cost: Number.parseFloat(formData.cost),
					currency: formData.currency,
				}),
			});

			if (response.ok) {
				const newCost = await response.json();
				setCosts([newCost, ...costs]);
				setIsCreateDialogOpen(false);
				resetForm();
			} else {
				const error = await response.json();
				alert(error.error || "Failed to create advertising cost");
			}
		} catch (error) {
			console.error("Error creating advertising cost:", error);
			alert("Failed to create advertising cost");
		}
	};

	const handleEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingCost) return;

		try {
			const response = await fetch(`/api/analytics/advertising-costs/${editingCost.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					month: Number.parseInt(formData.month, 10),
					year: Number.parseInt(formData.year, 10),
					cost: Number.parseFloat(formData.cost),
					currency: formData.currency,
				}),
			});

			if (response.ok) {
				const updatedCost = await response.json();
				setCosts(costs.map((cost) => (cost.id === editingCost.id ? updatedCost : cost)));
				setIsEditDialogOpen(false);
				setEditingCost(null);
				resetForm();
			} else {
				const error = await response.json();
				alert(error.error || "Failed to update advertising cost");
			}
		} catch (error) {
			console.error("Error updating advertising cost:", error);
			alert("Failed to update advertising cost");
		}
	};

	const handleDelete = async () => {
		if (!costToDelete) return;

		try {
			const response = await fetch(`/api/analytics/advertising-costs/${costToDelete.id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setCosts(costs.filter((cost) => cost.id !== costToDelete.id));
				setDeleteConfirmOpen(false);
				setCostToDelete(null);
			} else {
				alert("Failed to delete advertising cost");
			}
		} catch (error) {
			console.error("Error deleting advertising cost:", error);
			alert("Failed to delete advertising cost");
		}
	};

	const openEditDialog = (cost: AdvertisingCost) => {
		setEditingCost(cost);
		setFormData({
			month: cost.month.toString(),
			year: cost.year.toString(),
			cost: cost.cost.toString(),
			currency: cost.currency,
		});
		setIsEditDialogOpen(true);
	};

	const openDeleteDialog = (cost: AdvertisingCost) => {
		setCostToDelete(cost);
		setDeleteConfirmOpen(true);
	};

	const totalCost = costs.reduce((sum, cost) => sum + cost.cost, 0);

	return (
		<div className="space-y-6">
			{/* Summary Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Advertising Costs Overview
						<Badge variant="secondary" className="ml-auto">
							Total: {formatCurrency(totalCost)}
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div className="rounded-lg border p-4 text-center">
							<div className="font-bold text-2xl text-green-600">{formatCurrency(totalCost)}</div>
							<div className="text-muted-foreground text-sm">Total Spent</div>
						</div>
						<div className="rounded-lg border p-4 text-center">
							<div className="font-bold text-2xl">{costs.length}</div>
							<div className="text-muted-foreground text-sm">Total Entries</div>
						</div>
						<div className="rounded-lg border p-4 text-center">
							<div className="font-bold text-2xl">
								{costs.length > 0 ? formatCurrency(totalCost / costs.length) : formatCurrency(0)}
							</div>
							<div className="text-muted-foreground text-sm">Average per Month</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Management Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Manage Advertising Costs
						<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
							<DialogTrigger asChild>
								<Button size="sm" className="ml-auto" onClick={resetForm}>
									<Plus className="mr-1 h-4 w-4" />
									Add Cost
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Add Advertising Cost</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleCreate} className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="month">Month</Label>
											<Select
												value={formData.month}
												onValueChange={(value) => setFormData({ ...formData, month: value })}
											>
												<SelectTrigger>
													{formData.month
														? monthNames[Number.parseInt(formData.month, 10) - 1]
														: "Select month"}
												</SelectTrigger>{" "}
												<SelectContent>
													{monthNames.map((month, index) => (
														<SelectItem key={month} value={(index + 1).toString()}>
															{month}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div>
											<Label htmlFor="year">Year</Label>
											<Select
												value={formData.year}
												onValueChange={(value) => setFormData({ ...formData, year: value })}
											>
												<SelectTrigger>{formData.year || "Select year"}</SelectTrigger>{" "}
												<SelectContent>
													{years.map((year) => (
														<SelectItem key={year} value={year.toString()}>
															{year}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor={costInputId}>Cost</Label>
											<Input
												id={costInputId}
												type="number"
												step="0.01"
												placeholder="0.00"
												value={formData.cost}
												onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
												required
											/>
										</div>
										<div>
											<Label htmlFor="currency">Currency</Label>
											<Select
												value={formData.currency}
												onValueChange={(value) => setFormData({ ...formData, currency: value })}
											>
												<SelectTrigger>{formData.currency}</SelectTrigger>{" "}
												<SelectContent>
													<SelectItem value="RM">RM</SelectItem>
													<SelectItem value="USD">USD</SelectItem>
													<SelectItem value="EUR">EUR</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="flex justify-end gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setIsCreateDialogOpen(false)}
										>
											Cancel
										</Button>
										<Button type="submit">Add Cost</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{loading ? (
						<div className="space-y-2 p-6">
							{Array.from({ length: 5 }, () => (
								<Skeleton key={crypto.randomUUID()} className="h-12 w-full" />
							))}
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow className="bg-muted/50 hover:bg-transparent">
										<TableHead className="font-semibold">Period</TableHead>
										<TableHead className="text-right font-semibold">Cost</TableHead>
										<TableHead className="text-center font-semibold">Added</TableHead>
										<TableHead className="w-[100px] text-center font-semibold">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{costs.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
												No advertising costs found. Add your first entry above.
											</TableCell>
										</TableRow>
									) : (
										costs.map((cost) => (
											<TableRow key={cost.id} className="hover:bg-muted/30">
												<TableCell className="font-medium">
													<div className="flex items-center gap-2">
														<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 font-medium text-white text-xs">
															{monthNames[cost.month - 1]?.slice(0, 3)}
														</div>
														<span>
															{monthNames[cost.month - 1]} {cost.year}
														</span>
													</div>
												</TableCell>
												<TableCell className="text-right font-medium text-green-600">
													{formatCurrency(cost.cost, cost.currency)}
												</TableCell>
												<TableCell className="text-center text-muted-foreground text-sm">
													{new Date(cost.createdAt).toLocaleDateString()}
												</TableCell>
												<TableCell className="text-center">
													<div className="flex justify-center gap-1">
														<Button
															variant="ghost"
															size="sm"
															className="h-8 w-8 p-0"
															onClick={() => openEditDialog(cost)}
														>
															<Edit className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
															onClick={() => openDeleteDialog(cost)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Edit Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Advertising Cost</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleEdit} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="edit-month">Month</Label>
								<Select
									value={formData.month}
									onValueChange={(value) => setFormData({ ...formData, month: value })}
								>
									<SelectTrigger>
										{formData.month
											? monthNames[Number.parseInt(formData.month, 10) - 1]
											: "Select month"}
									</SelectTrigger>
									<SelectContent>
										{monthNames.map((month, index) => (
											<SelectItem key={month} value={(index + 1).toString()}>
												{month}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="edit-year">Year</Label>
								<Select
									value={formData.year}
									onValueChange={(value) => setFormData({ ...formData, year: value })}
								>
									<SelectTrigger>{formData.year || "Select year"}</SelectTrigger>
									<SelectContent>
										{years.map((year) => (
											<SelectItem key={year} value={year.toString()}>
												{year}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor={editCostInputId}>Cost</Label>
								<Input
									id={editCostInputId}
									type="number"
									step="0.01"
									placeholder="0.00"
									value={formData.cost}
									onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
									required
								/>
							</div>
							<div>
								<Label htmlFor="edit-currency">Currency</Label>
								<Select
									value={formData.currency}
									onValueChange={(value) => setFormData({ ...formData, currency: value })}
								>
									<SelectTrigger>{formData.currency}</SelectTrigger>
									<SelectContent>
										<SelectItem value="RM">RM</SelectItem>
										<SelectItem value="USD">USD</SelectItem>
										<SelectItem value="EUR">EUR</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="flex justify-end gap-2">
							<Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
								Cancel
							</Button>
							<Button type="submit">Update Cost</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Delete Advertising Cost</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-muted-foreground text-sm">
							Are you sure you want to delete the advertising cost for{" "}
							<span className="font-medium text-foreground">
								{costToDelete && `${monthNames[costToDelete.month - 1]} ${costToDelete.year}`}
							</span>
							? This action cannot be undone.
						</p>
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
