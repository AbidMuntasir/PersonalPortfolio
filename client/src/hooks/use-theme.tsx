import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create a theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light"); // Initialize with default
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage or system preference (only once)
  useEffect(() => {
    if (!isInitialized) {
      try {
        // Check if theme is stored in localStorage
        const savedTheme = window.localStorage.getItem("theme") as Theme;
        
        // Check for system preference if no saved theme
        if (!savedTheme) {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          setTheme(prefersDark ? "dark" : "light");
        } else {
          setTheme(savedTheme === "dark" ? "dark" : "light");
        }
      } catch (error) {
        console.error("Error initializing theme:", error);
        // Default to light theme if there's an error
        setTheme("light");
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Apply theme changes to document and save to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        // Update documentElement class when theme changes
        const root = window.document.documentElement;
        
        // First clear both classes to ensure clean state
        root.classList.remove('light');
        root.classList.remove('dark');
        
        // Then add the current theme
        root.classList.add(theme);
        
        // Save to localStorage for persistence
        localStorage.setItem("theme", theme);
        
        console.log('Theme changed to:', theme);
      } catch (error) {
        console.error("Error applying theme:", error);
      }
    }
  }, [theme, isInitialized]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Provide the theme context to children
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}