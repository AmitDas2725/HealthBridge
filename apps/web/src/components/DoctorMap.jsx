import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function RecenterMap({ center }) {
  const map = useMap();
  map.setView(center, 12);
  return null;
}

export default function DoctorMap({ doctors, userLocation }) {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : doctors[0]
      ? [doctors[0].latitude, doctors[0].longitude]
      : [20.2961, 85.8245];

  return (
    <section className="panel map-panel">
      <div className="section-title">
        <span className="eyebrow">Map View</span>
        <h2>Nearby doctors around your location</h2>
        <p className="map-note">
          Live free map tiles powered by OpenStreetMap for HealthBridge.
        </p>
      </div>

      <MapContainer center={center} zoom={12} scrollWheelZoom className="leaflet-shell">
        <RecenterMap center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation ? (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>Your location</Popup>
          </Marker>
        ) : null}

        {doctors.map((doctor) => (
          <Marker key={doctor.id} position={[doctor.latitude, doctor.longitude]}>
            <Popup>
              <strong>{doctor.name}</strong>
              <br />
              {doctor.clinicName}
              <br />
              {doctor.specialization}
              <br />
              <Link to={`/doctors/${doctor.id}`}>Open profile</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}
