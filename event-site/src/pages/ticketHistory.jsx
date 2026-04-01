import ellipse8 from "./ellipse-8.png";
import icon4 from "./icon-4.png";
import icon5 from "./icon-5.png";
import icon6 from "./icon-6.png";
import line1 from "./line-1.svg";
import line2 from "./line-2.svg";
import line3 from "./line-3.svg";
import line4 from "./line-4.svg";
import rectangle54 from "./rectangle-54.svg";
import rectangle56 from "./rectangle-56.svg";
import rectangle57 from "./rectangle-57.svg";
import "./ticketHistory.css";
 
export const TicketHistory = () => {
  return (
    <div className="ticket-history">
      <div className="rectangle" />
 
      <div className="text-wrapper">Logo here</div>
 
      <div className="div">Upcoming (2)</div>
 
      <div className="text-wrapper-2">Past (4)</div>
 
      <div className="text-wrapper-3">Waitlisted (1)</div>
 
      <img className="img" alt="Rectangle" src={rectangle54} />
 
      <div className="text-wrapper-4">VYB-00612</div>
 
      <div className="text-wrapper-5">P350</div>
 
      <p className="p">Wed 31 Dec · Gaborone CBD · VIP</p>
 
      <div className="text-wrapper-6">New Year Bash 2025</div>
 
      <div className="text-wrapper-7">VYB-00863</div>
 
      <div className="text-wrapper-8">Free</div>
 
      <p className="text-wrapper-9">Fri 3 Apr · BIUST Campus · Standard</p>
 
      <div className="text-wrapper-10">VYB-00841</div>
 
      <div className="text-wrapper-11">P120</div>
 
      <p className="text-wrapper-12">
        Sat 28 Mar · Gaborone Showgrounds · General Admission
      </p>
 
      <div className="text-wrapper-13">AfroFest 2026</div>
 
      <img className="rectangle-2" alt="Rectangle" src={rectangle56} />
 
      <div className="text-wrapper-14">BIUST Hackathon</div>
 
      <img className="rectangle-3" alt="Rectangle" src={rectangle57} />
 
      <div className="rectangle-4" />
 
      <div className="rectangle-5" />
 
      <div className="rectangle-6" />
 
      <div className="rectangle-7" />
 
      <div className="text-wrapper-15">Upcoming</div>
 
      {/* NOTE: text-wrapper-16 has no CSS defined — add styles in TicketHistory.css */}
      <div className="text-wrapper-16">Upcoming</div>
 
      <div className="rectangle-8" />
 
      <div className="rectangle-9" />
 
      <div className="rectangle-10" />
 
      <div className="text-wrapper-17">Attended</div>
 
      <img className="line" alt="Line" src={line1} />
 
      <img className="line-2" alt="Line" src={line2} />
 
      <img className="line-3" alt="Line" src={line3} />
 
      {/* NOTE: icon, icon-2 are off-screen in CSS (left: -1515px). Fix positions in TicketHistory.css */}
      <img className="icon" alt="Icon" src={icon4} />
      <img className="icon-2" alt="Icon" src={icon5} />
      <img className="icon-2" alt="Icon" src={icon6} />
 
      <img className="line-4" alt="Line" src={line4} />
 
      <img className="ellipse" alt="Ellipse" src={ellipse8} />
    </div>
  );
};