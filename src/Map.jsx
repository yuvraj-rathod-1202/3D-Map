import { useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./MapStyles.css";
import SearchBar from "./components/SearchBar";

const exampleData = [
  {
    name: "Tech Expo",
    description: "Showcasing innovative projects and research.",
    location: "IIT Gandhinagar - Central Hall",
    coordinates: [72.6844, 23.2098],
    image: "techexpo.jpg",
    time: "2025-02-14T16:00:00",
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
    time: "2025-02-14T18:00:00",
    genre: "Educational",
    tags: ["AI Symposium", "AI Symposium IITGN"],
    reviews: [],
    ticketRequired: true,
  },
  {
    name: "Dance Night",
    description: "Cultural event with live performances.",
    location: "IIT Gandhinagar - Open Grounds",
    coordinates: [72.6860, 23.2120],
    image: "dance.jpg",
    time: "2025-02-14T20:00:00",
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

const fetchEvents = async (data) => data;

const MapComponent = () => {
  const [mapInstance, setMapInstance] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [eventOptions, setEventOptions] = useState([]);

  useEffect(() => {
    maptilersdk.config.apiKey = "Vfl0UVnJBIbCh32Ps4Pl";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = [position.coords.longitude, position.coords.latitude];
        initMap(userLocation);
      },
      () => {
        const defaultLocation = [72.5461, 23.2167];
        initMap(defaultLocation);
      }
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
    setMapInstance(map);

    fetchEvents(exampleData).then((data) => {
      setEvents(data);
      const groupedEvents = {};
      data.forEach((event) => {
        const key = event.coordinates.join("_");
        if (!groupedEvents[key]) groupedEvents[key] = [];
        groupedEvents[key].push(event);
      });

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

        map.on("zoom", () => {
          markerElement.style.display = map.getZoom() > 14 ? "block" : "none";
        });
      });
    });
  };

  const submitReview = () => {
    if (!reviewText.trim()) return;

    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.name === selectedEvent.name
          ? {
              ...event,
              reviews: [
                ...event.reviews,
                { text: reviewText, image: reviewImage },
              ],
            }
          : event
      )
    );

    setReviewText("");
    setReviewImage(null);
  };

  return (
    <>
      <SearchBar map={mapInstance} events={events} />
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
            <p><b>Time:</b> {new Date(selectedEvent.time).toLocaleString()}</p>
            <p>{selectedEvent.description}</p>

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
