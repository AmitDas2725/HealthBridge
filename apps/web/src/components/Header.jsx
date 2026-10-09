import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span className="brand-mark">HB</span>
        <div className="brand-copy">
          <strong>HealthBridge</strong>
          <span>Doctor finder for real-life local care</span>
        </div>
      </Link>

      <nav className="site-nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/doc-list">Doc List</NavLink>
        <NavLink to="/booking">Booking</NavLink>
        {!user ? <NavLink to="/login">Login</NavLink> : null}
        {user ? (
          <button className="ghost-button" onClick={logout}>
            Logout
          </button>
        ) : null}
      </nav>
    </header>
  );
}
