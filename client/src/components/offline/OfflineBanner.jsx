import React, { useContext } from 'react';
import { OfflineContext } from '../../context/OfflineContext';
import { AuthContext } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const { isOnline } = useContext(OfflineContext);
  const { language } = useContext(AuthContext);
  const t = translations[language] || translations.en;

  if (isOnline) return null;

  return (
    <div class="bg-amber-500 text-amber-950 px-4 py-2.5 shadow-inner flex items-center justify-center space-x-2 text-sm font-medium">
      <WifiOff class="w-4 h-4 animate-pulse flex-shrink-0" />
      <span>{t.offlineBanner}</span>
    </div>
  );
}
