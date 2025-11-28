
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  PenTool, 
  Cpu, 
  Kanban, 
  Terminal, 
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import { Script, ViewState, Language } from './types';
import * as Storage from './services/storage';

// Views
import Dashboard from './views/Dashboard';
import TrendHunter from './views/TrendHunter';
import ScriptWriter from './views/ScriptWriter';
import StyleDecoder from './views/StyleDecoder';
import ProductionBoard from './views/ProductionBoard';
import Studio from './views/Studio';

// Translation Dictionary
const TRANSLATIONS = {
  'en-us': {
    dashboard: 'Dashboard',
    trendHunter: 'Trend Hunter',
    writer: 'Writer',
    decoder: 'Style Decoder',
    production: 'Production',
    systemStatus: 'SYSTEM STATUS',
    online: 'ONLINE',
    version: 'VER: 2.6.0 [FLASH]',
    rec: 'REC',
    collapse: 'Collapse',
    expand: 'Expand'
  },
  'pt-br': {
    dashboard: 'Painel',
    trendHunter: 'Caçador de Tendências',
    writer: 'Roteirista',
    decoder: 'Decodificador',
    production: 'Produção',
    systemStatus: 'STATUS DO SISTEMA',
    online: 'ONLINE',
    version: 'VER: 2.6.0 [FLASH]',
    rec: 'GRAV',
    collapse: 'Recolher',
    expand: 'Expandir'
  }
};

export default function App() {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [lang, setLang] = useState<Language>('pt-br');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [writerInitData, setWriterInitData] = useState<{topic?: string, context?: string} | undefined>(undefined);

  useEffect(() => {
    setScripts(Storage.getScripts());
  }, []);

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
      case 'STUDIO':
        return activeScriptId 
          ? <Studio scriptId={activeScriptId} onClose={() => setView('DASHBOARD')} onUpdate={refreshScripts} lang={lang} />
          : <Dashboard scripts={scripts} onNavigate={setView} lang={lang} />;
      default:
        return <Dashboard scripts={scripts} onNavigate={setView} lang={lang} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-mono overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`
          border-r border-slate-800 flex flex-col justify-between bg-slate-950 z-20 transition-all duration-300 relative
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div>
          <div className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-800`}>
            <div className="flex items-center">
              <Terminal className="text-red-600 w-8 h-8" />
              {!isSidebarCollapsed && (
                <span className="ml-3 font-sans font-bold text-lg tracking-wider text-slate-100 animate-fade-in">ScriptOS</span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button onClick={() => setIsSidebarCollapsed(true)} className="text-slate-600 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
            )}
          </div>

          {isSidebarCollapsed && (
             <div className="flex justify-center py-2 border-b border-slate-800">
                <button onClick={() => setIsSidebarCollapsed(false)} className="text-slate-600 hover:text-white transition-colors">
                  <ChevronRight size={20} />
                </button>
             </div>
          )}
          
          <nav className="mt-8 flex flex-col gap-2 px-2">
            <NavItem 
              active={view === 'DASHBOARD'} 
              onClick={() => setView('DASHBOARD')} 
              icon={<LayoutDashboard />} 
              label={t.dashboard}
              collapsed={isSidebarCollapsed}
            />
            <NavItem 
              active={view === 'TREND_HUNTER'} 
              onClick={() => setView('TREND_HUNTER')} 
              icon={<Search />} 
              label={t.trendHunter} 
              collapsed={isSidebarCollapsed}
            />
            <NavItem 
              active={view === 'WRITER'} 
              onClick={() => setView('WRITER')} 
              icon={<PenTool />} 
              label={t.writer} 
              collapsed={isSidebarCollapsed}
            />
            <NavItem 
              active={view === 'DECODER'} 
              onClick={() => setView('DECODER')} 
              icon={<Cpu />} 
              label={t.decoder} 
              collapsed={isSidebarCollapsed}
            />
            <NavItem 
              active={view === 'PRODUCTION'} 
              onClick={() => setView('PRODUCTION')} 
              icon={<Kanban />} 
              label={t.production} 
              collapsed={isSidebarCollapsed}
            />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          {!isSidebarCollapsed ? (
            <>
              <div className="flex justify-between items-center mb-4">
                 <div className="text-xs text-slate-600">{t.systemStatus}: <span className="text-emerald-500">{t.online}</span></div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={() => setLang('pt-br')} 
                  className={`text-xs px-2 py-1 rounded border ${lang === 'pt-br' ? 'bg-red-900/20 border-red-900 text-red-500' : 'border-slate-800 text-slate-500'}`}
                >
                  PT-BR
                </button>
                <button 
                  onClick={() => setLang('en-us')} 
                  className={`text-xs px-2 py-1 rounded border ${lang === 'en-us' ? 'bg-red-900/20 border-red-900 text-red-500' : 'border-slate-800 text-slate-500'}`}
                >
                  EN-US
                </button>
              </div>
              <div className="text-xs text-slate-600">
                {t.version}
              </div>
            </>
          ) : (
             <div className="flex flex-col gap-2 items-center">
                <Globe size={16} className="text-slate-600" />
                <button onClick={() => setLang(lang === 'pt-br' ? 'en-us' : 'pt-br')} className="text-[10px] font-bold text-red-500">
                  {lang.toUpperCase()}
                </button>
             </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative z-10 transition-all duration-300">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur-sm">
          <h1 className="text-xl font-sans font-bold text-slate-100 tracking-wide">
            {view === 'TREND_HUNTER' && t.trendHunter}
            {view === 'DASHBOARD' && t.dashboard}
            {view === 'WRITER' && t.writer}
            {view === 'DECODER' && t.decoder}
            {view === 'PRODUCTION' && t.production}
            {view === 'STUDIO' && 'STUDIO MODE'}
          </h1>
          <div className="flex items-center gap-4">
             {/* API Key Status Indicator (Implicit) */}
             <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
             <span className="text-xs text-red-500 font-bold uppercase tracking-widest">{t.rec}</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 relative">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label, collapsed }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
      ${active 
        ? 'bg-red-900/20 text-red-500 border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.15)]' 
        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'
      }
      ${collapsed ? 'justify-center' : ''}
    `}
    title={collapsed ? label : undefined}
  >
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    {!collapsed && <span className="block font-medium tracking-wide text-sm whitespace-nowrap">{label}</span>}
  </button>
);
