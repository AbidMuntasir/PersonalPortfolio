import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

export default function About() {
  const { ref, inView } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="about" ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans mb-2">About Me</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-3xl mx-auto">
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
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="John working at desk" 
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
            <h3 className="text-2xl font-bold font-sans mb-4 text-gray-900">Who I Am</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              I'm a passionate Full Stack Developer with over 5 years of experience creating web applications that deliver exceptional user experiences. My journey in tech began when I built my first website at 15, and I've been coding ever since.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              After graduating with a Computer Science degree from MIT, I worked with several startups before joining Amazon as a senior developer. Now, I provide freelance development services, focusing on React, Node.js, and cloud technologies.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              When I'm not coding, you can find me hiking mountain trails, experimenting with new recipes, or contributing to open-source projects.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-2 font-sans text-gray-900">Education</h4>
                <p className="text-gray-600">MIT, Computer Science</p>
              </div>
              <div>
                <h4 className="font-bold mb-2 font-sans text-gray-900">Experience</h4>
                <p className="text-gray-600">5+ Years Professional</p>
              </div>
              <div>
                <h4 className="font-bold mb-2 font-sans text-gray-900">Location</h4>
                <p className="text-gray-600">San Francisco, CA</p>
              </div>
              <div>
                <h4 className="font-bold mb-2 font-sans text-gray-900">Availability</h4>
                <p className="text-gray-600">Available for Freelance</p>
              </div>
            </div>
            
            <div className="mt-8">
              <a 
                href="#" 
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
