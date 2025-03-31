import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { Message } from '@shared/schema';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Admin() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
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

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
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
          View and manage contact form submissions.
        </p>
      </motion.div>

      {isLoading ? (
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
      ) : messages.length === 0 ? (
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
      ) : (
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
      )}
    </div>
  );
}