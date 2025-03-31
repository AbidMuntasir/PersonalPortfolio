import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Message, Project, Skill, Blog, InsertBlog, InsertProject, InsertSkill } from '@shared/schema';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { generateSlug } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Response interfaces
interface MessagesResponse {
  messages: Message[];
}

interface ProjectsResponse {
  projects: Project[];
}

interface SkillsResponse {
  skills: Skill[];
}

interface BlogsResponse {
  blogs: Blog[];
}

// Section for messages tab
function MessagesTab() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Fetch messages
  const { data, isLoading, isError, error } = useQuery<MessagesResponse>({
    queryKey: ['/api/admin/messages'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Error loading messages',
        description: 'Failed to load contact form messages.',
        variant: 'destructive',
      });
    }
  }, [isError, error, toast]);

  const messages = data?.messages || [];
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading messages...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No messages yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">
            There are no contact form submissions yet. When visitors send messages through the contact form, they will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
        <Table>
          <TableCaption>A list of all contact form submissions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="hidden md:table-cell">Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message: Message) => (
              <TableRow key={message.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="font-medium whitespace-nowrap">
                  {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                </TableCell>
                <TableCell>{message.name}</TableCell>
                <TableCell>
                  <a 
                    href={`mailto:${message.email}`} 
                    className="text-primary hover:underline"
                  >
                    {message.email}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {message.subject}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-xs truncate">
                  {message.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
}

// Section for projects tab
function ProjectsTab() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Fetch projects
  const { data, isLoading, isError, error } = useQuery<ProjectsResponse>({
    queryKey: ['/api/admin/projects'],
    enabled: isAuthenticated,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  
  // New project form state
  const [newProject, setNewProject] = useState<Partial<InsertProject>>({
    title: '',
    description: '',
    technologies: [],
    imageUrl: null,
    demoUrl: null,
    repoUrl: null,
    featured: false,
    order: 0
  });
  
  // Create project mutation
  const createMutation = useMutation({
    mutationFn: (project: InsertProject) => {
      return apiRequest('/api/admin/projects', {
        method: 'POST',
        body: JSON.stringify(project),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Project created',
        description: 'The project has been successfully created.',
      });
      setShowAddForm(false);
      setNewProject({
        title: '',
        description: '',
        technologies: [],
        imageUrl: null,
        demoUrl: null,
        repoUrl: null,
        featured: false,
        order: 0
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/projects'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create the project. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: (project: Partial<Project>) => {
      if (!editingProject) return Promise.reject('No project to update');
      return apiRequest(`/api/admin/projects/${editingProject.id}`, {
        method: 'PUT',
        body: JSON.stringify(project),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Project updated',
        description: 'The project has been successfully updated.',
      });
      setEditingProject(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/projects'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update the project. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Project deleted',
        description: 'The project has been successfully deleted.',
      });
      setProjectToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/projects'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete the project. Please try again.',
        variant: 'destructive',
      });
    }
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Error loading projects',
        description: 'Failed to load projects data.',
        variant: 'destructive',
      });
    }
  }, [isError, error, toast]);

  const projects = data?.projects || [];
  
  const handleCreateProject = () => {
    createMutation.mutate(newProject as InsertProject);
  };
  
  const handleUpdateProject = () => {
    if (!editingProject) return;
    updateMutation.mutate({
      title: editingProject.title,
      description: editingProject.description,
      technologies: editingProject.technologies,
      imageUrl: editingProject.imageUrl,
      demoUrl: editingProject.demoUrl,
      repoUrl: editingProject.repoUrl,
      featured: editingProject.featured,
      order: editingProject.order
    });
  };
  
  const handleDeleteProject = () => {
    if (projectToDelete === null) return;
    deleteMutation.mutate(projectToDelete);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading projects...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button 
          onClick={() => setShowAddForm(true)} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add New Project
        </Button>
      </div>
      
      {/* Project List */}
      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              You haven't added any projects yet. Click the "Add New Project" button to create your first project.
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
            <Table>
              <TableCaption>A list of all your projects.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Technologies</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project: Project) => (
                  <TableRow key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(project.technologies) && project.technologies.map((tech, index) => (
                          <Badge key={index} variant="outline" className="font-normal">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{project.featured ? "Yes" : "No"}</TableCell>
                    <TableCell>{project.order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingProject(project)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setProjectToDelete(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      )}
      
      {/* Add Project Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Fill in the details for your new project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={newProject.title} 
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={newProject.description} 
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                rows={4}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="technologies">Technologies</Label>
              <Input 
                id="technologies" 
                value={Array.isArray(newProject.technologies) ? newProject.technologies.join(', ') : ''}
                onChange={(e) => setNewProject({...newProject, technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                placeholder="React, Node, MongoDB, etc."
              />
            </div>
            

            
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input 
                id="imageUrl" 
                value={newProject.imageUrl || ''} 
                onChange={(e) => setNewProject({...newProject, imageUrl: e.target.value || null})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="demoUrl">Demo URL</Label>
              <Input 
                id="demoUrl" 
                value={newProject.demoUrl || ''} 
                onChange={(e) => setNewProject({...newProject, demoUrl: e.target.value || null})}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="repoUrl">Repository URL</Label>
              <Input 
                id="repoUrl" 
                value={newProject.repoUrl || ''} 
                onChange={(e) => setNewProject({...newProject, repoUrl: e.target.value || null})}
                placeholder="https://github.com/yourusername/project"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="order">Display Order</Label>
              <Input 
                id="order" 
                type="number"
                value={newProject.order?.toString() || '0'} 
                onChange={(e) => setNewProject({...newProject, order: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                id="featured" 
                checked={newProject.featured} 
                onCheckedChange={(checked) => setNewProject({...newProject, featured: checked})}
              />
              <Label htmlFor="featured">Featured Project</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateProject} 
              disabled={createMutation.isPending || !newProject.title || !newProject.description}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Project Dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the details for your project.
            </DialogDescription>
          </DialogHeader>
          
          {editingProject && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input 
                  id="edit-title" 
                  value={editingProject.title} 
                  onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={editingProject.description} 
                  onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-technologies">Technologies</Label>
                <Input 
                  id="edit-technologies" 
                  value={Array.isArray(editingProject.technologies) ? editingProject.technologies.join(', ') : ''}
                  onChange={(e) => setEditingProject({...editingProject, technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                />
              </div>
              

              
              <div className="grid gap-2">
                <Label htmlFor="edit-imageUrl">Image URL</Label>
                <Input 
                  id="edit-imageUrl" 
                  value={editingProject.imageUrl || ''} 
                  onChange={(e) => setEditingProject({...editingProject, imageUrl: e.target.value || null})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-demoUrl">Demo URL</Label>
                <Input 
                  id="edit-demoUrl" 
                  value={editingProject.demoUrl || ''} 
                  onChange={(e) => setEditingProject({...editingProject, demoUrl: e.target.value || null})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-repoUrl">Repository URL</Label>
                <Input 
                  id="edit-repoUrl" 
                  value={editingProject.repoUrl || ''} 
                  onChange={(e) => setEditingProject({...editingProject, repoUrl: e.target.value || null})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-order">Display Order</Label>
                <Input 
                  id="edit-order" 
                  type="number"
                  value={editingProject.order.toString()} 
                  onChange={(e) => setEditingProject({...editingProject, order: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  id="edit-featured" 
                  checked={editingProject.featured} 
                  onCheckedChange={(checked) => setEditingProject({...editingProject, featured: checked})}
                />
                <Label htmlFor="edit-featured">Featured Project</Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProject(null)}>Cancel</Button>
            <Button 
              onClick={handleUpdateProject} 
              disabled={updateMutation.isPending || !editingProject?.title || !editingProject?.description}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={projectToDelete !== null} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Section for skills tab
function SkillsTab() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Fetch skills
  const { data, isLoading, isError, error } = useQuery<SkillsResponse>({
    queryKey: ['/api/admin/skills'],
    enabled: isAuthenticated,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillToDelete, setSkillToDelete] = useState<number | null>(null);
  
  // New skill form state
  const [newSkill, setNewSkill] = useState<Partial<InsertSkill>>({
    name: '',
    category: '',
    level: 80,
    iconName: null
  });
  
  // Create skill mutation
  const createMutation = useMutation({
    mutationFn: (skill: InsertSkill) => {
      return apiRequest('/api/admin/skills', {
        method: 'POST',
        body: JSON.stringify(skill),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Skill created',
        description: 'The skill has been successfully created.',
      });
      setShowAddForm(false);
      setNewSkill({
        name: '',
        category: '',
        level: 80,
        iconName: null
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/skills'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create the skill. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Update skill mutation
  const updateMutation = useMutation({
    mutationFn: (skill: Partial<Skill>) => {
      if (!editingSkill) return Promise.reject('No skill to update');
      return apiRequest(`/api/admin/skills/${editingSkill.id}`, {
        method: 'PUT',
        body: JSON.stringify(skill),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Skill updated',
        description: 'The skill has been successfully updated.',
      });
      setEditingSkill(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/skills'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update the skill. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Delete skill mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/admin/skills/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Skill deleted',
        description: 'The skill has been successfully deleted.',
      });
      setSkillToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/skills'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete the skill. Please try again.',
        variant: 'destructive',
      });
    }
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Error loading skills',
        description: 'Failed to load skills data.',
        variant: 'destructive',
      });
    }
  }, [isError, error, toast]);

  const skills = data?.skills || [];
  
  const handleCreateSkill = () => {
    createMutation.mutate(newSkill as InsertSkill);
  };
  
  const handleUpdateSkill = () => {
    if (!editingSkill) return;
    updateMutation.mutate({
      name: editingSkill.name,
      category: editingSkill.category,
      level: editingSkill.level,
      iconName: editingSkill.iconName
    });
  };
  
  const handleDeleteSkill = () => {
    if (skillToDelete === null) return;
    deleteMutation.mutate(skillToDelete);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading skills...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Skills</h2>
        <Button 
          onClick={() => setShowAddForm(true)} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add New Skill
        </Button>
      </div>
      
      {/* Skills List */}
      {skills.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No skills yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              You haven't added any skills yet. Click the "Add New Skill" button to create your first skill.
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
            <Table>
              <TableCaption>A list of all your skills.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skills.map((skill: Skill) => (
                  <TableRow key={skill.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {skill.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{skill.level}%</TableCell>
                    <TableCell>{skill.iconName || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingSkill(skill)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setSkillToDelete(skill.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      )}
      
      {/* Add Skill Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
            <DialogDescription>
              Fill in the details for your new skill.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input 
                id="name" 
                value={newSkill.name} 
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                placeholder="React, Python, etc."
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newSkill.category}
                onValueChange={(value) => setNewSkill({...newSkill, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="level">Proficiency Level (0-100)</Label>
              <Input 
                id="level" 
                type="number"
                min="0"
                max="100"
                value={newSkill.level?.toString() || '80'} 
                onChange={(e) => setNewSkill({...newSkill, level: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="iconName">Icon Name (optional)</Label>
              <Input 
                id="iconName" 
                value={newSkill.iconName || ''} 
                onChange={(e) => setNewSkill({...newSkill, iconName: e.target.value || null})}
                placeholder="react, python, etc."
              />
              <p className="text-xs text-gray-500">
                Use lowercase names from react-icons/si (e.g., "react" for React icon)
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateSkill} 
              disabled={createMutation.isPending || !newSkill.name || !newSkill.category}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Skill Dialog */}
      <Dialog open={!!editingSkill} onOpenChange={(open) => !open && setEditingSkill(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
            <DialogDescription>
              Update the details for your skill.
            </DialogDescription>
          </DialogHeader>
          
          {editingSkill && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Skill Name</Label>
                <Input 
                  id="edit-name" 
                  value={editingSkill.name} 
                  onChange={(e) => setEditingSkill({...editingSkill, name: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editingSkill.category}
                  onValueChange={(value) => setEditingSkill({...editingSkill, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-level">Proficiency Level (0-100)</Label>
                <Input 
                  id="edit-level" 
                  type="number"
                  min="0"
                  max="100"
                  value={editingSkill.level.toString()} 
                  onChange={(e) => setEditingSkill({...editingSkill, level: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-iconName">Icon Name (optional)</Label>
                <Input 
                  id="edit-iconName" 
                  value={editingSkill.iconName || ''} 
                  onChange={(e) => setEditingSkill({...editingSkill, iconName: e.target.value || null})}
                />
                <p className="text-xs text-gray-500">
                  Use lowercase names from react-icons/si (e.g., "react" for React icon)
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSkill(null)}>Cancel</Button>
            <Button 
              onClick={handleUpdateSkill} 
              disabled={updateMutation.isPending || !editingSkill?.name || !editingSkill?.category}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={skillToDelete !== null} onOpenChange={(open) => !open && setSkillToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected skill.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSkill}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Section for blogs tab
function BlogsTab() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Fetch blogs
  const { data, isLoading, isError, error } = useQuery<BlogsResponse>({
    queryKey: ['/api/admin/blogs'],
    enabled: isAuthenticated,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);
  
  // New blog form state
  const [newBlog, setNewBlog] = useState<Partial<InsertBlog>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: null,
    published: false,
    tags: null
  });
  
  // Create blog mutation
  const createMutation = useMutation({
    mutationFn: (blog: InsertBlog) => {
      // Add timestamps
      const blogWithTimestamps = {
        ...blog,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return apiRequest('/api/admin/blogs', {
        method: 'POST',
        body: JSON.stringify(blogWithTimestamps),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Blog post created',
        description: 'The blog post has been successfully created.',
      });
      setShowAddForm(false);
      setNewBlog({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        coverImage: null,
        published: false,
        tags: null
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blogs'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create the blog post. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Update blog mutation
  const updateMutation = useMutation({
    mutationFn: (blog: Partial<Blog>) => {
      if (!editingBlog) return Promise.reject('No blog to update');
      
      // Add updated timestamp
      const blogWithTimestamp = {
        ...blog,
        updatedAt: new Date().toISOString()
      };
      
      return apiRequest(`/api/admin/blogs/${editingBlog.id}`, {
        method: 'PUT',
        body: JSON.stringify(blogWithTimestamp),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Blog post updated',
        description: 'The blog post has been successfully updated.',
      });
      setEditingBlog(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blogs'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update the blog post. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Delete blog mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Blog post deleted',
        description: 'The blog post has been successfully deleted.',
      });
      setBlogToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blogs'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete the blog post. Please try again.',
        variant: 'destructive',
      });
    }
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Error loading blogs',
        description: 'Failed to load blog data.',
        variant: 'destructive',
      });
    }
  }, [isError, error, toast]);

  const blogs = data?.blogs || [];
  
  const handleCreateBlog = () => {
    // Generate slug from title if not provided
    let slug = newBlog.slug;
    if (!slug && newBlog.title) {
      slug = generateSlug(newBlog.title);
    }
    
    createMutation.mutate({...newBlog, slug} as InsertBlog);
  };
  
  const handleUpdateBlog = () => {
    if (!editingBlog) return;
    updateMutation.mutate({
      title: editingBlog.title,
      slug: editingBlog.slug,
      content: editingBlog.content,
      excerpt: editingBlog.excerpt,
      coverImage: editingBlog.coverImage,
      published: editingBlog.published,
      tags: editingBlog.tags
    });
  };
  
  const handleDeleteBlog = () => {
    if (blogToDelete === null) return;
    deleteMutation.mutate(blogToDelete);
  };
  
  // Using the imported generateSlug utility from utils.ts
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading blogs...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        <Button 
          onClick={() => setShowAddForm(true)} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add New Blog Post
        </Button>
      </div>
      
      {/* Blog List */}
      {blogs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No blog posts yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              You haven't created any blog posts yet. Click the "Add New Blog Post" button to create your first post.
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
            <Table>
              <TableCaption>A list of all your blog posts.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog: Blog) => (
                  <TableRow key={blog.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-medium">{blog.title}</TableCell>
                    <TableCell>{format(new Date(blog.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(blog.updatedAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={blog.published ? "default" : "secondary"}
                        className="font-normal"
                      >
                        {blog.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingBlog(blog)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setBlogToDelete(blog.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      )}
      
      {/* Add Blog Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Blog Post</DialogTitle>
            <DialogDescription>
              Write and publish a new blog post.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={newBlog.title} 
                onChange={(e) => {
                  const title = e.target.value;
                  setNewBlog({
                    ...newBlog, 
                    title,
                    // Auto-generate slug if user hasn't manually set one
                    slug: newBlog.slug === '' ? generateSlug(title) : newBlog.slug
                  });
                }}
                placeholder="My Awesome Blog Post"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input 
                id="slug" 
                value={newBlog.slug} 
                onChange={(e) => setNewBlog({...newBlog, slug: e.target.value})}
                placeholder="my-awesome-blog-post"
              />
              <p className="text-xs text-gray-500">
                Used in the URL of your blog post. Auto-generated from title if left empty.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea 
                id="excerpt" 
                value={newBlog.excerpt} 
                onChange={(e) => setNewBlog({...newBlog, excerpt: e.target.value})}
                placeholder="A brief summary of your blog post"
                rows={2}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea 
                id="content" 
                value={newBlog.content} 
                onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                placeholder="Write your blog post content here..."
                rows={10}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input 
                id="coverImage" 
                value={newBlog.coverImage || ''} 
                onChange={(e) => setNewBlog({...newBlog, coverImage: e.target.value || null})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input 
                id="tags" 
                value={newBlog.tags || ''} 
                onChange={(e) => setNewBlog({...newBlog, tags: e.target.value || null})}
                placeholder="web development, tutorial, javascript"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                id="published" 
                checked={newBlog.published} 
                onCheckedChange={(checked) => setNewBlog({...newBlog, published: checked})}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateBlog} 
              disabled={createMutation.isPending || !newBlog.title || !newBlog.content}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Blog Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Blog Dialog */}
      <Dialog open={!!editingBlog} onOpenChange={(open) => !open && setEditingBlog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Update your blog post content.
            </DialogDescription>
          </DialogHeader>
          
          {editingBlog && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input 
                  id="edit-title" 
                  value={editingBlog.title} 
                  onChange={(e) => setEditingBlog({...editingBlog, title: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input 
                  id="edit-slug" 
                  value={editingBlog.slug} 
                  onChange={(e) => setEditingBlog({...editingBlog, slug: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-excerpt">Excerpt</Label>
                <Textarea 
                  id="edit-excerpt" 
                  value={editingBlog.excerpt} 
                  onChange={(e) => setEditingBlog({...editingBlog, excerpt: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea 
                  id="edit-content" 
                  value={editingBlog.content} 
                  onChange={(e) => setEditingBlog({...editingBlog, content: e.target.value})}
                  rows={10}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-coverImage">Cover Image URL</Label>
                <Input 
                  id="edit-coverImage" 
                  value={editingBlog.coverImage || ''} 
                  onChange={(e) => setEditingBlog({...editingBlog, coverImage: e.target.value || null})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input 
                  id="edit-tags" 
                  value={editingBlog.tags || ''} 
                  onChange={(e) => setEditingBlog({...editingBlog, tags: e.target.value || null})}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  id="edit-published" 
                  checked={editingBlog.published} 
                  onCheckedChange={(checked) => setEditingBlog({...editingBlog, published: checked})}
                />
                <Label htmlFor="edit-published">
                  {editingBlog.published ? 'Published' : 'Draft'}
                </Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBlog(null)}>Cancel</Button>
            <Button 
              onClick={handleUpdateBlog} 
              disabled={updateMutation.isPending || !editingBlog?.title || !editingBlog?.content}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={blogToDelete !== null} onOpenChange={(open) => !open && setBlogToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBlog}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Main Admin Dashboard component
export default function Admin() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [_, setLocation] = useLocation();
  const { logout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [location] = useLocation();
  
  // Determine which tab to show based on the URL
  const getTabFromPath = (path: string): string => {
    if (path.includes('/admin/messages')) return 'messages';
    if (path.includes('/admin/projects')) return 'projects';
    if (path.includes('/admin/skills')) return 'skills';
    if (path.includes('/admin/blogs')) return 'blogs';
    return 'messages'; // default tab
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromPath(location));
  
  // Update the tab when the location changes
  useEffect(() => {
    setActiveTab(getTabFromPath(location));
  }, [location]);
  
  // Handle tab changes and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLocation(`/admin/${value}`);
  };
  
  useEffect(() => {
    setIsClient(true);
    
    // Redirect if not authenticated
    if (isClient && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isClient, isAuthenticated, setLocation]);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4" /> 
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400 inline">
          Admin Dashboard
        </h1>
        <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Manage your portfolio content, blogs, projects, and skills.
        </p>
      </motion.div>

      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages">
          <MessagesTab />
        </TabsContent>
        
        <TabsContent value="projects">
          <ProjectsTab />
        </TabsContent>
        
        <TabsContent value="skills">
          <SkillsTab />
        </TabsContent>
        
        <TabsContent value="blogs">
          <BlogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}