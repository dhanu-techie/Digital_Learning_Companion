import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import OfflineBanner from './components/offline/OfflineBanner';
import LoginPage from './features/auth/LoginPage';
import StudentDashboard from './features/student/StudentDashboard';
import TeacherDashboard from './features/teacher/TeacherDashboard';
import ParentDashboard from './features/parent/ParentDashboard';
import AdminDashboard from './features/admin/AdminDashboard';

function DashboardForRole({ role }) {
  switch (role) {
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'school_admin':
    case 'super_admin':
      return <AdminDashboard />;
    default:
      return <StudentDashboard />;
  }
}

export default function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-sm font-bold text-brand-600 animate-pulse">Loading Digital Learning Companion...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <OfflineBanner />
      <main class="flex-1">
        <DashboardForRole role={user.role} />
      </main>
    </div>
  );
}
