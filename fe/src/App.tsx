import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import HabitDetail from "./pages/HabitDetail";
import NewEditHabit from "./pages/NewEditHabit";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-bg text-ink">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/habits/new" element={<NewEditHabit />} />
              <Route path="/habits/:id" element={<HabitDetail />} />
              <Route path="/habits/:id/edit" element={<NewEditHabit />} />
            </Route>
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
