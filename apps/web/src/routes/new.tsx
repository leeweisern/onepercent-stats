import { useId, useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function NewLead() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const firstNameId = useId();
	const lastNameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const notesId = useId();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData);

		try {
			const response = await fetch("/api/leads", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				toast.success("Lead created successfully");
				(e.target as HTMLFormElement).reset();
			} else {
				toast.error("Failed to create lead");
			}
		} catch (_error) {
			toast.error("An error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<ProtectedRoute>
			<div className="container mx-auto p-6">
				<Card className="mx-auto max-w-2xl">
					<CardHeader>
						<CardTitle>Create New Lead</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor={firstNameId}>First Name</Label>
									<Input id={firstNameId} name="firstName" required />
								</div>
								<div className="space-y-2">
									<Label htmlFor={lastNameId}>Last Name</Label>
									<Input id={lastNameId} name="lastName" required />
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor={emailId}>Email</Label>
								<Input id={emailId} name="email" type="email" required />
							</div>

							<div className="space-y-2">
								<Label htmlFor={phoneId}>Phone</Label>
								<Input id={phoneId} name="phone" type="tel" />
							</div>

							<div className="space-y-2">
								<Label htmlFor="platform">Platform</Label>
								<Select name="platform" required>
									<SelectTrigger>
										<SelectValue placeholder="Select platform" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="facebook">Facebook</SelectItem>
										<SelectItem value="instagram">Instagram</SelectItem>
										<SelectItem value="google">Google</SelectItem>
										<SelectItem value="website">Website</SelectItem>
										<SelectItem value="referral">Referral</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<Select name="status" defaultValue="new">
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="new">New</SelectItem>
										<SelectItem value="contacted">Contacted</SelectItem>
										<SelectItem value="qualified">Qualified</SelectItem>
										<SelectItem value="converted">Converted</SelectItem>
										<SelectItem value="lost">Lost</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor={notesId}>Notes</Label>
								<Textarea id={notesId} name="notes" rows={3} />
							</div>

							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? "Creating..." : "Create Lead"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	);
}
