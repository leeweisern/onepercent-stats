import { Edit2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

interface User {
	id: string;
	name: string;
	email: string;
	role: "admin" | "employee";
	emailVerified: boolean;
	createdAt: string;
}

interface Platform {
	id: number;
	name: string;
	active: number;
	leadCount: number;
	createdAt: string;
	updatedAt: string;
}

interface Trainer {
	id: number;
	handle: string;
	name: string | null;
	active: number;
	leadCount: number;
	createdAt: string;
	updatedAt: string;
}

export default function AdminPage() {
	const [activeTab, setActiveTab] = useState("users");

	// Users state
	const [users, setUsers] = useState<User[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(true);
	const [isDeleting, setIsDeleting] = useState<string | null>(null);

	// Platforms state
	const [platforms, setPlatforms] = useState<Platform[]>([]);
	const [loadingPlatforms, setLoadingPlatforms] = useState(false);
	const [platformDialog, setPlatformDialog] = useState<{
		open: boolean;
		mode: "create" | "edit" | "merge" | "delete";
		data?: any;
	}>({ open: false, mode: "create" });
	const [platformFormData, setPlatformFormData] = useState({ name: "" });

	// Trainers state
	const [trainers, setTrainers] = useState<Trainer[]>([]);
	const [loadingTrainers, setLoadingTrainers] = useState(false);
	const [trainerDialog, setTrainerDialog] = useState<{
		open: boolean;
		mode: "create" | "edit" | "merge" | "delete";
		data?: any;
	}>({ open: false, mode: "create" });
	const [trainerFormData, setTrainerFormData] = useState({ handle: "", name: "" });

	const { data: session } = authClient.useSession();

	// Check if current user is admin
	const isAdmin = session?.user && users.find((u) => u.id === session.user.id)?.role === "admin";

	// Fetch users
	const fetchUsers = useCallback(async () => {
		try {
			const response = await fetch("/api/admin/users", {
				credentials: "include",
			});

			if (!response.ok) {
				if (response.status === 403) {
					toast.error("Admin access required");
					return;
				}
				throw new Error("Failed to fetch users");
			}

			const data = await response.json();
			setUsers(data.users);
		} catch (error) {
			console.error("Error fetching users:", error);
			toast.error("Failed to load users");
		} finally {
			setLoadingUsers(false);
		}
	}, []);

	// Fetch platforms
	const fetchPlatforms = useCallback(async () => {
		setLoadingPlatforms(true);
		try {
			const response = await fetch("/api/admin/platforms?includeInactive=true", {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch platforms");
			}

			const data = await response.json();
			setPlatforms(data);
		} catch (error) {
			console.error("Error fetching platforms:", error);
			toast.error("Failed to load platforms");
		} finally {
			setLoadingPlatforms(false);
		}
	}, []);

	// Fetch trainers
	const fetchTrainers = useCallback(async () => {
		setLoadingTrainers(true);
		try {
			const response = await fetch("/api/admin/trainers?includeInactive=true", {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch trainers");
			}

			const data = await response.json();
			setTrainers(data);
		} catch (error) {
			console.error("Error fetching trainers:", error);
			toast.error("Failed to load trainers");
		} finally {
			setLoadingTrainers(false);
		}
	}, []);

	// Delete user
	const deleteUser = async (userId: string) => {
		if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
			return;
		}

		setIsDeleting(userId);
		try {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete user");
			}

			toast.success("User deleted successfully");
			fetchUsers();
		} catch (error) {
			console.error("Error deleting user:", error);
			toast.error(error instanceof Error ? error.message : "Failed to delete user");
		} finally {
			setIsDeleting(null);
		}
	};

	// Platform operations
	const handlePlatformSubmit = async () => {
		try {
			const url =
				platformDialog.mode === "edit"
					? `/api/admin/platforms/${platformDialog.data?.id}`
					: "/api/admin/platforms";

			const method = platformDialog.mode === "edit" ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(platformFormData),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to save platform");
			}

			toast.success(
				`Platform ${platformDialog.mode === "edit" ? "updated" : "created"} successfully`,
			);
			setPlatformDialog({ open: false, mode: "create" });
			setPlatformFormData({ name: "" });
			fetchPlatforms();
		} catch (error) {
			console.error("Error saving platform:", error);
			toast.error(error instanceof Error ? error.message : "Failed to save platform");
		}
	};

	const togglePlatformActive = async (platform: Platform) => {
		try {
			const response = await fetch(`/api/admin/platforms/${platform.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ active: platform.active === 1 ? 0 : 1 }),
			});

			if (!response.ok) {
				throw new Error("Failed to update platform");
			}

			toast.success(`Platform ${platform.active === 1 ? "deactivated" : "activated"} successfully`);
			fetchPlatforms();
		} catch (error) {
			console.error("Error updating platform:", error);
			toast.error("Failed to update platform");
		}
	};

	const deletePlatform = async (platform: Platform) => {
		if (platform.leadCount > 0) {
			toast.error(
				"Cannot delete platform with existing leads. Please reassign or delete leads first.",
			);
			return;
		}

		if (
			!confirm(`Are you sure you want to delete "${platform.name}"? This action cannot be undone.`)
		) {
			return;
		}

		try {
			const response = await fetch(`/api/admin/platforms/${platform.id}?hardDelete=true`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to delete platform");
			}

			toast.success("Platform deleted successfully");
			fetchPlatforms();
		} catch (error) {
			console.error("Error deleting platform:", error);
			toast.error("Failed to delete platform");
		}
	};

	// Trainer operations
	const handleTrainerSubmit = async () => {
		try {
			const url =
				trainerDialog.mode === "edit"
					? `/api/admin/trainers/${trainerDialog.data?.id}`
					: "/api/admin/trainers";

			const method = trainerDialog.mode === "edit" ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(trainerFormData),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to save trainer");
			}

			toast.success(
				`Trainer ${trainerDialog.mode === "edit" ? "updated" : "created"} successfully`,
			);
			setTrainerDialog({ open: false, mode: "create" });
			setTrainerFormData({ handle: "", name: "" });
			fetchTrainers();
		} catch (error) {
			console.error("Error saving trainer:", error);
			toast.error(error instanceof Error ? error.message : "Failed to save trainer");
		}
	};

	const toggleTrainerActive = async (trainer: Trainer) => {
		try {
			const response = await fetch(`/api/admin/trainers/${trainer.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ active: trainer.active === 1 ? 0 : 1 }),
			});

			if (!response.ok) {
				throw new Error("Failed to update trainer");
			}

			toast.success(`Trainer ${trainer.active === 1 ? "deactivated" : "activated"} successfully`);
			fetchTrainers();
		} catch (error) {
			console.error("Error updating trainer:", error);
			toast.error("Failed to update trainer");
		}
	};

	const deleteTrainer = async (trainer: Trainer) => {
		if (trainer.leadCount > 0) {
			toast.error(
				"Cannot delete trainer with existing leads. Please reassign or delete leads first.",
			);
			return;
		}

		if (
			!confirm(`Are you sure you want to delete "${trainer.handle}"? This action cannot be undone.`)
		) {
			return;
		}

		try {
			const response = await fetch(`/api/admin/trainers/${trainer.id}?hardDelete=true`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to delete trainer");
			}

			toast.success("Trainer deleted successfully");
			fetchTrainers();
		} catch (error) {
			console.error("Error deleting trainer:", error);
			toast.error("Failed to delete trainer");
		}
	};

	// Load data based on active tab
	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	useEffect(() => {
		if (activeTab === "platforms" && platforms.length === 0) {
			fetchPlatforms();
		} else if (activeTab === "trainers" && trainers.length === 0) {
			fetchTrainers();
		}
	}, [activeTab, fetchPlatforms, fetchTrainers, platforms.length, trainers.length]);

	if (loadingUsers) {
		return (
			<ProtectedRoute>
				<div className="flex items-center justify-center h-64">
					<div className="text-lg">Loading...</div>
				</div>
			</ProtectedRoute>
		);
	}

	if (!isAdmin) {
		return (
			<ProtectedRoute>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<Card>
						<CardHeader>
							<CardTitle>Access Denied</CardTitle>
							<CardDescription>You need admin privileges to access this page.</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Admin Management</h1>
					<p className="text-muted-foreground">Manage users, platforms, and trainers</p>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full max-w-md grid-cols-3">
						<TabsTrigger value="users">Users</TabsTrigger>
						<TabsTrigger value="platforms">Platforms</TabsTrigger>
						<TabsTrigger value="trainers">Trainers</TabsTrigger>
					</TabsList>

					{/* Users Tab */}
					<TabsContent value="users">
						<Card>
							<CardHeader>
								<CardTitle>Users ({users.length})</CardTitle>
								<CardDescription>All registered users in the system</CardDescription>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Role</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Created</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{users.map((user) => (
											<TableRow key={user.id}>
												<TableCell className="font-medium">{user.name}</TableCell>
												<TableCell>{user.email}</TableCell>
												<TableCell>
													<Badge variant={user.role === "admin" ? "default" : "secondary"}>
														{user.role}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge variant={user.emailVerified ? "default" : "destructive"}>
														{user.emailVerified ? "Verified" : "Unverified"}
													</Badge>
												</TableCell>
												<TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => deleteUser(user.id)}
														disabled={isDeleting === user.id || user.id === session?.user?.id}
														className="text-destructive hover:text-destructive"
													>
														{isDeleting === user.id ? (
															"Deleting..."
														) : (
															<Trash2 className="h-4 w-4" />
														)}
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Platforms Tab */}
					<TabsContent value="platforms">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between">
								<div>
									<CardTitle>
										Platforms ({platforms.filter((p) => p.active === 1).length} active)
									</CardTitle>
									<CardDescription>Manage platform options for leads</CardDescription>
								</div>
								<Button
									onClick={() => {
										setPlatformFormData({ name: "" });
										setPlatformDialog({ open: true, mode: "create" });
									}}
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Platform
								</Button>
							</CardHeader>
							<CardContent>
								{loadingPlatforms ? (
									<div className="text-center py-4">Loading platforms...</div>
								) : (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Name</TableHead>
												<TableHead>Lead Count</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Created</TableHead>
												<TableHead className="text-right">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{platforms.map((platform) => (
												<TableRow key={platform.id}>
													<TableCell className="font-medium">{platform.name}</TableCell>
													<TableCell>{platform.leadCount}</TableCell>
													<TableCell>
														<Badge variant={platform.active === 1 ? "default" : "secondary"}>
															{platform.active === 1 ? "Active" : "Inactive"}
														</Badge>
													</TableCell>
													<TableCell>{new Date(platform.createdAt).toLocaleDateString()}</TableCell>
													<TableCell className="text-right space-x-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																setPlatformFormData({ name: platform.name });
																setPlatformDialog({ open: true, mode: "edit", data: platform });
															}}
														>
															<Edit2 className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => togglePlatformActive(platform)}
														>
															{platform.active === 1 ? "Deactivate" : "Activate"}
														</Button>
														{platform.leadCount === 0 && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => deletePlatform(platform)}
																className="text-destructive hover:text-destructive"
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Trainers Tab */}
					<TabsContent value="trainers">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between">
								<div>
									<CardTitle>
										Trainers ({trainers.filter((t) => t.active === 1).length} active)
									</CardTitle>
									<CardDescription>Manage trainer options for leads</CardDescription>
								</div>
								<Button
									onClick={() => {
										setTrainerFormData({ handle: "", name: "" });
										setTrainerDialog({ open: true, mode: "create" });
									}}
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Trainer
								</Button>
							</CardHeader>
							<CardContent>
								{loadingTrainers ? (
									<div className="text-center py-4">Loading trainers...</div>
								) : (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Handle</TableHead>
												<TableHead>Lead Count</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Created</TableHead>
												<TableHead className="text-right">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{trainers.map((trainer) => (
												<TableRow key={trainer.id}>
													<TableCell className="font-medium">{trainer.handle}</TableCell>
													<TableCell>{trainer.leadCount}</TableCell>
													<TableCell>
														<Badge variant={trainer.active === 1 ? "default" : "secondary"}>
															{trainer.active === 1 ? "Active" : "Inactive"}
														</Badge>
													</TableCell>
													<TableCell>{new Date(trainer.createdAt).toLocaleDateString()}</TableCell>
													<TableCell className="text-right space-x-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																setTrainerFormData({ handle: trainer.handle });
																setTrainerDialog({ open: true, mode: "edit", data: trainer });
															}}
														>
															<Edit2 className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toggleTrainerActive(trainer)}
														>
															{trainer.active === 1 ? "Deactivate" : "Activate"}
														</Button>
														{trainer.leadCount === 0 && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => deleteTrainer(trainer)}
																className="text-destructive hover:text-destructive"
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Platform Dialog */}
				<Dialog
					open={platformDialog.open}
					onOpenChange={(open) => setPlatformDialog({ ...platformDialog, open })}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{platformDialog.mode === "edit" ? "Edit Platform" : "Create Platform"}
							</DialogTitle>
							<DialogDescription>
								{platformDialog.mode === "edit"
									? "Update the platform details below"
									: "Enter the details for the new platform"}
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="platform-name" className="text-right">
									Name
								</Label>
								<Input
									id="platform-name"
									value={platformFormData.name}
									onChange={(e) =>
										setPlatformFormData({ ...platformFormData, name: e.target.value })
									}
									className="col-span-3"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setPlatformDialog({ ...platformDialog, open: false })}
							>
								Cancel
							</Button>
							<Button onClick={handlePlatformSubmit}>
								{platformDialog.mode === "edit" ? "Update" : "Create"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Trainer Dialog */}
				<Dialog
					open={trainerDialog.open}
					onOpenChange={(open) => setTrainerDialog({ ...trainerDialog, open })}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{trainerDialog.mode === "edit" ? "Edit Trainer" : "Create Trainer"}
							</DialogTitle>
							<DialogDescription>
								{trainerDialog.mode === "edit"
									? "Update the trainer details below"
									: "Enter the details for the new trainer"}
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="trainer-handle" className="text-right">
									Handle
								</Label>
								<Input
									id="trainer-handle"
									value={trainerFormData.handle}
									onChange={(e) =>
										setTrainerFormData({ ...trainerFormData, handle: e.target.value })
									}
									className="col-span-3"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setTrainerDialog({ ...trainerDialog, open: false })}
							>
								Cancel
							</Button>
							<Button onClick={handleTrainerSubmit}>
								{trainerDialog.mode === "edit" ? "Update" : "Create"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</ProtectedRoute>
	);
}
