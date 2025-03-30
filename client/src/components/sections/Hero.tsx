import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Dribbble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTypingEffect } from "@/hooks/use-typing-effect";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "Dribbble", icon: Dribbble, href: "https://dribbble.com" },
];

export default function Hero() {
  const roles = ["Full Stack Developer", "UI/UX Designer", "Problem Solver", "Creative Thinker"];
  const text = useTypingEffect(roles, { typingSpeed: 100, deleteSpeed: 50, delayBeforeDelete: 1000, delayBeforeType: 300 });
  const { theme } = useTheme();

  return (
    <section id="home" className={cn(
      "min-h-screen flex items-center pt-16 pb-10",
      theme === "dark" 
        ? "bg-gradient-to-br from-background to-background/80" 
        : "bg-gradient-to-br from-background to-background/80"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div 
            className="md:w-1/2 mb-10 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-sans leading-tight mb-4 text-foreground">
              Hi, I'm <span className="text-primary">John Doe</span>
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium mb-6 h-8 text-muted-foreground">
              {text}
            </h2>
            <p className="text-lg mb-8 max-w-xl text-muted-foreground">
              I build exceptional digital experiences that are fast, accessible, visually appealing, and responsive. Let's turn your vision into reality.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md shadow-md"
                asChild
              >
                <a href="#projects">View My Work</a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary font-medium rounded-md hover:bg-primary/10"
                asChild
              >
                <a href="#contact">Contact Me</a>
              </Button>
            </div>
          </motion.div>
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className={cn(
              "w-64 h-64 md:w-80 md:h-80 overflow-hidden rounded-full mx-auto shadow-xl border-4",
              theme === "dark" ? "border-muted" : "border-background"
            )}>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="John Doe profile"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
        <motion.div 
          className="flex justify-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex space-x-6">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a 
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  aria-label={item.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-6 w-6" />
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
