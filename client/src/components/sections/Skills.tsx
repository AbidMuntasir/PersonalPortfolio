import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Skill } from '@shared/schema';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';

interface SkillsResponse {
  skills: Skill[];
}

export default function Skills() {
  const { ref, inView } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [leftColumnSkills, setLeftColumnSkills] = useState<Skill[]>([]);
  const [rightColumnSkills, setRightColumnSkills] = useState<Skill[]>([]);

  const { data, isLoading } = useQuery<SkillsResponse>({
    queryKey: ['/api/skills'],
  });

  useEffect(() => {
    if (data?.skills) {
      const midpoint = Math.ceil(data.skills.length / 2);
      setLeftColumnSkills(data.skills.slice(0, midpoint));
      setRightColumnSkills(data.skills.slice(midpoint));
    }
  }, [data]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

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
    <section ref={ref} className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-3xl font-bold text-center mb-12"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn}
        >
          Skills & Expertise
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isLoading ? (
              renderSkeletonItems()
            ) : leftColumnSkills.length > 0 ? (
              leftColumnSkills.map((skill, index) => (
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
              <p className="text-gray-500 dark:text-gray-400">No skills added yet. Add them in the Admin panel.</p>
            )}
          </motion.div>

          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isLoading ? (
              renderSkeletonItems()
            ) : rightColumnSkills.length > 0 ? (
              rightColumnSkills.map((skill, index) => (
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
              <p className="text-gray-500 dark:text-gray-400">No skills added yet. Add them in the Admin panel.</p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}