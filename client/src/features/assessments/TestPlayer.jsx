import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api/apiClient';
import { offlineStorage } from '../../services/db/indexedDB';
import { Award, Clock, ArrowRight, FileText } from 'lucide-react';

function parseJsonField(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

export default function TestPlayer() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [testReport, setTestReport] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await apiClient.get('/assessments');
      if (res.data.success) {
        setAssessments(res.data.data || []);
      }
    } catch (err) {
      console.warn('[ASSESSMENTS] Using empty list while offline.');
    } finally {
      setLoading(false);
    }
  };

  const openAssessment = async (assessment) => {
    try {
      const res = await apiClient.get(`/assessments/${assessment.id}`);
      if (res.data.success) {
        setActiveAssessment(res.data.data);
        setTestStarted(false);
        setTestReport(null);
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
      }
    } catch (err) {
      alert('Could not load this assessment. Check your connection and try again.');
    }
  };

  const questions = (activeAssessment?.questions || []).map((question) => ({
    ...question,
    options: parseJsonField(question.options_json, [])
  }));

  const handleAnswerSelect = (option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questions[currentQuestionIndex].id]: option
    }));
  };

  const resetPlayer = () => {
    setActiveAssessment(null);
    setTestStarted(false);
    setTestReport(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleFinishTest = async () => {
    setSubmitting(true);
    const attemptId = `att_${Date.now()}`;
    const answers = questions.map((question) => ({
      questionId: question.id,
      givenAnswer: selectedAnswers[question.id] || ''
    }));

    const payload = {
      attemptId,
      assessmentId: activeAssessment.id,
      answers,
      startedAt,
      completedAt: new Date().toISOString()
    };

    try {
      const res = await apiClient.post(`/assessments/${activeAssessment.id}/submit`, payload);
      if (res.data.success) {
        setTestReport(res.data.data);
        await offlineStorage.saveAttempt({ id: attemptId, ...res.data.data });
        setSubmitting(false);
        return;
      }
    } catch (err) {
      await offlineStorage.queueSyncOperation({
        entityType: 'assessment_attempt',
        entityId: attemptId,
        action: 'SUBMIT',
        payload
      });
      setTestReport({
        scoreObtained: 0,
        totalMarks: questions.length,
        percentage: 0,
        isPassed: false,
        queuedOffline: true
      });
    }
    setSubmitting(false);
  };

  if (testReport) {
    return (
      <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-md text-center max-w-md mx-auto space-y-6">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Award class="w-8 h-8" />
        </div>
        <div>
          <h3 class="text-2xl font-black text-gray-900">
            {testReport.queuedOffline ? 'Saved offline' : 'Assessment Completed!'}
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            {testReport.queuedOffline
              ? 'Your answers are queued and will sync when the network returns.'
              : 'Score saved to your learning record.'}
          </p>
        </div>
        <div class="bg-gray-50 p-4 rounded-xl space-y-2">
          <div class="text-3xl font-black text-brand-600">{testReport.percentage}%</div>
          <div class="text-xs font-bold text-gray-600">
            Score: {testReport.scoreObtained} / {testReport.totalMarks}
            {testReport.isPassed ? ' • Passed' : ''}
          </div>
        </div>
        <button
          onClick={resetPlayer}
          class="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors cursor-pointer"
        >
          Back to Assessments
        </button>
      </div>
    );
  }

  if (activeAssessment && testStarted && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    return (
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-md space-y-6">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <span class="text-xs font-bold text-gray-500 uppercase">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span class="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
            <Clock class="w-3.5 h-3.5 mr-1" /> {activeAssessment.duration_minutes || 10} min
          </span>
        </div>
        <div class="space-y-4">
          <h4 class="text-lg font-bold text-gray-900">{currentQ.question_text}</h4>
          <div class="space-y-2">
            {currentQ.options.map((option) => {
              const isSelected = selectedAnswers[currentQ.id] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  class={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
        <div class="flex justify-between pt-4 border-t border-gray-100">
          <button
            onClick={resetPlayer}
            class="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
          >
            Cancel
          </button>
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              class="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl hover:bg-brand-700 transition-colors cursor-pointer"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleFinishTest}
              disabled={submitting}
              class="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (activeAssessment && !testStarted) {
    return (
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span class="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg mb-2 capitalize">
            {activeAssessment.assessment_type?.replace('_', ' ') || 'Assessment'}
          </span>
          <h3 class="text-xl font-bold text-gray-900">{activeAssessment.title}</h3>
          <p class="text-xs text-gray-500 mt-1">
            {activeAssessment.subject_name} • {activeAssessment.total_marks} marks • Pass {activeAssessment.passing_marks}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            onClick={resetPlayer}
            class="px-4 py-3 text-xs font-bold text-gray-500 hover:text-gray-800"
          >
            Back
          </button>
          <button
            onClick={() => {
              setStartedAt(new Date().toISOString());
              setTestStarted(true);
            }}
            class="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <span>Start Assessment</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div class="text-sm text-gray-500 font-semibold">Loading assessments...</div>;
  }

  if (assessments.length === 0) {
    return (
      <div class="bg-white rounded-2xl p-8 border border-gray-100 text-center text-sm text-gray-500">
        No assessments are available yet. Please refresh in a moment.
      </div>
    );
  }

  return (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assessments.map((assessment) => (
        <div key={assessment.id} class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span class="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg mb-3 capitalize">
              <FileText class="w-3.5 h-3.5 mr-1" />
              {assessment.assessment_type?.replace('_', ' ')}
            </span>
            <h3 class="text-lg font-bold text-gray-900">{assessment.title}</h3>
            <p class="text-xs text-gray-500 mt-2">
              {assessment.subject_name} • {assessment.total_marks} marks • {assessment.duration_minutes || 10} min
            </p>
          </div>
          <button
            onClick={() => openAssessment(assessment)}
            class="mt-5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center space-x-1 transition-colors cursor-pointer"
          >
            <span>Open Test</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
