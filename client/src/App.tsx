import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Monitoring } from './pages/Monitoring';
import { Analytics } from './pages/Analytics';
import { RiskPrediction } from './pages/RiskPrediction';
import { Workers } from './pages/Workers';
import { WorkerProfile } from './pages/WorkerProfile';
import { Notifications } from './pages/Notifications';
import { Reports } from './pages/Reports';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/analytics" element={<Analytics />} />
          
          <Route path="/risk" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SAFETY_OFFICER']}>
              <RiskPrediction />
            </ProtectedRoute>
          } />
          
          <Route path="/workers" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SAFETY_OFFICER']}>
              <Workers />
            </ProtectedRoute>
          } />
          
          <Route path="/workers/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SAFETY_OFFICER']}>
              <WorkerProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />
          
          <Route path="/profile" element={<Profile />} />
          
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PlaceholderPage title="Settings" description="System and sensor configuration." />
            </ProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
