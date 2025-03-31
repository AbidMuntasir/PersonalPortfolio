import {
  Cloud, 
  Code, 
  Server, 
  Database,
  Github
} from "lucide-react";

import { 
  SiJavascript, 
  SiReact, 
  SiNodedotjs, 
  SiExpress, 
  SiMongodb, 
  SiPostgresql, 
  SiDocker, 
  SiAmazonwebservices, 
  SiGit, 
  SiTypescript, 
  SiVuedotjs, 
  SiD3Dotjs
} from "react-icons/si";
import { FaHtml5, FaCss3Alt } from "react-icons/fa";

// Skills data
export const frontendSkills = [
  { name: "JavaScript", percentage: 95 },
  { name: "React.js", percentage: 90 },
  { name: "HTML/CSS", percentage: 98 },
  { name: "TypeScript", percentage: 85 },
  // To add more frontend skills, copy this format:
  // { name: "Skill Name", percentage: 85 }, 
  // Percentage should be between 0-100
  
  // EXAMPLES - Remove comments to activate or modify as needed
  // { name: "Vue.js", percentage: 80 },
  // { name: "Tailwind CSS", percentage: 95 },
  // { name: "Responsive Design", percentage: 90 },
];

export const backendSkills = [
  { name: "Node.js", percentage: 92 },
  { name: "Express", percentage: 88 },
  { name: "MongoDB", percentage: 80 },
  { name: "SQL", percentage: 85 },
  // To add more backend skills, copy this format:
  // { name: "Skill Name", percentage: 85 },
  // Percentage should be between 0-100
  
  // EXAMPLES - Remove comments to activate or modify as needed
  // { name: "Python", percentage: 95 },
  // { name: "Django", percentage: 88 },
  // { name: "Flask", percentage: 85 },
  // { name: "PostgreSQL", percentage: 90 },
  // { name: "Docker", percentage: 75 },
];

/*
Available technology icons from react-icons:
- SiJavascript (JavaScript)
- SiReact (React)
- SiNodedotjs (Node.js)
- SiExpress (Express)
- SiMongodb (MongoDB)
- SiPostgresql (PostgreSQL)
- SiDocker (Docker)
- SiAmazonwebservices (AWS)
- SiGit (Git)
- SiTypescript (TypeScript)
- SiVuedotjs (Vue.js)
- SiD3Dotjs (D3.js)
- FaHtml5 (HTML5)
- FaCss3Alt (CSS3)

For more icons, you can import others from:
- react-icons/si (for SiIconName - branded/technology icons)
- react-icons/fa (for FaIconName - FontAwesome icons)
- lucide-react (for component icons like Cloud, Code, etc.)
*/

export const technologies = [
  { name: "React", icon: SiReact, iconClass: "text-blue-500" },
  { name: "Node.js", icon: SiNodedotjs, iconClass: "text-green-600" },
  { name: "AWS", icon: SiAmazonwebservices, iconClass: "text-orange-400" },
  { name: "Docker", icon: SiDocker, iconClass: "text-blue-600" },
  { name: "Git", icon: SiGit, iconClass: "text-gray-800" },
  { name: "MongoDB", icon: SiMongodb, iconClass: "text-green-500" },
  // To add a new technology, use this format:
  // { name: "Technology Name", icon: IconComponentName, iconClass: "text-color-shade" },
  // For icon colors, you can use Tailwind colors like:
  // text-blue-500, text-green-600, text-purple-700, text-red-500, etc.
  
  // EXAMPLES - Remove comments to activate or modify as needed
  // { name: "JavaScript", icon: SiJavascript, iconClass: "text-yellow-500" },
  // { name: "TypeScript", icon: SiTypescript, iconClass: "text-blue-700" },
  // { name: "Vue.js", icon: SiVuedotjs, iconClass: "text-green-500" },
  // { name: "PostgreSQL", icon: SiPostgresql, iconClass: "text-blue-800" },
  // { name: "HTML5", icon: FaHtml5, iconClass: "text-orange-600" },
  // { name: "CSS3", icon: FaCss3Alt, iconClass: "text-blue-500" },
  // { name: "Express", icon: SiExpress, iconClass: "text-gray-800" },
  // { name: "D3.js", icon: SiD3Dotjs, iconClass: "text-orange-500" },
];

