import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { 
  name,
  aboutMe,
  location,
  education,
  experience,
  resumeLink
} from "@/lib/personal-info";
// Direct import of the profile image
import profileImage from "../../lib/photo.png";

export default function About() {
  const { ref, inView } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="about" ref={ref} className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans mb-2 dark:text-white">About Me</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get to know my professional journey and what drives me to create exceptional digital experiences.
          </p>
        </motion.div>
        
        <div className="flex flex-col md:flex-row">
          <motion.div 
            className="md:w-2/5 mb-10 md:mb-0"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <img 
              src={profileImage} 
              alt={`${name} professional photo`} 
              className="rounded-lg shadow-lg w-full object-cover h-[450px]"
            />
          </motion.div>
          
          <motion.div 
            className="md:w-3/5 md:pl-12"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold font-sans mb-4 text-gray-900 dark:text-white">Who I Am</h3>
            <div className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed space-y-4">
              {aboutMe.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-2 font-sans text-gray-900 dark:text-white">Education</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {education[0]?.institution || "University"}, {education[0]?.degree?.split(" ").pop() || "Degree"}
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2 font-sans text-gray-900 dark:text-white">Experience</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {experience?.length > 0 
                    ? `${experience.length}+ Years Professional` 
                    : "Professional Experience"}
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2 font-sans text-gray-900 dark:text-white">Location</h4>
                <p className="text-gray-600 dark:text-gray-300">{location}</p>
              </div>
              <div>
                <h4 className="font-bold mb-2 font-sans text-gray-900 dark:text-white">Availability</h4>
                <p className="text-gray-600 dark:text-gray-300">Available for Projects</p>
              </div>
            </div>
            
            <div className="mt-8">
              <a 
                href={resumeLink} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:text-blue-700 font-medium"
              >
                <span>Download Resume</span>
                <Download className="ml-2 h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
