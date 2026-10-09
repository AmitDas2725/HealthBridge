import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import { useAuth } from "./context/AuthContext";
import BookingPage from "./pages/BookingPage";
import DoctorDetailsPage from "./pages/DoctorDetailsPage";
import DoctorListPage from "./pages/DoctorListPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-shell">Checking your session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      {user ? <Header /> : null}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors/:id"
          element={
            <ProtectedRoute>
              <DoctorDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doc-list"
          element={
            <ProtectedRoute>
              <DoctorListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}
