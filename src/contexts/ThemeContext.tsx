import React, { createContext, useContext, useEffect } from "react";

interface ThemeContextType {
  theme: "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always use dark theme
  const theme = "dark";

  useEffect(() => {
    // Ensure dark mode is always applied
    document.documentElement.classList.add("dark");
  }, []);

  // Keep toggleTheme function for API compatibility, but it does nothing now
  const toggleTheme = () => {
    // No-op since we only have dark mode now
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
