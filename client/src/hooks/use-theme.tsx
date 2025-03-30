import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light"); // Initialize with default
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage or system preference (only once)
  useEffect(() => {
    if (!isInitialized) {
      // Check if theme is stored in localStorage
      const savedTheme = window.localStorage.getItem("theme") as Theme;
      // Check for system preference if no saved theme
      if (!savedTheme) {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
      } else {
        setTheme(savedTheme === "dark" ? "dark" : "light");
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Apply theme changes to document and save to localStorage
  useEffect(() => {
    if (isInitialized) {
      // Update documentElement class and localStorage when theme changes
      const root = window.document.documentElement;
      
      // First clear both classes to ensure clean state
      root.classList.remove('light');
      root.classList.remove('dark');
      
      // Then add the current theme
      root.classList.add(theme);
      
      // Also set a data attribute for additional CSS targeting
      root.setAttribute('data-theme', theme);
      
      console.log('Theme changed to:', theme);
      console.log('Classes on html element:', root.className);
      
      localStorage.setItem("theme", theme);
      
      // Only update the theme.json appearance when explicitly toggling theme
      // Not during initialization to avoid server request flood
      const updateServerTheme = async () => {
        try {
          await fetch('/api/theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appearance: theme }),
          });
        } catch (err) {
          console.error('Failed to update theme on server:', err);
        }
      };
      
      // Use a debounced server update to prevent rapid consecutive calls
      const timeoutId = setTimeout(updateServerTheme, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}