import { useEffect, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import { fetchDoctors } from "../services/api";

const initialSearch = {
  name: "",
  specialization: ""
};

export default function DoctorListPage() {
  const [search, setSearch] = useState(initialSearch);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDoctors(activeSearch = search) {
    setLoading(true);
    setError("");

    try {
      const response = await fetchDoctors({
        name: activeSearch.name,
        specialization: activeSearch.specialization
      });
      setDoctors(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctors(initialSearch);
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    loadDoctors(search);
  }

  function handleReset() {
    setSearch(initialSearch);
    loadDoctors(initialSearch);
  }

  return (
    <div className="page-shell">
      <section className="hero-banner">
        <div>
          <span className="eyebrow">Doctor Directory</span>
          <h1>Browse all doctors and search by name or profession.</h1>
          <p>
            Use this section to see the full doctor list, then narrow it by doctor name or
            specialization whenever you need a faster lookup.
          </p>
        </div>
        <div className="hero-card">
          <h3>How to use it</h3>
          <ul>
            <li>Search by doctor name</li>
            <li>Search by profession or specialization</li>
            <li>Open profile or book directly from the list</li>
          </ul>
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <span className="eyebrow">Doc List</span>
          <h2>All doctors</h2>
        </div>

        <form className="directory-search" onSubmit={handleSubmit}>
          <label>
            Doctor name
            <input
              value={search.name}
              onChange={(event) =>
                setSearch((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Dr. Satyabrata Mishra"
            />
          </label>

          <label>
            Profession or specialization
            <input
              value={search.specialization}
              onChange={(event) =>
                setSearch((prev) => ({ ...prev, specialization: event.target.value }))
              }
              placeholder="Gastroenterologist"
            />
          </label>

          <div className="action-row directory-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Find Doctors"}
            </button>
            <button type="button" className="secondary-button" onClick={handleReset}>
              Show All
            </button>
          </div>
        </form>

        {error ? <p className="error-text">{error}</p> : null}
        {!error ? (
          <p className="subtle-text directory-summary">
            {loading ? "Loading doctor list..." : `${doctors.length} doctors found.`}
          </p>
        ) : null}

        <div className="doctor-list">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>

        {!loading && !error && doctors.length === 0 ? (
          <p className="empty-state">
            No doctors matched this name or profession. Try a shorter name or a broader specialty.
          </p>
        ) : null}
      </section>
    </div>
  );
}
