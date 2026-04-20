import { verifyTicket, checkInTicket } from "./generateTicket.js";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log("\n🔍 TICKET VERIFICATION SYSTEM");
  console.log("=".repeat(40));
  
  rl.question("\nEnter Ticket ID to verify: ", async (ticketId) => {
    console.log("");
    
    // Verify the ticket
    const result = await verifyTicket(ticketId);
    
    if (result.valid) {
      console.log("\n✅ VALID TICKET!");
      console.log(`   Attendee: ${result.ticket.attendeeName}`);
      console.log(`   Event: ${result.ticket.eventTitle}`);
      console.log(`   Email: ${result.ticket.attendeeEmail}`);
      
      rl.question("\nCheck in this attendee? (yes/no): ", async (answer) => {
        if (answer.toLowerCase() === "yes") {
          const checkinResult = await checkInTicket(ticketId);
          console.log(`\n${checkinResult.success ? "✅" : "❌"} ${checkinResult.message}`);
        }
        rl.close();
      });
    } else {
      console.log(`\n❌ INVALID TICKET: ${result.reason}`);
      rl.close();
    }
  });
}

main();
