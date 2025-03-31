import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Dribbble } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { insertMessageSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { contactEmail, contactPhone, location, socialLinks as personalSocialLinks } from "@/lib/personal-info";

const contactFormSchema = insertMessageSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

// Map social icons to corresponding components
const iconMap: Record<string, any> = {
  Github,
  Linkedin,
  Twitter,
  Dribbble
};

// Create social links with icons
const socialLinks = personalSocialLinks.map(link => ({
  name: link.name,
  icon: iconMap[link.icon] || Github, // Default to Github if icon not found
  href: link.href,
  bgClass: "bg-primary/10 text-primary hover:bg-primary hover:text-white"
}));

export default function Contact() {
  const { ref, inView } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thanks for your message. I'll get back to you soon.",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    contactMutation.mutate(data);
  };
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="contact" ref={ref} className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans mb-2 dark:text-white">Get In Touch</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Have a project in mind or want to discuss potential opportunities? I'd love to hear from you.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
            >
              <div className="mb-6">
                <Label htmlFor="name" className="block text-gray-900 dark:text-white font-medium mb-2">
                  Your Name
                </Label>
                <Input
                  id="name"
                  placeholder="John Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-primary"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <Label htmlFor="email" className="block text-gray-900 dark:text-white font-medium mb-2">
                  Your Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-primary"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <Label htmlFor="subject" className="block text-gray-900 dark:text-white font-medium mb-2">
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="Project Inquiry"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-primary"
                  {...form.register("subject")}
                />
                {form.formState.errors.subject && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.subject.message}
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <Label htmlFor="message" className="block text-gray-900 dark:text-white font-medium mb-2">
                  Your Message
                </Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Tell me about your project..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-primary"
                  {...form.register("message")}
                />
                {form.formState.errors.message && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.message.message}
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-md"
                disabled={contactMutation.isPending}
              >
                {contactMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="mb-10">
              <h3 className="text-2xl font-bold font-sans mb-6 text-gray-900 dark:text-white">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                    <Mail className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Email</h4>
                    <a href={`mailto:${contactEmail}`} className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-300">
                      {contactEmail}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                    <Phone className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Phone</h4>
                    <a 
                      href={`tel:${contactPhone.replace(/\s/g, '')}`} 
                      className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-300"
                    >
                      {contactPhone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                    <MapPin className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Location</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold font-sans mb-6 text-gray-900 dark:text-white">Follow Me</h3>
              <div className="flex space-x-5">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a 
                      key={item.name}
                      href={item.href}
                      className={`p-3 rounded-full transition-all duration-300 ${item.bgClass}`} 
                      aria-label={item.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
