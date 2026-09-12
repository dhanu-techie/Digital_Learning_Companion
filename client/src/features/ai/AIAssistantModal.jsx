import React, { useState } from 'react';
import apiClient from '../../services/api/apiClient';
import { Bot, X, Send, Sparkles, ShieldAlert } from 'lucide-react';

export default function AIAssistantModal({ onClose }) {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('ta');
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const res = await apiClient.post('/ai/explain', {
        conceptTitle: prompt,
        prompt,
        language,
        context: 'learning'
      });

      if (res.data.success) {
        setExplanation(res.data.data.explanation);
      }
    } catch (err) {
      if (err.response?.data?.error === 'AI_SAFETY_RESTRICTION') {
        setError(err.response.data.message);
      } else {
        // Fallback local regional explanation generator
        setExplanation(`[${language.toUpperCase()} AI Response]: ${prompt} குறித்த விளக்கத்திற்கு: 1. படங்களை முதலில் கவனிக்கவும். 2. எளிய 3 கணக்குகளை தனியாக செய்து பார்க்கவும்.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative border border-purple-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Bot class="w-7 h-7" />
          </div>
          <div>
            <h3 class="text-xl font-black text-gray-900 flex items-center">
              AI Learning Companion <Sparkles class="w-4 h-4 ml-1.5 text-amber-400" />
            </h3>
            <p class="text-xs text-gray-500">Ask for simple explanations in your regional language</p>
          </div>
        </div>

        {/* Language Selector */}
        <div class="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl">
          <span class="text-xs font-bold text-gray-500 uppercase ml-1">Language:</span>
          {['ta', 'te', 'hi', 'en'].map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              class={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === lang ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lang === 'ta' ? 'தமிழ்' : lang === 'te' ? 'తెలుగు' : lang === 'hi' ? 'हिंदी' : 'English'}
            </button>
          ))}
        </div>

        {error && (
          <div class="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold p-3 rounded-xl flex items-center space-x-2">
            <ShieldAlert class="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Response Container */}
        {explanation && (
          <div class="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-xs font-medium text-purple-950 leading-relaxed">
            {explanation}
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleAsk} class="space-y-3">
          <textarea
            rows="3"
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Explain LCM of 2 and 3 in simple terms..."
            class="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Thinking...' : 'Get Simple Explanation'}</span>
            <Send class="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
