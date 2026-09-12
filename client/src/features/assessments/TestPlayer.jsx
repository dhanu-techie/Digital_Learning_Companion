import React, { useState } from 'react';
import { offlineStorage } from '../../services/db/indexedDB';
import { CheckCircle2, Award, Clock, ArrowRight } from 'lucide-react';

export default function TestPlayer() {
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testReport, setTestReport] = useState(null);

  const mockQuestions = [
    {
      id: "q1",
      text: "What is 1/4 + 2/4?",
      options: ["3/4", "2/8", "1/2", "3/8"],
      correctAnswer: "3/4"
    },
    {
      id: "q2",
      text: "What is 1/2 + 1/3?",
      options: ["2/5", "5/6", "1/6", "3/6"],
      correctAnswer: "5/6"
    }
  ];

  const handleAnswerSelect = (option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [mockQuestions[currentQuestionIndex].id]: option
    }));
  };

  const handleFinishTest = async () => {
    let score = 0;
    const itemAnswers = [];

    mockQuestions.forEach(q => {
      const given = selectedAnswers[q.id];
      const isCorrect = given === q.correctAnswer;
      if (isCorrect) score += 1;

      itemAnswers.push({
        questionId: q.id,
        givenAnswer: given,
        isCorrect
      });
    });

    const percentage = ((score / mockQuestions.length) * 100).toFixed(1);
    const report = {
      assessmentId: "asm_fractions_diag",
      scoreObtained: score,
      totalMarks: mockQuestions.length,
      percentage,
      isPassed: percentage >= 50.0,
      itemAnswers
    };

    setTestReport(report);

    // Save locally to IndexedDB & queue for background sync
    await offlineStorage.saveAttempt(report);
    await offlineStorage.queueSyncOperation({
      entityType: 'assessment_attempt',
      entityId: `att_${Date.now()}`,
      action: 'SUBMIT',
      payload: {
        assessmentId: "asm_fractions_diag",
        scoreObtained: score,
        answers: itemAnswers
      }
    });
  };

  if (testReport) {
    return (
      <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-md text-center max-w-md mx-auto space-y-6">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Award class="w-8 h-8" />
        </div>
        <div>
          <h3 class="text-2xl font-black text-gray-900">Assessment Completed!</h3>
          <p class="text-xs text-gray-500 mt-1">Saved locally & queued for synchronization</p>
        </div>

        <div class="bg-gray-50 p-4 rounded-xl space-y-2">
          <div class="text-3xl font-black text-brand-600">{testReport.percentage}%</div>
          <div class="text-xs font-bold text-gray-600">Score: {testReport.scoreObtained} / {testReport.totalMarks}</div>
        </div>

        <button
          onClick={() => {
            setTestStarted(false);
            setTestReport(null);
            setSelectedAnswers({});
            setCurrentQuestionIndex(0);
          }}
          class="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span class="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg mb-2">
            Diagnostic Test
          </span>
          <h3 class="text-xl font-bold text-gray-900">Fractions Diagnostic Assessment</h3>
          <p class="text-xs text-gray-500 mt-1">2 Questions • Offline Evaluation Enabled</p>
        </div>
        <button
          onClick={() => setTestStarted(true)}
          class="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <span>Start Assessment</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    );
  }

  const currentQ = mockQuestions[currentQuestionIndex];

  return (
    <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-md space-y-6">
      
      {/* Header */}
      <div class="flex items-center justify-between border-b border-gray-100 pb-3">
        <span class="text-xs font-bold text-gray-500 uppercase">Question {currentQuestionIndex + 1} of {mockQuestions.length}</span>
        <span class="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
          <Clock class="w-3.5 h-3.5 mr-1" /> 10:00
        </span>
      </div>

      {/* Question */}
      <div class="space-y-4">
        <h4 class="text-lg font-bold text-gray-900">{currentQ.text}</h4>
        
        <div class="space-y-2">
          {currentQ.options.map(option => {
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

      {/* Footer Nav */}
      <div class="flex justify-end pt-4 border-t border-gray-100">
        {currentQuestionIndex < mockQuestions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            class="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl hover:bg-brand-700 transition-colors cursor-pointer"
          >
            Next Question
          </button>
        ) : (
          <button
            onClick={handleFinishTest}
            class="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Submit Test
          </button>
        )}
      </div>

    </div>
  );
}
