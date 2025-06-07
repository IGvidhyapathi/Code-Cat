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
    const { subject, content, recipients } = body;

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
            html: content,
            text: content.replace(/<[^>]*>/g, ''),
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