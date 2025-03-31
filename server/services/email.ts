import { Message } from '@shared/schema';

/**
 * Handle sending of contact notifications
 * This version doesn't actually send emails but logs messages to the console and returns a success
 * so the rest of the contact form still works without email configuration
 * 
 * @param message The message data from the contact form
 */
export async function sendContactNotification(message: Message): Promise<any> {
  // Format the message content for logging
  const formattedDate = new Date(message.createdAt).toLocaleString();
  
  // Log the message details to console for admin to see
  console.log('------ New Contact Form Submission ------');
  console.log(`Date: ${formattedDate}`);
  console.log(`From: ${message.name} (${message.email})`);
  console.log(`Subject: ${message.subject}`);
  console.log('Message:');
  console.log(message.message);
  console.log('----------------------------------------');
  
  // Return success - the message is saved in the database anyway
  return { 
    success: true, 
    message: 'Message saved successfully to the database' 
  };
}

/**
 * Simple status check for the contact form
 * Always returns success since we're only storing messages in the DB
 */
export async function verifyEmailConnection(): Promise<{success: boolean, message: string}> {
  // Return a message that explains we're only storing messages in the database
  return {
    success: true,
    message: 'Contact form is ready to receive messages. Messages will be stored in the database.'
  };
}