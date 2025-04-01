import { db } from './db';
import { 
  users, messages, blogs, projects, skills,
  type User, type InsertUser, 
  type Message, type InsertMessage,
  type Blog, type InsertBlog,
  type Project, type InsertProject,
  type Skill, type InsertSkill
} from '../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { IStorage } from './storage';

export class PostgresStorage implements IStorage {
  // User related methods
  async getUser(id: number): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.id, id)
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.username, username)
    });
  }

  async createUser(user: InsertUser): Promise<User> {
    const createdAt = new Date().toISOString();
    const [newUser] = await db.insert(users)
      .values({ ...user, createdAt })
      .returning();
    return newUser;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    console.log('Validating user in database:', { username });
    try {
      const user = await db.query.users.findFirst({
        where: and(
          eq(users.username, username),
          eq(users.password, password)
        )
      });
      
      if (user) {
        console.log('User found:', { userId: user.id, username: user.username });
      } else {
        console.log('No user found with these credentials');
      }
      
      return user || null;
    } catch (error) {
      console.error('Database error during user validation:', error);
      throw error;
    }
  }

  // Message related methods
  async getMessages(): Promise<Message[]> {
    return await db.query.messages.findMany({
      orderBy: desc(messages.createdAt)
    });
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return await db.query.messages.findFirst({
      where: eq(messages.id, id)
    });
  }

  async createMessage(message: InsertMessage & { createdAt: string }): Promise<Message> {
    const [newMessage] = await db.insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  // Blog related methods
  async getBlogs(): Promise<Blog[]> {
    return await db.query.blogs.findMany({
      orderBy: desc(blogs.createdAt)
    });
  }

  async getPublishedBlogs(): Promise<Blog[]> {
    return await db.query.blogs.findMany({
      where: eq(blogs.published, true),
      orderBy: desc(blogs.createdAt)
    });
  }

  async getBlog(id: number): Promise<Blog | undefined> {
    return await db.query.blogs.findFirst({
      where: eq(blogs.id, id)
    });
  }

  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    return await db.query.blogs.findFirst({
      where: eq(blogs.slug, slug)
    });
  }

  async createBlog(blog: InsertBlog & { createdAt: string, updatedAt: string }): Promise<Blog> {
    const [newBlog] = await db.insert(blogs)
      .values(blog)
      .returning();
    return newBlog;
  }

  async updateBlog(id: number, blog: Partial<InsertBlog> & { updatedAt: string }): Promise<Blog | undefined> {
    const [updatedBlog] = await db.update(blogs)
      .set(blog)
      .where(eq(blogs.id, id))
      .returning();
    return updatedBlog;
  }

  async deleteBlog(id: number): Promise<boolean> {
    const [deletedBlog] = await db.delete(blogs)
      .where(eq(blogs.id, id))
      .returning();
    return !!deletedBlog;
  }

  // Project related methods
  async getProjects(): Promise<Project[]> {
    return await db.query.projects.findMany({
      orderBy: [projects.order, desc(projects.id)]
    });
  }

  async getFeaturedProjects(): Promise<Project[]> {
    return await db.query.projects.findMany({
      where: eq(projects.featured, true),
      orderBy: [projects.order, desc(projects.id)]
    });
  }

  async getProject(id: number): Promise<Project | undefined> {
    return await db.query.projects.findFirst({
      where: eq(projects.id, id)
    });
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const [deletedProject] = await db.delete(projects)
      .where(eq(projects.id, id))
      .returning();
    return !!deletedProject;
  }

  // Skill related methods
  async getSkills(): Promise<Skill[]> {
    return await db.query.skills.findMany({
      orderBy: [skills.category, desc(skills.level)]
    });
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return await db.query.skills.findMany({
      where: eq(skills.category, category),
      orderBy: desc(skills.level)
    });
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    return await db.query.skills.findFirst({
      where: eq(skills.id, id)
    });
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills)
      .values(skill)
      .returning();
    return newSkill;
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined> {
    const [updatedSkill] = await db.update(skills)
      .set(skill)
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<boolean> {
    const [deletedSkill] = await db.delete(skills)
      .where(eq(skills.id, id))
      .returning();
    return !!deletedSkill;
  }
} 