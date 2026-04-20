import { db } from "./firebase.js";
import { collection, addDoc, getDoc, doc, updateDoc } from "firebase/firestore";
import QRCode from "qrcode";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create tickets folder if it doesn't exist
const ticketsDir = join(__dirname, "generated_tickets");
if (!existsSync(ticketsDir)) {
  mkdirSync(ticketsDir);
  console.log("📁 Created 'generated_tickets' folder");
}

// Function to generate a unique ticket ID
function generateTicketId() {
  return "TKT-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Function to generate QR code as image file
async function generateQRCodeImage(ticketData, filePath) {
  try {
    // Convert ticket data to JSON string
    const qrData = JSON.stringify(ticketData);
    
    // Generate QR code as PNG file
    await QRCode.toFile(filePath, qrData, {
      color: {
        dark: '#000000',  // Black dots
        light: '#FFFFFF'  // White background
      },
      width: 500,
      margin: 2
    });
    
    console.log(`   📸 QR Code saved: ${filePath}`);
    return true;
  } catch (error) {
    console.error("   ❌ QR Generation Error:", error);
    return false;
  }
}

// Function to generate QR code as base64 string (for embedding in HTML)
async function generateQRCodeBase64(ticketData) {
  try {
    const qrData = JSON.stringify(ticketData);
    return await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 1
    });
  } catch (error) {
    console.error("QR Base64 Error:", error);
    return null;
  }
}

// Main function to create a ticket
async function createTicket(userId, eventId, attendeeName, attendeeEmail) {
  try {
    console.log("\n🎫 Creating new ticket...");
    console.log(`   👤 Attendee: ${attendeeName}`);
    console.log(`   📧 Email: ${attendeeEmail}`);
    console.log(`   🎟️ Event ID: ${eventId}`);
    
    // 1. Get event details from Firestore
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);
    
    let eventTitle = "Unknown Event";
    let eventDate = "Date TBD";
    let eventLocation = "Location TBD";
    
    if (eventSnap.exists()) {
      eventTitle = eventSnap.data().title || eventTitle;
      eventDate = eventSnap.data().date ? new Date(eventSnap.data().date.seconds * 1000).toLocaleDateString() : eventDate;
      eventLocation = eventSnap.data().location || eventLocation;
      console.log(`   📍 Event: ${eventTitle}`);
    } else {
      console.log("   ⚠️ Warning: Event not found in database");
    }
    
    // 2. Generate unique ticket ID
    const ticketId = generateTicketId();
    console.log(`   🆔 Ticket ID: ${ticketId}`);
    
    // 3. Create ticket data object
    const ticketData = {
      ticketId: ticketId,
      userId: userId,
      eventId: eventId,
      eventTitle: eventTitle,
      eventDate: eventDate,
      eventLocation: eventLocation,
      attendeeName: attendeeName,
      attendeeEmail: attendeeEmail,
      generatedAt: new Date().toISOString(),
      qrCodeData: ticketId, // Simple QR data
      used: false,
      checkedIn: false
    };
    
    // 4. Generate QR code image file
    const qrFileName = `${ticketId}.png`;
    const qrFilePath = join(ticketsDir, qrFileName);
    await generateQRCodeImage(ticketData, qrFilePath);
    
    // 5. Also generate base64 QR code
    const qrBase64 = await generateQRCodeBase64(ticketData);
    
    // 6. Save ticket to Firestore
    const ticketRef = await addDoc(collection(db, "tickets"), {
      ticketId: ticketId,
      userId: userId,
      eventId: eventId,
      attendeeName: attendeeName,
      attendeeEmail: attendeeEmail,
      eventTitle: eventTitle,
      eventDate: eventDate,
      eventLocation: eventLocation,
      qrCodeImagePath: qrFileName,
      qrCodeData: ticketId,
      generatedAt: new Date().toISOString(),
      used: false,
      checkedIn: false,
      checkedInAt: null
    });
    
    console.log(`   ✅ Ticket saved to Firestore with ID: ${ticketRef.id}`);
    console.log(`   📁 QR code image: generated_tickets/${qrFileName}`);
    
    return {
      success: true,
      ticketId: ticketId,
      firestoreId: ticketRef.id,
      qrImagePath: qrFileName,
      qrBase64: qrBase64,
      ticketData: ticketData
    };
    
  } catch (error) {
    console.error("❌ Error creating ticket:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to verify a ticket (check if it's valid)
async function verifyTicket(ticketId) {
  try {
    console.log(`\n🔍 Verifying ticket: ${ticketId}`);
    
    // Find ticket in Firestore by ticketId field
    const ticketsRef = collection(db, "tickets");
    const querySnapshot = await getDocs(collection(db, "tickets"));
    
    let foundTicket = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().ticketId === ticketId) {
        foundTicket = { id: doc.id, ...doc.data() };
      }
    });
    
    if (!foundTicket) {
      console.log("   ❌ Ticket not found!");
      return { valid: false, reason: "Ticket not found" };
    }
    
    if (foundTicket.checkedIn) {
      console.log("   ⚠️ Ticket already used!");
      return { valid: false, reason: "Ticket already checked in", ticket: foundTicket };
    }
    
    console.log("   ✅ Ticket is valid!");
    return { valid: true, ticket: foundTicket };
    
  } catch (error) {
    console.error("Verification error:", error);
    return { valid: false, reason: error.message };
  }
}

