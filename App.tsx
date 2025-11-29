
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  PenTool, 
  Cpu, 
  Kanban, 
  Terminal, 
  GitBranch,
  Bell,
  UserCircle
} from 'lucide-react';
import { Script, ViewState, Language, UserProfile } from './types';
import * as Storage from './services/storage';

// Views
import Dashboard from './views/Dashboard';
import TrendHunter from './views/TrendHunter';
import ScriptWriter from './views/ScriptWriter';
import StyleDecoder from './views/StyleDecoder';
import ProductionBoard from './views/ProductionBoard';
import Studio from './views/Studio';
import Automations from './views/Automations';
import ChannelProfile from './views/ChannelProfile';
import ChatAssistant from './components/ChatAssistant';

const TRANSLATIONS = {
  'en-us': {
    dashboard: 'Dashboard',
    trendHunter: 'Trend Hunter',
    writer: 'Writer',
    decoder: 'Decoder',
    production: 'Production',
    automations: 'Automations',
    profile: 'Identity Core',
    rec: 'REC',
  },
  'pt-br': {
    dashboard: 'Painel',
    trendHunter: 'Tendências',
    writer: 'Roteirista',
    decoder: 'Decodificador',
    production: 'Produção',
    automations: 'Automações',
    profile: 'Identidade',
    rec: 'GRAV',
  }
};

