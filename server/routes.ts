import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { IStorage } from "./storage";
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
import { Router } from "express";
import { getDb } from "./db";
import { users } from "../shared/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import PgSession from "connect-pg-simple";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import fetch from 'node-fetch';

// Define JWT token type
interface JwtPayload {
  userId: number;
  username: string;
  isAdmin: boolean;
}

// Auth request augmentation
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    is_admin: boolean;
  };
}

const themeSchema = z.object({
  appearance: z.enum(["light", "dark", "system"])
});

// Create JWT token
const createToken = (user: { id: number; username: string; is_admin: boolean }): string => {
  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    isAdmin: user.is_admin
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Auth middleware - check if user is logged in and has admin rights
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get auth token from cookie
    const token = req.cookies.auth_token;
    console.log('Auth middleware - checking token:', { 
      hasToken: !!token,
      tokenLength: token ? token.length : 0
    });
    
    if (!token) {
      console.log('No auth token in cookie');
      return res.status(401).json({ success: false, message: "Unauthorized - Please log in" });
    }
    
    // Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your-secret-key'
      ) as JwtPayload;
      
      console.log('Token verified successfully:', { 
        userId: decoded.userId, 
        username: decoded.username,
        isAdmin: decoded.isAdmin
      });
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
    }
    
    // Check admin status from token
    if (!decoded.isAdmin) {
      console.log('User is not an admin according to token');
      return res.status(403).json({ success: false, message: "Forbidden - Admin access required" });
    }
    
    // Verify user still exists in database
    const user = await storage.getUser(decoded.userId);
    console.log('User from database:', {
      found: !!user,
      isAdmin: user?.is_admin,
      username: user?.username,
      userId: user?.id
    });
    
    if (!user) {
      console.log('User not found in database');
      res.clearCookie('auth_token');
      return res.status(401).json({ success: false, message: "Unauthorized - User not found" });
    }
    
    if (!user.is_admin) {
      console.log('User is not an admin according to database');
      return res.status(403).json({ success: false, message: "Forbidden - Admin access required" });
    }
    
    // Add user info to request
    (req as AuthRequest).user = {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin
    };
    
    console.log('Auth successful, proceeding to route');
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ success: false, message: "Server error during authentication" });
  }
};

// Remove the router and its login route since we're not using it
// const router = Router();
// router.post("/login", async (req, res) => { ... });

