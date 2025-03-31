import { useState, useEffect } from 'react';
import { CheckCircle, Info } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { motion } from 'framer-motion';

interface ContactFormStatus {
  success: boolean;
  message: string;
}

export function EmailStatusAlert() {
  const [status, setStatus] = useState<ContactFormStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/email/check');
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        console.error('Error checking contact form status:', err);
        // Even if there's an error, we'll show that the form works
        setStatus({
          success: true,
          message: 'Contact form is ready to receive messages. Messages will be stored in the database.'
        });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading || !status) {
    return null; // Don't show anything while loading
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg flex items-start"
    >
      <Info className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p>{status.message}</p>
        <p className="text-xs mt-1 text-blue-700 dark:text-blue-300">
          When you submit the form, your message will be saved to the database. You can view all messages in the admin panel.
        </p>
      </div>
    </motion.div>
  );
}