import { useState, useEffect } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface NavLink {
  name: string;
  href: string;
}

const navLinks: NavLink[] = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" }
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed w-full z-50 transition-all duration-300",
      isScrolled ? 
        (theme === "dark" ? "bg-gray-900 shadow-md" : "bg-white shadow-md") : 
        (theme === "dark" ? "bg-gray-900/80 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm")
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <a href="#home" className={cn(
            "text-2xl font-bold font-sans",
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          )}>
            <span className="text-primary">John</span> Doe
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "font-medium transition-colors duration-300",
                    theme === "dark" 
                      ? "text-gray-300 hover:text-primary" 
                      : "text-gray-600 hover:text-primary"
                  )}
                >
                  {link.name}
                </a>
              ))}
            </nav>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-full transition-colors duration-300 focus:outline-none",
                theme === "dark" 
                  ? "bg-gray-800 text-yellow-500 hover:bg-gray-700" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Mobile Navigation Controls */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Theme Toggle Button (Mobile) */}
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-full transition-colors duration-300 focus:outline-none",
                theme === "dark" 
                  ? "bg-gray-800 text-yellow-500 hover:bg-gray-700" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              className={cn(
                "focus:outline-none", 
                theme === "dark" ? "text-gray-300 hover:text-primary" : "text-gray-600 hover:text-primary"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className={cn(
          "md:hidden py-4 px-4 shadow-inner",
          theme === "dark" ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={cn(
                  "font-medium transition-colors duration-300 py-2",
                  theme === "dark" 
                    ? "text-gray-300 hover:text-primary" 
                    : "text-gray-600 hover:text-primary"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
