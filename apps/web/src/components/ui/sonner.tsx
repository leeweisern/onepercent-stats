"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const [mounted, setMounted] = useState(false);
	const [theme, setTheme] = useState("system");

	useEffect(() => {
		setMounted(true);
		// Try to get theme from localStorage or default to system
		try {
			const savedTheme = localStorage.getItem("vite-ui-theme") || "system";
			setTheme(savedTheme);
		} catch {
			setTheme("system");
		}
	}, []);

	if (!mounted) {
		return (
			<Sonner
				theme="system"
				className="toaster group"
				style={
					{
						"--normal-bg": "var(--popover)",
						"--normal-text": "var(--popover-foreground)",
						"--normal-border": "var(--border)",
					} as React.CSSProperties
				}
				{...props}
			/>
		);
	}

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