export default function App() {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [lang, setLang] = useState<Language>('pt-br');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [writerInitData, setWriterInitData] = useState<{topic?: string, context?: string} | undefined>(undefined);

  useEffect(() => {
    setScripts(Storage.getScripts());
    setUserProfile(Storage.getUserProfile());
  }, [view]);

  const refreshScripts = () => {
    setScripts(Storage.getScripts());
  };

  const handleOpenScript = (id: string) => {
    setActiveScriptId(id);
    setView('STUDIO');
  };

  const handleInitWriter = (data: {topic: string, context: string}) => {
    setWriterInitData(data);
    setView('WRITER');
  };

  const t = TRANSLATIONS[lang];

  // Dynamic Aura Background based on View
  const getAuraClass = () => {
    switch (view) {
      case 'DASHBOARD': return 'aura-nebula';
      case 'TREND_HUNTER': return 'aura-logic';
      case 'WRITER': return 'aura-creative';
      case 'AUTOMATIONS': return 'aura-logic';
      case 'PROFILE': return 'aura-identity';
      default: return 'aura-nebula';
    }
  };

  const renderView = () => {
    switch (view) {
      case 'DASHBOARD':
        return <Dashboard scripts={scripts} onNavigate={setView} lang={lang} />;
      case 'TREND_HUNTER':
        return <TrendHunter onInitWriter={handleInitWriter} lang={lang} />;
      case 'WRITER':
        return <ScriptWriter onScriptCreated={refreshScripts} initialData={writerInitData} lang={lang} />;
      case 'DECODER':
        return <StyleDecoder lang={lang} />;
      case 'PRODUCTION':
        return <ProductionBoard scripts={scripts} onUpdate={refreshScripts} onOpen={handleOpenScript} lang={lang} />;
      case 'AUTOMATIONS':
        return <Automations lang={lang} />;
      case 'PROFILE':
        return <ChannelProfile lang={lang} />;
      case 'STUDIO':
        return activeScriptId 
          ? <Studio scriptId={activeScriptId} onClose={() => setView('DASHBOARD')} onUpdate={refreshScripts} lang={lang} />
          : <Dashboard scripts={scripts} onNavigate={setView} lang={lang} />;
      default:
        return <Dashboard scripts={scripts} onNavigate={setView} lang={lang} />;
    }
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* 1. Global Ambient Aura (Transitions smoothly) */}
      <div className={`absolute inset-0 transition-all duration-1000 opacity-20 pointer-events-none ${getAuraClass()}`}></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

      {/* 2. Main Layout Container */}
      <div className="relative z-10 flex h-full p-4 gap-4">
        
        {/* 3. Floating Capsule Dock (Left) */}
        <aside className="hidden md:flex w-[88px] h-full bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[32px] flex-col items-center py-8 justify-between shrink-0 shadow-2xl z-50">
          
          {/* Top: Logo */}
          <div className="flex flex-col gap-8 items-center w-full">
            <div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] cursor-pointer group hover:scale-105 transition-transform" 
              onClick={() => setView('DASHBOARD')}
            >
              <Terminal className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>

            {/* Middle: Navigation */}
            <nav className="flex flex-col gap-3 w-full items-center px-3">
              <div className="w-full h-px bg-white/5 mb-2"></div>
              
              <DockItem active={view === 'DASHBOARD'} onClick={() => setView('DASHBOARD')} icon={<LayoutDashboard size={22} />} tooltip={t.dashboard} />
              <DockItem active={view === 'TREND_HUNTER'} onClick={() => setView('TREND_HUNTER')} icon={<Search size={22} />} tooltip={t.trendHunter} />
              <DockItem active={view === 'WRITER'} onClick={() => setView('WRITER')} icon={<PenTool size={22} />} tooltip={t.writer} />
              <DockItem active={view === 'AUTOMATIONS'} onClick={() => setView('AUTOMATIONS')} icon={<GitBranch size={22} />} tooltip={t.automations} />
              <DockItem active={view === 'DECODER'} onClick={() => setView('DECODER')} icon={<Cpu size={22} />} tooltip={t.decoder} />
              <DockItem active={view === 'PRODUCTION'} onClick={() => setView('PRODUCTION')} icon={<Kanban size={22} />} tooltip={t.production} />
            </nav>
          </div>

          {/* Bottom: Profile & Settings */}
          <div className="flex flex-col gap-4 items-center w-full px-3">
             <div className="w-full h-px bg-white/5"></div>
             
             <button 
                onClick={() => setLang(lang === 'pt-br' ? 'en-us' : 'pt-br')} 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-500 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest border border-transparent hover:border-white/10"
             >
                {lang === 'pt-br' ? 'BR' : 'EN'}
             </button>

             <button 
                onClick={() => setView('PROFILE')}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 p-0.5 ${view === 'PROFILE' ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-transparent hover:border-white/10'}`}
                title={t.profile}
             >
                {userProfile?.channelName ? (
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-white overflow-hidden relative">
                    {userProfile.avatarUrl ? (
                      <img src={userProfile.avatarUrl} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gradient-blue">{userProfile.channelName[0]}</span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                    <UserCircle className="text-slate-400" size={24} />
                  </div>
                )}
             </button>
          </div>
        </aside>

        {/* 4. Center Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-900/30 backdrop-blur-sm border border-white/5 rounded-[32px] shadow-2xl">
          {/* Header */}
          <header className="h-20 shrink-0 flex items-center justify-between px-8 border-b border-white/5 bg-slate-950/20 z-40">
             <div className="animate-fade-in">
                <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-sm font-sans flex items-center gap-3">
                   {view === 'TREND_HUNTER' && t.trendHunter}
                   {view === 'DASHBOARD' && t.dashboard}
                   {view === 'WRITER' && t.writer}
                   {view === 'DECODER' && t.decoder}
                   {view === 'PRODUCTION' && t.production}
                   {view === 'AUTOMATIONS' && t.automations}
                   {view === 'PROFILE' && t.profile}
                   {view === 'STUDIO' && 'STUDIO'}
                </h1>
                <p className="text-[10px] text-indigo-400 font-mono tracking-[0.2em] uppercase mt-0.5 opacity-70">
                   A.I.N.A OS v3.5 // PRISMATIC CORE
                </p>
             </div>
             
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-950/50 border border-white/5">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"></div>
                   <span className="text-[10px] font-bold text-slate-300 tracking-widest">{t.rec}</span>
                </div>
                <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors group">
                   <Bell size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                   <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border border-slate-950"></span>
                </button>
             </div>
          </header>

          {/* Scrollable View */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 scroll-smooth custom-scrollbar relative">
             {renderView()}
          </div>
        </main>

        {/* 5. AINA Co-Pilot (Right Sidebar) */}
        <ChatAssistant lang={lang} />

      </div>
    </div>
  );
}

const DockItem = ({ active, onClick, icon, tooltip }: any) => (
  <button
    onClick={onClick}
    className={`
      relative group w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
      ${active 
        ? 'bg-white/10 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] border border-white/10' 
        : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
      }
    `}
    title={tooltip}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-100' : 'scale-90 group-hover:scale-100'}`}>
      {icon}
    </div>
    
    {/* Active Glow */}
    {active && (
       <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-md -z-10"></div>
    )}
    
    {/* Tooltip */}
    <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs font-bold text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl translate-x-2 group-hover:translate-x-0 transform duration-200">
      {tooltip}
    </div>
  </button>
);
