import React, { useState } from "react";
import "../stylesheet/SeachBar.css";
import { Link } from "react-router-dom";

const SearchBar = ({ map, events }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async (e) => {
    const value = e.target.value.toLowerCase();
    setQuery(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${e.target.value}.json?key=Vfl0UVnJBIbCh32Ps4Pl`
      );
      const data = await response.json();
      const locationSuggestions = data.features.map((place) => ({
        id: place.id,
        name: place.place_name,
        coordinates: place.geometry.coordinates,
        type: "location",
      }));

      const eventSuggestions = events
        .filter(
          (event) =>
            event.name.toLowerCase().includes(value) ||
            event.tags.some((tag) => tag.toLowerCase().includes(value))
        )
        .map((event) => ({
          id: event.name,
          name: event.name,
          coordinates: event.coordinates,
          type: "event",
        }));

      setSuggestions([...eventSuggestions, ...locationSuggestions]);
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const handleSelect = (item) => {
    setQuery(item.name);
    setSuggestions([]);

    if (map) {
      map.flyTo({
        center: item.coordinates,
        zoom: 18,
        speed: 0.5,
        curve: 1.5,
        essential: true,
      });
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
  };

  return (
    <div className="search-bar flex flex-row">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
        placeholder="Search for a location or event..."
      />
      {query && <button className="clear-btn" onClick={handleClear}>×</button>}
      <ul className="suggestions">
        {suggestions.map((item, index) => (
          <li key={index} onClick={() => handleSelect(item)}>
            {item.name} {item.type === "event" ? "(Event)" : ""}
          </li>
        ))}
      </ul>
      <div>
        <Link to="/addevents">
      <button className="search-btn">Add Event </button>
      </Link>
      <Link to="/login">
      <button className="search-btn">Login</button>
      </Link>
      </div>
    </div>
  );
};

export default SearchBar;
