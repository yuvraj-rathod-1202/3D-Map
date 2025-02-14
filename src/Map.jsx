import { useEffect } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./MapStyles.css";

const MapComponent = () => {
    

  useEffect(() => {
    maptilersdk.config.apiKey = "Vfl0UVnJBIbCh32Ps4Pl"; // 🔹 Replace with your API key

    const map = new maptilersdk.Map({
      container: "map",
      style: maptilersdk.MapStyle.STREETS,
      center: [16.62662018, 49.2125578],
      zoom: 14
    });

    map.addControl(new maptilersdk.NavigationControl(), "top-right");
    map.scrollZoom.enable();
    map.dragPan.enable();
    map.touchZoomRotate.enable();

    new maptilersdk.Marker()
      .setLngLat([16.62662018, 49.2125578])
      .addTo(map);
  }, []);

  return <div id="map"></div>;
};

export default MapComponent;