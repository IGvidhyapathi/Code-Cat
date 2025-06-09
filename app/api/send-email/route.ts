import nodemailer from 'nodemailer';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  },
  debug: true, // Enable debug logging
  logger: true // Enable logger
});

const convertPlainTextToHtml = (text: string) => {
  // Convert line breaks to <br> tags
  let html = text.replace(/\n/g, '<br>');
  
  // Convert URLs to clickable links
  html = html.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" style="color: #4F46E5; text-decoration: underline;">$1</a>'
  );
  
  // Wrap paragraphs
  html = html.split('<br><br>').map(para => 
    para.trim() ? `<p style="margin: 0 0 1em 0;">${para}</p>` : ''
  ).join('');
  
  return html;
};

const createEmailTemplate = (subject: string, content: string, isPlainText: boolean = false) => {
  const formattedContent = isPlainText ? convertPlainTextToHtml(content) : content;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          margin-bottom: 20px;
        }
        .logo img {
          height: 40px;
        }
        .title {
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .content {
          padding: 30px;
          background: white;
        }
        .message {
          color: #374151;
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        .message p {
          margin: 0 0 1em 0;
        }
        .message p:last-child {
          margin-bottom: 0;
        }
        .message a {
          color: #4F46E5;
          text-decoration: underline;
        }
        .cta-button {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          color: white !important;
          text-decoration: none !important;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          background: #F9FAFB;
          padding: 20px 30px;
          text-align: center;
          border-top: 1px solid #E5E7EB;
        }
        .social-links {
          margin-bottom: 20px;
        }
        .social-link {
          display: inline-block;
          margin: 0 10px;
          color: #6B7280;
          text-decoration: none;
        }
        .footer-text {
          color: #6B7280;
          font-size: 14px;
          margin: 0;
        }
        .divider {
          height: 4px;
          background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%);
          margin: 0;
          border: none;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .header {
            padding: 30px 20px;
          }
          .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <!-- Replace with your actual logo -->
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="white" fill-opacity="0.1"/>
              <path d="M20 8L28 12V20L20 24L12 20V12L20 8Z" fill="white"/>
            </svg>
          </div>
          <h1 class="title">${subject}</h1>
        </div>
        <hr class="divider">
        <div class="content">
          <div class="message">
            ${formattedContent}
          </div>
        </div>
        <div class="footer">
          <div class="social-links">
            <a href="#" class="social-link">Twitter</a>
            <a href="#" class="social-link">LinkedIn</a>
            <a href="#" class="social-link">GitHub</a>
          </div>
          <p class="footer-text">
            © ${new Date().getFullYear()} CodeCat. All rights reserved.<br>
            You're receiving this email because you're part of the CodeCat community.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = await currentUser();
    
    // Check if user is authenticated
    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (user.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    // Check email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Missing email credentials');
      return NextResponse.json(
        { error: "Email configuration is incomplete. Please check server logs." },
        { status: 500 }
      );
    }

    console.log('Email configuration:', {
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASSWORD
    });

    const body = await req.json();
    const { subject, content, recipients, isPlainText = true } = body;

    console.log('Received email request:', {
      subject,
      recipientsCount: recipients?.length,
      sendToAll: body.sendToAll
    });

    // Validate required fields
    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: "At least one recipient is required" },
        { status: 400 }
      );
    }

    // Verify connection before proceeding
    try {
      await transporter.verify();
      console.log('Email connection verified successfully');
    } catch (error) {
      console.error('Email verification failed:', error);
      return NextResponse.json(
        { error: `Email configuration error: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Use provided recipients list
    const emailList = recipients.filter(Boolean); // Remove any null/undefined values
    if (emailList.length === 0) {
      return NextResponse.json(
        { error: "No valid email addresses provided" },
        { status: 400 }
      );
    }

    console.log(`Attempting to send email to ${emailList.length} recipients:`, emailList);

    // Send email to each recipient
    const results = await Promise.all(
      emailList.map(async (email: string) => {
        try {
          const mailOptions = {
            from: {
              name: 'CodeCat',
              address: process.env.EMAIL_USER as string
            },
            to: email,
            subject: subject,
            html: createEmailTemplate(subject, content, isPlainText),
            headers: {
              'X-Priority': '1', // High priority
              'X-MSMail-Priority': 'High',
              'Importance': 'high'
            }
          };

          console.log(`Sending email to ${email} with options:`, mailOptions);
          const info = await transporter.sendMail(mailOptions);
          console.log(`Email sent successfully to ${email}:`, {
            messageId: info.messageId,
            response: info.response,
            accepted: info.accepted,
            rejected: info.rejected
          });

          return { 
            email, 
            success: true, 
            messageId: info.messageId,
            response: info.response
          };
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          return { 
            email, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      })
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    if (successful === 0) {
      return NextResponse.json(
        { 
          error: "Failed to send any emails",
          details: results.filter(r => !r.success).map(r => r.error)
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Email sent successfully to ${successful} recipients${failed ? `, failed for ${failed} recipients` : ''}`,
      results
    });
  } catch (error) {
    console.error('[SEND_EMAIL] Unexpected error:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 