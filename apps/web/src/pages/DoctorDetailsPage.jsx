import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchDoctor } from "../services/api";

export default function DoctorDetailsPage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDoctor(id)
      .then((response) => setDoctor(response.data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return <p className="page-shell error-text">{error}</p>;
  }

  if (!doctor) {
    return <p className="page-shell">Loading doctor profile...</p>;
  }

  return (
    <div className="page-shell details-page">
      <section className="panel detail-layout">
        <img className="detail-image" src={doctor.imageUrl} alt={doctor.name} />

        <div>
          <span className="eyebrow">Doctor Details</span>
          <h1>{doctor.name}</h1>
          <p className="lead-text">
            {doctor.specialization} | {doctor.clinicName}
          </p>

          <div className="pill-row">
            <span className="pill">Rating {doctor.rating}</span>
            <span className="pill">{doctor.experience} years experience</span>
            <span className="pill">Rs. {doctor.consultationFee}</span>
            {doctor.verified ? <span className="pill success">Verified</span> : null}
            {doctor.teleconsultation ? <span className="pill">Teleconsultation</span> : null}
          </div>

          <p>{doctor.about}</p>
          <p className="muted">{doctor.address}</p>
          <p className="muted">City: {doctor.city}</p>
          <p className="muted">Languages: {doctor.languages}</p>
          <p className="muted">Next available: {doctor.nextAvailable}</p>

          <div className="tag-row">
            {doctor.diseaseTags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
          </div>

          <div className="action-row">
            <Link to={`/booking?doctorId=${doctor.id}`}>Book Appointment</Link>
            <a href={doctor.directionsUrl} target="_blank" rel="noreferrer">
              Open Map
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

