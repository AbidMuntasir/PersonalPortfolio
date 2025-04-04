import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Message } from '@shared/schema';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronLeft, MessageSquare, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageModal } from '@/components/ui/message-modal';
import { useToast } from '@/hooks/use-toast';
import '@/components/ui/message-styles.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MessagesResponse {
  success: boolean;
  messages: Message[];
  message?: string;
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const viewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };
  
  const handleMessageDeleted = (messageId: number) => {
    toast({
      title: "Message deleted",
      description: "The message has been removed from your inbox.",
    });
    
    // Refresh the messages list
    queryClient.invalidateQueries(['admin-messages']);
  };

  // Fetch messages
  const { data, isLoading, isError } = useQuery<MessagesResponse>({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/admin/messages');
        return response.data;
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Authentication Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{data?.message || "Error loading messages"}</p>
          <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
        </div>
      </div>
    );
  }

  const messages = data?.messages || [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2"
          onClick={() => window.location.href = "/"}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" /> 
          Logout
        </Button>
      </div>

      <Card className="border shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                You have received {messages.length} message{messages.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="messages" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                Messages
              </TabsTrigger>
            </TabsList>
            <TabsContent value="messages">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No messages yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">When visitors send you messages, they'll appear here.</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table className="messages-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((message) => (
                        <TableRow 
                          key={message.id} 
                          onClick={() => viewMessage(message)}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        >
                          <TableCell className="font-medium">{message.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="truncate max-w-[200px]">{message.subject}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell truncate max-w-[200px]">{message.email}</TableCell>
                          <TableCell>{format(new Date(message.created_at), 'MMM d, yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <MessageModal 
        message={selectedMessage} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onMessageDeleted={handleMessageDeleted}
      />
    </div>
  );
}