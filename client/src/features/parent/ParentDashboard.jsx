import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api/apiClient';

export default function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    apiClient.get('/parent/children').then((res) => {
      const list = res.data.data || [];
      setChildren(list);
      if (list[0]) setSelectedId(list[0].student_id);
    }).catch(() => setChildren([]));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    apiClient.get(`/parent/child/${selectedId}/progress`).then((res) => {
      setProgress(res.data.data);
    }).catch(() => setProgress(null));
  }, [selectedId]);

  return (
    <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div class="bg-gradient-to-r from-rose-600 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
        <h2 class="text-2xl font-black">Parent progress view</h2>
        <p class="text-xs text-rose-100 mt-1">You can see scores and mastery. Private teacher-student chat stays hidden.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        {children.map((child) => (
          <button
            key={child.student_id}
            onClick={() => setSelectedId(child.student_id)}
            class={`px-4 py-2 rounded-xl text-xs font-bold ${
              selectedId === child.student_id ? 'bg-rose-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {child.first_name} {child.last_name}
          </button>
        ))}
        {children.length === 0 && <p class="text-sm text-gray-500">No linked children yet. Demo login: parent1 / password123</p>}
      </div>

      {progress && (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 class="text-sm font-black mb-3">Topic mastery</h3>
            {(progress.topicMastery || []).map((item) => (
              <div key={item.id} class="py-2 border-b border-gray-50 text-sm">
                <div class="font-bold text-gray-900">{item.topic_title}</div>
                <div class="text-xs text-gray-500">{Number(item.mastery_percentage).toFixed(0)}%</div>
              </div>
            ))}
            {(progress.topicMastery || []).length === 0 && <p class="text-xs text-gray-500">No test data yet.</p>}
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 class="text-sm font-black mb-3">Recent tests</h3>
            {(progress.recentTestAttempts || []).map((item) => (
              <div key={item.id} class="py-2 border-b border-gray-50 text-sm">
                <div class="font-bold text-gray-900">{item.assessment_title}</div>
                <div class="text-xs text-gray-500">{item.percentage}% • {item.is_passed ? 'Passed' : 'Needs practice'}</div>
              </div>
            ))}
            {(progress.recentTestAttempts || []).length === 0 && <p class="text-xs text-gray-500">No attempts yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
