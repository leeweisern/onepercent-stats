import { createContext, useContext, useEffect } from "react";

type ThemeProviderProps = {
	children: React.ReactNode;
};

type ThemeProviderState = {
	theme: "light";
	setTheme: () => void;
};

const initialState: ThemeProviderState = {
	theme: "light",
	setTheme: () => null,
};

const ThemeContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove("dark");
		root.classList.add("light");
	}, []);

	const contextValue = {
		theme: "light" as const,
		setTheme: () => null,
	};

	return (
		<ThemeContext value={contextValue} {...props}>
			{children}
		</ThemeContext>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
	const context = useContext(ThemeContext);

	if (!context) throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};