export async function registerRoutes(app: Express, storage: IStorage): Promise<Server> {
  // Trust first proxy for session handling
  app.set('trust proxy', 1);
  
  // Add cookie parser middleware
  app.use(cookieParser());

  // Determine environment and cookie settings
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = !isProduction;

  // Log configuration
  console.log('Authentication configuration:', {
    environment: process.env.NODE_ENV || 'development',
    cookieSecure: true,
    authMethod: 'JWT'
  });

  // Add a health check endpoint to keep the database warm
  app.get("/api/health", async (req: Request, res: Response) => {
    try {
      // Test database connection
      const db = await getDb();
      await db.execute(sql`SELECT 1`);
      
      return res.status(200).json({
        success: true,
        message: "Service is healthy",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Health check failed:", error);
      return res.status(500).json({
        success: false,
        message: "Service is unhealthy",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Add a middleware to log cookie settings on each request
  app.use((req, res, next) => {
    if (isDevelopment) {
      console.log('Request details:', {
        hasAuthCookie: !!req.cookies.auth_token,
        secure: req.secure,
        protocol: req.protocol,
        'x-forwarded-proto': req.get('x-forwarded-proto'),
        'headers': {
          'cookie': req.headers.cookie,
          'host': req.headers.host,
          'origin': req.headers.origin,
          'referer': req.headers.referer
        }
      });
    }
    next();
  });

  // Check contact form status on startup
  try {
    const formStatus = await verifyEmailConnection();
    console.log('Contact form status:', formStatus.message);
  } catch (error) {
    console.error('Error checking contact form status:', error);
  }
  
  // Authentication routes
  app.post("/api/login", async (req: Request, res) => {
    try {
      console.log('Login attempt received:', { username: req.body.username });
      const { username, password } = loginSchema.parse(req.body);
      console.log('Validating user...');
      
      // Ensure database connection is working
      try {
        const db = await getDb();
        await db.execute(sql`SELECT 1`);
        console.log('Database connection successful!');
      } catch (dbError) {
        console.error('Database connection error:', dbError);
        return res.status(500).json({ 
          success: false, 
          message: "Database connection error. Please try again later." 
        });
      }
      
      const user = await storage.validateUser(username, password);
      
      if (!user) {
        console.log('Login failed: Invalid credentials');
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }
      
      console.log('User validated successfully:', { userId: user.id, username: user.username });
      
      // Generate JWT token
      const token = createToken(user);
      console.log('JWT token generated');
      
      // Set cookie with the token
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true, // Always true for Netlify
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });
      
      console.log('Auth cookie set');
      
      res.status(200).json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          is_admin: user.is_admin
        }
      });
    } catch (error) {
      console.error("Login error details:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid login data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Login failed. Please try again later." 
      });
    }
  });
  
  app.post("/api/logout", (req: Request, res) => {
    // Clear the auth cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/'
    });
    
    res.status(200).json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  });
  
  app.get("/api/session", async (req: Request, res) => {
    try {
      // Get auth token from cookie
      const token = req.cookies.auth_token;
      
      if (!token) {
        return res.status(200).json({ 
          success: true, 
          authenticated: false 
        });
      }
      
      // Verify token
      try {
        const decoded = jwt.verify(
          token, 
          process.env.JWT_SECRET || 'your-secret-key'
        ) as JwtPayload;
        
        // Verify user still exists in database
        const user = await storage.getUser(decoded.userId);
        
        if (!user) {
          res.clearCookie('auth_token');
          return res.status(200).json({ 
            success: true, 
            authenticated: false 
          });
        }
        
        return res.status(200).json({ 
          success: true, 
          authenticated: true,
          user: {
            id: user.id,
            username: user.username,
            is_admin: user.is_admin
          }
        });
      } catch (tokenError) {
        // Token is invalid or expired
        res.clearCookie('auth_token');
        return res.status(200).json({ 
          success: true, 
          authenticated: false 
        });
      }
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
        await sendContactNotification(savedMessage);
        console.log('Contact form message processed successfully');
      } catch (emailError) {
        console.error('Error processing message:', emailError);
        // We continue even if there's an error - the message is already saved in the database
      }
      
      // Trigger n8n webhook for AI auto-reply
      try {
        const webhookUrl = process.env.N8N_WEBHOOK_URL || '';
        
        if (webhookUrl) {
          const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(savedMessage),
          });
          
          console.log('n8n webhook triggered:', {
            status: webhookResponse.status,
            success: webhookResponse.ok
          });
        } else {
          console.log('N8N_WEBHOOK_URL not configured, skipping auto-reply webhook');
        }
      } catch (webhookError) {
        console.error('Error triggering n8n webhook:', webhookError);
        // Continue even if webhook fails - the message is saved in the database
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
      console.log('Admin messages request received from:', {
        userId: req.user?.id,
        username: req.user?.username,
        isAdmin: req.user?.is_admin
      });
      
      // Attempt to get messages
      const messages = await storage.getMessages();
      console.log(`Successfully retrieved ${messages.length} messages:`, {
        preview: messages.length > 0 ? 
          { 
            firstMessage: {
              id: messages[0].id,
              name: messages[0].name,
              email: messages[0].email,
              created_at: messages[0].created_at
            } 
          } : 'No messages'
      });
      
      return res.status(200).json({ 
        success: true, 
        messages: messages 
      });
    } catch (error) {
      console.error("Error retrieving messages:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to retrieve messages",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Add endpoint to delete a message
  app.delete("/api/admin/messages/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid message ID" });
      }
      
      console.log(`Deleting message with ID: ${id}`);
      const success = await storage.deleteMessage(id);
      
      if (!success) {
        return res.status(404).json({ 
          success: false, 
          message: "Message not found or could not be deleted" 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Message deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to delete message",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add a diagnostic endpoint for testing
  app.get("/api/admin/diagnostic", requireAdmin, async (req: AuthRequest, res) => {
    try {
      console.log('Admin diagnostic endpoint called');
      
      // Check database connection
      const db = await getDb();
      await db.execute(sql`SELECT 1`);
      console.log('Database connection successful in diagnostic endpoint');
      
      // Check if messages table exists and count records
      const messagesCount = await db.execute(sql`SELECT COUNT(*) FROM messages`);
      console.log('Messages count:', messagesCount.rows);
      
      // Try to fetch messages directly
      const rawMessages = await db.execute(sql`SELECT * FROM messages LIMIT 5`);
      console.log('Raw messages (first 5):', rawMessages.rows);
      
      // Try to fetch using storage
      const messages = await storage.getMessages();
      console.log(`Successfully retrieved ${messages.length} messages through storage`);
      
      // Return diagnostic info
      return res.status(200).json({
        success: true,
        diagnostic: {
          databaseConnection: true,
          messagesCount: messagesCount.rows[0],
          hasMessages: messages.length > 0,
          sampleMessages: messages.slice(0, 2)
        }
      });
    } catch (error) {
      console.error("Diagnostic error:", error);
      return res.status(500).json({
        success: false,
        message: "Diagnostic failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add a user diagnostic endpoint for testing
  app.get("/api/admin/user-test", async (req: Request, res) => {
    try {
      console.log('User-test diagnostic endpoint called');
      
      // Get auth token from cookie
      const token = req.cookies.auth_token;
      
      if (!token) {
        return res.status(200).json({
          success: true,
          diagnosticResult: "No auth token found in cookie"
        });
      }
      
      // Try to decode the token
      try {
        const decoded = jwt.verify(
          token, 
          process.env.JWT_SECRET || 'your-secret-key'
        ) as JwtPayload;
        
        console.log('Token decoded for diagnostic:', decoded);
        
        // Get user from database
        const user = await storage.getUser(decoded.userId);
        
        return res.status(200).json({
          success: true,
          diagnosticResult: {
            tokenDecoded: true,
            token: {
              userId: decoded.userId,
              username: decoded.username,
              isAdmin: decoded.isAdmin
            },
            userInDatabase: !!user,
            user: user ? {
              id: user.id,
              username: user.username,
              is_admin: user.is_admin
            } : null,
            adminStatus: {
              inToken: decoded.isAdmin,
              inDatabase: user?.is_admin
            },
            adminMatchesToken: decoded.isAdmin === user?.is_admin
          }
        });
      } catch (tokenError) {
        console.error('Token verification failed in diagnostic:', tokenError);
        return res.status(200).json({
          success: true,
          diagnosticResult: {
            tokenDecoded: false,
            error: tokenError instanceof Error ? tokenError.message : "Unknown error"
          }
        });
      }
    } catch (error) {
      console.error("User diagnostic error:", error);
      return res.status(500).json({
        success: false,
        message: "Diagnostic failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    console.log('Logout request received');
    res.clearCookie('auth_token', { 
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/'
    });
    console.log('Auth token cookie cleared');
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
