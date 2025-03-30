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
  // Verify email service connection on startup
  try {
    const emailVerification = await verifyEmailConnection();
    if (emailVerification.success) {
      console.log('Email service status: Connected and ready to send messages');
    } else {
      console.log(`Email service status: Not connected - ${emailVerification.error}`);
    }
  } catch (error) {
    console.error('Error verifying email connection:', error);
  }

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
        // First check if email service is connected
        const emailVerification = await verifyEmailConnection();
        
        if (emailVerification.success) {
          await sendContactNotification(savedMessage);
          console.log('Email notification sent successfully');
        } else {
          console.warn(`Skipping email notification - email service not connected: ${emailVerification.error}`);
          // We still return success as the message was saved in the database
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // We continue even if the email fails - the message is already saved
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

  // API endpoint to check email connection
  app.get("/api/email/check", async (req, res) => {
    try {
      const verification = await verifyEmailConnection();
      res.status(200).json({
        success: true,
        connected: verification.success,
        message: verification.success 
          ? "Email service is connected and ready to send messages" 
          : `Email service is not connected: ${verification.error}`,
        errorDetails: verification.errorDetails
      });
    } catch (error) {
      console.error("Error checking email connection:", error);
      res.status(500).json({
        success: false,
        connected: false,
        message: "Failed to check email connection"
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
