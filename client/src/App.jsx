import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import OfflineBanner from './components/offline/OfflineBanner';
import LoginPage from './features/auth/LoginPage';
import StudentDashboard from './features/student/StudentDashboard';
import TeacherDashboard from './features/teacher/TeacherDashboard';

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
        {user.role === 'student' && <StudentDashboard />}
        {user.role === 'teacher' && <TeacherDashboard />}
        {user.role !== 'student' && user.role !== 'teacher' && <StudentDashboard />}
      </main>
    </div>
  );
}
