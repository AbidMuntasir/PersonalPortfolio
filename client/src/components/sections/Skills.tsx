import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useQuery } from "@tanstack/react-query";
import { Skill } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { technologies } from "@/lib/data"; // Keep technologies for icons

interface SkillsResponse {
  skills: Skill[];
}

export default function Skills() {
  const { ref, inView } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [frontendSkills, setFrontendSkills] = useState<Skill[]>([]);
  const [backendSkills, setBackendSkills] = useState<Skill[]>([]);
  
  // Fetch skills from API
  const { data, isLoading, isError } = useQuery<SkillsResponse>({
    queryKey: ['/api/skills'],
  });
  
  // Organize skills by category when data is available
  useEffect(() => {
    if (data?.skills) {
      setFrontendSkills(data.skills.filter(skill => skill.category === 'frontend'));
      setBackendSkills(data.skills.filter(skill => skill.category === 'backend'));
    }
  }, [data]);
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Loading and empty state renderers
  const renderSkeletonItems = () => (
    Array(4).fill(0).map((_, i) => (
      <div key={i} className="mb-6">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-2.5 w-full" />
      </div>
    ))
  );

  return (
    <section id="skills" ref={ref} className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans mb-2 text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400 inline">My Skills</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            I've worked with a variety of technologies throughout my career. Here's a snapshot of my technical expertise.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <h3 className="text-xl font-bold font-sans mb-6 text-gray-900 dark:text-white">Frontend Development</h3>
            
            {isLoading ? (
              renderSkeletonItems()
            ) : frontendSkills.length > 0 ? (
              frontendSkills.map((skill, index) => (
                <motion.div 
                  key={skill.id} 
                  className="mb-6 group cursor-pointer"
                  initial={{ opacity: 0, width: 0 }}
                  animate={inView ? { opacity: 1, width: "100%" } : { opacity: 0, width: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">
                      {skill.name}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={inView ? skill.level : 0} 
                      className="h-2.5 bg-gray-200 dark:bg-gray-600 overflow-hidden" 
                    />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No frontend skills added yet. Add them in the Admin panel.</p>
            )}
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <h3 className="text-xl font-bold font-sans mb-6 text-gray-900 dark:text-white">Backend Development</h3>
            
            {isLoading ? (
              renderSkeletonItems()
            ) : backendSkills.length > 0 ? (
              backendSkills.map((skill, index) => (
                <motion.div 
                  key={skill.id} 
                  className="mb-6 group cursor-pointer"
                  initial={{ opacity: 0, width: 0 }}
                  animate={inView ? { opacity: 1, width: "100%" } : { opacity: 0, width: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">
                      {skill.name}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={inView ? skill.level : 0} 
                      className="h-2.5 bg-gray-200 dark:bg-gray-600 overflow-hidden" 
                    />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No backend skills added yet. Add them in the Admin panel.</p>
            )}
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {technologies.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <motion.div 
                key={tech.name} 
                className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md text-center group cursor-pointer hover:shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ 
                  y: -5,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className={`mx-auto h-10 w-10 mb-3 ${tech.iconClass} group-hover:text-primary transition-colors duration-300`} />
                </motion.div>
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">{tech.name}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
