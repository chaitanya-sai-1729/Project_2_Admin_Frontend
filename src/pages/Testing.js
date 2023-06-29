import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const Testing = () => {
  useEffect(() => {
    // Create a map instance
    const map = L.map('map').setView([12.9716, 77.5946], 15);

    // Add a tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Define custom marker icon
    const customIcon = L.icon({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41],
    });

    const locations = [
      [14.4673, 78.8242],
      [14.0684212, 78.7527913],
      [13.6288, 79.4192],
      // Add more locations as needed
    ];

    const markers = [];

    // Create markers with custom icons and add them to the map
    for (let i = 0; i < locations.length; i++) {
      const marker = L.marker(locations[i], { icon: customIcon }).addTo(map);
      markers.push(marker);
    }

    // Fetch the routes from OpenRouteService API
    fetchRoutes(locations)
      .then((routes) => {
        // Create polylines representing the routes
        for (let i = 0; i < routes.length; i++) {
          const coordinates = routes[i].features[0].geometry.coordinates;
          const polyline = L.polyline(coordinates.map((coord) => [coord[1], coord[0]]), {
            color: 'blue',
          }).addTo(map);
        }

        // Fit the map to the bounds of all the markers
        const bounds = L.latLngBounds(markers.map((marker) => marker.getLatLng()));
        map.fitBounds(bounds);
      })
      .catch((error) => {
        console.error('Error fetching routes:', error);
      });

    // Optional: Add popups to markers
    for (let i = 0; i < markers.length; i++) {
      markers[i].bindPopup(`Location ${i + 1}`).openPopup();
    }
  }, []);

  const fetchRoutes = async (locations) => {
    const apiKey = '5b3ce3597851110001cf62489e0738b35da0487da467da5c9b5d369f';
    const promises = [];

    for (let i = 0; i < locations.length - 1; i++) {
      const startPoint = locations[i];
      const endPoint = locations[i + 1];
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startPoint[1]},${startPoint[0]}&end=${endPoint[1]},${endPoint[0]}`;
      promises.push(fetch(url).then((response) => response.json()));
    }

    try {
      return await Promise.all(promises);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return <div id="map" style={{ height: '100vh' }}></div>;
};

export default Testing;

