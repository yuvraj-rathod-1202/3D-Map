import { useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './MapStyles.css'
import SearchBar from "./components/SearchBar";
import { fetchMessages, getallEvenstDetail, sendMessage } from "./firebase/firestore";
import { getOpenRouteServiceRoute } from "./components/getshortesturl";
import { useAuth } from "./firebase/AuthContext";

const exampleData = [
  { 
    id: "1",
    name: "Tech Expo",
    description: "Showcasing innovative projects and research.",
    location: [72.6844, 23.2098],
    start_time: "2025-02-15T10:00:00",
    end_time: "2025-02-15T17:00:00",
    genre: "Technical",
    tags: ["Tech Expo", "Tech Expo IITGN"],
    ticketRequired: false,
    sender: "1"
  }
];

// {
//   name: "AI Symposium",
//   description: "A conference on the latest AI advancements.",
//   coordinates: [72.6844, 23.2098],
//   image: "aisymposium.jpg",
//   time: "2025-02-14T18:00:00",
//   genre: "Educational",
//   tags: ["AI Symposium", "AI Symposium IITGN"],
//   ticketRequired: true,
// },
// {
//   name: "Dance Night",
//   description: "Cultural event with live performances.",
//   coordinates: [72.6860, 23.2120],
//   image: "dance.jpg",
//   time: "2025-02-14T20:00:00",
//   genre: "Cultural",
//   tags: ["Dance Night", "Cultural Event IITGN"],
//   ticketRequired: false,
// },

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
  const [addlocation, setAddLocation] = useState(false);
  const fetchEvents = async (data) => data;
  const [messages, setMessages] = useState([]);
  const {currentUser} = useAuth();

  useEffect(() => {
    fetchMessages().then((messages) => {
      setMessages(messages);
    });
  }, [])
  


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
    setMapI(map);

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
        markerElement.innerHTML = group.map(event => `${genreIcons[event.genre]} ${event.name}`).join("<br>");
        
        const marker = new maptilersdk.Marker({ element: markerElement })
          .setLngLat(group[0].location)
          .addTo(map);

        marker.getElement().addEventListener("click", () => {
          setEventOptions(group);
          console.log(group);
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

    setMapI(map);

    new maptilersdk.Marker()
      .setLngLat([16.62662018, 49.2125578])
      .addTo(map);

    
      if(addlocation){
        map.on('click', (event) => {
          const { lng, lat } = event.lngLat;
          if(confirm(`Clicked Location:\nLatitude: ${lat}\nLongitude: ${lng}`)){
            setAddLocation(false);
          }
        });
      }
    

    
      function showShortestPath(map, routeGeoJSON, endPoint) {
        // If a source for the shortest path already exists, update its data.
        if (map.getSource('shortest-path')) {
          map.getSource('shortest-path').setData(routeGeoJSON);
        } else {
          // Otherwise, add a new GeoJSON source for the route.
          map.addSource('shortest-path', {
            type: 'geojson',
            data: routeGeoJSON
          });
        }

        new maptilersdk.Marker({
            color: 'red'
        })
            .setLngLat(endPoint)
            .addTo(map);

        // If the route layer does not exist, add a new layer to display it.
        if (!map.getLayer('shortest-path-layer')) {
          map.addLayer({
            id: 'shortest-path-layer',
            type: 'line',
            source: 'shortest-path',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': 'blue', // Blue color for the shortest path
              'line-width': 5       // Customize the line width as needed
            }
          });
        }
      }
      

    getOpenRouteServiceRoute([16.62662018, 49.2125578], [16.63662018, 49.2155578]).then(({ route, endPoint}) => {
        if (route) {
          showShortestPath(map, route.geometry, endPoint);
        }

    });
  };

  const submitReview = () => {
    if (!reviewText.trim()) return;
    sendMessage({message: reviewText.trim(), sender: currentUser.uid});
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
            <p><b>Time:</b> {new Date(selectedEvent.time).toLocaleString()}</p>
            <p>{selectedEvent.description}</p>

            {selectedEvent.ticketRequired ? (
              <button className="ticket-button">Buy Ticket</button>
            ) : (
              <div className="free-block">Free</div>
            )}

            <div className="review-section">
              <h3>Reviews</h3>
              {messages.length === 0 ? (
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

export default MapComponent
