import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api/apiClient';
import { Send, ShieldCheck, UserCheck } from 'lucide-react';

export default function DoubtChatRoom({ viewerRole = 'student' }) {
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [inputText, setInputText] = useState('');
  const [title, setTitle] = useState('');
  const [classroom, setClassroom] = useState(null);
  const [error, setError] = useState(null);

  const loadThreads = async () => {
    const res = await apiClient.get('/doubts');
    if (res.data.success) setThreads(res.data.data || []);
  };

  useEffect(() => {
    loadThreads().catch(() => setThreads([]));
    if (viewerRole === 'student') {
      apiClient.get('/students/me/classroom').then((res) => {
        if (res.data.success) setClassroom(res.data.data);
      }).catch(() => setClassroom(null));
    }
  }, [viewerRole]);

  const openThread = async (thread) => {
    try {
      const res = await apiClient.get(`/doubts/${thread.id}`);
      setActive(res.data.data || thread);
    } catch (err) {
      setActive(thread);
    }
  };

  const startDoubt = async (e) => {
    e.preventDefault();
    if (!title.trim() || !inputText.trim()) return;
    if (!classroom?.teacher_id || !classroom?.subject_id) {
      setError('No assigned teacher yet. Ask admin to link your class.');
      return;
    }
    try {
      const res = await apiClient.post('/doubts', {
        teacherId: classroom.teacher_id,
        subjectId: classroom.subject_id,
        title,
        messageText: inputText
      });
      setTitle('');
      setInputText('');
      await loadThreads();
      setActive(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send doubt.');
    }
  };

  const reply = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !active) return;
    try {
      const res = await apiClient.post(`/doubts/${active.id}/reply`, { messageText: inputText });
      setInputText('');
      setActive(res.data.data);
      await loadThreads();
    } catch (err) {
      setError(err.response?.data?.message || 'Reply failed.');
    }
  };

  const teacherName = classroom
    ? `${classroom.teacher_first_name} ${classroom.teacher_last_name}`
    : 'Assigned teacher';

  return (
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
        <h4 class="text-xs font-black uppercase text-gray-400">Doubt threads</h4>
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => openThread(thread)}
            class={`w-full text-left p-3 rounded-xl text-xs ${active?.id === thread.id ? 'bg-brand-50 text-brand-800' : 'bg-gray-50 text-gray-700'}`}
          >
            <div class="font-bold">{thread.title}</div>
            <div class="text-[11px] text-gray-400">{thread.subject_title} • {thread.status}</div>
          </button>
        ))}
        {threads.length === 0 && <p class="text-xs text-gray-500">No doubts yet.</p>}
      </div>

      <div class="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden flex flex-col h-[500px]">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <UserCheck class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900">{active?.title || teacherName}</h4>
              <div class="flex items-center text-xs text-emerald-700 font-medium">
                <ShieldCheck class="w-3.5 h-3.5 mr-1" /> Contact details protected (In-App Only)
              </div>
            </div>
          </div>
        </div>

        {error && <div class="mx-4 mt-3 text-xs text-red-700 bg-red-50 p-2 rounded-lg">{error}</div>}

        <div class="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
          {(active?.messages || []).map((msg) => (
            <div key={msg.id} class={`flex ${msg.sender_role === viewerRole ? 'justify-end' : 'justify-start'}`}>
              <div class={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender_role === viewerRole
                  ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
              }`}>
                {msg.message_text}
              </div>
            </div>
          ))}
          {!active && <p class="text-xs text-gray-400">Select a thread or start a new doubt.</p>}
        </div>

        <form onSubmit={active ? reply : startDoubt} class="p-4 bg-white border-t border-gray-100 space-y-2">
          {!active && viewerRole === 'student' && (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Doubt title, e.g. LCM of 2 and 3"
              class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
            />
          )}
          <div class="flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={active ? 'Write a reply...' : 'Ask your question...'}
              class="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button type="submit" class="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md">
              <Send class="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
