import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login({
          email: form.email,
          password: form.password
        });
      } else {
        await register(form);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-shell login-shell">
      <section className="panel auth-panel">
        <span className="eyebrow">Login</span>
        <h1>{mode === "login" ? "Welcome back to HealthBridge" : "Create your HealthBridge account"}</h1>
        <p className="muted">
          Save bookings, log in faster next time, and keep your doctor discovery journey in one place.
        </p>

        <form className="stack-form" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label>
              Full name
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </label>

          <button type="submit">{mode === "login" ? "Login" : "Create Account"}</button>
        </form>

        {error ? <p className="error-text">{error}</p> : null}

        <button
          className="link-button"
          onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </section>
    </div>
  );
}

