import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerEmployees from './pages/owner/Employees';
import OwnerProjects from './pages/owner/Projects';
import HRDashboard from './pages/hr/Dashboard';
import HREmployees from './pages/hr/Employees';
import HRAttendance from './pages/hr/Attendance';
import HRTickets from './pages/hr/Tickets';
import HRLeaves from './pages/hr/Leaves';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeTickets from './pages/employee/Tickets';
import EmployeeLeaves from './pages/employee/Leaves';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'owner') return <Navigate to="/owner/dashboard" replace />;
  if (user.role === 'hr') return <Navigate to="/hr/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<div style={{ padding: '2rem', textAlign: 'center' }}><h2>403 — Not Authorized</h2></div>} />

          {/* Owner routes */}
          <Route path="/owner/dashboard" element={<ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/employees" element={<ProtectedRoute roles={['owner']}><OwnerEmployees /></ProtectedRoute>} />
          <Route path="/owner/projects" element={<ProtectedRoute roles={['owner']}><OwnerProjects /></ProtectedRoute>} />

          {/* HR routes */}
          <Route path="/hr/dashboard" element={<ProtectedRoute roles={['hr']}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/employees" element={<ProtectedRoute roles={['hr']}><HREmployees /></ProtectedRoute>} />
          <Route path="/hr/attendance" element={<ProtectedRoute roles={['hr']}><HRAttendance /></ProtectedRoute>} />
          <Route path="/hr/tickets" element={<ProtectedRoute roles={['hr']}><HRTickets /></ProtectedRoute>} />
          <Route path="/hr/leaves" element={<ProtectedRoute roles={['hr']}><HRLeaves /></ProtectedRoute>} />

          {/* Employee routes */}
          <Route path="/employee/dashboard" element={<ProtectedRoute roles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/attendance" element={<ProtectedRoute roles={['employee']}><EmployeeAttendance /></ProtectedRoute>} />
          <Route path="/employee/tickets" element={<ProtectedRoute roles={['employee']}><EmployeeTickets /></ProtectedRoute>} />
          <Route path="/employee/leaves" element={<ProtectedRoute roles={['employee']}><EmployeeLeaves /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
