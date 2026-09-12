import React, { useState } from 'react';
import { Send, Mic, ShieldCheck, UserCheck } from 'lucide-react';

export default function DoubtChatRoom() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'student', text: 'Teacher, I do not understand how LCM of 2 and 3 becomes 6.' },
    { id: 2, sender: 'teacher', text: 'Great question! Multiples of 2 are: 2, 4, 6. Multiples of 3 are: 3, 6. The smallest common multiple is 6.' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'student', text: inputText }
    ]);
    setInputText('');
  };

  return (
    <div class="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden flex flex-col h-[500px]">
      
      {/* Header with Privacy Badge */}
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <UserCheck class="w-5 h-5" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-gray-900">Teacher Kumar (Assigned Math Teacher)</h4>
            <div class="flex items-center text-xs text-emerald-700 font-medium">
              <ShieldCheck class="w-3.5 h-3.5 mr-1" /> Contact details protected (In-App Only)
            </div>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div class="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map(msg => (
          <div
            key={msg.id}
            class={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              class={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'student'
                  ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Footer */}
      <form onSubmit={handleSend} class="p-4 bg-white border-t border-gray-100 flex items-center space-x-2">
        <button
          type="button"
          title="Record Voice Note"
          class="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
        >
          <Mic class="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question or request voice explanation..."
          class="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
        />

        <button
          type="submit"
          class="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
        >
          <Send class="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
