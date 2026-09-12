import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../services/api/apiClient';
import { AlertCircle, Users, HelpCircle, CheckCircle, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useContext(AuthContext);
  const [isAvailable, setIsAvailable] = useState(true);
  const [interventions, setInterventions] = useState([
    { studentId: 's1', studentName: 'Ramu K', topicTitle: 'Fractions Addition', masteryPct: 35.0, attempts: 3 },
    { studentId: 's2', studentName: 'Priya S', topicTitle: 'Fractions Addition', masteryPct: 40.0, attempts: 2 }
  ]);

  const toggleAvailability = async () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    try {
      await apiClient.post('/teacher/availability', {
        isAvailableForDoubts: nextState,
        doubtStartTime: '16:00',
        doubtEndTime: '19:00',
        maxDoubtsPerDay: 20
      });
    } catch (err) {
      console.log('Saved availability preference locally');
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Teacher Banner */}
      <div class="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-2">
            Teacher Portal • Mathematics
          </span>
          <h2 class="text-2xl font-black">Welcome, {user?.first_name}! 👋</h2>
          <p class="text-xs text-blue-100 mt-1">Class 8 Mathematics Teacher • District Govt School</p>
        </div>

        {/* Availability Toggle Button */}
        <div class="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
          <div class="text-right">
            <div class="text-xs font-bold uppercase text-blue-200">Doubt Status</div>
            <div class="text-xs font-black">{isAvailable ? 'Available for Questions' : 'Off Duty'}</div>
          </div>
          <button
            onClick={toggleAvailability}
            class="text-white hover:text-amber-300 transition-colors cursor-pointer"
          >
            {isAvailable ? <ToggleRight class="w-8 h-8 text-emerald-400" /> : <ToggleLeft class="w-8 h-8 text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Actionable Interventions Section */}
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900 flex items-center">
            <AlertCircle class="w-5 h-5 text-amber-500 mr-2" />
            Students Needing Remedial Attention
          </h3>
          <span class="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
            {interventions.length} Students Struggling (&lt;50% Mastery)
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interventions.map(item => (
            <div key={item.studentId} class="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex items-center justify-between">
              <div>
                <div class="text-sm font-bold text-gray-900">{item.studentName}</div>
                <div class="text-xs text-gray-500 mt-0.5">Topic: <span class="font-semibold text-gray-700">{item.topicTitle}</span></div>
                <div class="text-xs text-red-600 font-bold mt-1">Mastery: {item.masteryPct}% ({item.attempts} attempts)</div>
              </div>

              <button
                onClick={() => alert(`Remedial visual lesson assigned to ${item.studentName}`)}
                class="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Assign Remedial
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
