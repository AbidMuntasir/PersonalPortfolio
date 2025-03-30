import nodemailer from 'nodemailer';
import { Message } from '@shared/schema';

// Create a transporter using the provided email credentials
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Sends an email notification when a new contact message is received
 * @param message The message data from the contact form
 * @returns Promise resolving to the nodemailer info object
 */
export async function sendContactNotification(message: Message): Promise<any> {
  // Format the message content
  const formattedDate = new Date(message.createdAt).toLocaleString();
  
  // Create email options
  const mailOptions = {
    from: `"Portfolio Website" <${process.env.EMAIL_USER}>`,
    to: process.env.YOUR_EMAIL,
    subject: `New Contact Form Message: ${message.subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>From:</strong> ${message.name} (${message.email})</p>
      <p><strong>Subject:</strong> ${message.subject}</p>
      <h3>Message:</h3>
      <p>${message.message.replace(/\n/g, '<br>')}</p>
    `,
    text: `
      New Contact Form Submission
      ---------------------------
      Date: ${formattedDate}
      From: ${message.name} (${message.email})
      Subject: ${message.subject}
      
      Message:
      ${message.message}
    `,
  };
  
  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact notification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending contact notification email:', error);
    throw error;
  }
}

/**
 * Verifies that the email configuration is working
 * @returns Promise resolving to an object with connection status and error details if any
 */
export async function verifyEmailConnection(): Promise<{success: boolean, error?: string, errorDetails?: any}> {
  try {
    await transporter.verify();
    console.log('Email service is ready to send messages');
    return { success: true };
  } catch (error: any) {
    console.error('Email service configuration error:', error);
    
    // Create a more user-friendly error message
    let errorMessage = 'Unknown error connecting to email service';
    
    // Handle specific error cases
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Please check your email and password.';
      
      // If using Gmail, provide additional info about app passwords
      if (process.env.EMAIL_HOST?.includes('gmail')) {
        errorMessage += ' For Gmail accounts, you may need to use an App Password instead of your regular password. Visit https://myaccount.google.com/apppasswords to generate one.';
      }
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Connection problem. Please check your email host and port settings.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Failed to connect to email server. Please check your network connection and email settings.';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      errorDetails: {
        code: error.code,
        message: error.message
      }
    };
  }
}