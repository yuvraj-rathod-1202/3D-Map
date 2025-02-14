import React, { useState } from "react";
import "../stylesheet/SeachBar.css";

const SearchBar = ({ map }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async (e) => {
    setQuery(e.target.value);
    if (e.target.value.length < 2) return;

    try {
      const response = await fetch(`https://api.maptiler.com/geocoding/${e.target.value}.json?key=Vfl0UVnJBIbCh32Ps4Pl`);
      const data = await response.json();
      setSuggestions(data.features);
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const handleSelect = (location) => {
    setQuery(location.place_name);
    setSuggestions([]);

    if (map) {
      map.flyTo({
        center: location.geometry.coordinates,
        zoom: 18,
        speed: 0.5,  // 🔹 Slower transition for smooth movement
        curve: 1.5,  // 🔹 Makes movement more natural
        essential: true
      });
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search for a location..."
      />
      <ul className="suggestions">
        {suggestions.map((place) => (
          <li key={place.id} onClick={() => handleSelect(place)}>
            {place.place_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchBar;