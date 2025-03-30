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
];

export const backendSkills = [
  { name: "Node.js", percentage: 92 },
  { name: "Express", percentage: 88 },
  { name: "MongoDB", percentage: 80 },
  { name: "SQL", percentage: 85 },
];

export const technologies = [
  { name: "React", icon: SiReact, iconClass: "text-blue-500" },
  { name: "Node.js", icon: SiNodedotjs, iconClass: "text-green-600" },
  { name: "AWS", icon: SiAmazonwebservices, iconClass: "text-orange-400" },
  { name: "Docker", icon: SiDocker, iconClass: "text-blue-600" },
  { name: "Git", icon: SiGit, iconClass: "text-gray-800" },
  { name: "MongoDB", icon: SiMongodb, iconClass: "text-green-500" },
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
];