// Projects data
export const projects = [
  {
    title: "E-commerce Platform",
    description: "A full-featured online store with payment processing, inventory management, and analytics dashboard.",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    category: "Web App",
    categoryClass: "bg-primary",
    technologies: [
      { name: "React", class: "bg-blue-100 text-blue-600" },
      { name: "Node.js", class: "bg-green-100 text-green-600" },
      { name: "MongoDB", class: "bg-purple-100 text-purple-600" },
      { name: "Stripe", class: "bg-yellow-100 text-yellow-600" },
    ],
    demoLink: "#",
    demoText: "Live Demo",
    codeLink: "#",
  },
  {
    title: "Task Management App",
    description: "A productivity app with drag-and-drop interface, notifications, and team collaboration features.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    category: "Mobile App",
    categoryClass: "bg-green-500",
    technologies: [
      { name: "React Native", class: "bg-blue-100 text-blue-600" },
      { name: "Firebase", class: "bg-gray-100 text-gray-600" },
      { name: "Redux", class: "bg-red-100 text-red-600" },
    ],
    demoLink: "#",
    demoText: "App Store",
    codeLink: "#",
  },
  {
    title: "Analytics Dashboard",
    description: "Real-time data visualization platform with customizable widgets and reporting features.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    category: "Dashboard",
    categoryClass: "bg-purple-500",
    technologies: [
      { name: "Vue.js", class: "bg-blue-100 text-blue-600" },
      { name: "D3.js", class: "bg-green-100 text-green-600" },
      { name: "Express", class: "bg-indigo-100 text-indigo-600" },
      { name: "PostgreSQL", class: "bg-red-100 text-red-600" },
    ],
    demoLink: "#",
    demoText: "Live Demo",
    codeLink: "#",
  },
  
  // ADDING A NEW PROJECT TEMPLATE - Copy this template and fill in your details
  /*
  {
    title: "Your Project Title",
    description: "A brief description of your project and what it does. What problems does it solve?",
    image: "URL to project image or screenshot", // Use Unsplash, Imgur, or your own hosted images
    category: "Project Category", // Examples: Web App, Mobile App, Dashboard, API, Data Analysis, etc.
    categoryClass: "bg-primary", // or choose from: bg-green-500, bg-purple-500, bg-red-500, etc.
    technologies: [
      { name: "Technology 1", class: "bg-blue-100 text-blue-600" },
      { name: "Technology 2", class: "bg-green-100 text-green-600" },
      { name: "Technology 3", class: "bg-purple-100 text-purple-600" },
      // Add more technologies as needed
    ],
    demoLink: "URL to live demo or deployed app",
    demoText: "Live Demo", // or "View Site", "App Store", "Play Store", etc.
    codeLink: "URL to GitHub repository or code",
  },
  */
  
  // Example of adding your own project (commented out - remove /* and */ to activate)
  /*
  {
    title: "Data Scraping Tool",
    description: "Automated web scraping tool that extracts product information from e-commerce sites and exports to structured CSV files.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    category: "Python App",
    categoryClass: "bg-primary",
    technologies: [
      { name: "Python", class: "bg-blue-100 text-blue-600" },
      { name: "BeautifulSoup", class: "bg-green-100 text-green-600" },
      { name: "Pandas", class: "bg-purple-100 text-purple-600" },
      { name: "Selenium", class: "bg-yellow-100 text-yellow-600" },
    ],
    demoLink: "https://github.com/yourusername/project-name",
    demoText: "Demo Video",
    codeLink: "https://github.com/yourusername/project-name",
  },
  */
];
