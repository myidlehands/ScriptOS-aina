
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, X, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import { ChatMessage, Language } from '../types';
import * as Gemini from '../services/gemini';

interface ChatAssistantProps {
  lang: Language;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: lang === 'pt-br' ? 'A.I.N.A Online. Aguardando diretrizes.' : 'A.I.N.A Online. Awaiting directives.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call Gemini
    const response = await Gemini.chatWithAINA(messages, input, lang);
    
    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      text: response,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] z-50 hover:scale-110 transition-transform"
      >
        <Sparkles className="text-white" size={24} />
      </button>
    );
  }

  return (
    <div className="w-96 glass-panel border-l border-white/5 flex flex-col h-full bg-slate-900/40 relative z-40 transition-all duration-300">
      {/* Header */}
      <div className="h-20 shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-slate-950/20 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">AINA Co-Pilot</h3>
            <span className="text-[10px] text-emerald-400 font-mono tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE
            </span>
          </div>
        </div>
        <div className="flex gap-2 text-slate-400">
           <button onClick={() => setMessages([])} className="hover:text-white p-1"><RefreshCw size={16}/></button>
           <button onClick={() => setIsOpen(false)} className="hover:text-white p-1"><Minimize2 size={16}/></button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
         {messages.map(msg => (
           <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`
               max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-md
               ${msg.role === 'user' 
                 ? 'bg-indigo-600 text-white rounded-br-none' 
                 : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'}
             `}>
               {msg.text}
             </div>
           </div>
         ))}
         {isTyping && (
           <div className="flex justify-start">
             <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
             </div>
           </div>
         )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-slate-950/40">
        <div className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={lang === 'pt-br' ? 'Enviar diretriz...' : 'Send directive...'}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:border-indigo-500 outline-none transition-colors shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={!input || isTyping}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded-lg text-white disabled:opacity-50 hover:bg-indigo-500 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
