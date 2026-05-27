import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const TASHKENT = [41.2995, 69.2401];

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function LocationMap({
  latitude,
  longitude,
  onLocationSelect,
  height = "280px",
}) {
  const lat = latitude ?? TASHKENT[0];
  const lng = longitude ?? TASHKENT[1];
  const hasMarker = latitude != null && longitude != null;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <p className="bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Click on the map to set location
      </p>
      <MapContainer
        center={[lat, lng]}
        zoom={hasMarker ? 13 : 11}
        style={{ height, width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        <MapRecenter lat={lat} lng={lng} />
        {hasMarker && <Marker position={[latitude, longitude]} />}
      </MapContainer>
    </div>
  );
}
