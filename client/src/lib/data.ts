import {
  Cloud, 
  Code, 
  Server, 
  Database,
  Github,
  LineChart,
  BarChart,
  LayoutDashboard
} from "lucide-react";

import { 
  SiPython,
  SiPandas,
  SiNumpy,
  SiScikitlearn,
  SiJupyter,
  SiSelenium,
  SiDocker, 
  SiAmazonwebservices, 
  SiGit
} from "react-icons/si";
import { FaRegChartBar, FaRobot, FaHtml5, FaChartBar, FaFileExcel } from "react-icons/fa";

// Skills data
export const dataSkills = [
  { name: "Python", percentage: 95 },
  { name: "Data Analysis", percentage: 90 },
  { name: "Web Scraping", percentage: 88 },
  { name: "Pandas", percentage: 92 },
  // To add more data skills, copy this format:
  // { name: "Skill Name", percentage: 85 }, 
  // Percentage should be between 0-100
  
  // EXAMPLES - Remove comments to activate or modify as needed
  // { name: "NumPy", percentage: 85 },
  // { name: "Data Visualization", percentage: 90 },
  // { name: "Jupyter Notebooks", percentage: 95 },
];

export const automationSkills = [
  { name: "Selenium", percentage: 90 },
  { name: "BeautifulSoup", percentage: 92 },
  { name: "API Integration", percentage: 85 },
  { name: "Streamlit Dashboards", percentage: 80 },
  // To add more automation skills, copy this format:
  // { name: "Skill Name", percentage: 85 }, 
  // Percentage should be between 0-100
  
  // EXAMPLES - Remove comments to activate or modify as needed
  // { name: "Workflow Automation", percentage: 85 },
  // { name: "Scheduled Tasks", percentage: 90 },
  // { name: "Data Pipeline", percentage: 80 },
];

/*
Available technology icons from react-icons:
- SiPython (Python)
- SiPandas (Pandas)
- SiNumpy (NumPy)
- SiJupyter (Jupyter)
- SiSelenium (Selenium)
- SiGit (Git)
- FaRegChartBar (Chart Bar)
- FaRobot (Robot - for automation)

For more icons, you can import others from:
- react-icons/si (for SiIconName - branded/technology icons)
- react-icons/fa (for FaIconName - FontAwesome icons)
- lucide-react (for component icons like LineChart, Database, etc.)
*/

export const technologies = [
  { name: "Python", icon: SiPython, iconClass: "text-blue-500" },
  { name: "Pandas", icon: SiPandas, iconClass: "text-blue-600" },
  { name: "Numpy", icon: SiNumpy, iconClass: "text-blue-700" },
  { name: "Selenium", icon: SiSelenium, iconClass: "text-green-600" },
  { name: "Excel", icon: FaFileExcel, iconClass: "text-green-700" },
  { name: "Automation", icon: FaRobot, iconClass: "text-gray-600" },
  // Add any additional technologies here
];

// Projects data
export const projects = [
  {
    title: "eCommerce Price Tracker",
    description: "Automated price tracking system for Startech Bangladesh that scrapes product information, monitors price changes, tracks new products, and displays data on an interactive dashboard.",
    image: "/images/projects/price-tracker-dashboard.png",
    category: "Web Scraping",
    categoryClass: "bg-blue-500",
    technologies: [
      { name: "Python", class: "bg-blue-100 text-blue-600" },
      { name: "Selenium", class: "bg-green-100 text-green-600" },
      { name: "Pandas", class: "bg-yellow-100 text-yellow-600" },
      { name: "Streamlit", class: "bg-red-100 text-red-600" },
      { name: "BeautifulSoup", class: "bg-purple-100 text-purple-600" },
    ],
    demoLink: "https://startech-price-tracker.streamlit.app/",
    demoText: "Live Demo",
    codeLink: "https://github.com/AbidMuntasir/eCommerce-Price-Tracker",
    featured: true,
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
