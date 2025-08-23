"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const ChartContainer = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		config: Record<string, any>;
	}
>(({ className, config, ...props }, ref) => {
	return <div ref={ref} className={cn("w-full", className)} {...props} />;
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn("rounded-lg border bg-background p-2 shadow-md", className)}
				{...props}
			/>
		);
	},
);
ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		active?: boolean;
		payload?: any[];
		label?: string;
	}
>(({ className, active, payload, label, ...props }, ref) => {
	if (!active || !payload?.length) {
		return null;
	}

	return (
		<div
			ref={ref}
			className={cn("rounded-lg border bg-background p-2 shadow-md", className)}
			{...props}
		>
			<div className="grid gap-2">
				{label && <div className="font-medium text-foreground">{label}</div>}
				{payload.map((entry, index) => (
					<div key={index} className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
						<span className="text-muted-foreground text-sm">
							{entry.name}: {entry.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
});
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };
