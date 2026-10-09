import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

// Replace this with the IP address of the computer running `npm run dev:server`.
// Example: http://192.168.1.5:4000/api
const API_BASE_URL = "http://192.168.137.34:4000/api";

function buildQueryString(filters) {
  return Object.entries(filters)
    .filter(([, value]) => value !== "" && value !== null && value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

async function fetchDoctors(filters) {
  const query = buildQueryString(filters);
  const response = await fetch(`${API_BASE_URL}/doctors${query ? `?${query}` : ""}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load doctors");
  }

  return data.data;
}

async function requestAi(payload) {
  const response = await fetch(`${API_BASE_URL}/ai/triage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to process symptoms");
  }

  return data.data;
}

async function loginRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to log in");
  }

  return data.data;
}

async function registerRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to create account");
  }

  return data.data;
}

function SectionTitle({ eyebrow, title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function DoctorCard({ doctor }) {
  return (
    <View style={styles.doctorCard}>
      <Text style={styles.doctorName}>{doctor.name}</Text>
      <Text style={styles.doctorMeta}>
        {doctor.specialization} | {doctor.city}
      </Text>
      <Text style={styles.doctorMeta}>
        {doctor.clinicName} | Fee Rs. {doctor.consultationFee}
      </Text>
      <Text style={styles.doctorMeta}>
        Rating {doctor.rating} | {doctor.experience} years experience
      </Text>
      <Text style={styles.doctorMeta}>Next available: {doctor.nextAvailable}</Text>
      <Pressable style={styles.linkButton} onPress={() => Linking.openURL(doctor.directionsUrl)}>
        <Text style={styles.linkButtonText}>Open Route</Text>
      </Pressable>
    </View>
  );
}

function LoginScreen({ mode, setMode, form, setForm, onSubmit, loading, error }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.loginContainer}>
        <View style={styles.hero}>
          <Text style={styles.brand}>HealthBridge</Text>
          <Text style={styles.headline}>Login first to enter the app.</Text>
          <Text style={styles.subheadline}>
            Your doctor search, booking flow, and AI symptom checker start after authentication.
          </Text>
        </View>

        <View style={styles.card}>
          <SectionTitle
            eyebrow="Authentication"
            title={mode === "login" ? "Login to HealthBridge" : "Create your account"}
          />

          {mode === "register" ? (
            <TextInput
              style={styles.input}
              placeholder="Full name"
              value={form.name}
              onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
            />
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={form.password}
            onChangeText={(value) => setForm((prev) => ({ ...prev, password: value }))}
          />

          <Pressable style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Login"
                  : "Create Account"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => setMode(mode === "login" ? "register" : "login")}
          >
            <Text style={styles.secondaryButtonText}>
              {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
            </Text>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MainApp({ user, onLogout }) {
  const [filters, setFilters] = useState({
    city: "Bhubaneswar",
    specialization: "",
    disease: "",
    ratingMin: "",
    availableToday: ""
  });
  const [chatForm, setChatForm] = useState({
    symptoms: ""
  });
  const [doctors, setDoctors] = useState([]);
  const [result, setResult] = useState(null);
  const [statusText, setStatusText] = useState(
    "Search for a doctor in your current locality."
  );
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);

  const doctorCountLabel = useMemo(() => `${doctors.length} doctors found`, [doctors.length]);

  async function handleSearch() {
    try {
      setLoadingDoctors(true);
      setStatusText("Searching doctors...");
      const nextDoctors = await fetchDoctors(filters);
      setDoctors(nextDoctors);
      setStatusText("Doctors loaded successfully.");
    } catch (error) {
      setStatusText(error.message);
    } finally {
      setLoadingDoctors(false);
    }
  }

  async function handleAi() {
    try {
      setLoadingAi(true);
      setStatusText("Checking symptoms...");
      const triage = await requestAi(chatForm);
      setResult(triage);

      const nextFilters = {
        ...filters,
        specialization: triage.recommendedDoctor || filters.specialization,
        disease: chatForm.symptoms || filters.disease
      };

      setFilters(nextFilters);
      const nextDoctors = await fetchDoctors(nextFilters);
      setDoctors(nextDoctors);
      setStatusText("AI guidance is ready and matching doctors were loaded.");
    } catch (error) {
      setStatusText(error.message);
    } finally {
      setLoadingAi(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.brand}>HealthBridge</Text>
          <Text style={styles.headline}>Welcome, {user.name}</Text>
          <Text style={styles.subheadline}>
            Search doctors by city, disease, or specialization and get AI-guided doctor suggestions.
          </Text>
          <Text style={styles.mapCaption}>
            Odisha-ready search starts with Bhubaneswar by default.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inlineHeader}>
            <SectionTitle eyebrow="Doctor Search" title="Find a doctor" />
            <Pressable style={styles.smallLogoutButton} onPress={onLogout}>
              <Text style={styles.smallLogoutText}>Logout</Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            placeholder="City"
            value={filters.city}
            onChangeText={(value) => setFilters((prev) => ({ ...prev, city: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Specialization"
            value={filters.specialization}
            onChangeText={(value) =>
              setFilters((prev) => ({ ...prev, specialization: value }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Disease or symptom"
            value={filters.disease}
            onChangeText={(value) => setFilters((prev) => ({ ...prev, disease: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Minimum rating (example 4.5)"
            value={filters.ratingMin}
            onChangeText={(value) => setFilters((prev) => ({ ...prev, ratingMin: value }))}
          />
          <Pressable style={styles.button} onPress={handleSearch}>
            <Text style={styles.buttonText}>
              {loadingDoctors ? "Searching..." : "Search Doctors"}
            </Text>
          </Pressable>
          <Text style={styles.helper}>{doctorCountLabel}</Text>
        </View>

        <View style={styles.card}>
          <SectionTitle eyebrow="AI Assistant" title="Symptom checker" />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Describe symptoms like gastric pain, acidity, rash, fever, or back pain"
            multiline
            value={chatForm.symptoms}
            onChangeText={(value) => setChatForm({ symptoms: value })}
          />
          <Pressable style={styles.button} onPress={handleAi}>
            <Text style={styles.buttonText}>
              {loadingAi ? "Checking..." : "Check Symptoms"}
            </Text>
          </Pressable>
          {result ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>
                Recommended doctor: {result.recommendedDoctor}
              </Text>
              {Array.isArray(result.possibleConditions)
                ? result.possibleConditions.map((item) => (
                    <Text key={item} style={styles.resultText}>
                      - {item}
                    </Text>
                  ))
                : null}
              {Array.isArray(result.medicinesToDiscuss)
                ? result.medicinesToDiscuss.map((item) => (
                    <Text key={`medicine-${item}`} style={styles.resultText}>
                      - {item}
                    </Text>
                  ))
                : null}
              {result.followUpQuestion ? (
                <Text style={styles.resultText}>Next question: {result.followUpQuestion}</Text>
              ) : null}
              <Text style={styles.disclaimer}>{result.disclaimer}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <SectionTitle eyebrow="Doctors" title="Recommended clinics" />
          <Text style={styles.helper}>{statusText}</Text>
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [authState, setAuthState] = useState({
    user: null,
    token: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAuthSubmit() {
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const data = await loginRequest({
          email: form.email,
          password: form.password
        });
        setAuthState(data);
      } else {
        const data = await registerRequest(form);
        setAuthState(data);
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  }

  if (!authState.user) {
    return (
      <LoginScreen
        mode={mode}
        setMode={setMode}
        form={form}
        setForm={setForm}
        onSubmit={handleAuthSubmit}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <MainApp
      user={authState.user}
      onLogout={() => {
        setAuthState({ user: null, token: "" });
        setForm({ name: "", email: "", password: "" });
        setMode("login");
        setError("");
      }}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f1f7f3"
  },
  container: {
    padding: 18,
    gap: 18
  },
  loginContainer: {
    padding: 18,
    gap: 18,
    justifyContent: "center",
    minHeight: "100%"
  },
  hero: {
    padding: 24,
    borderRadius: 28,
    backgroundColor: "#17422e"
  },
  brand: {
    color: "#9ee3b2",
    textTransform: "uppercase",
    letterSpacing: 3,
    fontWeight: "700",
    fontSize: 12
  },
  headline: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 28,
    marginTop: 10
  },
  subheadline: {
    color: "#daefe0",
    marginTop: 10,
    fontSize: 15
  },
  mapCaption: {
    color: "#9ee3b2",
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700"
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    gap: 12
  },
  sectionHeader: {
    marginBottom: 6
  },
  inlineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  eyebrow: {
    color: "#2f7d4d",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 11,
    fontWeight: "700"
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#173622",
    marginTop: 4
  },
  input: {
    borderWidth: 1,
    borderColor: "#d7e7db",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: "#fbfefc"
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top"
  },
  button: {
    backgroundColor: "#245f48",
    paddingVertical: 14,
    borderRadius: 999
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700"
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#ebf4ef"
  },
  secondaryButtonText: {
    color: "#21533a",
    textAlign: "center",
    fontWeight: "700"
  },
  smallLogoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#ebf4ef",
    marginTop: 6
  },
  smallLogoutText: {
    color: "#21533a",
    fontWeight: "700"
  },
  helper: {
    color: "#4d6656"
  },
  resultBox: {
    borderRadius: 18,
    backgroundColor: "#eef7ef",
    padding: 14,
    gap: 8
  },
  resultTitle: {
    fontWeight: "700",
    color: "#173622"
  },
  resultText: {
    color: "#254231"
  },
  disclaimer: {
    color: "#5a6f61",
    fontSize: 12
  },
  doctorCard: {
    borderWidth: 1,
    borderColor: "#e2eee6",
    borderRadius: 20,
    padding: 14,
    gap: 8
  },
  doctorName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#173622"
  },
  doctorMeta: {
    color: "#4d6656"
  },
  linkButton: {
    marginTop: 6
  },
  linkButtonText: {
    color: "#245f48",
    fontWeight: "700"
  },
  errorText: {
    color: "#a32121",
    fontWeight: "700"
  }
});
