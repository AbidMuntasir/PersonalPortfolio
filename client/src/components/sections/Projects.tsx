import { motion } from "framer-motion";
import { ExternalLink, Github, Star } from "lucide-react";
import { Link } from "wouter";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { projects } from "@/lib/data";

export default function Projects() {
  const { ref, inView } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Filter and sort projects for the main page
  // 1. Put featured projects first
  // 2. Limit to maximum 3 projects (for main page)
  const displayedProjects = [...projects]
    .sort((a, b) => {
      // If a is featured and b is not, a comes first
      if (a.featured && !b.featured) return -1;
      // If b is featured and a is not, b comes first
      if (!a.featured && b.featured) return 1;
      // Otherwise keep original order
      return 0;
    })
    .slice(0, 3); // Show maximum 3 projects on main page

  return (
    <section id="projects" ref={ref} className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans mb-2 text-gray-900 dark:text-white">My Projects</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Here are some of my recent projects. Each one presented unique challenges and opportunities for growth.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProjects.map((project, index) => (
            <motion.div 
              key={project.title}
              className={`group bg-white dark:bg-gray-800 rounded-xl overflow-hidden 
                ${project.featured 
                  ? 'border-2 border-primary dark:border-primary shadow-lg hover:shadow-xl dark:shadow-primary/20 dark:hover:shadow-primary/30' 
                  : 'border border-transparent dark:border-gray-700 shadow-lg hover:shadow-xl dark:shadow-gray-900/30 dark:hover:shadow-purple-900/20'
                } 
                transition-all duration-300 hover:-translate-y-2`}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeIn}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{
                boxShadow: project.featured 
                  ? "0 20px 25px -5px rgba(139, 92, 246, 0.2), 0 10px 10px -5px rgba(139, 92, 246, 0.1)"
                  : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              {project.featured && (
                <div className="absolute top-0 right-0 mt-4 mr-4 z-10">
                  <div className="bg-primary rounded-full p-1 shadow-md animate-pulse">
                    <Star className="h-5 w-5 text-white" fill="white" />
                  </div>
                </div>
              )}
              <div className="relative overflow-hidden" style={{ height: "200px" }}>
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-4">
                    <span className={`text-white text-sm font-medium ${project.categoryClass} px-2 py-1 rounded`}>
                      {project.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold font-sans mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech) => (
                    <Badge key={tech.name} variant="outline" className={`${tech.class} transition-all duration-300 group-hover:scale-105`}>
                      {tech.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between">
                  <a 
                    href={project.demoLink} 
                    className="text-primary hover:text-primary/80 font-medium flex items-center transition-transform duration-300 hover:translate-x-1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <span>{project.demoText}</span>
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                  <a 
                    href={project.codeLink} 
                    className="text-primary hover:text-primary/80 font-medium flex items-center transition-transform duration-300 hover:translate-x-1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <span>Source Code</span>
                    <Github className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="text-center mt-12"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            asChild
          >
            <Link href="/projects" className="inline-flex items-center">
              <span>View All Projects</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
