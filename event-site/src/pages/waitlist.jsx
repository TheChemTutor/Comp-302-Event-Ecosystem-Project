import "./TicketWaitlist.css";
 
export const TicketWaitlist = () => {
  return (
    <div className="ticket-waitlist">
 
      {/* Nav bar */}
      <div className="rectangle"></div>
      <div className="text-wrapper">Logo here</div>
      <div className="ellipse"></div>
 
      {/* Page heading */}
      <div className="div">My Waitlist</div>
      <p className="you-ll-be-notified">
        You&#39;ll be notified the moment a spot opens up
      </p>
 
      {/* Card 1 */}
      <div className="rectangle-2"></div>
      <div className="rectangle-3"></div>
      <p className="text-wrapper-4">AfroFest 2026 — VVIP Table</p>
      <p className="p">Sat 28 Mar · P850 if confirmed</p>
      <div className="rectangle-5"></div>
      <div className="text-wrapper-5">Waitlisted</div>
      <div className="rectangle-7"></div>
      <div className="text-wrapper-6">Your Position</div>
      <div className="text-wrapper-8">#4 of 11</div>
      <div className="text-wrapper-10">0 spots available</div>
      <div className="text-wrapper-11">11 waiting</div>
      <p className="we-ll-hold-your-spot">
        We&#39;ll hold your spot for 30 minutes once a ticket becomes available.
        <br />
        Make sure your payment method is up to date.
      </p>
      <div className="rectangle-9"></div>
      <div className="text-wrapper-12">Leave waitlist</div>
 
      {/* Card 2 */}
      <div className="img"></div>
      <div className="rectangle-4"></div>
      <div className="text-wrapper-3">Rooftop Social - VIP</div>
      <div className="text-wrapper-2">TBC P200 if confirmed</div>
      <div className="rectangle-6"></div>
      <div className="text-wrapper-13">Pending</div>
      <div className="rectangle-8"></div>
      <div className="text-wrapper-7">Your Position</div>
      <div className="text-wrapper-9">#1 of 3</div>
 
    </div>
  );
};