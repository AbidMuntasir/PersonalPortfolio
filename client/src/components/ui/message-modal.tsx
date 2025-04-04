import React from 'react';
import { Message } from '@shared/schema';
import { Mail, Calendar, User, FileText, Reply, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import './message-styles.css';

interface MessageModalProps {
  message: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageDeleted?: (messageId: number) => void;
}

export function MessageModal({ message, open, onOpenChange, onMessageDeleted }: MessageModalProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  if (!message) return null;
  
  const handleDelete = async () => {
    if (!message) return;
    
    try {
      setIsDeleting(true);
      const response = await axios.delete(`/api/admin/messages/${message.id}`);
      
      if (response.data.success) {
        toast({
          title: "Message deleted",
          description: "The message has been deleted successfully.",
          variant: "default",
        });
        
        onOpenChange(false);
        if (onMessageDeleted) {
          onMessageDeleted(message.id);
        }
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to delete message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the message.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="message-modal-header">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {message.subject}
          </DialogTitle>
        </DialogHeader>
        
        <div className="message-info">
          <div className="message-info-item">
            <span className="message-info-label flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-gray-500" /> From:
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300 ml-2">{message.name}</span>
          </div>
          
          <div className="message-info-item">
            <span className="message-info-label flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-gray-500" /> Email:
            </span>
            <a href={`mailto:${message.email}`} className="text-primary hover:underline ml-2">
              {message.email}
            </a>
          </div>
          
          <div className="message-info-item">
            <span className="message-info-label flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-500" /> Date:
            </span>
            <span className="text-gray-700 dark:text-gray-300 ml-2">
              {format(new Date(message.created_at), 'MMMM d, yyyy h:mm a')}
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FileText className="h-4 w-4 text-gray-500" />
            Message Content:
          </div>
          <div className="message-modal-content">
            <p className="message-content">
              {message.message}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <Button 
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete Message"}
          </Button>
          
          <Button 
            variant="default"
            className="flex items-center gap-2"
            onClick={() => {
              window.location.href = `mailto:${message.email}?subject=Re: ${message.subject}&body=Hello ${message.name},%0D%0A%0D%0ARe: ${message.subject}%0D%0A%0D%0A`;
            }}
          >
            <Reply className="h-4 w-4" />
            Reply via Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 