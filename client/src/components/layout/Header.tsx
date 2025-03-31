import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, Sun, Moon, Lock } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { name } from "@/lib/personal-info";
import { motion } from "framer-motion";

interface NavLink {
  name: string;
  href: string;
}

// Home links for the main page sections
const navLinks: NavLink[] = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" }
];

// Page navigation links
const pageLinks: NavLink[] = [
  { name: "All Projects", href: "/projects" },
  { name: "Blog", href: "/blogs" }
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
      
      // Update active link based on scroll position
      const sections = document.querySelectorAll("section[id]");
      sections.forEach(section => {
        const sectionTop = (section as HTMLElement).offsetTop - 100;
        const sectionHeight = (section as HTMLElement).offsetHeight;
        const sectionId = section.getAttribute("id") || "";
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveLink(sectionId);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Split the name into first and last name
  const nameParts = name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed w-full z-50 transition-all duration-300",
        isScrolled 
          ? "bg-background shadow-md" 
          : "bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <a 
            href="#home" 
            className="text-2xl font-bold font-sans text-foreground group"
          >
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400">
              {firstName}
            </span>
            <span className="group-hover:text-primary transition-colors duration-300"> {lastName}</span>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8">
              {location === "/" ? (
                // Show section links on homepage
                navLinks.map((link) => (
                  <a 
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "font-medium relative py-1 transition-colors duration-300",
                      activeLink === link.href.replace("#", "") 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-primary"
                    )}
                    onClick={() => setActiveLink(link.href.replace("#", ""))}
                  >
                    {link.name}
                    {activeLink === link.href.replace("#", "") && (
                      <motion.span 
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </a>
                ))
              ) : (
                // Show regular link back to homepage on other pages
                <Link 
                  to="/"
                  className="font-medium relative py-1 transition-colors duration-300 text-muted-foreground hover:text-primary"
                >
                  Home
                </Link>
              )}
              
              {/* Add page navigation links */}
              {pageLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "font-medium relative py-1 transition-colors duration-300",
                    location === link.href
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {link.name}
                  {location === link.href && (
                    <motion.span 
                      layoutId="page-indicator"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              ))}
            </nav>
            
            {/* Admin Link */}
            <Link 
              to="/admin"
              className={cn(
                "flex items-center text-sm font-medium py-1 px-3 rounded transition-colors duration-300",
                location === "/admin"
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <Lock className="h-4 w-4 mr-1" />
              Admin
            </Link>
            
            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-full transition-all duration-300 focus:outline-none bg-secondary",
                theme === "dark" 
                  ? "text-yellow-500 hover:bg-secondary/80" 
                  : "text-gray-700 hover:bg-secondary/80"
              )}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>
          </div>
          
          {/* Mobile Navigation Controls */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Theme Toggle Button (Mobile) */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-full transition-colors duration-300 focus:outline-none bg-secondary",
                theme === "dark" 
                  ? "text-yellow-500 hover:bg-secondary/80" 
                  : "text-gray-700 hover:bg-secondary/80"
              )}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>
            
            {/* Mobile Menu Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="focus:outline-none text-muted-foreground hover:text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden py-4 px-4 shadow-inner bg-card"
        >
          <div className="flex flex-col space-y-4">
            {location === "/" ? (
              // Home page section links
              <>
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "font-medium transition-colors duration-300 py-2 border-l-2",
                      activeLink === link.href.replace("#", "")
                        ? "text-primary border-primary pl-3" 
                        : "text-muted-foreground hover:text-primary border-transparent hover:border-primary/50 hover:pl-3"
                    )}
                    onClick={() => {
                      setActiveLink(link.href.replace("#", ""));
                      setMobileMenuOpen(false);
                    }}
                  >
                    {link.name}
                  </a>
                ))}
                
                {/* Page links */}
                <div className="pt-2 mt-2 border-t border-border">
                  {pageLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="font-medium transition-colors duration-300 py-2 border-l-2 block text-muted-foreground hover:text-primary border-transparent hover:border-primary/50 hover:pl-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              // Other pages
              <>
                <Link
                  to="/"
                  className="font-medium transition-colors duration-300 py-2 border-l-2 block text-muted-foreground hover:text-primary border-transparent hover:border-primary/50 hover:pl-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                
                {/* Page links */}
                {pageLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={cn(
                      "font-medium transition-colors duration-300 py-2 border-l-2 block",
                      location === link.href
                        ? "text-primary border-primary pl-3" 
                        : "text-muted-foreground hover:text-primary border-transparent hover:border-primary/50 hover:pl-3"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </>
            )}
            
            <div className="pt-2 mt-2 border-t border-border">
              <Link
                to="/admin"
                className={cn(
                  "font-medium transition-colors duration-300 py-2 border-l-2 flex items-center",
                  location === "/admin"
                    ? "text-primary border-primary pl-3" 
                    : "text-muted-foreground hover:text-primary border-transparent hover:border-primary/50 hover:pl-3"
                )}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
              >
                <Lock className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </div>
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
}
