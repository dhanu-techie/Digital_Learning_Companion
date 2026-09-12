import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

function flattenLessons(course) {
  const lessons = [];
  (course.chapters || []).forEach((chapter) => {
    (chapter.topics || []).forEach((topic) => {
      (topic.lessons || []).forEach((lesson) => {
        lessons.push({
          ...lesson,
          chapterTitle: chapter.title,
          topicTitle: topic.title
        });
      });
    });
  });
  return lessons;
}

export default function LessonViewer({ course, onBack }) {
  const lessons = useMemo(() => flattenLessons(course), [course]);
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);

  const fallbackLessons = [
    {
      title: course.title || 'Lesson',
      chapterTitle: course.subject_name || 'Course',
      topicTitle: 'Overview',
      text_content: course.description || 'This course package is still loading. Try Start Lesson again after a refresh.'
    }
  ];

  const steps = lessons.length > 0 ? lessons : fallbackLessons;
  const current = steps[currentStep - 1];

  return (
    <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-md space-y-6">
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

      <div class="space-y-2">
        <p class="text-[11px] font-bold uppercase tracking-wide text-gray-400">
          {current.chapterTitle} • {current.topicTitle}
        </p>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900">{current.title}</h3>
          <span class="text-xs font-semibold text-gray-400">Lesson {currentStep} of {steps.length}</span>
        </div>
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-800 text-sm leading-relaxed">
          <p>{current.text_content || current.content || 'Lesson text will appear here.'}</p>
        </div>
      </div>

      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => prev - 1)}
          class="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
        >
          Previous Lesson
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={() => setCurrentStep((prev) => prev + 1)}
            class="px-5 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-colors cursor-pointer"
          >
            Next Lesson
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
