import React from 'react';
import { AlertTriangle, CheckCircle2, Compass, Play, FileText } from 'lucide-react';

export default function AdaptivePath({ recommendations, topicMastery, assessments, learningMode, onChangeMode, onOpenCourse, onOpenTest }) {
  const weak = (topicMastery || []).filter((item) => Number(item.mastery_percentage) < 50);
  const strong = (topicMastery || []).filter((item) => Number(item.mastery_percentage) >= 80);
  const practiceRecs = (recommendations || []).filter((rec) => rec.recommendation_type === 'practice_set' || rec.assessment_id);

  return (
    <div class="space-y-6">
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-black text-gray-900 flex items-center">
            <Compass class="w-4 h-4 mr-2 text-brand-600" /> Learning mode
          </h3>
        </div>
        <div class="grid grid-cols-3 gap-2">
          {[
            { id: 'visual', label: 'Visual' },
            { id: 'reading', label: 'Text' },
            { id: 'practice', label: 'Practice' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => onChangeMode(mode.id)}
              class={`py-2 text-xs font-bold rounded-xl border ${
                learningMode === mode.id
                  ? 'bg-brand-50 border-brand-200 text-brand-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <p class="text-[11px] text-gray-400 mt-2">
          Adaptive path uses your test scores. Low mastery opens a remedial lesson; high mastery suggests the next topic.
        </p>
      </div>

      <div class="space-y-3">
        <h3 class="text-sm font-black text-gray-900">Recommended next</h3>
        {(recommendations || []).length === 0 && (
          <div class="bg-white rounded-2xl p-5 border border-gray-100 text-xs text-gray-500">
            Take an assessment to generate your adaptive path. Weak topics will appear here automatically.
          </div>
        )}
        {(recommendations || []).map((rec) => (
          <div key={rec.id} class="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center space-x-2">
                <AlertTriangle class="w-4 h-4 text-amber-500" />
                <span class="text-xs font-black uppercase text-amber-700">{rec.recommendation_type?.replace('_', ' ')}</span>
              </div>
              <h4 class="text-sm font-bold text-gray-900 mt-1">{rec.topic_title || rec.course_title || 'Learning task'}</h4>
              <p class="text-xs text-gray-500 mt-1">{rec.reason}</p>
            </div>
            <button
              onClick={() => {
                if (rec.recommendation_type === 'practice_set') onOpenTest(rec.assessment_id);
                else onOpenCourse(rec.course_id);
              }}
              class="px-3 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
            >
              {rec.recommendation_type === 'practice_set' ? <FileText class="w-3.5 h-3.5" /> : <Play class="w-3.5 h-3.5" />}
              <span>{rec.recommendation_type === 'practice_set' ? 'Open test' : 'Start'}</span>
            </button>
          </div>
        ))}
      </div>

      <div class="space-y-3">
        <h3 class="text-sm font-black text-gray-900">Adaptive assessments</h3>
        {(assessments || []).length === 0 && practiceRecs.length === 0 && (
          <div class="bg-white rounded-2xl p-5 border border-gray-100 text-xs text-gray-500">
            Diagnostic tests will appear here once courses are available.
          </div>
        )}
        {(assessments || []).map((assessment) => (
          <div key={assessment.id} class="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center space-x-2">
                <FileText class="w-4 h-4 text-purple-600" />
                <span class="text-xs font-black uppercase text-purple-700">{assessment.assessment_type?.replace('_', ' ')}</span>
              </div>
              <h4 class="text-sm font-bold text-gray-900 mt-1">{assessment.title}</h4>
              <p class="text-xs text-gray-500 mt-1">
                {assessment.subject_name} • {assessment.total_marks} marks • {assessment.duration_minutes || 10} min
              </p>
            </div>
            <button
              onClick={() => onOpenTest(assessment.id)}
              class="px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
            >
              <FileText class="w-3.5 h-3.5" />
              <span>Start test</span>
            </button>
          </div>
        ))}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white rounded-2xl p-5 border border-gray-100">
          <h4 class="text-xs font-black uppercase text-gray-400 mb-3">Needs attention</h4>
          {weak.length === 0 && <p class="text-xs text-gray-500">No weak topics yet.</p>}
          {weak.map((item) => (
            <div key={item.id} class="py-2 border-b border-gray-50 last:border-0">
              <div class="text-sm font-bold text-gray-900">{item.topic_title}</div>
              <div class="text-xs text-red-600 font-semibold">{Number(item.mastery_percentage).toFixed(0)}% mastery • {item.total_attempts} attempts</div>
            </div>
          ))}
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-100">
          <h4 class="text-xs font-black uppercase text-gray-400 mb-3">Mastered</h4>
          {strong.length === 0 && <p class="text-xs text-gray-500">Complete a test to unlock mastery badges.</p>}
          {strong.map((item) => (
            <div key={item.id} class="py-2 border-b border-gray-50 last:border-0 flex items-center justify-between">
              <div class="text-sm font-bold text-gray-900">{item.topic_title}</div>
              <CheckCircle2 class="w-4 h-4 text-emerald-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
