import React, { useState } from "react";
import '../stylesheet/AddEvents.css';

const AddEvents = ({ onAddEvent }) => {
    const [showForm, setShowForm] = useState(false);
    const [eventData, setEventData] = useState({
        eventName: "",
        eventDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        eventDescription: "",
        tickets: "no",
        eventType: "educational",
        customEventName: "",
        customEventIcon: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    const handleFileChange = (e) => {
        setEventData({ ...eventData, customEventIcon: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddEvent(eventData);
        setShowForm(false);
        setEventData({
            eventName: "",
            eventDate: "",
            endDate: "",
            startTime: "",
            endTime: "",
            eventDescription: "",
            tickets: "no",
            eventType: "educational",
            customEventName: "",
            customEventIcon: null,
        });
    };

    return (
        <div>
            <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                + Add Event
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="event-form">
                    <label>Event Name:</label>
                    <input type="text" name="eventName" value={eventData.eventName} onChange={handleChange} required />

                    <label>Start Date:</label>
                    <input type="date" name="eventDate" value={eventData.eventDate} onChange={handleChange} required />

                    <label>End Date:</label>
                    <input type="date" name="endDate" value={eventData.endDate} onChange={handleChange} required />

                    <label>Start Time:</label>
                    <input type="time" name="startTime" value={eventData.startTime} onChange={handleChange} required />

                    <label>End Time:</label>
                    <input type="time" name="endTime" value={eventData.endTime} onChange={handleChange} required />

                    <label>Description:</label>
                    <textarea name="eventDescription" rows="3" value={eventData.eventDescription} onChange={handleChange}></textarea>

                    <fieldset className="ticket-fieldset">
                        <legend>Ticketing</legend>
                        <label>
                            <input type="radio" name="tickets" value="yes" checked={eventData.tickets === "yes"} onChange={handleChange} />
                            🎟 Tickets Required
                        </label>
                        <label>
                            <input type="radio" name="tickets" value="no" checked={eventData.tickets === "no"} onChange={handleChange} />
                            🆓 Free Entry
                        </label>
                    </fieldset>

                    <label>Event Type:</label>
                    <select name="eventType" value={eventData.eventType} onChange={handleChange} required>
                        <option value="educational">📚 Educational</option>
                        <option value="cultural">🎭 Cultural</option>
                        <option value="technical">💡 Technical</option>
                        <option value="custom">➕ Custom Event</option>
                    </select>

                    {eventData.eventType === "custom" && (
                        <div>
                            <label>Custom Name:</label>
                            <input type="text" name="customEventName" value={eventData.customEventName} onChange={handleChange} />

                            <label>Upload Icon:</label>
                            <input type="file" name="customEventIcon" accept="image/jpeg, image/png" onChange={handleFileChange} />

                            {eventData.customEventIcon && <img src={URL.createObjectURL(eventData.customEventIcon)} alt="Icon preview" className="icon-preview" />}
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="submit-btn">Create Event</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AddEvents;