// Function to check in a ticket
async function checkInTicket(ticketId) {
  try {
    console.log(`\n✅ Checking in ticket: ${ticketId}`);
    
    // First verify the ticket
    const verification = await verifyTicket(ticketId);
    
    if (!verification.valid) {
      return { success: false, message: verification.reason };
    }
    
    // Find and update the ticket
    const ticketsRef = collection(db, "tickets");
    const querySnapshot = await getDocs(ticketsRef);
    
    let ticketDocId = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().ticketId === ticketId) {
        ticketDocId = doc.id;
      }
    });
    
    if (ticketDocId) {
      const ticketRef = doc(db, "tickets", ticketDocId);
      await updateDoc(ticketRef, {
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        used: true
      });
      
      console.log("   🎟️ Ticket checked in successfully!");
      return { success: true, message: "Checked in!" };
    }
    
    return { success: false, message: "Could not update ticket" };
    
  } catch (error) {
    console.error("Check-in error:", error);
    return { success: false, message: error.message };
  }
}

// Helper function to get all documents from a collection
import { getDocs } from "firebase/firestore";

// Create multiple sample tickets
async function createSampleTickets() {
  console.log("\n" + "=".repeat(50));
  console.log("🎫 CREATING SAMPLE TICKETS");
  console.log("=".repeat(50));
  
  // First, get an event ID from your database
  const eventsRef = collection(db, "events");
  const eventsSnapshot = await getDocs(eventsRef);
  
  let eventId = null;
  eventsSnapshot.forEach((doc) => {
    if (!eventId) {
      eventId = doc.id;
      console.log(`\n📅 Using event: ${doc.data().title} (ID: ${eventId})`);
    }
  });
  
  if (!eventId) {
    console.log("❌ No events found! Please create an event first.");
    return;
  }
  
  // Sample attendees
  const attendees = [
    { name: "John Doe", email: "john@example.com" },
    { name: "Jane Smith", email: "jane@example.com" },
    { name: "Mike Johnson", email: "mike@example.com" },
    { name: "Sarah Williams", email: "sarah@example.com" }
  ];
  
  // Create tickets for each attendee
  for (const attendee of attendees) {
    const result = await createTicket(
      "LY5VcDeCLCZ2aDMGVCR7",
      eventId,
      attendee.name,
      attendee.email
    );
    
    if (result.success) {
      console.log(`   🎉 Ticket created for ${attendee.name}\n`);
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("📁 Tickets saved in 'generated_tickets' folder");
  console.log("📁 Tickets also saved in Firestore 'tickets' collection");
  console.log("=".repeat(50));
}

// Run the sample ticket creation
createSampleTickets().catch(console.error);

// Export functions for use in other files
export { createTicket, verifyTicket, checkInTicket, generateQRCodeBase64 };
