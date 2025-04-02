import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Message } from '@shared/schema';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
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
import { LogOut, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MessagesResponse {
  messages: Message[];
}

export default function Admin() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [_, setLocation] = useLocation();
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Redirect if not authenticated
    if (isClient && !isAuthenticated && !authLoading) {
      setLocation('/login');
    }
  }, [isClient, isAuthenticated, authLoading, setLocation]);
  
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

  // Fetch messages
  const { data, isLoading, isError, error } = useQuery<MessagesResponse>({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/messages', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server response:', errorData);
          throw new Error(errorData.message || 'Failed to fetch messages');
        }
        
        const data = await response.json();
        if (!data.success) {
          console.error('Server response data:', data);
          throw new Error(data.message || 'Failed to fetch messages');
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && isClient && !authLoading,
    retry: 1,
    refetchOnWindowFocus: false
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
      <div className="flex justify-between mb-4">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-purple-500 hover:text-purple-600 hover:bg-purple-100/10 transition-colors"
          onClick={() => setLocation("/")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Button>

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
                      {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
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