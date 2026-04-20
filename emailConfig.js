import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Function to create HTML email template
function createTicketEmailTemplate(attendeeName, eventTitle, eventDate, eventLocation, ticketId, qrBase64) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f9;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .ticket-info {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }
        .ticket-info p {
          margin: 10px 0;
          font-size: 16px;
        }
        .label {
          font-weight: bold;
          color: #667eea;
        }
        .qr-section {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background: white;
          border: 2px dashed #667eea;
          border-radius: 12px;
        }
        .qr-section img {
          max-width: 200px;
          height: auto;
        }
        .ticket-id {
          font-family: monospace;
          background: #f0f0f0;
          padding: 10px;
          border-radius: 8px;
          font-size: 14px;
          text-align: center;
          word-break: break-all;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎫 Your Event Ticket</h1>
          <p>Thank you for registering!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${attendeeName}! 👋</h2>
          <p>You're all set for the event. Here are your ticket details:</p>
          
          <div class="ticket-info">
            <p><span class="label">🎉 Event:</span> ${eventTitle}</p>
            <p><span class="label">📅 Date:</span> ${eventDate}</p>
            <p><span class="label">📍 Location:</span> ${eventLocation}</p>
            <p><span class="label">🆔 Ticket ID:</span> ${ticketId}</p>
          </div>
          
          <div class="qr-section">
            <h3>Your QR Code Ticket</h3>
            <img src="${qrBase64}" alt="QR Code Ticket">
            <p>Please present this QR code at the entrance</p>
          </div>
          
          <div class="ticket-id">
            <strong>Ticket ID:</strong> ${ticketId}
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <strong>Important:</strong> Please save this email or take a screenshot.<br>
            You'll need this QR code to enter the event.
          </p>
        </div>
        
        <div class="footer">
          <p>For any questions, contact event support</p>
          <p>© 2024 Event Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Function to send email with QR code
async function sendTicketEmail(attendeeEmail, attendeeName, ticketData, qrBase64) {
  try {
    const transporter = createTransporter();
    
    const emailHtml = createTicketEmailTemplate(
      attendeeName,
      ticketData.eventTitle,
      ticketData.eventDate,
      ticketData.eventLocation,
      ticketData.ticketId,
      qrBase64  // This passes the QR code to the template
    );
    
    const mailOptions = {
      from: `"Event System" <${process.env.EMAIL_USER}>`,
      to: attendeeEmail,
      subject: `🎫 Your Ticket for ${ticketData.eventTitle}`,
      html: emailHtml,
      // Add this to embed QR code as attachment
      attachments: [{
        filename: 'qrcode.png',
        content: qrBase64.split(';base64,')[1],
        encoding: 'base64',
        cid: 'qrcode'  // This makes it embeddable
      }]
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`   📧 Email sent to ${attendeeEmail}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error(`   ❌ Email failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}
export { sendTicketEmail, createTicketEmailTemplate };
