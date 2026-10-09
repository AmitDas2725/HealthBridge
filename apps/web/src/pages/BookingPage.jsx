import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useAuth } from "../context/AuthContext";
import {
  createAppointment,
  fetchDoctor,
  fetchDoctorSlots,
  fetchMyAppointments
} from "../services/api";

const SLOT_GROUPS = {
  Morning: ["09:00", "10:00", "11:00"],
  Afternoon: ["13:00", "14:00", "15:00"],
  Evening: ["17:00", "18:00"]
};

const HEALTH_TIPS = [
  "Stay hydrated before your consultation.",
  "Reach the clinic 10 minutes early.",
  "Carry previous prescriptions or reports."
];

const STATS = [
  "2500+ successful appointments",
  "98% patient satisfaction",
  "Verified healthcare providers",
  "AI-powered healthcare guidance"
];

function formatSlotLabel(slot) {
  const [hours, minutes] = slot.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;
  return `${normalizedHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function createAppointmentDate(date, slot) {
  return `${date}T${slot}`;
}

function statusTone(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "completed") {
    return "status-badge completed";
  }

  if (normalized === "cancelled") {
    return "status-badge cancelled";
  }

  if (normalized === "pending") {
    return "status-badge pending";
  }

  return "status-badge confirmed";
}

function displayStatus(status) {
  return status === "Booked" ? "Confirmed" : status;
}

function BookingProgress({ hasDoctor, hasSlot, hasSubmitted }) {
  const steps = [
    { label: "Select Doctor", complete: hasDoctor },
    { label: "Choose Slot", complete: hasSlot },
    { label: "Confirm Booking", complete: hasSubmitted }
  ];

  return (
    <div className="booking-progress">
      {steps.map((step, index) => (
        <div key={step.label} className={`progress-step ${step.complete ? "complete" : ""}`}>
          <span className="progress-index">{index + 1}</span>
          <div>
            <strong>{step.label}</strong>
            <p>{step.complete ? "Complete" : "Pending"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DoctorSummaryCard({ doctor }) {
  if (!doctor) {
    return (
      <section className="panel booking-hero-card">
        <span className="eyebrow">Selected Doctor</span>
        <h2>Choose a doctor to start booking</h2>
        <p className="muted">
          Open a doctor profile or doctor list card first, then continue your appointment booking
          here.
        </p>
      </section>
    );
  }

  return (
    <section className="panel booking-hero-card">
      <div className="booking-doctor-card">
        <img className="booking-doctor-image" src={doctor.imageUrl} alt={doctor.name} />
        <div className="booking-doctor-info">
          <span className="eyebrow">Selected Doctor</span>
          <h2>{doctor.name}</h2>
          <p className="lead-text">
            {doctor.specialization} | {doctor.clinicName}
          </p>

          <div className="pill-row">
            <span className="pill accent">⭐ {doctor.rating}</span>
            <span className="pill">{doctor.experience} yrs exp</span>
            <span className="pill">₹{doctor.consultationFee}</span>
            <span className={`pill ${doctor.availableToday ? "success" : "warning"}`}>
              {doctor.availableToday ? "Available Today" : "Next available soon"}
            </span>
            {doctor.verified ? <span className="pill success">Verified</span> : null}
            {doctor.teleconsultation ? <span className="pill">Teleconsultation</span> : null}
          </div>

          <div className="booking-detail-grid">
            <div>
              <strong>Location</strong>
              <p>{doctor.city}</p>
            </div>
            <div>
              <strong>Phone</strong>
              <p>{doctor.phone || "Contact at clinic"}</p>
            </div>
            <div>
              <strong>Address</strong>
              <p>{doctor.address}</p>
            </div>
            <div>
              <strong>Available timing</strong>
              <p>{doctor.nextAvailable}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClinicMapCard({ doctor }) {
  if (!doctor) {
    return null;
  }

  const center = [doctor.latitude, doctor.longitude];

  return (
    <section className="panel clinic-map-card">
      <div className="section-title">
        <span className="eyebrow">Clinic Map</span>
        <h2>Live clinic location</h2>
        <p className="muted">See the clinic marker, surrounding area, and get directions quickly.</p>
      </div>

      <MapContainer center={center} zoom={15} scrollWheelZoom className="booking-map-shell">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>
            <strong>{doctor.clinicName}</strong>
            <br />
            {doctor.name}
            <br />
            {doctor.address}
          </Popup>
        </Marker>
      </MapContainer>

      <div className="action-row">
        <a href={doctor.directionsUrl} target="_blank" rel="noreferrer">
          Get Directions
        </a>
      </div>
    </section>
  );
}

function AppointmentModal({ bookingDetails, doctor, onClose }) {
  if (!bookingDetails || !doctor) {
    return null;
  }

  const bookingId = `HB-${String(bookingDetails.id).padStart(4, "0")}`;

  return (
    <div className="booking-modal-backdrop" onClick={onClose}>
      <div className="booking-modal" onClick={(event) => event.stopPropagation()}>
        <div className="booking-checkmark">✓</div>
        <h2>Appointment Confirmed</h2>
        <p className="muted">Healthcare should be accessible, simple, and stress-free.</p>

        <div className="booking-modal-summary">
          <p>
            <strong>Booking ID:</strong> {bookingId}
          </p>
          <p>
            <strong>Doctor:</strong> {doctor.name}
          </p>
          <p>
            <strong>Clinic:</strong> {doctor.clinicName}
          </p>
          <p>
            <strong>Date & time:</strong> {new Date(bookingDetails.appointmentDate).toLocaleString()}
          </p>
          <p>
            <strong>Location:</strong> {doctor.address}
          </p>
        </div>

        <div className="action-row">
          <a href={doctor.directionsUrl} target="_blank" rel="noreferrer">
            Open Directions
          </a>
          <button type="button" className="secondary-button" onClick={() => window.print()}>
            Download Summary
          </button>
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const { token, user } = useAuth();
  const fileInputRef = useRef(null);

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [form, setForm] = useState({
    appointmentDate: "",
    notes: "",
    patientName: user?.name || "",
    age: "",
    gender: "",
    phone: "",
    email: user?.email || "",
    emergencyContact: "",
    consultationMode: "In-Clinic Visit",
    slot: ""
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (doctorId) {
      fetchDoctor(doctorId)
        .then((response) => setDoctor(response.data))
        .catch((error) => setMessage(error.message));
    }
  }, [doctorId]);

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchMyAppointments(token)
      .then((response) => setAppointments(response.data))
      .catch(() => undefined);
  }, [token]);

  useEffect(() => {
    if (!doctorId || !form.appointmentDate) {
      setBookedSlots([]);
      return;
    }

    setLoadingSlots(true);
    fetchDoctorSlots(doctorId, form.appointmentDate)
      .then((response) => {
        const nextSlots = response.data.map((item) =>
          new Date(item.appointmentDate).toTimeString().slice(0, 5)
        );
        setBookedSlots(nextSlots);
      })
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, form.appointmentDate]);

  const isLoggedIn = useMemo(() => Boolean(token && user), [token, user]);
  const hasSelectedSlot = useMemo(
    () => Boolean(form.appointmentDate && form.slot),
    [form.appointmentDate, form.slot]
  );

  function handleFiles(nextFiles) {
    const allowedFiles = Array.from(nextFiles).filter((file) =>
      ["application/pdf", "image/jpeg", "image/png"].includes(file.type)
    );
    setUploadedFiles((prev) => [...prev, ...allowedFiles]);
  }

  function removeFile(name) {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== name));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!doctorId) {
      setMessage("Choose a doctor first.");
      return;
    }

    if (!isLoggedIn) {
      setMessage("Please log in before booking an appointment.");
      return;
    }

    if (!form.appointmentDate || !form.slot) {
      setMessage("Please choose both a date and a slot.");
      return;
    }

    try {
      const appointmentDate = createAppointmentDate(form.appointmentDate, form.slot);
      const compiledNotes = [
        `Patient: ${form.patientName || "Not provided"}`,
        `Age: ${form.age || "Not provided"}`,
        `Gender: ${form.gender || "Not provided"}`,
        `Phone: ${form.phone || "Not provided"}`,
        `Email: ${form.email || "Not provided"}`,
        `Emergency Contact: ${form.emergencyContact || "Not provided"}`,
        `Consultation Mode: ${form.consultationMode}`,
        `Uploaded Files: ${uploadedFiles.map((file) => file.name).join(", ") || "None"}`,
        `Notes: ${form.notes || "No additional notes"}`
      ].join("\n");

      const response = await createAppointment(
        {
          doctorId,
          appointmentDate,
          notes: compiledNotes
        },
        token
      );

      setMessage(`Appointment booked successfully with status ${displayStatus(response.data.status)}.`);
      setBookingDetails(response.data);
      setForm((prev) => ({
        ...prev,
        appointmentDate: "",
        notes: "",
        age: "",
        gender: "",
        phone: "",
        emergencyContact: "",
        consultationMode: "In-Clinic Visit",
        slot: ""
      }));
      setUploadedFiles([]);
      const appointmentsResponse = await fetchMyAppointments(token);
      setAppointments(appointmentsResponse.data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="page-shell booking-page-shell">
      <section className="hero-banner booking-hero">
        <div>
          <span className="eyebrow">HealthBridge Booking</span>
          <h1>Book appointments quickly and manage healthcare visits with ease.</h1>
          <p>Healthcare should be accessible, simple, and stress-free.</p>
        </div>
        <div className="hero-card">
          <h3>Booking highlights</h3>
          <ul>
            {STATS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <DoctorSummaryCard doctor={doctor} />

      <div className="booking-layout">
        <div className="booking-main">
          <section className="panel booking-flow-card">
            <div className="section-title">
              <span className="eyebrow">Booking Progress</span>
              <h2>Complete your appointment request</h2>
            </div>

            <BookingProgress
              hasDoctor={Boolean(doctor)}
              hasSlot={hasSelectedSlot}
              hasSubmitted={Boolean(bookingDetails)}
            />

            {!isLoggedIn ? (
              <p className="warning-text">
                You need to <Link to="/login">log in</Link> before you can confirm a booking.
              </p>
            ) : null}

            <form className="stack-form booking-form" onSubmit={handleSubmit}>
              <section className="booking-section-block">
                <h3>1. Choose date and consultation mode</h3>

                <div className="booking-form-grid">
                  <label>
                    Appointment date
                    <input
                      type="date"
                      value={form.appointmentDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, appointmentDate: event.target.value, slot: "" }))
                      }
                      required
                    />
                  </label>

                  <label>
                    Consultation mode
                    <select
                      value={form.consultationMode}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, consultationMode: event.target.value }))
                      }
                    >
                      <option>In-Clinic Visit</option>
                      <option>Video Consultation</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="booking-section-block">
                <h3>2. Select a slot</h3>
                {loadingSlots ? <p className="muted">Checking booked slots...</p> : null}
                {Object.entries(SLOT_GROUPS).map(([label, slots]) => (
                  <div key={label} className="slot-group">
                    <strong>{label}</strong>
                    <div className="slot-grid">
                      {slots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = form.slot === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={!form.appointmentDate || isBooked}
                            className={`slot-button ${isSelected ? "selected" : ""} ${
                              isBooked ? "disabled" : ""
                            }`}
                            onClick={() => setForm((prev) => ({ ...prev, slot }))}
                          >
                            {formatSlotLabel(slot)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>

              <section className="booking-section-block">
                <h3>3. Patient information</h3>
                <div className="booking-form-grid">
                  <label>
                    Patient full name
                    <input
                      value={form.patientName}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, patientName: event.target.value }))
                      }
                      required
                    />
                  </label>

                  <label>
                    Age
                    <input
                      type="number"
                      min="0"
                      value={form.age}
                      onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
                    />
                  </label>

                  <label>
                    Gender
                    <select
                      value={form.gender}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, gender: event.target.value }))
                      }
                    >
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </label>

                  <label>
                    Phone number
                    <input
                      value={form.phone}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, phone: event.target.value }))
                      }
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                    />
                  </label>

                  <label>
                    Emergency contact number
                    <input
                      value={form.emergencyContact}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, emergencyContact: event.target.value }))
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="booking-section-block">
                <h3>4. Symptoms and notes</h3>
                <label>
                  Describe symptoms or additional notes for the doctor
                  <textarea
                    rows={6}
                    value={form.notes}
                    onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Describe symptoms, previous history, reports, or concerns for the consultation."
                  />
                </label>
              </section>

              <section className="booking-section-block">
                <h3>5. Medical document upload</h3>
                <div
                  className="upload-dropzone"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleFiles(event.dataTransfer.files);
                  }}
                >
                  <p>Drag and drop reports, prescriptions, or images here.</p>
                  <p className="muted">Allowed: PDF, JPG, PNG</p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    hidden
                    onChange={(event) => handleFiles(event.target.files)}
                  />
                </div>

                {uploadedFiles.length ? (
                  <div className="upload-preview-list">
                    {uploadedFiles.map((file) => (
                      <div key={file.name} className="upload-preview-card">
                        <div>
                          <strong>{file.name}</strong>
                          <p className="muted">{Math.ceil(file.size / 1024)} KB</p>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => removeFile(file.name)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>

              <div className="action-row">
                <button type="submit">Confirm Booking</button>
              </div>
            </form>

            {message ? <p className="success-text">{message}</p> : null}
          </section>

          <ClinicMapCard doctor={doctor} />

          <section className="panel clinic-details-card">
            <span className="eyebrow">Clinic Details</span>
            <h2>Clinic information</h2>
            {doctor ? (
              <div className="booking-detail-grid">
                <div>
                  <strong>Clinic name</strong>
                  <p>{doctor.clinicName}</p>
                </div>
                <div>
                  <strong>Contact number</strong>
                  <p>{doctor.phone}</p>
                </div>
                <div>
                  <strong>Address</strong>
                  <p>{doctor.address}</p>
                </div>
                <div>
                  <strong>Opening hours</strong>
                  <p>{doctor.nextAvailable}</p>
                </div>
                <div>
                  <strong>Consultation mode</strong>
                  <p>{doctor.teleconsultation ? "In-clinic and video consultation" : "In-clinic visit"}</p>
                </div>
                <div>
                  <strong>Emergency availability</strong>
                  <p>{doctor.availableToday ? "Open for same-day consultation" : "Call clinic before emergency visit"}</p>
                </div>
              </div>
            ) : (
              <p className="muted">Select a doctor to view clinic details.</p>
            )}
          </section>
        </div>

        <aside className="booking-sidebar">
          <section className="panel booking-summary-sticky">
            <span className="eyebrow">Booking Summary</span>
            <h2>Appointment snapshot</h2>
            <p className="muted">
              {doctor ? `${doctor.name} | ${doctor.specialization}` : "Choose a doctor to begin."}
            </p>
            <div className="booking-summary-list">
              <div>
                <strong>Date</strong>
                <p>{form.appointmentDate || "Not selected"}</p>
              </div>
              <div>
                <strong>Slot</strong>
                <p>{form.slot ? formatSlotLabel(form.slot) : "Not selected"}</p>
              </div>
              <div>
                <strong>Mode</strong>
                <p>{form.consultationMode}</p>
              </div>
            </div>
          </section>

          <section className="panel emergency-card">
            <span className="eyebrow">Emergency Notice</span>
            <h2>Medical emergency support</h2>
            <p>
              In case of medical emergency, contact nearby hospitals immediately instead of waiting
              for a scheduled consultation.
            </p>
          </section>

          <section className="panel tips-card">
            <span className="eyebrow">AI Health Tips</span>
            <h2>Before your visit</h2>
            <ul className="tips-list">
              {HEALTH_TIPS.map((tip) => (
                <li key={tip}>💡 {tip}</li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <span className="eyebrow">My Appointments</span>
            <h2>Upcoming appointments</h2>

            <div className="appointment-list enhanced-appointments">
              {appointments.map((appointment) => (
                <article key={appointment.id} className="appointment-card booking-appointment-card">
                  <img
                    className="appointment-doctor-image"
                    src={appointment.image_url}
                    alt={appointment.doctor_name}
                  />
                  <div>
                    <div className="doctor-top">
                      <div>
                        <strong>{appointment.doctor_name}</strong>
                        <p className="muted">{appointment.specialization}</p>
                      </div>
                      <span className={statusTone(displayStatus(appointment.status))}>
                        {displayStatus(appointment.status)}
                      </span>
                    </div>
                    <p>{new Date(appointment.appointment_date).toLocaleString()}</p>
                    <p className="muted">{appointment.clinic_name}</p>
                    <p className="muted">{appointment.address}</p>
                    <div className="action-row">
                      <a href={`tel:${appointment.phone}`}>Contact</a>
                      <a
                        className="secondary-link"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          appointment.address
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Directions
                      </a>
                    </div>
                  </div>
                </article>
              ))}

              {!appointments.length ? (
                <div className="empty-appointment-state">
                  <div className="empty-appointment-icon">🩺</div>
                  <h3>No upcoming appointments yet.</h3>
                  <p>Book your first consultation with HealthBridge.</p>
                </div>
              ) : null}
            </div>
          </section>
        </aside>
      </div>

      <AppointmentModal
        bookingDetails={bookingDetails}
        doctor={doctor}
        onClose={() => setBookingDetails(null)}
      />
    </div>
  );
}
