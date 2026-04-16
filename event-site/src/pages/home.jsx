import "./homepagedesktop.css";
//import logo from "./event_horizon_logo.png";

export const Frame = () => {
    return (
        <div className="frame">
            <nav className="navbar">
                <img src={logo} alt="Event Horizon" className="logo-img" />
                <div className="nav-links">
                    <a href="#">Explore</a>
                    <a href="#">My tickets</a>
                    <a href="#">Host an event</a>
                    <a href="#">About</a>
                </div>
                <div className="nav-right">
                    <button className="btn-signin">Sign in</button>
                    <div className="hamburger" aria-label="Menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </nav>

            <div className="hero">
                <p className="hero-subtitle">
                    Concerts, tech meetups, sports, food festivals - all in one place
                </p>
                <h1 className="hero-title">Find your next experience</h1>
                <div className="search-bar">
                    <input type="text" placeholder="Search events, artists, venues..." />
                    <button className="btn-search">Search</button>
                </div>
            </div>
        </div>
    );
    
};
export default Frame