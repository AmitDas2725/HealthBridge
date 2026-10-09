const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

function buildHeaders(token, headers = {}) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers
  };
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(options.token, options.headers)
    });
  } catch {
    throw new Error(`Cannot reach the HealthBridge API at ${API_BASE_URL}. Start it in another terminal with: npm run dev:server`);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ? `${data.message}` : data.message || "Request failed");
  }

  return data;
}

export async function fetchDoctors(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      params.set(key, value);
    }
  });

  return request(`/doctors?${params.toString()}`);
}

export async function fetchNearbyDoctors({ lat, lng, radiusKm = 20 }) {
  return request(`/doctors/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
}

export async function fetchDoctor(id) {
  return request(`/doctors/${id}`);
}

export async function requestAi(payload) {
  return request("/ai", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function registerUser(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function loginUser(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchCurrentUser(token) {
  return request("/auth/me", { token });
}

export async function createAppointment(payload, token) {
  return request("/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
    token
  });
}

export async function fetchMyAppointments(token) {
  return request("/appointments/mine", { token });
}

export async function fetchDoctorSlots(doctorId, date) {
  return request(`/appointments/doctor/${doctorId}/slots?date=${encodeURIComponent(date)}`);
}
