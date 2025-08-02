import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";
import { useEffect, useState } from "react";

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div style={{ visibility: "hidden" }}>{children}</div>;
	}

	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export { useTheme } from "next-themes";
