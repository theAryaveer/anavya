import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupWizard } from './pages/SignupWizard';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './components/Dashboard';
import { getUserSession } from './lib/api';

function App() {
  const { userId } = getUserSession();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupWizard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected dashboard route */}
        <Route
          path="/dashboard"
          element={userId ? <Dashboard /> : <Navigate to="/signup" replace />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
