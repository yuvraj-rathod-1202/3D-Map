import React, { useEffect } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

const MapPicker = ({ initialLocation, onLocationSelect, onClose }) => {
  useEffect(() => {
    // Set your MapTiler API key
    maptilersdk.config.apiKey = "Vfl0UVnJBIbCh32Ps4Pl";

    // Function to initialize the map
    const initMap = (center) => {
      const map = new maptilersdk.Map({
        container: "map-picker",
        style: maptilersdk.MapStyle.STREETS,
        center,
        zoom: 14,
      });

      map.addControl(new maptilersdk.NavigationControl(), "top-right");
      map.scrollZoom.enable();
      map.dragPan.enable();
      map.touchZoomRotate.enable();

      // Listen for click events on the map
      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        onLocationSelect([lng, lat]);
      });

      return map;
    };

    // Determine center for the map: use provided initialLocation or try geolocation
    let mapInstance;
    if (initialLocation && initialLocation.length === 2) {
      mapInstance = initMap(initialLocation);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const center = [position.coords.longitude, position.coords.latitude];
          mapInstance = initMap(center);
        },
        () => {
          // Fallback center if geolocation fails
          mapInstance = initMap([23.21456, 72.68663]);
        }
      );
    }

    // Cleanup: remove map when component unmounts
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [initialLocation, onLocationSelect]);

  return (
    <div>
      <div id="map-picker" style={{ width: "100%", height: "300px" }}></div>
      <button onClick={onClose}>Close Map</button>
    </div>
  );
};

export default MapPicker;
