import React from 'react';
import { Message } from '@shared/schema';
import { X, Mail, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import './message-styles.css';

interface MessageModalProps {
  message: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessageModal({ message, open, onOpenChange }: MessageModalProps) {
  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="message-modal-header">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {message.subject}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
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
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            variant="default"
            onClick={() => {
              window.location.href = `mailto:${message.email}?subject=Re: ${message.subject}&body=Hello ${message.name},%0D%0A%0D%0ARe: ${message.subject}%0D%0A%0D%0A`;
            }}
          >
            Reply via Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 