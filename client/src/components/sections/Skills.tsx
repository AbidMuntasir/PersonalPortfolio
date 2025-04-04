import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { dataSkills, automationSkills, technologies } from "@/lib/data";
import { useTheme } from "@/hooks/use-theme";

export default function Skills() {
  const { ref, inView } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const { isColorSchemeForced } = useTheme();
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

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
          <h2 
            className="text-3xl md:text-4xl font-bold font-sans mb-2 text-gray-900 dark:text-purple-300 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-200 inline"
            data-gradient-heading="true"
          >My Skills</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            I've worked with a variety of data technologies and tools. Here's a snapshot of my technical expertise.
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
            <h3 className="text-xl font-bold font-sans mb-6 text-gray-900 dark:text-white">Data Analysis</h3>
            
            {dataSkills.map((skill, index) => (
              <motion.div 
                key={skill.name} 
                className="mb-6 group cursor-pointer"
                initial={{ opacity: 0, width: 0 }}
                animate={inView ? { opacity: 1, width: "100%" } : { opacity: 0, width: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">{skill.name}</span>
                  <span className="text-gray-600 dark:text-gray-300">{skill.percentage}%</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={inView ? skill.percentage : 0} 
                    className="h-2.5 bg-gray-200 dark:bg-gray-600 overflow-hidden" 
                    data-forced-colors={isColorSchemeForced ? "true" : "false"}
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ width: `${skill.percentage}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <h3 className="text-xl font-bold font-sans mb-6 text-gray-900 dark:text-white">Automation & Scraping</h3>
            
            {automationSkills.map((skill, index) => (
              <motion.div 
                key={skill.name} 
                className="mb-6 group cursor-pointer"
                initial={{ opacity: 0, width: 0 }}
                animate={inView ? { opacity: 1, width: "100%" } : { opacity: 0, width: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">{skill.name}</span>
                  <span className="text-gray-600 dark:text-gray-300">{skill.percentage}%</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={inView ? skill.percentage : 0} 
                    className="h-2.5 bg-gray-200 dark:bg-gray-600 overflow-hidden" 
                    data-forced-colors={isColorSchemeForced ? "true" : "false"}
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ width: `${skill.percentage}%` }}
                  />
                </div>
              </motion.div>
            ))}
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
