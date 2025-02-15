import { useEffect, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './MapStyles.css';
import SearchBar from "./components/SearchBar";
import { fetchMessages, getallEvenstDetail, sendMessage, setImage } from "./firebase/firestore";
import { getOpenRouteServiceRoute } from "./components/getshortesturl";
import { useAuth } from "./firebase/AuthContext";
import { Link } from "react-router-dom";

const formatTime = (startTime, endTime) => {
  return `${new Date(startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const isEventOpen = (endTime) => new Date() < new Date(endTime);

const genreIcons = {
  technical: "🖥",
  cultural: "🕺",
  educational: "📚",
};

const MapComponent = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [eventOptions, setEventOptions] = useState([]);
  const [mapi, setMapI] = useState(null);
  const [addlocation, setAddLocation] = useState(false);
  const [messages, setMessages] = useState([]);
  const { currentUser } = useAuth();
  const userMarkerRef = useRef(null);
  const fallbackCoords = [72.5461, 23.2167];
  const fetchEvents = async (data) => data;

  useEffect(() => {
    fetchMessages().then((msgs) => {
      setMessages(msgs);
    });
  }, []);

  useEffect(() => {
    maptilersdk.config.apiKey = "Vfl0UVnJBIbCh32Ps4Pl";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.longitude, position.coords.latitude];
        initMap(coords);
      },
      () => initMap(fallbackCoords)
    );
  }, []);

  // This useEffect will watch the user's position and update the live marker.
  useEffect(() => {
    if (!mapi) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newCoords = [position.coords.longitude, position.coords.latitude];
        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat(newCoords);
        }
        // Optionally, recenter the map:
        // mapi.setCenter(newCoords);
      },
      (error) => {
        console.error("Error watching position:", error);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [mapi]);

  const initMap = (center) => {
    const map = new maptilersdk.Map({
      container: "map",
      style: maptilersdk.MapStyle.STREETS,
      center,
      zoom: 16,
    });

    map.addControl(new maptilersdk.NavigationControl(), "top-right");
    setMapI(map);

    // Add a live location marker using the current center.
    userMarkerRef.current = new maptilersdk.Marker({ color: "blue" })
      .setLngLat(center)
      .addTo(map);

    // Fetch events and add event markers
    fetchEvents(getallEvenstDetail()).then((data) => {
      console.log(data);
      setEvents(data);
      const groupedEvents = {};
      data.forEach((event) => {
        const key = event.location.join("_");
        if (!groupedEvents[key]) groupedEvents[key] = [];
        groupedEvents[key].push(event);
      });

      Object.values(groupedEvents).forEach((group) => {
        const markerElement = document.createElement("div");
        markerElement.className = "custom-marker";
        markerElement.innerHTML = group
          .map((event) => `${genreIcons[event.genre]} ${event.name}`)
          .join("<br>");
        
        const marker = new maptilersdk.Marker({ element: markerElement })
          .setLngLat(group[0].location)
          .addTo(map);

        marker.getElement().addEventListener("click", () => {
          setEventOptions(group);
          setSelectedEvent(group[0]);
          map.flyTo({ center: group[0].location, zoom: 18 });
        });

        map.on("zoom", () => {
          markerElement.style.display = map.getZoom() > 14 ? "block" : "none";
        });
      });
    });

    map.scrollZoom.enable();
    map.dragPan.enable();
    map.touchZoomRotate.enable();

    // Additional marker code for grouped events (if needed)...
    const extraGroupedEvents = {};
    const markers = [];

    Object.values(extraGroupedEvents).forEach((group) => {
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.innerHTML = group
        .map((event) => `${genreIcons[event.genre]} ${event.name}`)
        .join("<br>");

      const marker = new maptilersdk.Marker({ element: markerElement })
        .setLngLat(group[0].location)
        .addTo(map);

      marker.getElement().addEventListener("click", () => {
        setEventOptions(group);
        setSelectedEvent(group[0]);
        map.flyTo({ center: group[0].location, zoom: 18 });
      });

      markers.push({ marker, element: markerElement });
    });

    map.on("zoom", () => {
      const zoomLevel = map.getZoom();
      markers.forEach(({ element }) => {
        element.style.display = zoomLevel > 18 || zoomLevel < 14 ? "none" : "block";
      });
    });

    if (addlocation) {
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
    sendMessage({ message: reviewText.trim(), sender: currentUser?.uid });
    setImage(crypto.randomUUID(), reviewImage);
    setReviewText("");
    setReviewImage(null);
  };

  function showShortestPath(map, routeGeoJSON, endPoint) {
    if (map.getSource("shortest-path")) {
      map.getSource("shortest-path").setData(routeGeoJSON);
    } else {
      map.addSource("shortest-path", {
        type: "geojson",
        data: routeGeoJSON,
      });
    }
    new maptilersdk.Marker({ color: "red" })
      .setLngLat(endPoint)
      .addTo(map);
    if (!map.getLayer("shortest-path-layer")) {
      map.addLayer({
        id: "shortest-path-layer",
        type: "line",
        source: "shortest-path",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "blue",
          "line-width": 5,
        },
      });
    }
  }

  return (
    <>
      <SearchBar map={mapi} events={events} />
      <div id="map"></div>
      <div className={`event-sidebar ${selectedEvent ? "active" : ""}`}>
        {selectedEvent && (
          <div className="event-sidebar-content">
            <button className="close-btn" onClick={() => setSelectedEvent(null)}>
              ×
            </button>
            {eventOptions.length > 1 && (
              <select
                onChange={(e) =>
                  setSelectedEvent(events.find((ev) => ev.name === e.target.value))
                }
              >
                {eventOptions.map((event) => (
                  <option key={event.name} value={event.name}>
                    {event.name}
                  </option>
                ))}
              </select>
            )}
            <img
              src={selectedEvent.image}
              alt={selectedEvent.name}
              className="event-image"
            />
            <h2>{selectedEvent.name}</h2>
            <p>
              <b>Location:</b> {selectedEvent.location}
            </p>
            <p>
              <b>Time:</b> {formatTime(selectedEvent.start_time, selectedEvent.end_time)}
            </p>
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
              <a href="https://www.district.in/" className="ticket-button">
                Buy Ticket
              </a>
            ) : (
              <div className="free-block">Free</div>
            )}
            <div className="review-section">
              <h3>Reviews</h3>
              {messages.length === 0 ? (
                <p>No reviews yet.</p>
              ) : (
                messages.map((review, index) => (
                  <div key={index} className="review">
                    <p>{review.message}</p>
                  </div>
                ))
              )}
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write a review..."
              ></textarea>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setReviewImage(URL.createObjectURL(e.target.files[0]))
                }
              />
              <button onClick={submitReview}>Submit Review</button>
            </div>
          </div>
        )}
        <div>
          <Link
            to="/addEvent"
            style={{
              marginLeft: "500px",
              backgroundColor: "red",
              zIndex: 10,
              alignContent: "end",
            }}
          >
            Add Event
          </Link>
        </div>
      </div>
    </>
  );
};

export default MapComponent;
