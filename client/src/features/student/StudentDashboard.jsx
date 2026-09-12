import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';
import apiClient from '../../services/api/apiClient';
import CourseCatalog from '../courses/CourseCatalog';
import TestPlayer from '../assessments/TestPlayer';
import DoubtChatRoom from '../doubts/DoubtChatRoom';
import AIAssistantModal from '../ai/AIAssistantModal';
import AdaptivePath from './AdaptivePath';
import AssignmentsPanel from './AssignmentsPanel';
import { Flame, BookOpen, HelpCircle, FileText, Bot, Compass, ClipboardList } from 'lucide-react';

export default function StudentDashboard() {
  const { user, language } = useContext(AuthContext);
  const t = translations[language] || translations.en;

  const [activeTab, setActiveTab] = useState('adaptive');
  const [recommendations, setRecommendations] = useState([]);
  const [topicMastery, setTopicMastery] = useState([]);
  const [streak, setStreak] = useState(0);
  const [learningMode, setLearningMode] = useState(localStorage.getItem('learningMode') || 'visual');
  const [focusCourseId, setFocusCourseId] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const refreshAdaptive = async () => {
    try {
      const [recRes, progressRes] = await Promise.all([
        apiClient.get('/students/me/recommendations'),
        apiClient.get('/students/me/progress')
      ]);
      if (recRes.data.success) setRecommendations(recRes.data.data || []);
      if (progressRes.data.success) {
        setTopicMastery(progressRes.data.data.topicMastery || []);
        setStreak(progressRes.data.data.streak?.learning_streak_count || 0);
        if (progressRes.data.data.preferences?.preferred_mode) {
          setLearningMode(progressRes.data.data.preferences.preferred_mode);
        }
      }
    } catch (err) {
      console.log('Using offline adaptive cache');
    }
  };

  useEffect(() => {
    refreshAdaptive();
  }, []);

  const changeMode = async (mode) => {
    setLearningMode(mode);
    localStorage.setItem('learningMode', mode);
    try {
      await apiClient.post('/students/me/preferences', {
        preferredMode: mode,
        languageCode: language
      });
    } catch (err) {
      console.warn('[MODE] Saved locally');
    }
  };

  const tabs = [
    { id: 'adaptive', label: 'Adaptive', icon: Compass },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'test', label: 'Assessments', icon: FileText },
    { id: 'assignments', label: t.submitHomework, icon: ClipboardList },
    { id: 'doubts', label: 'Ask Teacher', icon: HelpCircle }
  ];

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div class="bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-2">
            Class 8 • {learningMode} mode
          </span>
          <h2 class="text-2xl font-black">Hello, {user?.first_name}! 👋</h2>
          <p class="text-xs text-emerald-100 mt-1">{t.todaysPlan}</p>
        </div>
        <div class="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
          <Flame class="w-7 h-7 text-amber-300" />
          <div>
            <div class="text-xs uppercase font-bold text-emerald-200">{t.streak}</div>
            <div class="text-lg font-black text-white">{streak} Days</div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between border-b border-gray-200 pb-2">
        <div class="flex space-x-3 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                class={`flex items-center space-x-2 pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon class="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowAIModal(true)}
          class="inline-flex items-center space-x-2 px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <Bot class="w-4 h-4" />
          <span>{t.aiAssistant}</span>
        </button>
      </div>

      <div>
        {activeTab === 'adaptive' && (
          <AdaptivePath
            recommendations={recommendations}
            topicMastery={topicMastery}
            learningMode={learningMode}
            onChangeMode={changeMode}
            onOpenCourse={(courseId) => {
              setFocusCourseId(courseId);
              setActiveTab('courses');
            }}
            onOpenTest={() => setActiveTab('test')}
          />
        )}
        {activeTab === 'courses' && <CourseCatalog focusCourseId={focusCourseId} learningMode={learningMode} />}
        {activeTab === 'test' && <TestPlayer onCompleted={refreshAdaptive} />}
        {activeTab === 'assignments' && <AssignmentsPanel />}
        {activeTab === 'doubts' && <DoubtChatRoom />}
      </div>

      {showAIModal && <AIAssistantModal onClose={() => setShowAIModal(false)} />}
    </div>
  );
}
