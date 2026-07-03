import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Projects from './pages/Projects';
import Monitoring from './pages/Monitoring';
import Integrations from './pages/Integrations';

export default function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />

        {/* Private Protected Routes */}
        <Route path="/" element={token ? <Monitoring /> : <Navigate to="/login" replace />} />
        <Route path="/projects" element={token ? <Projects /> : <Navigate to="/login" replace />} />
        <Route path="/integrations" element={token ? <Integrations /> : <Navigate to="/login" replace />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
