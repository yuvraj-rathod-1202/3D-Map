import { useEffect, useState } from "react";
import L, { map } from 'leaflet';
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./MapStyles.css";
import { getOpenRouteServiceRoute } from "./components/getshortesturl";
import SearchBar from "./components/SearchBar";

const MapComponent = () => {

    const [mapi, setMapI] = useState(null);


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

    setMapI(map);

    new maptilersdk.Marker()
      .setLngLat([16.62662018, 49.2125578])
      .addTo(map);

    
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

      
  }, []);

    

  return (
    <>
    <SearchBar map={mapi} />
    <div id="map"></div>
    </>);
};

export default MapComponent;