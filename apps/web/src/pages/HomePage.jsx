import { useEffect, useMemo, useState } from "react";
import ChatbotPanel from "../components/ChatbotPanel";
import DoctorCard from "../components/DoctorCard";
import DoctorMap from "../components/DoctorMap";
import SearchFilters from "../components/SearchFilters";
import { fetchDoctors, fetchNearbyDoctors } from "../services/api";

const initialFilters = {
  disease: "",
  specialization: "",
  city: "Bhubaneswar",
  ratingMin: "",
  availableToday: false,
  topRated: false
};

export default function HomePage() {
  const [filters, setFilters] = useState(initialFilters);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function loadDoctors(activeFilters = filters) {
    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const response = await fetchDoctors({
        ...activeFilters,
        lat: userLocation?.lat,
        lng: userLocation?.lng
      });
      setDoctors(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleNearbyDoctors() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(nextLocation);

        try {
          setLoading(true);
          setHasSearched(true);
          const response = await fetchNearbyDoctors(nextLocation);
          setDoctors(response.data);
          setError("");
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      () => setError("Unable to access your location.")
    );
  }

  const topRatedCount = useMemo(
    () => doctors.filter((doctor) => doctor.rating >= 4.7).length,
    [doctors]
  );

  const hasAutoSearchInput = useMemo(
    () =>
      Boolean(
        filters.disease.trim() ||
          filters.specialization.trim() ||
          filters.city !== initialFilters.city ||
          filters.ratingMin ||
          filters.availableToday ||
          filters.topRated
      ),
    [filters]
  );

  useEffect(() => {
    if (!hasAutoSearchInput) {
      setDoctors([]);
      setError("");
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      loadDoctors(filters);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [filters, hasAutoSearchInput]);

  return (
    <div className="page-shell">
      <section className="hero-banner">
        <div>
          <span className="eyebrow">HealthBridge</span>
          <h1>Doctor discovery for new cities, urgent questions, and everyday care.</h1>
          <p>
            HealthBridge combines symptom-based search, verified doctor profiles, nearby map
            markers, and quick appointment booking in one place.
          </p>
        </div>
        <div className="hero-card">
          <h3>Why HealthBridge is useful</h3>
          <p>
            HealthBridge helps users quickly discover trusted care when they are in a new place,
            unsure which doctor to visit, or need a faster way to compare nearby options.
          </p>
          <ul>
            <li>AI-guided symptom support helps users choose the right doctor category.</li>
            <li>Verified profiles show ratings, clinic details, fees, and availability clearly.</li>
            <li>Map-based discovery makes it easier to find doctors near the user location.</li>
            <li>Quick booking flow turns doctor search into a real healthcare action.</li>
          </ul>
        </div>
      </section>

      <div className="home-grid">
        <div className="left-stack">
          <SearchFilters
            filters={filters}
            setFilters={setFilters}
            onSearch={() => loadDoctors(filters)}
            onNearby={handleNearbyDoctors}
            loading={loading}
            topRatedCount={topRatedCount}
          />
          <ChatbotPanel
            onApplyRecommendedDoctor={(recommendedDoctor) => {
              const nextFilters = { ...filters, specialization: recommendedDoctor };
              setFilters(nextFilters);
              loadDoctors(nextFilters);
            }}
          />
        </div>

        <div className="content-stack">
          <DoctorMap doctors={doctors} userLocation={userLocation} />

          <section className="panel">
            <div className="section-title">
              <span className="eyebrow">Doctor List</span>
              <h2>{loading ? "Loading doctors..." : "Doctors matching your need"}</h2>
            </div>

            {error ? <p className="error-text">{error}</p> : null}

            <div className="doctor-list">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>

            {!loading && !error && !hasSearched ? (
              <p className="empty-state">
                This section is empty by default. As soon as you enter symptom, specialty, city,
                or use Doctors Near Me, matching doctors will load here automatically.
              </p>
            ) : null}

            {!loading && !error && hasSearched && doctors.length === 0 ? (
              <p className="empty-state">
                No doctors matched this exact search. This usually happens when one filter is too
                specific or a specialty name is misspelled. Try `Gastroenterologist`, clear one
                filter, or search only by city and symptom first.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
