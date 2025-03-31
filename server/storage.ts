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
      isAdmin: true,
      createdAt
    });
    
    // Add sample blog posts
    const blog1Id = this.currentBlogId++;
    const blog1CreatedAt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
    const blog1UpdatedAt = blog1CreatedAt;
    this.blogs.set(blog1Id, {
      id: blog1Id,
      title: "Getting Started with Data Analysis in Python",
      slug: "getting-started-with-data-analysis-python",
      content: "Python has become the go-to language for data analysis and data science. In this blog post, we'll explore the fundamental libraries and techniques to get started with data analysis in Python.\n\nFirst, let's look at the essential libraries:\n\n1. **NumPy** - For numerical operations and multi-dimensional arrays\n2. **Pandas** - For data manipulation and analysis\n3. **Matplotlib** - For data visualization\n4. **Seaborn** - For statistical data visualization\n\nLet's start with a simple example of loading and exploring data with Pandas:\n\n```python\nimport pandas as pd\n\n# Load data from a CSV file\ndf = pd.read_csv('data.csv')\n\n# Display the first few rows\nprint(df.head())\n\n# Get basic statistics\nprint(df.describe())\n\n# Check for missing values\nprint(df.isnull().sum())\n```\n\nThis simple code helps you understand the structure of your data, identify missing values, and get a statistical summary.\n\nIn future posts, we'll dive deeper into data cleaning, visualization, and applying machine learning algorithms to extract insights from data.",
      excerpt: "Learn the essentials of data analysis with Python, focusing on key libraries like NumPy, Pandas, Matplotlib, and Seaborn with practical examples.",
      tags: "Python,Data Analysis,Pandas,Beginner",
      coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2400&auto=format&fit=crop",
      published: true,
      createdAt: blog1CreatedAt,
      updatedAt: blog1UpdatedAt
    });
    
    const blog2Id = this.currentBlogId++;
    const blog2CreatedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days ago
    const blog2UpdatedAt = blog2CreatedAt;
    this.blogs.set(blog2Id, {
      id: blog2Id,
      title: "Web Scraping Techniques for Data Collection",
      slug: "web-scraping-techniques-data-collection",
      content: "Web scraping is a powerful technique for gathering data from websites when APIs aren't available. In this post, we'll explore ethical web scraping practices and the tools you can use.\n\n## Ethical Web Scraping Guidelines\n\n1. Always check a website's robots.txt file and terms of service\n2. Implement reasonable request rates to avoid overwhelming servers\n3. Identify your scraper with a proper user-agent\n4. Cache results when possible to minimize requests\n\n## Popular Python Web Scraping Libraries\n\n### BeautifulSoup\nBeautifulSoup is a popular library for parsing HTML and XML documents. It creates a parse tree for parsed pages that can be used to extract data.\n\n```python\nimport requests\nfrom bs4 import BeautifulSoup\n\nurl = 'https://example.com'\nresponse = requests.get(url)\nsoup = BeautifulSoup(response.text, 'html.parser')\n\n# Find all links\nlinks = soup.find_all('a')\nfor link in links:\n    print(link.get('href'))\n```\n\n### Scrapy\nScrapy is a full-featured web crawling framework for Python that provides all the tools needed to efficiently extract data from websites, process it, and store it.\n\n### Selenium\nSelenium allows you to automate browser actions, making it perfect for scraping dynamic websites that load content using JavaScript.\n\nIn my next post, I'll share a real-world project that combines web scraping with data analysis to extract valuable insights.",
      excerpt: "Discover ethical web scraping techniques and tools for effective data collection, with examples using BeautifulSoup, Scrapy, and Selenium in Python.",
      tags: "Web Scraping,Python,Data Collection,BeautifulSoup",
      coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2400&auto=format&fit=crop",
      published: true,
      createdAt: blog2CreatedAt,
      updatedAt: blog2UpdatedAt
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
    // Ensure isAdmin is a boolean
    const isAdmin = insertUser.isAdmin === undefined ? false : insertUser.isAdmin;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      isAdmin 
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
    // Set default values for optional fields
    const published = blogData.published === undefined ? false : blogData.published;
    const tags = blogData.tags === undefined ? null : blogData.tags;
    const coverImage = blogData.coverImage === undefined ? null : blogData.coverImage;
    
    const blog: Blog = { 
      ...blogData, 
      id,
      published,
      tags,
      coverImage
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
