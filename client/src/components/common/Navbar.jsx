import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { OfflineContext } from '../../context/OfflineContext';
import { translations } from '../../i18n/translations';
import SyncStatusIndicator from '../offline/SyncStatusIndicator';
import { BookOpen, LogOut, Globe, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout, language, changeLanguage } = useContext(AuthContext);
  const { isOnline } = useContext(OfflineContext);
  const t = translations[language] || translations.en;

  return (
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
            <BookOpen class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900 leading-tight">{t.appTitle}</h1>
            <div class="flex items-center space-x-2 text-xs text-gray-500">
              <span class="inline-flex items-center text-brand-700 font-medium">
                <ShieldCheck class="w-3.5 h-3.5 mr-1" /> Safe & Offline Ready
              </span>
            </div>
          </div>
        </div>

        {/* Sync Indicator & Language Selector */}
        <div class="flex items-center space-x-4">
          <SyncStatusIndicator />

          {/* Language Selector */}
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            <Globe class="w-4 h-4 text-gray-500 ml-1 mr-1" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              class="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer pr-2"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* User Profile & Logout */}
          {user && (
            <div class="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div class="text-right hidden sm:block">
                <div class="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</div>
                <div class="text-xs text-brand-600 font-medium uppercase">{user.role}</div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                class="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut class="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
