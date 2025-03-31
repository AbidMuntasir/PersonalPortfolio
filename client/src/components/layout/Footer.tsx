import { Github, Linkedin, Twitter, Dribbble, Code, Database, LineChart } from "lucide-react";
import { motion } from "framer-motion";
import { name, tagline, socialLinks as personalSocialLinks } from "@/lib/personal-info";

const navigation = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

// Map social icons to components
const iconMap: Record<string, any> = {
  Github,
  Linkedin,
  Twitter,
  Dribbble
};

// Use the actual social links from personal info
const socialLinks = personalSocialLinks.map(link => ({
  name: link.name,
  icon: iconMap[link.icon] || Github,
  href: link.href
}));

// Skills for the footer
const footerSkills = [
  { name: "Web Scraping", icon: Code },
  { name: "Data Analysis", icon: LineChart },
  { name: "Python", icon: Database }
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Split name into first and last name parts
  const nameParts = name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div 
            className="mb-6 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <a href="#home" className="text-2xl font-bold font-sans group">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">{firstName}</span>
              <span className="group-hover:text-primary transition-colors duration-300"> {lastName}</span>
            </a>
            <p className="text-gray-400 mt-2">{tagline}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {footerSkills.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <motion.div 
                    key={skill.name}
                    className="flex items-center text-gray-400 bg-gray-800 px-3 py-1 rounded-full text-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "rgba(139, 92, 246, 0.2)",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    {skill.name}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
          
          <motion.div 
            className="mb-6 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ul className="flex flex-wrap justify-center gap-6">
              {navigation.map((item, index) => (
                <motion.li 
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                >
                  <a 
                    href={item.href} 
                    className="text-gray-400 hover:text-primary transition-colors duration-300 relative group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex space-x-4">
              {socialLinks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.a 
                    key={item.name}
                    href={item.href}
                    className="text-gray-400 hover:text-primary bg-gray-800 p-2 rounded-full transition-all duration-300" 
                    aria-label={item.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(139, 92, 246, 0.2)" }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="border-t border-gray-800 mt-8 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-gray-400">© {currentYear} {name}. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}
