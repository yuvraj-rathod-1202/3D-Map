import React, { useState } from "react";
import "../stylesheet/AddEvents.css";
import { setEventDatatoDB, setImage } from "../firebase/firestore";
import { useAuth } from "../firebase/AuthContext";
import MapPicker from "../components/MapPicker"; // Adjust the import path as needed

const AddEvents = ({ onAddEvent }) => {
  const [showForm, setShowForm] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const { currentUser } = useAuth();
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
    tagName: "",
    customEventIcon: null,
  });
  const [location, setLocation] = useState([0, 0]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setEventData((prevData) => ({ ...prevData, customEventIcon: e.target.files[0] }));
  };

  // When a location is selected from MapPicker
  const handleLocationSelect = (coords) => {
    setLocation(coords);
    alert(`Location selected: ${coords}`);
    setShowMapPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (
      eventData.eventName.trim() === "" ||
      eventData.eventDate.trim() === "" ||
      eventData.endDate.trim() === "" ||
      eventData.startTime.trim() === "" ||
      eventData.endTime.trim() === "" ||
      eventData.eventDescription.trim() === ""
    ) {
      alert("Please fill all the fields!");
      return;
    }

    // Build the new event object
    const newEvent = {
      uid: crypto.randomUUID(),
      name: eventData.eventName,
      description: eventData.eventDescription,
      location: location,
      start_time: `${eventData.eventDate}T${eventData.startTime}`,
      end_time: `${eventData.endDate}T${eventData.endTime}`,
      genre: eventData.eventType,
      tags: [eventData.tagName],
      ticketRequired: eventData.tickets === "yes",
      sender: currentUser?.uid,
    };

    // If a custom icon is provided, upload it and add its URL to the event
    if (eventData.customEventIcon) {
      try {
        const imageUrl = await setImage(eventData.customEventIcon);
        newEvent.imageUrl = imageUrl;
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    console.log("New Event:", newEvent);
    // Add the event to Firestore
    await setEventDatatoDB(newEvent);
    if (onAddEvent) {
      onAddEvent(newEvent);
    }

    // Reset form and hide it
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
    setLocation([0, 0]);
  };

  return (
    <div>
      <button className="add-btn" onClick={() => setShowForm(!showForm)}>
        + Add Event
      </button>

      {showForm && (
        <form className="event-form" onSubmit={handleSubmit}>
          {/* ... other form fields ... */}
          <label>Event Name:</label>
          <input type="text" name="eventName" value={eventData.eventName} onChange={handleChange} required />
          <label>Event Tag:</label>
          <input type="text" name="tagName" value={eventData.tagName} onChange={handleChange} required />
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
          </select>

          {eventData.eventType === "custom" && (
            <div>
              <label>Custom Name:</label>
              <input type="text" name="customEventName" value={eventData.customEventName} onChange={handleChange} />
              <label>Upload Icon:</label>
              <input type="file" name="customEventIcon" accept="image/jpeg, image/png" onChange={handleFileChange} />
              {eventData.customEventIcon && (
                <img src={URL.createObjectURL(eventData.customEventIcon)} alt="Icon preview" className="icon-preview" />
              )}
            </div>
          )}

          {/* Button to open the map picker */}
          <button type="button" className="add-btn" onClick={() => setShowMapPicker(true)}>
            + Add Location
          </button>

          {/* Conditionally render the MapPicker */}
          {showMapPicker && (
            <MapPicker
              initialLocation={location}
              onLocationSelect={handleLocationSelect}
              onClose={() => setShowMapPicker(false)}
            />
          )}

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Create Event
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddEvents;
