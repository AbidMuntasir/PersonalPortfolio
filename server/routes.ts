import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { ZodError } from "zod";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { sendContactNotification, verifyEmailConnection } from "./services/email";

const themeSchema = z.object({
  appearance: z.enum(["light", "dark", "system"])
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Check contact form status on startup
  try {
    const formStatus = await verifyEmailConnection();
    console.log('Contact form status:', formStatus.message);
  } catch (error) {
    console.error('Error checking contact form status:', error);
  }

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

  const httpServer = createServer(app);
  return httpServer;
}
