import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../services/api/apiClient';
import DoubtChatRoom from '../doubts/DoubtChatRoom';
import { AlertCircle, ToggleLeft, ToggleRight, HelpCircle, ClipboardList } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useContext(AuthContext);
  const [isAvailable, setIsAvailable] = useState(true);
  const [interventions, setInterventions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState('help');
  const [homeworkTitle, setHomeworkTitle] = useState('Practice set');
  const [homeworkBody, setHomeworkBody] = useState('');

  const loadDashboard = async () => {
    try {
      const res = await apiClient.get('/teacher/dashboard');
      if (res.data.success) {
        const help = res.data.data.actionableInsights?.studentsNeedingHelp || [];
        setInterventions(help);
        const profile = res.data.data.teacherProfile;
        if (profile?.is_available_for_doubts != null) {
          setIsAvailable(Boolean(profile.is_available_for_doubts));
        }
      }
    } catch (err) {
      setInterventions([]);
    }
  };

  useEffect(() => {
    loadDashboard();
    apiClient.get('/assignments').then((res) => {
      if (res.data.success) setAssignments(res.data.data || []);
    }).catch(() => setAssignments([]));
  }, []);

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

  const createHomework = async (e) => {
    e.preventDefault();
    try {
      const subjects = await apiClient.get('/courses');
      const subjectId = subjects.data.data?.[0]?.subject_id;
      await apiClient.post('/assignments', {
        subjectId,
        title: homeworkTitle,
        description: homeworkBody,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        maxMarks: 20
      });
      setHomeworkBody('');
      const res = await apiClient.get('/assignments');
      if (res.data.success) setAssignments(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not create assignment');
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div class="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-2">
            Teacher Portal • Adaptive interventions
          </span>
          <h2 class="text-2xl font-black">Welcome, {user?.first_name}! 👋</h2>
          <p class="text-xs text-blue-100 mt-1">Students below 50% mastery are flagged automatically.</p>
        </div>
        <div class="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
          <div class="text-right">
            <div class="text-xs font-bold uppercase text-blue-200">Doubt Status</div>
            <div class="text-xs font-black">{isAvailable ? 'Available for Questions' : 'Off Duty'}</div>
          </div>
          <button onClick={toggleAvailability} class="text-white cursor-pointer">
            {isAvailable ? <ToggleRight class="w-8 h-8 text-emerald-400" /> : <ToggleLeft class="w-8 h-8 text-gray-400" />}
          </button>
        </div>
      </div>

      <div class="flex space-x-4 border-b border-gray-200">
        {[
          { id: 'help', label: 'Students needing help', icon: AlertCircle },
          { id: 'doubts', label: 'Doubt inbox', icon: HelpCircle },
          { id: 'homework', label: 'Homework', icon: ClipboardList }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              class={`flex items-center space-x-2 pb-2 text-sm font-bold border-b-2 ${
                tab === item.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500'
              }`}
            >
              <Icon class="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {tab === 'help' && (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interventions.map((item) => (
            <div key={`${item.student_id}-${item.topic_title}`} class="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm">
              <div class="text-sm font-bold text-gray-900">{item.first_name} {item.last_name}</div>
              <div class="text-xs text-gray-500 mt-0.5">Topic: <span class="font-semibold text-gray-700">{item.topic_title}</span></div>
              <div class="text-xs text-red-600 font-bold mt-1">Mastery: {Number(item.mastery_percentage).toFixed(0)}% ({item.total_attempts} attempts)</div>
              <button
                onClick={() => setTab('doubts')}
                class="mt-3 px-3.5 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
              >
                Open doubt inbox
              </button>
            </div>
          ))}
          {interventions.length === 0 && (
            <div class="bg-white rounded-2xl p-6 text-sm text-gray-500">
              No flagged students yet. After a student scores below 50%, they appear here.
            </div>
          )}
        </div>
      )}

      {tab === 'doubts' && <DoubtChatRoom viewerRole="teacher" />}

      {tab === 'homework' && (
        <div class="space-y-4">
          <form onSubmit={createHomework} class="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
            <input
              value={homeworkTitle}
              onChange={(e) => setHomeworkTitle(e.target.value)}
              class="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm"
              placeholder="Assignment title"
            />
            <textarea
              value={homeworkBody}
              onChange={(e) => setHomeworkBody(e.target.value)}
              class="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm"
              rows="3"
              placeholder="Instructions for the class"
            />
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">Assign homework</button>
          </form>
          {assignments.map((item) => (
            <div key={item.id} class="bg-white rounded-2xl p-4 border border-gray-100 text-sm">
              <div class="font-bold">{item.title}</div>
              <div class="text-xs text-gray-500">{item.subject_name} • due {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'soon'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
