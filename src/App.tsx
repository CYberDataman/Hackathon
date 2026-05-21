import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import ReportForm from './ReportForm';
import Admin from './Admin';
import AdminLogin from './pages/AdminLogin';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReportForm />} />
        <Route
          path="/admin"
          element={isLoggedIn ? <Admin /> : <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;