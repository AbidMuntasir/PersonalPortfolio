import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { Link } from "wouter";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectsResponse {
  projects: Project[];
}

export default function Projects() {
  const { ref, inView } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  
  // Fetch projects from API
  const { data, isLoading, isError } = useQuery<ProjectsResponse>({
    queryKey: ['/api/projects'],
  });
  
  // Filter for featured projects
  useEffect(() => {
    if (data?.projects) {
      setFeaturedProjects(data.projects.filter(project => project.featured).sort((a, b) => a.order - b.order));
    }
  }, [data]);
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  // Helper function to render project technology badges
  const renderTechBadges = (technologies: string[]) => {
    return technologies.map((tech, index) => (
      <Badge key={index} variant="outline" className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
        {tech}
      </Badge>
    ));
  };

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
          {isLoading ? (
            // Skeleton loading state for projects
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-6" />
                  <div className="flex gap-2 mb-6">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : featuredProjects.length > 0 ? (
            featuredProjects.map((project, index) => (
              <motion.div 
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="relative overflow-hidden" style={{ height: "200px" }}>
                  {project.imageUrl ? (
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400">No image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4">
                      <span className="text-white text-sm font-medium bg-primary px-2 py-1 rounded">
                        Featured
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold font-sans mb-2 text-gray-900 dark:text-white">{project.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {renderTechBadges(project.technologies)}
                  </div>
                  <div className="flex justify-between">
                    {project.demoUrl ? (
                      <a href={project.demoUrl} className="text-primary hover:text-primary/80 font-medium flex items-center" target="_blank" rel="noopener noreferrer">
                        <span>Live Demo</span>
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400">No demo available</span>
                    )}
                    {project.repoUrl ? (
                      <a href={project.repoUrl} className="text-primary hover:text-primary/80 font-medium flex items-center" target="_blank" rel="noopener noreferrer">
                        <span>Source Code</span>
                        <Github className="ml-1 h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400">Private repo</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No projects available. Add some in the Admin panel.</p>
            </div>
          )}
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
            className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md shadow-md"
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
