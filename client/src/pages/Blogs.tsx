import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Blog } from '@shared/schema';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Calendar, Tag } from 'lucide-react';

interface BlogsResponse {
  blogs: Blog[];
}

export default function Blogs() {
  const { toast } = useToast();
  
  // Fetch blogs
  const { data, isLoading, isError, error } = useQuery<BlogsResponse>({
    queryKey: ['/api/blogs'],
  });

  if (isError && error) {
    toast({
      title: 'Error loading blogs',
      description: 'Failed to load blog posts.',
      variant: 'destructive',
    });
  }

  const blogs = data?.blogs || [];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400 inline">
          Blog Posts
        </h1>
        <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Insights, tutorials, and thoughts on data science, programming, and technology.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-0">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No blog posts yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              Blog posts are coming soon. Check back later for updates!
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

interface BlogCardProps {
  blog: Blog;
}

function BlogCard({ blog }: BlogCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col">
        {blog.coverImage && (
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={blog.coverImage} 
              alt={blog.title} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={blog.createdAt}>{format(new Date(blog.createdAt), 'MMM d, yyyy')}</time>
          </div>
          <CardTitle className="text-xl">{blog.title}</CardTitle>
          {blog.excerpt && (
            <CardDescription className="line-clamp-3">{blog.excerpt}</CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="flex-grow">
          {blog.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.split(',').map((tag, index) => (
                <Badge key={index} variant="secondary" className="font-normal">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full gap-2"
            asChild
          >
            <a href={`/blogs/${blog.slug}`}>
              Read More <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}