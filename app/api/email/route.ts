import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const { projectTitle, amount, paymentId, buyerName, buyerEmail } = await req.json();

    // Email content with modern design
    const mailOptions = {
      from: `"CodeCat" <${process.env.EMAIL_USER}>`,
      to: 'projecthub0003@gmail.com',
      subject: `New Project Purchase: ${projectTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .success-icon {
              text-align: center;
              margin: 20px 0;
            }
            .success-icon div {
              width: 60px;
              height: 60px;
              background: #4CAF50;
              border-radius: 50%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              animation: scaleIn 0.5s ease-out;
            }
            .success-icon svg {
              width: 30px;
              height: 30px;
              fill: white;
            }
            .amount {
              font-size: 24px;
              color: #1a237e;
              text-align: center;
              margin: 20px 0;
              font-weight: bold;
            }
            .details {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px solid #e0e0e0;
            }
            .detail-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .detail-label {
              font-weight: bold;
              width: 150px;
              color: #666;
            }
            .detail-value {
              flex: 1;
              color: #333;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
            @keyframes scaleIn {
              from {
                transform: scale(0);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Received!</h1>
            </div>
            <div class="content">
              <div class="success-icon">
                <div>
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
              </div>
              <div class="amount">
                ₹${amount.toFixed(2)}
              </div>
              <div class="details">
                <div class="detail-row">
                  <div class="detail-label">Project Title:</div>
                  <div class="detail-value">${projectTitle}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Payment ID:</div>
                  <div class="detail-value">${paymentId}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Buyer Name:</div>
                  <div class="detail-value">${buyerName}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Buyer Email:</div>
                  <div class="detail-value">${buyerEmail}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Purchase Date:</div>
                  <div class="detail-value">${new Date().toLocaleString()}</div>
                </div>
              </div>
              <div class="footer">
                <p>This is an automated message from CodeCat. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} CodeCat. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 