import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { signOut } from 'aws-amplify/auth';
import ReportForm from './ReportForm';
import Admin from './Admin';
import AdminLogin from './pages/AdminLogin';
import AdminHotspotMap from './AdminHotspotMap';

function App() {
  const [token, setToken] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setToken(null);
    }
  };

  const handleLoginSuccess = (t: string) => {
    setToken(t);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReportForm />} />

        <Route
          path="/admin"
          element={
            token ? (
              <Admin token={token} onLogout={handleLogout} />
            ) : (
              <AdminLogin onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route
          path="/admin/hotspot-map"
          element={
            token ? (
              <AdminHotspotMap token={token} />
            ) : (
              <AdminLogin onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;