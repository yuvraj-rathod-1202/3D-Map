import { useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./MapStyles.css";
import SearchBar from "./components/SearchBar";

const formatTime = (startTime, endTime) => {
  return `${new Date(startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const isEventOpen = (endTime) => new Date() < new Date(endTime);

const exampleData = [
  {
    name: "Tech Expo",
    description: "Showcasing innovative projects and research.",
    location: "IIT Gandhinagar - Central Hall",
    coordinates: [72.6844, 23.2098],
    image: "techexpo.jpg",
    startTime: "2025-02-14T16:00:00",
    endTime: "2025-02-14T19:00:00",
    genre: "Technical",
    tags: ["Tech Expo", "Tech Expo IITGN"],
    reviews: [],
    ticketRequired: false,
  },
  {
    name: "AI Symposium",
    description: "A conference on the latest AI advancements.",
    location: "IIT Gandhinagar - Central Hall",
    coordinates: [72.6844, 23.2098],
    image: "aisymposium.jpg",
    startTime: "2025-02-15T18:00:00",
    endTime: "2025-02-15T21:00:00",
    genre: "Educational",
    tags: ["AI Symposium", "AI Symposium IITGN"],
    reviews: [],
    ticketRequired: true,
  },
  {
    name: "Dance Night",
    description: "Cultural event with live performances.",
    location: "IIT Gandhinagar - Open Grounds",
    coordinates: [72.686, 23.212],
    image: "dance.jpg",
    startTime: "2025-02-14T20:00:00",
    endTime: "2025-02-14T23:30:00",
    genre: "Cultural",
    tags: ["Dance Night", "Cultural Event IITGN"],
    reviews: [],
    ticketRequired: false,
  },
];

const genreIcons = {
  Technical: "🖥",
  Cultural: "🕺",
  Educational: "📚",
};

const MapComponent = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [eventOptions, setEventOptions] = useState([]);
  const [mapi, setMapI] = useState(null);
  const [addLocation, setAddLocation] = useState(false);

  useEffect(() => {
    maptilersdk.config.apiKey = "Vfl0UVnJBIbCh32Ps4Pl";
    navigator.geolocation.getCurrentPosition(
      (position) => initMap([position.coords.longitude, position.coords.latitude]),
      () => initMap([72.5461, 23.2167])
    );
  }, []);

  const initMap = (center) => {
    const map = new maptilersdk.Map({
      container: "map",
      style: maptilersdk.MapStyle.STREETS,
      center,
      zoom: 16,
    });

    map.addControl(new maptilersdk.NavigationControl(), "top-right");
    setMapI(map);
    setEvents(exampleData);

    const groupedEvents = {};
    exampleData.forEach((event) => {
      const key = event.coordinates.join("_");
      if (!groupedEvents[key]) groupedEvents[key] = [];
      groupedEvents[key].push(event);
    });

    const markers = [];

    Object.values(groupedEvents).forEach((group) => {
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.innerHTML = group.map(event => `${genreIcons[event.genre]} ${event.name}`).join("<br>");

      const marker = new maptilersdk.Marker({ element: markerElement })
        .setLngLat(group[0].coordinates)
        .addTo(map);

      marker.getElement().addEventListener("click", () => {
        setEventOptions(group);
        setSelectedEvent(group[0]);
        map.flyTo({ center: group[0].coordinates, zoom: 18 });
      });

      markers.push({ marker, element: markerElement });
    });

    map.on("zoom", () => {
      const zoomLevel = map.getZoom();
      markers.forEach(({ element }) => {
        element.style.display = zoomLevel > 18 || zoomLevel < 14 ? "none" : "block";
      });
    });

    if (addLocation) {
      map.on("click", (event) => {
        const { lng, lat } = event.lngLat;
        if (confirm(`Clicked Location:\nLatitude: ${lat}\nLongitude: ${lng}`)) {
          setAddLocation(false);
        }
      });
    }
  };

  const submitReview = () => {
    if (!reviewText.trim()) return;
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.name === selectedEvent.name
          ? { ...event, reviews: [...event.reviews, { text: reviewText, image: reviewImage }] }
          : event
      )
    );
    setReviewText("");
    setReviewImage(null);
  };

  return (
    <>
      <SearchBar map={mapi} events={events} />
      <div id="map"></div>
      <div className={`event-sidebar ${selectedEvent ? "active" : ""}`}>
        {selectedEvent && (
          <div className="event-sidebar-content">
            <button className="close-btn" onClick={() => setSelectedEvent(null)}>×</button>
            {eventOptions.length > 1 && (
              <select onChange={(e) => setSelectedEvent(events.find(ev => ev.name === e.target.value))}>
                {eventOptions.map((event) => (
                  <option key={event.name} value={event.name}>{event.name}</option>
                ))}
              </select>
            )}
            <img src={selectedEvent.image} alt={selectedEvent.name} className="event-image" />
            <h2>{selectedEvent.name}</h2>
            <p><b>Location:</b> {selectedEvent.location}</p>
            <p><b>Time:</b> {formatTime(selectedEvent.startTime, selectedEvent.endTime)}</p>
            <p>{selectedEvent.description}</p>

            <div
              className="status-block"
              style={{
                backgroundColor: isEventOpen(selectedEvent.endTime) ? "green" : "red",
                color: "white",
                padding: "5px 10px",
                borderRadius: "5px",
                display: "inline-block",
                fontWeight: "bold",
              }}
            >
              {isEventOpen(selectedEvent.endTime) ? "Open" : "Closed"}
            </div>
            {selectedEvent.ticketRequired ? (
              <button className="ticket-button">Buy Ticket</button>
            ) : (
              <div className="free-block">Free</div>
            )}
            <div className="review-section">
              <h3>Reviews</h3>
              {selectedEvent.reviews.length === 0 ? (
                <p>No reviews yet.</p>
              ) : (
                selectedEvent.reviews.map((review, index) => (
                  <div key={index} className="review">
                    <p>{review.text}</p>
                    {review.image && <img src={review.image} alt="Review" className="review-image" />}
                  </div>
                ))
              )}
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Write a review..."></textarea>
              <input type="file" accept="image/*" onChange={(e) => setReviewImage(URL.createObjectURL(e.target.files[0]))} />
              <button onClick={submitReview}>Submit Review</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MapComponent;
