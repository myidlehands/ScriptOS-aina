
import React, { useState, useEffect, useRef } from 'react';
import { Script, ViralMetrics, Language } from '../types';
import * as Storage from '../services/storage';
import * as Gemini from '../services/gemini';
import { X, Play, Pause, Save, Radar, Eye, Download, Trash2, Wand2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Radar as RechartRadar } from 'recharts';

interface StudioProps {
  scriptId: string;
  onClose: () => void;
  onUpdate: () => void;
  lang: Language;
}

const Studio: React.FC<StudioProps> = ({ scriptId, onClose, onUpdate, lang }) => {
  const [script, setScript] = useState<Script | null>(null);
  const [mode, setMode] = useState<'EDIT' | 'PROMPTER' | 'ANALYZE'>('EDIT');
  const [content, setContent] = useState('');
  
  // Prompter State
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const prompterRef = useRef<HTMLDivElement>(null);

  // Analysis State
  const [analysis, setAnalysis] = useState<ViralMetrics | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [remixing, setRemixing] = useState(false);

  // Labels
  const labels = lang === 'pt-br' ? {
    editor: 'EDITOR',
    analysis: 'ANÁLISE',
    prompter: 'PROMPTER',
    speed: 'VELOCIDADE',
    noData: 'Nenhum dado viral encontrado para esta versão.',
    deepScan: 'EXECUTAR SCAN PROFUNDO',
    analyzing: 'ANALISANDO GANCHOS DE RETENÇÃO...',
    reAnalyze: 'Re-Analisar',
    aiFeedback: 'Feedback da IA',
    avg: 'MÉDIA',
    deleteConfirm: 'Deletar este roteiro permanentemente?',
    remixRet: 'REMIX: RETENÇÃO',
    remixCon: 'REMIX: POLÊMICA'
  } : {
    editor: 'EDITOR',
    analysis: 'ANALYSIS',
    prompter: 'PROMPTER',
    speed: 'SPEED',
    noData: 'No viral data found for this version.',
    deepScan: 'RUN DEEP SCAN',
    analyzing: 'ANALYZING RETENTION HOOKS...',
    reAnalyze: 'Re-Analyze',
    aiFeedback: 'AI Feedback',
    avg: 'AVG',
    deleteConfirm: 'Delete this script permanently?',
    remixRet: 'REMIX: RETENTION',
    remixCon: 'REMIX: CONTROVERSY'
  };

  useEffect(() => {
    const allScripts = Storage.getScripts();
    const found = allScripts.find(s => s.id === scriptId);
    if (found) {
      setScript(found);
      setContent(found.content);
      if (found.viralMetrics) setAnalysis(found.viralMetrics);
    }
  }, [scriptId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'PROMPTER' && isScrolling && prompterRef.current) {
      interval = setInterval(() => {
        if (prompterRef.current) {
          prompterRef.current.scrollTop += scrollSpeed;
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isScrolling, scrollSpeed, mode]);

  const handleSave = () => {
    if (script) {
      const updated = { ...script, content, viralMetrics: analysis || undefined, lastModified: Date.now() };
      Storage.saveScript(updated);
      onUpdate();
    }
  };

  const handleDelete = () => {
    if (confirm(labels.deleteConfirm)) {
      Storage.deleteScript(scriptId);
      onUpdate();
      onClose();
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const metrics = await Gemini.analyzeViralScore(content, lang);
    setAnalysis(metrics);
    handleSave();
    setAnalyzing(false);
  };

  const handleRemix = async (type: 'RETENTION' | 'CONTROVERSY') => {
    setRemixing(true);
    const newContent = await Gemini.remixScript(content, type, lang);
    setContent(newContent);
    setRemixing(false);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script?.title || 'script'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!script) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col animate-fade-in">
      {/* Toolbar */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="hover:text-red-500 transition-colors"><X /></button>
          <h2 className="font-bold font-sans text-lg truncate max-w-[200px] md:max-w-md">{script.title}</h2>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setMode('EDIT')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${mode === 'EDIT' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {labels.editor}
          </button>
          <button 
             onClick={() => setMode('ANALYZE')}
             className={`px-4 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${mode === 'ANALYZE' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {labels.analysis}
          </button>
          <button 
             onClick={() => setMode('PROMPTER')}
             className={`px-4 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${mode === 'PROMPTER' ? 'bg-red-900/20 text-red-500' : 'text-slate-500 hover:text-red-400'}`}
          >
            {labels.prompter}
          </button>
        </div>

        <div className="flex items-center gap-2">
            <button onClick={handleSave} className="p-2 hover:bg-slate-900 rounded text-emerald-500"><Save size={20}/></button>
            <button onClick={handleDownload} className="p-2 hover:bg-slate-900 rounded text-slate-400"><Download size={20}/></button>
            <button onClick={handleDelete} className="p-2 hover:bg-slate-900 rounded text-red-500"><Trash2 size={20}/></button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* EDIT MODE */}
        {mode === 'EDIT' && (
          <div className="relative h-full w-full">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full bg-slate-950 p-8 text-slate-300 font-mono text-base resize-none focus:outline-none leading-relaxed max-w-4xl mx-auto block pb-20"
              spellCheck={false}
            />
            {/* AI Remix Toolbar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 flex gap-4 shadow-xl">
               <button 
                 onClick={() => handleRemix('RETENTION')}
                 disabled={remixing}
                 className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-purple-400 transition-colors disabled:opacity-50"
               >
                 <Wand2 size={14} /> {remixing ? '...' : labels.remixRet}
               </button>
               <div className="w-px bg-slate-700 h-4 self-center"></div>
               <button 
                 onClick={() => handleRemix('CONTROVERSY')}
                 disabled={remixing}
                 className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
               >
                 <Wand2 size={14} /> {remixing ? '...' : labels.remixCon}
               </button>
            </div>
          </div>
        )}

        {/* PROMPTER MODE */}
        {mode === 'PROMPTER' && (
          <div className="h-full relative group">
             <div ref={prompterRef} className="h-full overflow-y-auto p-12 text-center bg-black">
                <div className="max-w-3xl mx-auto text-5xl font-sans font-bold text-slate-100 leading-snug whitespace-pre-wrap pb-[50vh]">
                  {content}
                </div>
             </div>
             {/* Prompter Controls */}
             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded-full flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsScrolling(!isScrolling)} className="p-3 bg-red-600 rounded-full hover:bg-red-500 text-white">
                  {isScrolling ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1"/>}
                </button>
                <div className="flex flex-col px-2">
                   <span className="text-[10px] uppercase text-slate-400 font-bold">{labels.speed}</span>
                   <input 
                     type="range" 
                     min="1" 
                     max="10" 
                     value={scrollSpeed} 
                     onChange={(e) => setScrollSpeed(Number(e.target.value))} 
                     className="w-24 accent-red-600"
                   />
                </div>
             </div>
          </div>
        )}

        {/* ANALYZE MODE */}
        {mode === 'ANALYZE' && (
          <div className="h-full p-8 flex flex-col items-center justify-center bg-slate-950 overflow-y-auto">
             {!analysis && !analyzing && (
               <div className="text-center">
                 <Radar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                 <p className="text-slate-500 mb-6">{labels.noData}</p>
                 <button onClick={handleAnalyze} className="bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded font-bold tracking-wider">
                   {labels.deepScan}
                 </button>
               </div>
             )}
             
             {analyzing && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-t-red-600 border-slate-800 rounded-full animate-spin mx-auto"></div>
                  <p className="font-mono text-red-500 animate-pulse">{labels.analyzing}</p>
                </div>
             )}

             {analysis && !analyzing && (
               <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="h-80 w-full bg-slate-900/30 rounded-xl border border-slate-800 p-4 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: 'Hook', A: analysis.hookScore, fullMark: 100 },
                        { subject: 'Retention', A: analysis.retentionScore, fullMark: 100 },
                        { subject: 'Controversy', A: analysis.controversyScore, fullMark: 100 },
                      ]}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <RechartRadar name="Viral Score" dataKey="A" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div className="absolute top-4 right-4 text-3xl font-bold text-red-500 font-sans">
                      {Math.round((analysis.hookScore + analysis.retentionScore + analysis.controversyScore) / 3)}
                      <span className="text-sm text-slate-500 ml-1 block text-right font-normal">{labels.avg}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                      <h3 className="text-amber-500 font-bold mb-2 flex items-center gap-2">
                        <Eye size={16} /> {labels.aiFeedback}
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed font-mono">
                        "{analysis.feedback}"
                      </p>
                    </div>
                    <button onClick={handleAnalyze} className="w-full border border-slate-700 hover:bg-slate-800 text-slate-400 py-3 rounded text-sm uppercase tracking-wider">
                      {labels.reAnalyze}
                    </button>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Studio;
