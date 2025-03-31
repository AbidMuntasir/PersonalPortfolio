import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model with admin flag
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("isAdmin").default(false).notNull(),
  createdAt: text("createdAt").notNull(),
});

// Contact messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: text("createdAt").notNull(),
});

// Blog posts
export const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  tags: text("tags"), // Comma-separated tags string
  coverImage: text("coverImage"), // URL to cover image
  published: boolean("published").default(false).notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  technologies: text("technologies").array().notNull(),
  imageUrl: text("imageUrl"),
  demoUrl: text("demoUrl"),
  repoUrl: text("repoUrl"),
  featured: boolean("featured").default(false).notNull(),
  order: integer("order").default(0).notNull(),
});

// Skills
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  level: integer("level").default(0).notNull(),
  iconName: text("iconName"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

export const insertBlogSchema = createInsertSchema(blogs).pick({
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  tags: true,
  coverImage: true,
  published: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  title: true,
  description: true,
  technologies: true,
  imageUrl: true,
  demoUrl: true,
  repoUrl: true,
  featured: true,
  order: true,
});

export const insertSkillSchema = createInsertSchema(skills).pick({
  name: true,
  category: true,
  level: true,
  iconName: true,
});

// Authentication schema
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Blog = typeof blogs.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

export type LoginCredentials = z.infer<typeof loginSchema>;
