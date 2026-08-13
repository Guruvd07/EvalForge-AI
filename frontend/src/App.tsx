import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Analytics from "./pages/Analytics";
import Metrics from "./pages/Metrics";
import Activity from "./pages/Activity";
import Experiments from "./pages/Experiments";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ExperimentDetails from "./pages/ExperimentDetails";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Protected application */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/experiments" element={<Experiments />} />

            <Route
              path="/experiment-details/:experimentId"
              element={<ExperimentDetails />}
            />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;