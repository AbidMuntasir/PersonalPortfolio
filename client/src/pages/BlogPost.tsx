import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Blog } from '@shared/schema';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useParams, useLocation } from 'wouter';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';

interface BlogResponse {
  blog: Blog;
}

export default function BlogPost() {
  const { toast } = useToast();
  const params = useParams<{ slug: string }>();
  const [_, setLocation] = useLocation();
  const slug = params.slug;
  
  // Fetch blog post
  const { data, isLoading, isError, error } = useQuery<BlogResponse>({
    queryKey: [`/api/blogs/${slug}`],
    enabled: !!slug,
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Error loading blog post',
        description: 'The requested blog post could not be found.',
        variant: 'destructive',
      });
      // Redirect to blogs page after a short delay
      const timer = setTimeout(() => {
        setLocation('/blogs');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isError, error, toast, setLocation]);

  const blog = data?.blog;

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-2/3 mb-4" />
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="flex flex-col items-center py-12">
            <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation('/blogs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format content with proper paragraph breaks
  const formattedContent = blog.content
    .split('\\n')
    .map((paragraph, i) => 
      paragraph.trim() ? <p key={i} className="mb-4">{paragraph}</p> : null
    )
    .filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-6" 
            onClick={() => setLocation('/blogs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-6">{blog.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={blog.createdAt}>{format(new Date(blog.createdAt), 'MMMM d, yyyy')}</time>
            </div>
            
            {blog.tags && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="secondary" className="font-normal">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {blog.coverImage && (
            <div className="w-full h-72 md:h-96 overflow-hidden rounded-lg mb-8">
              <img 
                src={blog.coverImage} 
                alt={blog.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        
        <div className="prose dark:prose-invert prose-lg prose-purple max-w-none">
          {formattedContent}
        </div>
      </motion.div>
    </div>
  );
}