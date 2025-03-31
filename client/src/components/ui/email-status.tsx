import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';

interface ContactFormStatus {
  success: boolean;
  message: string;
}

export function EmailStatusAlert() {
  return null; // Don't show any status message
}