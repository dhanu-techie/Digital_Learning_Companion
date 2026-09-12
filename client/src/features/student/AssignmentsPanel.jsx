import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api/apiClient';
import { ClipboardList } from 'lucide-react';

export default function AssignmentsPanel() {
  const [assignments, setAssignments] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    apiClient.get('/assignments').then((res) => {
      if (res.data.success) setAssignments(res.data.data || []);
    }).catch(() => setAssignments([]));
  }, []);

  const submit = async (assignmentId) => {
    try {
      await apiClient.post(`/assignments/${assignmentId}/submit`, {
        assignmentId,
        submissionText: drafts[assignmentId] || ''
      });
      setMessage('Homework submitted.');
      const res = await apiClient.get('/assignments');
      if (res.data.success) setAssignments(res.data.data || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit yet.');
    }
  };

  if (assignments.length === 0) {
    return (
      <div class="bg-white rounded-2xl p-8 border border-gray-100 text-sm text-gray-500 text-center">
        No homework assigned yet.
      </div>
    );
  }

  return (
    <div class="space-y-4">
      {message && <div class="text-xs font-semibold text-brand-700 bg-brand-50 p-3 rounded-xl">{message}</div>}
      {assignments.map((item) => (
        <div key={item.id} class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <div class="inline-flex items-center text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg mb-2">
                <ClipboardList class="w-3.5 h-3.5 mr-1" /> {item.subject_name}
              </div>
              <h3 class="text-sm font-black text-gray-900">{item.title}</h3>
              <p class="text-xs text-gray-500 mt-1">{item.description}</p>
            </div>
            <span class="text-[11px] font-bold uppercase text-gray-400">
              {item.submission_status || 'pending'}
            </span>
          </div>
          {item.submission_status !== 'evaluated' && (
            <>
              <textarea
                rows="3"
                value={drafts[item.id] || ''}
                onChange={(e) => setDrafts((current) => ({ ...current, [item.id]: e.target.value }))}
                placeholder="Write your answer..."
                class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
              <button
                onClick={() => submit(item.id)}
                class="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
              >
                Submit homework
              </button>
            </>
          )}
          {item.marks_awarded != null && (
            <p class="text-xs font-bold text-emerald-700">Marks: {item.marks_awarded}</p>
          )}
        </div>
      ))}
    </div>
  );
}
