import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMessageSchema, 
  loginSchema, 
  insertBlogSchema, 
  insertProjectSchema, 
  insertSkillSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { sendContactNotification, verifyEmailConnection } from "./services/email";
import session from "express-session";

// Session data augmentation
declare module "express-session" {
  interface Session {
    userId?: number;
  }
}

// Authentication middleware
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

const themeSchema = z.object({
  appearance: z.enum(["light", "dark", "system"])
});

// Auth middleware - check if user is logged in and has admin rights
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - Please log in" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy((err: Error | null) => {
        if (err) console.error("Error destroying invalid session:", err);
      });
      return res.status(401).json({ success: false, message: "Unauthorized - User not found" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden - Admin access required" });
    }

    // Add user info to request
    (req as AuthRequest).user = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ success: false, message: "Server error during authentication" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Check contact form status on startup
  try {
    const formStatus = await verifyEmailConnection();
    console.log('Contact form status:', formStatus.message);
  } catch (error) {
    console.error('Error checking contact form status:', error);
  }
  
  // Authentication routes
  app.post("/api/login", async (req: Request & { session: any }, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.validateUser(username, password);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }
      
      // Set user in session
      req.session.userId = user.id;
      
      res.status(200).json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid login data", 
          errors: error.errors 
        });
      }
      
      console.error("Login error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Login failed. Please try again later." 
      });
    }
  });
  
  app.post("/api/logout", (req: Request, res) => {
    req.session.destroy((err: Error | null) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to log out. Please try again." 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Logged out successfully" 
      });
    });
  });
  
  app.get("/api/session", async (req: Request, res) => {
    try {
      if (!req.session.userId) {
        return res.status(200).json({ 
          success: true, 
          authenticated: false 
        });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy((err: Error | null) => {
          if (err) console.error("Error destroying invalid session:", err);
        });
        
        return res.status(200).json({ 
          success: true, 
          authenticated: false 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error("Session check error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to check session" 
      });
    }
  });

  // API endpoint to get all messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.status(200).json({ 
        success: true, 
        messages: messages 
      });
    } catch (error) {
      console.error("Error retrieving messages:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to retrieve messages" 
      });
    }
  });

  // Handle contact form submissions
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      
      // Add current timestamp
      const messageWithTimestamp = {
        ...validatedData,
        createdAt: new Date().toISOString(),
      };
      
      // Store the message in the database
      const savedMessage = await storage.createMessage(messageWithTimestamp);
      
      // Send email notification
      try {
        // Store the message but don't worry about email sending
        await sendContactNotification(savedMessage);
        console.log('Contact form message processed successfully');
      } catch (emailError) {
        console.error('Error processing message:', emailError);
        // We continue even if there's an error - the message is already saved in the database
      }
      
      res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid form data", 
          errors: error.errors 
        });
      }
      
      console.error("Error saving message:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send message. Please try again later." 
      });
    }
  });

  // API endpoint to check contact form status
  app.get("/api/email/check", async (req, res) => {
    try {
      const status = await verifyEmailConnection();
      console.log('Contact form status check:', status.message);
      
      res.status(200).json({
        success: true,
        message: status.message
      });
    } catch (error) {
      console.error("Error checking contact form status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check contact form status"
      });
    }
  });

  // Handle theme toggle
  app.post("/api/theme", async (req, res) => {
    try {
      // Debounce frequent requests
      const { appearance } = themeSchema.parse(req.body);
      console.log(`Updating theme to: ${appearance}`);
      
      // Read the current theme.json file
      const themePath = join(process.cwd(), "theme.json");
      
      try {
        const themeFile = readFileSync(themePath, "utf-8");
        const theme = JSON.parse(themeFile);
        
        // Only update if there's an actual change
        if (theme.appearance !== appearance) {
          // Update the appearance property
          theme.appearance = appearance;
          
          // Write the updated theme back to the file
          writeFileSync(themePath, JSON.stringify(theme, null, 2));
          console.log(`Theme updated to: ${appearance}`);
        } else {
          console.log(`Theme already set to: ${appearance}, skipping update`);
        }
      } catch (fileError) {
        console.error("Error reading or parsing theme file:", fileError);
        // Continue with response anyway - don't fail the request
      }
      
      res.status(200).json({ success: true, message: "Theme updated successfully" });
    } catch (error) {
      console.error("Error processing theme update:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update theme" 
      });
    }
  });

  // BLOG ROUTES
  // Get all published blogs for public consumption
  app.get("/api/blogs", async (req, res) => {
    try {
      const blogs = await storage.getPublishedBlogs();
      res.status(200).json({ success: true, blogs });
    } catch (error) {
      console.error("Error retrieving blogs:", error);
      res.status(500).json({ success: false, message: "Failed to retrieve blogs" });
    }
  });

  // Get a single blog by slug for public consumption
  app.get("/api/blogs/:slug", async (req, res) => {
    try {
      const blog = await storage.getBlogBySlug(req.params.slug);
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
      
      if (!blog.published) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
      
      res.status(200).json({ success: true, blog });
    } catch (error) {
      console.error("Error retrieving blog:", error);
      res.status(500).json({ success: false, message: "Failed to retrieve blog" });
    }
  });

  // ADMIN BLOG ROUTES
  // Get all blogs (published and drafts) - admin only
  app.get("/api/admin/blogs", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const blogs = await storage.getBlogs();
      res.status(200).json({ success: true, blogs });
    } catch (error) {
      console.error("Error retrieving blogs for admin:", error);
      res.status(500).json({ success: false, message: "Failed to retrieve blogs" });
    }
  });

  // Create a new blog - admin only
  app.post("/api/admin/blogs", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const blogData = insertBlogSchema.parse(req.body);
      const timestamp = new Date().toISOString();
      
      const blog = await storage.createBlog({
        ...blogData,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      
      res.status(201).json({ success: true, blog });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid blog data", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating blog:", error);
      res.status(500).json({ success: false, message: "Failed to create blog" });
    }
  });

  // Update a blog - admin only
  app.put("/api/admin/blogs/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid blog ID" });
      }
      
      const blogData = insertBlogSchema.partial().parse(req.body);
      const timestamp = new Date().toISOString();
      
      const blog = await storage.updateBlog(id, {
        ...blogData,
        updatedAt: timestamp
      });
      
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
      
      res.status(200).json({ success: true, blog });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid blog data", 
          errors: error.errors 
        });
      }
      
      console.error("Error updating blog:", error);
      res.status(500).json({ success: false, message: "Failed to update blog" });
    }
  });

  // Delete a blog - admin only
  app.delete("/api/admin/blogs/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid blog ID" });
      }
      
      const success = await storage.deleteBlog(id);
      if (!success) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
      
      res.status(200).json({ success: true, message: "Blog deleted" });
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ success: false, message: "Failed to delete blog" });
    }
  });

  // PROJECT ROUTES
  // Get all projects for public consumption
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.status(200).json({ success: true, projects });
    } catch (error) {
      console.error("Error retrieving projects:", error);
      res.status(500).json({ success: false, message: "Failed to retrieve projects" });
    }
  });

  // Get featured projects
  app.get("/api/projects/featured", async (req, res) => {
    try {
      const projects = await storage.getFeaturedProjects();
      res.status(200).json({ success: true, projects });
    } catch (error) {
      console.error("Error retrieving featured projects:", error);
      res.status(500).json({ success: false, message: "Failed to retrieve featured projects" });
    }
  });

  // ADMIN PROJECT ROUTES
  // Create a new project - admin only
  app.post("/api/admin/projects", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      
      res.status(201).json({ success: true, project });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid project data", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating project:", error);
      res.status(500).json({ success: false, message: "Failed to create project" });
    }
  });

  // Update a project - admin only
  app.put("/api/admin/projects/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid project ID" });
      }
      
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, projectData);
      
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
      
      res.status(200).json({ success: true, project });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid project data", 
          errors: error.errors 
        });
      }
      
      console.error("Error updating project:", error);
      res.status(500).json({ success: false, message: "Failed to update project" });
    }
  });

  // Delete a project - admin only
  app.delete("/api/admin/projects/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid project ID" });
      }
      
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
      
      res.status(200).json({ success: true, message: "Project deleted" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ success: false, message: "Failed to delete project" });
    }
  });

  // SKILL ROUTES
  // Get all skills for public consumption
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.status(200).json({ success: true, skills });
    } catch (error) {
      console.error("Error retrieving skills:", error);
      res.status(500).json({ success: false, message: "Failed to retrieve skills" });
    }
  });

  // Get skills by category
  app.get("/api/skills/:category", async (req, res) => {
    try {
      const skills = await storage.getSkillsByCategory(req.params.category);
      res.status(200).json({ success: true, skills });
    } catch (error) {
      console.error("Error retrieving skills by category:", error);
      res.status(500).json({ success: false, message: "Failed to retrieve skills by category" });
    }
  });

  // ADMIN SKILL ROUTES
  // Create a new skill - admin only
  app.post("/api/admin/skills", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(skillData);
      
      res.status(201).json({ success: true, skill });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid skill data", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating skill:", error);
      res.status(500).json({ success: false, message: "Failed to create skill" });
    }
  });

  // Update a skill - admin only
  app.put("/api/admin/skills/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid skill ID" });
      }
      
      const skillData = insertSkillSchema.partial().parse(req.body);
      const skill = await storage.updateSkill(id, skillData);
      
      if (!skill) {
        return res.status(404).json({ success: false, message: "Skill not found" });
      }
      
      res.status(200).json({ success: true, skill });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid skill data", 
          errors: error.errors 
        });
      }
      
      console.error("Error updating skill:", error);
      res.status(500).json({ success: false, message: "Failed to update skill" });
    }
  });

  // Delete a skill - admin only
  app.delete("/api/admin/skills/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid skill ID" });
      }
      
      const success = await storage.deleteSkill(id);
      if (!success) {
        return res.status(404).json({ success: false, message: "Skill not found" });
      }
      
      res.status(200).json({ success: true, message: "Skill deleted" });
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ success: false, message: "Failed to delete skill" });
    }
  });

  // Add admin protection to the messages endpoint
  app.get("/api/admin/messages", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const messages = await storage.getMessages();
      res.status(200).json({ 
        success: true, 
        messages: messages 
      });
    } catch (error) {
      console.error("Error retrieving messages:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to retrieve messages" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
