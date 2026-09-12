import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';
import apiClient from '../../services/api/apiClient';
import CourseCatalog from '../courses/CourseCatalog';
import TestPlayer from '../assessments/TestPlayer';
import DoubtChatRoom from '../doubts/DoubtChatRoom';
import AIAssistantModal from '../ai/AIAssistantModal';
import { Flame, Award, BookOpen, AlertTriangle, HelpCircle, FileText, Bot } from 'lucide-react';

export default function StudentDashboard() {
  const { user, language } = useContext(AuthContext);
  const t = translations[language] || translations.en;

  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'test', 'doubts'
  const [recommendations, setRecommendations] = useState([]);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await apiClient.get('/students/me/recommendations');
      if (res.data.success) {
        setRecommendations(res.data.data || []);
      }
    } catch (err) {
      console.log('Using offline recommendation cache');
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Welcome & Streak Banner */}
      <div class="bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-2">
            Class 8 • Tamil Nadu Board
          </span>
          <h2 class="text-2xl font-black">Hello, {user?.first_name}! 👋</h2>
          <p class="text-xs text-emerald-100 mt-1">{t.todaysPlan}: 1 Lesson on Fractions + 1 Diagnostic Assessment</p>
        </div>

        {/* Streak Counter */}
        <div class="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
          <Flame class="w-7 h-7 text-amber-300 animate-bounce" />
          <div>
            <div class="text-xs uppercase font-bold text-emerald-200">{t.streak}</div>
            <div class="text-lg font-black text-white">5 Days</div>
          </div>
        </div>
      </div>

      {/* Remedial Recommendation Banner (if flagged by engine) */}
      {recommendations.length > 0 && (
        <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start space-x-3 shadow-sm">
          <AlertTriangle class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h4 class="text-sm font-bold text-amber-900">{t.remedialRecommendation}</h4>
            <p class="text-xs text-amber-800 mt-0.5">
              {recommendations[0].reason || 'Watch 10-minute visual concept video on Fractions to boost mastery above 50%.'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('courses')}
            class="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
          >
            Start Lesson
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div class="flex items-center justify-between border-b border-gray-200 pb-2">
        <div class="flex space-x-4">
          <button
            onClick={() => setActiveTab('courses')}
            class={`flex items-center space-x-2 pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'courses' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <BookOpen class="w-4 h-4" />
            <span>My Courses</span>
          </button>

          <button
            onClick={() => setActiveTab('test')}
            class={`flex items-center space-x-2 pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'test' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileText class="w-4 h-4" />
            <span>Assessments</span>
          </button>

          <button
            onClick={() => setActiveTab('doubts')}
            class={`flex items-center space-x-2 pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'doubts' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <HelpCircle class="w-4 h-4" />
            <span>Ask Teacher</span>
          </button>
        </div>

        {/* AI Learning Assistant Launcher Button */}
        <button
          onClick={() => setShowAIModal(true)}
          class="inline-flex items-center space-x-2 px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <Bot class="w-4 h-4" />
          <span>{t.aiAssistant}</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'courses' && <CourseCatalog />}
        {activeTab === 'test' && <TestPlayer />}
        {activeTab === 'doubts' && <DoubtChatRoom />}
      </div>

      {/* AI Assistant Modal */}
      {showAIModal && <AIAssistantModal onClose={() => setShowAIModal(false)} />}

    </div>
  );
}
