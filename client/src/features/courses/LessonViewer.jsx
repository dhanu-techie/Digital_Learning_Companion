import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, BookOpen, Volume2 } from 'lucide-react';

export default function LessonViewer({ course, onBack }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);

  const lessonSteps = [
    {
      title: "Step 1: Understanding Fractions",
      content: "A fraction represents a part of a whole. When a denominator (bottom number) is equal, we simply add the numerators (top numbers)."
    },
    {
      title: "Step 2: Finding Common Denominator",
      content: "When denominators are different (e.g. 1/2 + 1/3), find the Least Common Multiple (LCM). LCM of 2 and 3 is 6. Convert 1/2 to 3/6, and 1/3 to 2/6."
    },
    {
      title: "Step 3: Perform Addition",
      content: "Now add the numerators: 3/6 + 2/6 = 5/6. The answer is 5/6!"
    }
  ];

  return (
    <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-md space-y-6">
      
      {/* Top Header */}
      <div class="flex items-center justify-between border-b border-gray-100 pb-4">
        <button
          onClick={onBack}
          class="inline-flex items-center text-xs font-bold text-gray-600 hover:text-brand-600 cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4 mr-1" /> Back to Courses
        </button>
        <span class="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
          {course.title}
        </span>
      </div>

      {/* Lesson Step Container */}
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900">{lessonSteps[currentStep - 1].title}</h3>
          <span class="text-xs font-semibold text-gray-400">Step {currentStep} of {lessonSteps.length}</span>
        </div>

        <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-800 text-sm leading-relaxed space-y-4">
          <p>{lessonSteps[currentStep - 1].content}</p>
        </div>
      </div>

      {/* Footer Navigation */}
      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          disabled={currentStep === 1}
          onClick={() => setCurrentStep(prev => prev - 1)}
          class="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
        >
          Previous Step
        </button>

        {currentStep < lessonSteps.length ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            class="px-5 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-colors cursor-pointer"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={() => setCompleted(true)}
            class="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <CheckCircle2 class="w-4 h-4 mr-1" />
            <span>{completed ? 'Completed!' : 'Mark Lesson Complete'}</span>
          </button>
        )}
      </div>

    </div>
  );
}
