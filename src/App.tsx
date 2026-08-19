import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import DoctorDetail from './pages/DoctorDetail';
import MyAppointments from './pages/MyAppointments';
import Chat from './pages/Chat';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorProfile from './pages/DoctorProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminDoctors from './pages/AdminDoctors';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/doctors/:id" element={<DoctorDetail />} />

        {/* Patient-only routes */}
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        {/* Doctor-only routes */}
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDoctors />
            </ProtectedRoute>
          }
        />

        {/* Any logged-in user (patient, doctor, or admin) */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;