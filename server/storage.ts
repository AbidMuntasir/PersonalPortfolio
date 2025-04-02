import { 
  users, messages, blogs, projects, skills,
  type User, type InsertUser, 
  type Message, type InsertMessage,
  type Blog, type InsertBlog,
  type Project, type InsertProject,
  type Skill, type InsertSkill
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(username: string, password: string): Promise<User | null>;
  
  // Message related methods
  getMessages(): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage & { createdAt: string }): Promise<Message>;
  
  // Blog related methods
  getBlogs(): Promise<Blog[]>;
  getPublishedBlogs(): Promise<Blog[]>;
  getBlog(id: number): Promise<Blog | undefined>;
  getBlogBySlug(slug: string): Promise<Blog | undefined>;
  createBlog(blog: InsertBlog & { createdAt: string, updatedAt: string }): Promise<Blog>;
  updateBlog(id: number, blog: Partial<InsertBlog> & { updatedAt: string }): Promise<Blog | undefined>;
  deleteBlog(id: number): Promise<boolean>;
  
  // Project related methods
  getProjects(): Promise<Project[]>;
  getFeaturedProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Skill related methods
  getSkills(): Promise<Skill[]>;
  getSkillsByCategory(category: string): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private blogs: Map<number, Blog>;
  private projects: Map<number, Project>;
  private skills: Map<number, Skill>;
  
  currentUserId: number;
  currentMessageId: number;
  currentBlogId: number;
  currentProjectId: number;
  currentSkillId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.blogs = new Map();
    this.projects = new Map();
    this.skills = new Map();
    
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.currentBlogId = 1;
    this.currentProjectId = 1;
    this.currentSkillId = 1;
    
    // Create default admin user - using direct Map set to avoid circular dependency
    const adminId = this.currentUserId++;
    const createdAt = new Date().toISOString();
    this.users.set(adminId, {
      id: adminId,
      username: 'Abid', // Change this to your desired username
      password: '07928abid', // Change this to your desired password
      is_admin: true, // Use is_admin to match schema
      createdAt
    });
  }

  // User related methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date().toISOString();
    // Ensure is_admin is a boolean
    const is_admin = insertUser.is_admin === undefined ? false : insertUser.is_admin;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      is_admin 
    };
    this.users.set(id, user);
    return user;
  }
  
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
  
  // Message related methods
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async createMessage(messageData: InsertMessage & { createdAt: string }): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { ...messageData, id };
    this.messages.set(id, message);
    return message;
  }
  
  // Blog related methods
  async getBlogs(): Promise<Blog[]> {
    return Array.from(this.blogs.values());
  }
  
  async getPublishedBlogs(): Promise<Blog[]> {
    return Array.from(this.blogs.values()).filter(blog => blog.published);
  }
  
  async getBlog(id: number): Promise<Blog | undefined> {
    return this.blogs.get(id);
  }
  
  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    return Array.from(this.blogs.values()).find(
      blog => blog.slug === slug
    );
  }
  
  async createBlog(blogData: InsertBlog & { createdAt: string, updatedAt: string }): Promise<Blog> {
    const id = this.currentBlogId++;
    const published = blogData.published === undefined ? false : blogData.published;
    const blog: Blog = { 
      ...blogData, 
      id,
      published
    };
    this.blogs.set(id, blog);
    return blog;
  }
  
  async updateBlog(id: number, blogData: Partial<InsertBlog> & { updatedAt: string }): Promise<Blog | undefined> {
    const existingBlog = await this.getBlog(id);
    if (!existingBlog) return undefined;
    
    const updatedBlog: Blog = { ...existingBlog, ...blogData };
    this.blogs.set(id, updatedBlog);
    return updatedBlog;
  }
  
  async deleteBlog(id: number): Promise<boolean> {
    return this.blogs.delete(id);
  }
  
  // Project related methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
      .sort((a, b) => a.order - b.order);
  }
  
  async getFeaturedProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.featured)
      .sort((a, b) => a.order - b.order);
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(projectData: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    // Set default values for optional fields
    const featured = projectData.featured === undefined ? false : projectData.featured;
    const order = projectData.order === undefined ? 0 : projectData.order;
    const imageUrl = projectData.imageUrl === undefined ? null : projectData.imageUrl;
    const demoUrl = projectData.demoUrl === undefined ? null : projectData.demoUrl;
    const repoUrl = projectData.repoUrl === undefined ? null : projectData.repoUrl;
    
    const project: Project = { 
      ...projectData, 
      id,
      featured,
      order,
      imageUrl,
      demoUrl,
      repoUrl
    };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = await this.getProject(id);
    if (!existingProject) return undefined;
    
    const updatedProject: Project = { ...existingProject, ...projectData };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
  
  // Skill related methods
  async getSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }
  
  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return Array.from(this.skills.values())
      .filter(skill => skill.category === category)
      .sort((a, b) => b.level - a.level);
  }
  
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }
  
  async createSkill(skillData: InsertSkill): Promise<Skill> {
    const id = this.currentSkillId++;
    // Set default values for optional fields
    const level = skillData.level === undefined ? 0 : skillData.level;
    const iconName = skillData.iconName === undefined ? null : skillData.iconName;
    
    const skill: Skill = { 
      ...skillData, 
      id,
      level,
      iconName
    };
    this.skills.set(id, skill);
    return skill;
  }
  
  async updateSkill(id: number, skillData: Partial<InsertSkill>): Promise<Skill | undefined> {
    const existingSkill = await this.getSkill(id);
    if (!existingSkill) return undefined;
    
    const updatedSkill: Skill = { ...existingSkill, ...skillData };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }
  
  async deleteSkill(id: number): Promise<boolean> {
    return this.skills.delete(id);
  }
}

export const storage = new MemStorage();
