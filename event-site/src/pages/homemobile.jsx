import "./homemobile.css";
import logo from "./event_horizon_logo.png";

export const HomePageForMobile = () => {
    return (
        <div className="home-page-for-mobile">

            <div className="frame">
                <div className="mobile-navbar">
                    <img src={logo} alt="Event Horizon" className="logo-img" />
                    <div className="hamburger">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <div className="text-wrapper">Find your next experience</div>
                <p className="div">
                    Concerts, tech meetups, sports, food festival - all in one place.
                </p>
                <div className="group">
                    <div className="frame-2">
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Search events, artists, venues..."
                        />
                        <div className="search-btn">
                            <span>Search</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="event-banner">
                <div className="banner-placeholder" />
            </div>

            <div className="category-tags">
                <div className="tag">All</div>
                <div className="tag">Music</div>
                <div className="tag">Sports</div>
                <div className="tag">Tech</div>
                <div className="tag">Food &amp; Clothing</div>
            </div>

            <div className="event-card">
                <div className="card-header">
                    <div className="card-tag">Music</div>
                </div>
                <div className="card-body">
                    <h3 className="card-title">AfroFest 2026</h3>
                    <p className="card-date">Sat 28 Mar · Gaborone Showgrounds</p>
                    <div className="card-footer">
                        <span className="card-price">P120</span>
                        <button className="register-btn">Register</button>
                    </div>
                </div>
            </div>

            <div className="event-card">
                <div className="card-header">
                    <div className="card-tag">Tech</div>
                </div>
                <div className="card-body">
                    <h3 className="card-title">BIUST Hackathon</h3>
                    <p className="card-date">Fri 3 Apr · BIUST Campus</p>
                    <div className="card-footer">
                        <span className="card-price free">Free</span>
                        <button className="register-btn">Register</button>
                    </div>
                </div>
            </div>

        </div>
    );
};