
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full w-9 h-9 border-gray-600 hover:bg-gray-100 dark:border-gray-300 dark:hover:bg-gray-900"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-gray-800" />
      ) : (
        <Sun className="h-5 w-5 text-gray-200" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;

