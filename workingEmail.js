import { db } from "./firebase.js";
import { collection, getDocs } from "firebase/firestore";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendTicket() {
  try {
    console.log("\n📧 Starting...");
    
    // Get the first event
    const eventsRef = collection(db, "events");
    const snapshot = await getDocs(eventsRef);
    
    let eventTitle = "Tech Conference";
    let eventId = null;
    
    snapshot.forEach((doc) => {
      eventId = doc.id;
      eventTitle = doc.data().title || eventTitle;
    });
    
    if (!eventId) {
      console.log("❌ No event found");
      return;
    }
    
    console.log(`📅 Event: ${eventTitle}`);
    console.log(`📧 Sending to: motheobasinyi@gmail.com`);
    
    // Simple QR code data
    const qrData = {
      name: "Test User",
      email: "motheobasinyi@gmail.com",
      event: eventTitle,
      date: new Date().toLocaleDateString()
    };
    
    // Generate QR code as image
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
    
    // Simple HTML email
    const emailHTML = `
      <div style="text-align: center; font-family: Arial; padding: 20px;">
        <h1 style="color: #667eea;">🎫 ${eventTitle}</h1>
        <h2>Hello Test User!</h2>
        <img src="${qrCodeImage}" style="width: 250px; border: 3px solid #667eea; border-radius: 10px; padding: 10px;" />
        <p style="font-size: 18px; margin-top: 20px;"><strong>Show this QR code at the entrance</strong></p>
        <p>Ticket ID: ${Date.now()}</p>
        <hr />
        <p style="color: #666;">Event Management System</p>
      </div>
    `;
    
    // Send the email
    const mailOptions = {
      from: `"Event System" <${process.env.EMAIL_USER}>`,
      to: "motheobasinyi@gmail.com",
      subject: `🎫 Your Ticket for ${eventTitle}`,
      html: emailHTML
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ EMAIL SENT SUCCESSFULLY!");
    console.log("📨 Message ID:", result.messageId);
    console.log("\n📬 Check your inbox (or spam folder)!");
    
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

// Run it
sendTicket();
