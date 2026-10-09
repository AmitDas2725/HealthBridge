export default function SearchFilters({
  filters,
  setFilters,
  onSearch,
  onNearby,
  loading,
  topRatedCount
}) {
  return (
    <section className="panel">
      <div className="section-title">
        <span className="eyebrow">Search</span>
        <h2>Find a doctor by symptom, specialty, city, or rating</h2>
      </div>

      <div className="field-grid">
        <label>
          Disease or symptom
          <input
            value={filters.disease}
            onChange={(event) => setFilters((prev) => ({ ...prev, disease: event.target.value }))}
            placeholder="gastric, fever, rash"
          />
        </label>

        <label>
          Specialization
          <input
            value={filters.specialization}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, specialization: event.target.value }))
            }
            placeholder="Cardiologist or Gastroenterologist"
          />
        </label>

        <label>
          City or locality
          <input
            value={filters.city}
            onChange={(event) => setFilters((prev) => ({ ...prev, city: event.target.value }))}
            placeholder="Bhubaneswar or Jayadev Vihar"
          />
        </label>

        <label>
          Minimum rating
          <select
            value={filters.ratingMin}
            onChange={(event) => setFilters((prev) => ({ ...prev, ratingMin: event.target.value }))}
          >
            <option value="">Any</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
            <option value="4.8">4.8+</option>
          </select>
        </label>
      </div>

      <div className="inline-options">
        <label className="check-option">
          <input
            type="checkbox"
            checked={Boolean(filters.availableToday)}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, availableToday: event.target.checked }))
            }
          />
          Available today
        </label>

        <label className="check-option">
          <input
            type="checkbox"
            checked={Boolean(filters.topRated)}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, topRated: event.target.checked }))
            }
          />
          Top rated
        </label>

        <span className="subtle-text">{topRatedCount} strong options loaded</span>
      </div>

      <div className="action-row">
        <button onClick={onSearch} disabled={loading}>
          {loading ? "Searching..." : "Search Doctors"}
        </button>
        <button className="secondary-button" onClick={onNearby}>
          Doctors Near Me
        </button>
      </div>
    </section>
  );
}
