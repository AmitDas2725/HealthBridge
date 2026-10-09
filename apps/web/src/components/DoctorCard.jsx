import { Link } from "react-router-dom";

export default function DoctorCard({ doctor }) {
  return (
    <article className="doctor-card">
      <img className="doctor-image" src={doctor.imageUrl} alt={doctor.name} />
      <div className="doctor-body">
        <div className="doctor-top">
          <div>
            <h3>{doctor.name}</h3>
            <p className="muted">
              {doctor.specialization} | {doctor.clinicName}
            </p>
          </div>
          <span className="pill accent">Rating {doctor.rating}</span>
        </div>

        <div className="pill-row">
          <span className="pill">{doctor.city}</span>
          <span className="pill">{doctor.experience} yrs exp</span>
          <span className="pill">Rs. {doctor.consultationFee}</span>
          {doctor.distanceKm ? <span className="pill">{doctor.distanceKm.toFixed(1)} km away</span> : null}
          {doctor.verified ? <span className="pill success">Verified</span> : null}
          {doctor.availableToday ? <span className="pill warning">Available today</span> : null}
          {doctor.teleconsultation ? <span className="pill">Teleconsultation</span> : null}
        </div>

        <p className="doctor-about">{doctor.about}</p>
        <p className="muted">{doctor.address}</p>
        <p className="muted">Next available: {doctor.nextAvailable}</p>

        <div className="action-row">
          <Link to={`/doctors/${doctor.id}`}>View Profile</Link>
          <Link className="secondary-link" to={`/booking?doctorId=${doctor.id}`}>
            Book Appointment
          </Link>
        </div>
      </div>
    </article>
  );
}

