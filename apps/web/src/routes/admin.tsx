import { Trash2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
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
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";

interface User {
	id: string;
	name: string;
	email: string;
	role: "admin" | "employee";
	emailVerified: boolean;
	createdAt: string;
}

export default function AdminPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState<string | null>(null);
	const { data: session } = authClient.useSession();

	// Check if current user is admin
	const isAdmin = session?.user && users.find((u) => u.id === session.user.id)?.role === "admin";

	const fetchUsers = useCallback(async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/admin/users`, {
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
			setLoading(false);
		}
	}, []);

	const createUser = async (userData: {
		name: string;
		email: string;
		password: string;
		role: string;
	}) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/admin/users`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(userData),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create user");
			}

			toast.success("User created successfully");
			setIsCreateDialogOpen(false);
			fetchUsers();
		} catch (error) {
			console.error("Error creating user:", error);
			toast.error(error instanceof Error ? error.message : "Failed to create user");
		}
	};

	const deleteUser = async (userId: string) => {
		if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
			return;
		}

		setIsDeleting(userId);
		try {
			const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/admin/users/${userId}`, {
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

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const content = () => {
		if (loading) {
			return (
				<div className="flex items-center justify-center h-64">
					<div className="text-lg">Loading...</div>
				</div>
			);
		}

		if (!isAdmin) {
			return (
				<Card>
					<CardHeader>
						<CardTitle>Access Denied</CardTitle>
						<CardDescription>You need admin privileges to access this page.</CardDescription>
					</CardHeader>
				</Card>
			);
		}

		return (
			<>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-3xl font-bold">User Management</h1>
						<p className="text-muted-foreground">Manage employee accounts and permissions</p>
					</div>
					<CreateUserDialog
						isOpen={isCreateDialogOpen}
						onOpenChange={setIsCreateDialogOpen}
						onCreateUser={createUser}
					/>
				</div>

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
												{isDeleting === user.id ? "Deleting..." : <Trash2 className="h-4 w-4" />}
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</>
		);
	};

	return (
		<ProtectedRoute>
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
				{/* Page Header */}
				{content()}
			</div>
		</ProtectedRoute>
	);
}

function CreateUserDialog({
	isOpen,
	onOpenChange,
	onCreateUser,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateUser: (userData: { name: string; email: string; password: string; role: string }) => void;
}) {
	const nameInputId = useId();
	const emailInputId = useId();
	const passwordInputId = useId();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "employee",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await onCreateUser(formData);
			setFormData({ name: "", email: "", password: "", role: "employee" });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button>
					<UserPlus className="mr-2 h-4 w-4" />
					Add User
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New User</DialogTitle>
					<DialogDescription>
						Add a new employee to the system. They will be able to log in immediately.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={nameInputId} className="text-right">
								Name
							</Label>
							<Input
								id={nameInputId}
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={emailInputId} className="text-right">
								Email
							</Label>
							<Input
								id={emailInputId}
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={passwordInputId} className="text-right">
								Password
							</Label>
							<Input
								id={passwordInputId}
								type="password"
								value={formData.password}
								onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								className="col-span-3"
								minLength={8}
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="role" className="text-right">
								Role
							</Label>
							<Select
								value={formData.role}
								onValueChange={(value) => setFormData({ ...formData, role: value })}
							>
								<SelectTrigger className="col-span-3">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="employee">Employee</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create User"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
