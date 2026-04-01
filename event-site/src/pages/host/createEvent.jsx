import logoImg from "./event_horizon_logo.png";
import ellipse18982 from "./ellipse-1898-2.svg";
import ellipse1898 from "./ellipse-1898.svg";
import ellipse18992 from "./ellipse-1899-2.svg";
import ellipse1899 from "./ellipse-1899.svg";
import location from "./location.png";
import path2 from "./path-2.svg";
import path from "./path.svg";
import rectangle7 from "./rectangle-7.svg";
import sound1048861 from "./sound-104886-1.svg";
import "./EventCreationHost.css";
import vector8 from "./vector-8.svg";
import vector9 from "./vector-9.svg";
import vector3352 from "./vector-335-2.svg";
import vector335 from "./vector-335.svg";
 
import { ArrowLeft } from "./ArrowLeft";
 
export const EventCreationHost = () => {
    return (
        <div className="event-creation-host">
 
            {/* ── Top nav bar ── */}
            <div className="rectangle-7" />
 
            {/* UPDATED: logo image replaces "LogoHere" text */}
            <img className="logo" alt="Event Horizon" src={logoImg} />
 
            <div className="text-wrapper-14">Host Dashboard</div>
            <div className="text-wrapper-15">About</div>
 
            <ArrowLeft className="arrow-left-instance" />
 
            {/* ── Page title ── */}
            <div className="text-wrapper-3">Create a new Event</div>
 
            {/* ── LEFT COLUMN ── */}
 
            <div className="input-field">
                <label className="label" htmlFor="input-1">
                    Event name
                </label>
                <input
                    className="input"
                    id="input-1"
                    placeholder="Name of event"
                    type="text"
                />
            </div>
 
            <div className="input-field-3">
                <div className="label">Venue / Location</div>
                <div className="value-wrapper">
                    <img className="location" alt="Location" src={location} />
                    <div className="value">Location</div>
                </div>
            </div>
 
            <div className="input-field-7">
                <div className="label">Start Date</div>
                <div className="input-4">
                    <div className="value-2">DD/MM/YY</div>
                </div>
            </div>
 
            <div className="input-field-8">
                <div className="label">Start Time</div>
                <div className="input-5">
                    <div className="value">09:00 AM</div>
                </div>
            </div>
 
            <div className="input-field-10">
                <div className="label-text-wrapper">
                    <div className="label-text">Category</div>
                </div>
                <div className="input-field-11">
                    <div className="lead-icon-text">
                        <div className="vector-wrapper">
                            <img className="vector-6" alt="Vector" src={vector8} />
                        </div>
                        <div className="cursor-text">
                            <div className="insert-text-here">Insert Category</div>
                        </div>
                    </div>
                    <div className="vector-wrapper">
                        <img className="vector-7" alt="Vector" src={vector335} />
                    </div>
                </div>
            </div>
 
            <div className="input-field-12">
                <div className="label-text-wrapper">
                    <div className="label-text">Visibility</div>
                </div>
                <div className="input-field-11">
                    <div className="lead-icon-text">
                        <div className="vector-wrapper">
                            <img className="vector-6" alt="Vector" src={vector9} />
                        </div>
                        <div className="cursor-text">
                            <div className="insert-text-here">Public</div>
                        </div>
                    </div>
                    <div className="vector-wrapper">
                        <img className="vector-7" alt="Vector" src={vector3352} />
                    </div>
                </div>
            </div>
 
            <div className="input-field-2">
                <div className="label">Description of event</div>
                <div className="input-2" />
            </div>
 
            <div className="input-field-4">
                <div className="label">Capacity</div>
                <div className="input-3">
                    <div className="value">200</div>
                </div>
            </div>
 
            <div className="input-field-6">
                <div className="label">End Date</div>
                <div className="input-4">
                    <div className="value-2">DD/MM/YY</div>
                </div>
            </div>
 
            <div className="input-field-9">
                <div className="label">End Time</div>
                <div className="input-5">
                    <div className="value">09:00 AM</div>
                </div>
            </div>
 
            {/* ── RIGHT COLUMN ── */}
 
            <div className="input-field-5">
                <div className="label">Event Flyer</div>
            </div>
 
            <div className="uploader">
                <img className="sound" alt="Sound" src={sound1048861} />
                <div className="drag-and-drop">
                    <p className="drag-and-drop-title">Drag and drop your files</p>
                    <p className="text-wrapper">
                        JPEG, PNG, PDF, and MP4 formats, up to 50MB
                    </p>
                </div>
                <button className="btn">
                    <div className="element-up-from-yesterd">Select File</div>
                </button>
            </div>
 
            <div className="inputs">
                <div className="label-2">or upload from URL</div>
                <div className="content-wrapper">
                    <div className="URL-input-container">
                        <div className="placeholder">Add file URL</div>
                    </div>
                    <button className="element-up-from-yesterd-wrapper">
                        <div className="element-up-from-yesterd">Upload</div>
                    </button>
                </div>
            </div>
 
            <div className="label-wrapper">
                <div className="label">Ticket Types</div>
            </div>
 
            <div className="div-wrapper">
                <div className="text-wrapper-2">General ticket</div>
            </div>
 
            <p className="add-ticket-type">+ Add ticket type</p>
 
            <div className="elements-3">
                <img className="ellipse" alt="Ellipse" src={ellipse1898} />
                <img className="path" alt="Path" src={path} />
                <img className="ellipse-2" alt="Ellipse" src={ellipse1899} />
            </div>
 
            <div className="elements-4">
                <img className="ellipse" alt="Ellipse" src={ellipse18982} />
                <img className="path" alt="Path" src={path2} />
                <img className="ellipse-2" alt="Ellipse" src={ellipse18992} />
            </div>
 
            <div className="button-group-2">
                <div className="text-wrapper-11">Publish event</div>
            </div>
            <div className="button-group">
                <div className="text-wrapper-12">Save as Draft</div>
            </div>
 
        </div>
    );
};