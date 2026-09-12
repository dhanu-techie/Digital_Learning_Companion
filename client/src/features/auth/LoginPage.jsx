import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, User, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await login(username, password);
    setSubmitting(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'student') {
      setUsername('student1');
      setPassword('password123');
    } else if (role === 'teacher') {
      setUsername('teacher1');
      setPassword('password123');
    } else if (role === 'admin') {
      setUsername('admin');
      setPassword('password123');
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-brand-50 via-gray-50 to-emerald-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8">
        
        {/* Header Logo */}
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-500/30">
            <BookOpen class="w-8 h-8" />
          </div>
          <h2 class="text-2xl font-extrabold text-gray-900">Welcome Back</h2>
          <p class="text-xs text-gray-500 mt-1">Digital & Smart Learning Companion</p>
        </div>

        {error && (
          <div class="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Username</label>
            <div class="relative">
              <User class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
            <div class="relative">
              <Lock class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            class="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </form>

        {/* Demo Roles Shortcut Buttons */}
        <div class="mt-8 pt-6 border-t border-gray-100">
          <p class="text-xs text-center font-bold text-gray-500 uppercase mb-3">Quick Demo Auto-Fill</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              onClick={() => setDemoCredentials('student')}
              class="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Student
            </button>
            <button
              onClick={() => setDemoCredentials('teacher')}
              class="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Teacher
            </button>
            <button
              onClick={() => setDemoCredentials('admin')}
              class="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
