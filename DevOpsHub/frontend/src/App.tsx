import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Route-based code splitting: each page chunk is only downloaded when navigated to.
// This keeps the initial bundle to React core + router + auth only (~30KB).
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Projects = lazy(() => import('./pages/Projects'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Integrations = lazy(() => import('./pages/Integrations'));
const Servers = lazy(() => import('./pages/Servers'));
const Monitoring = lazy(() => import('./pages/Monitoring'));

// Minimal non-flashing fallback — dark background matches the app so there's no white flash
const PageLoader = () => (
  <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
  </div>
);

export default function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!token ? <Landing /> : <Navigate to="/projects" replace />} />
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/projects" replace />} />
          <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/projects" replace />} />

          {/* Private Protected Routes */}
          <Route path="/about" element={token ? <AboutUs /> : <Navigate to="/login" replace />} />
          <Route path="/projects" element={token ? <Projects /> : <Navigate to="/login" replace />} />
          <Route path="/monitoring" element={token ? <Monitoring /> : <Navigate to="/login" replace />} />
          <Route path="/integrations" element={token ? <Integrations /> : <Navigate to="/login" replace />} />
          <Route path="/servers" element={token ? <Servers /> : <Navigate to="/login" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
