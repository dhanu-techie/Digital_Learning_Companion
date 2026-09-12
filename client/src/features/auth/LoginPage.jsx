import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, User, Lock, ArrowRight, Mail, GraduationCap } from 'lucide-react';

const emptySignup = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  role: 'student',
  grade: '8'
};

export default function LoginPage() {
  const { login, register } = useContext(AuthContext);
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signup, setSignup] = useState(emptySignup);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await login(username, password);
    setSubmitting(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await register({
      firstName: signup.firstName,
      lastName: signup.lastName,
      username: signup.username,
      email: signup.email,
      password: signup.password,
      role: signup.role,
      grade: signup.role === 'student' ? signup.grade : undefined
    });
    setSubmitting(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  const setDemoCredentials = (role) => {
    switchMode('login');
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

  const updateSignup = (field) => (e) => {
    setSignup((current) => ({ ...current, [field]: e.target.value }));
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-brand-50 via-gray-50 to-emerald-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8">
        
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-500/30">
            <BookOpen class="w-8 h-8" />
          </div>
          <h2 class="text-2xl font-extrabold text-gray-900">
            {isSignup ? 'Create your account' : 'Welcome Back'}
          </h2>
          <p class="text-xs text-gray-500 mt-1">Digital & Smart Learning Companion</p>
        </div>

        <div class="grid grid-cols-2 bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode('login')}
            class={`py-2 text-xs font-bold rounded-lg transition-colors ${!isSignup ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            class={`py-2 text-xs font-bold rounded-lg transition-colors ${isSignup ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div class="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        {isSignup ? (
          <form onSubmit={handleSignup} class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">First name</label>
                <input
                  type="text"
                  required
                  value={signup.firstName}
                  onChange={updateSignup('firstName')}
                  placeholder="Priya"
                  class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Last name</label>
                <input
                  type="text"
                  required
                  value={signup.lastName}
                  onChange={updateSignup('lastName')}
                  placeholder="Kumar"
                  class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Username</label>
              <div class="relative">
                <User class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  minLength={3}
                  value={signup.username}
                  onChange={updateSignup('username')}
                  placeholder="Choose a username"
                  class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Email (optional)</label>
              <div class="relative">
                <Mail class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={signup.email}
                  onChange={updateSignup('email')}
                  placeholder="you@school.edu"
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
                  minLength={6}
                  value={signup.password}
                  onChange={updateSignup('password')}
                  placeholder="At least 6 characters"
                  class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">I am a</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSignup((current) => ({ ...current, role: 'student' }))}
                  class={`py-2 text-xs font-bold rounded-lg border transition-colors ${signup.role === 'student' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setSignup((current) => ({ ...current, role: 'teacher' }))}
                  class={`py-2 text-xs font-bold rounded-lg border transition-colors ${signup.role === 'teacher' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                >
                  Teacher
                </button>
              </div>
            </div>

            {signup.role === 'student' && (
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Grade</label>
                <div class="relative">
                  <GraduationCap class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  <select
                    value={signup.grade}
                    onChange={updateSignup('grade')}
                    class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  >
                    {['6', '7', '8', '9', '10', '11', '12'].map((grade) => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              class="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Creating account...' : 'Create account'}</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} class="space-y-4">
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
        )}

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
          <p class="text-[11px] text-center text-gray-400 mt-3">
            Demo users only work after the database is seeded. Use Sign Up to create your own account.
          </p>
        </div>

      </div>
    </div>
  );
}
