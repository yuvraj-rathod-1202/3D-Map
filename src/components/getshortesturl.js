import 'leaflet/dist/leaflet.css';
export const getOpenRouteServiceRoute = async (start, end) => {
    // Coordinates: [longitude, latitude]
    const apiKey = '5b3ce3597851110001cf6248198ef0ddb8414c58ac3a3788e1b18f8c'; // Replace with your API key
    const startCoords = `${start[0]},${start[1]}`;
    const endCoords = `${end[0]},${end[1]}`;
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startCoords}&end=${endCoords}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error('HTTP error:', response.status);
        return null;
      }
      const data = await response.json();
  
      if (data.features && data.features.length > 0) {
        // The route is contained in the first feature's geometry
        const route = data.features[0];
        // console.log('OpenRouteService route:', route);
        return { route, endPoint: end};
      } else {
        console.error('No routes found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      return null;
    }
  };  
  
  