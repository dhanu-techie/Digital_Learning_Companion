import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api/apiClient';

export default function AdminDashboard() {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    apiClient.get('/admin/schools').then((res) => {
      if (res.data.success) setSchools(res.data.data || []);
    }).catch(() => setSchools([]));
  }, []);

  return (
    <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div class="bg-gradient-to-r from-slate-800 to-slate-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 class="text-2xl font-black">School administration</h2>
        <p class="text-xs text-slate-200 mt-1">Organizations and schools on this platform.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schools.map((school) => (
          <div key={school.id} class="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 class="text-sm font-black text-gray-900">{school.name}</h3>
            <p class="text-xs text-gray-500 mt-1">{school.district}, {school.state}</p>
            <p class="text-[11px] font-bold text-slate-500 mt-2">{school.code}</p>
          </div>
        ))}
        {schools.length === 0 && <p class="text-sm text-gray-500">No schools returned.</p>}
      </div>
    </div>
  );
}
