import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { ZodError } from "zod";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

const themeSchema = z.object({
  appearance: z.enum(["light", "dark", "system"])
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Handle contact form submissions
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      
      // Add current timestamp
      const messageWithTimestamp = {
        ...validatedData,
        createdAt: new Date().toISOString(),
      };
      
      const result = await storage.createMessage(messageWithTimestamp);
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

  // Handle theme toggle
  app.post("/api/theme", async (req, res) => {
    try {
      const { appearance } = themeSchema.parse(req.body);
      
      // Read the current theme.json file
      const themePath = join(process.cwd(), "theme.json");
      const themeFile = readFileSync(themePath, "utf-8");
      const theme = JSON.parse(themeFile);
      
      // Update the appearance property
      theme.appearance = appearance;
      
      // Write the updated theme back to the file
      writeFileSync(themePath, JSON.stringify(theme, null, 2));
      
      res.status(200).json({ success: true, message: "Theme updated successfully" });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update theme" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
