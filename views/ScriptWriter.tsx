
import React, { useState, useEffect } from 'react';
import { Script, StyleDNA, ScriptStatus, YouTubeVideo, Language } from '../types';
import * as Storage from '../services/storage';
import * as Gemini from '../services/gemini';
import * as YouTube from '../services/youtube';
import { Bot, Save, Loader2, ArrowRight, Copy, Check, Eye, Target, Sparkles } from 'lucide-react';

interface ScriptWriterProps {
  onScriptCreated: () => void;
  initialData?: {topic?: string, context?: string};
  lang: Language;
}

const ScriptWriter: React.FC<ScriptWriterProps> = ({ onScriptCreated, initialData, lang }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [styles, setStyles] = useState<StyleDNA[]>([]);
  
  // Form State
  const [topic, setTopic] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState('');
  const [duration, setDuration] = useState(lang === 'pt-br' ? 'Médio (8-12 min)' : 'Medium (8-12 min)');
  const [context, setContext] = useState('');

  // Recon State
  const [competitorVideos, setCompetitorVideos] = useState<YouTubeVideo[]>([]);
  const [reconLoading, setReconLoading] = useState(false);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [copied, setCopied] = useState(false);

  // Labels based on Lang
  const labels = lang === 'pt-br' ? {
    missionParams: 'Parâmetros da Missão',
    topic: 'Tópico / Ângulo',
    topicPlaceholder: 'Ex: A psicologia dos espaços liminares',
    style: 'Perfil de Estilo',
    duration: 'Duração',
    context: 'Contexto / Dados Brutos',
    contextPlaceholder: 'Cole notas ou use o Reconhecimento abaixo...',
    initGen: 'INICIAR GERAÇÃO',
    compRecon: 'Reconhecimento de Concorrência',
    absorb: '+ Absorver Contexto',
    noSignal: 'Insira um tópico para escanear sinais hostis.',
    waiting: 'AGUARDANDO ENTRADA...',
    establishing: '> ESTABELECENDO NEURAL LINK...',
    parsing: '> ANALISANDO DNA DE ESTILO...',
    synth: '> SINTETIZANDO NARRATIVA...',
    save: 'SALVAR',
    discard: 'Descartar',
    draft: 'RASCUNHO'
  } : {
    missionParams: 'Mission Parameters',
    topic: 'Topic / Angle',
    topicPlaceholder: 'e.g. The psychology of liminal spaces',
    style: 'Style Profile',
    duration: 'Duration',
    context: 'Context / Raw Data',
    contextPlaceholder: 'Paste notes or use Recon below...',
    initGen: 'INITIALIZE GENERATION',
    compRecon: 'Competitor Recon',
    absorb: '+ Absorb Context',
    noSignal: 'Enter a topic to scan for hostile signals.',
    waiting: 'WAITING FOR INPUT...',
    establishing: '> ESTABLISHING NEURAL LINK...',
    parsing: '> PARSING STYLE DNA...',
    synth: '> SYNTHESIZING NARRATIVE...',
    save: 'SAVE',
    discard: 'Discard',
    draft: 'DRAFT'
  };

  useEffect(() => {
    const loadedStyles = Storage.getStyles();
    setStyles(loadedStyles);
    if (loadedStyles.length > 0) setSelectedStyleId(loadedStyles[0].id);
  }, []);

  useEffect(() => {
    if (initialData) {
      if (initialData.topic) setTopic(initialData.topic);
      if (initialData.context) setContext(initialData.context);
    }
  }, [initialData]);

  // Debounced Recon Search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (topic && topic.length > 5) {
        performRecon(topic);
      }
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [topic]);

  const performRecon = async (query: string) => {
    setReconLoading(true);
    // Append language to query to find relevant competitors
    const q = lang === 'pt-br' ? `${query} pt-br` : query;
    const videos = await YouTube.searchVideos(q);
    setCompetitorVideos(videos.slice(0, 3)); // Top 3
    setReconLoading(false);
  };

  const handleAbsorbIntel = (video: YouTubeVideo) => {
    const intel = lang === 'pt-br'
      ? `\n[INTELIGÊNCIA DE CONCORRÊNCIA]: Existe um vídeo popular intitulado "${video.title}". Certifique-se de que nosso ângulo seja distinto, mas aproveite ganchos semelhantes.`
      : `\n[COMPETITOR INTEL]: A popular video titled "${video.title}" exists. Ensure our angle is distinct but leverages similar hooks.`;
    setContext(prev => prev + intel);
  };

  const handleGenerate = async () => {
    if (!topic || !selectedStyleId) return;
    
    setIsGenerating(true);
    const style = styles.find(s => s.id === selectedStyleId);
    
    if (style) {
      const content = await Gemini.generateScript(topic, style, duration, lang, context);
      setGeneratedContent(content);
      setGeneratedTitle(`${topic} - [${labels.draft}]`);
      setStep(2);
    }
    setIsGenerating(false);
  };

  const handleSave = () => {
    if (!generatedContent) return;

    const newScript: Script = {
      id: crypto.randomUUID(),
      title: generatedTitle,
      topic: topic,
      content: generatedContent,
      status: ScriptStatus.IDEA,
      styleId: selectedStyleId,
      createdAt: Date.now(),
      lastModified: Date.now(),
      language: lang
    };

    Storage.saveScript(newScript);
    onScriptCreated();
    
    // Reset form
    setStep(1);
    setTopic('');
    setGeneratedContent('');
    setContext('');
    setCompetitorVideos([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-6 animate-fade-in">
      
      {/* LEFT: Config Panel */}
      <div className={`lg:w-1/3 flex flex-col gap-6 transition-all duration-500 ${step === 2 ? 'hidden lg:flex lg:opacity-50 lg:pointer-events-none lg:grayscale' : ''}`}>
        
        {/* Main Parameters */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2 font-sans">
            <Bot className="text-red-500" />
            {labels.missionParams}
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1 tracking-wider uppercase">{labels.topic}</label>
              <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm text-slate-200 focus:border-red-600 focus:outline-none transition-colors"
                placeholder={labels.topicPlaceholder}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1 tracking-wider uppercase">{labels.style}</label>
              <div className="relative">
                <select 
                  value={selectedStyleId}
                  onChange={(e) => setSelectedStyleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm text-slate-200 focus:border-red-600 focus:outline-none appearance-none cursor-pointer"
                >
                  {styles.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-500 text-xs">▼</div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 bg-slate-900/50 p-2 rounded border border-slate-800/50 italic">
                DNA: {styles.find(s => s.id === selectedStyleId)?.tone || 'Unknown'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1 tracking-wider uppercase">{labels.duration}</label>
              <select 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm text-slate-200 focus:border-red-600 focus:outline-none"
              >
                <option>{lang === 'pt-br' ? 'Curto (< 1 min)' : 'Short (Under 1 min)'}</option>
                <option>{lang === 'pt-br' ? 'Médio (8-12 min)' : 'Standard (8-12 min)'}</option>
                <option>{lang === 'pt-br' ? 'Documentário (20+ min)' : 'Deep Dive (20+ min)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1 tracking-wider uppercase">{labels.context}</label>
              <textarea 
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm text-slate-200 h-24 resize-none focus:border-red-600 focus:outline-none scrollbar-hide"
                placeholder={labels.contextPlaceholder}
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !topic}
              className="w-full mt-4 bg-red-700 hover:bg-red-600 text-white font-bold py-4 rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)]"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : labels.initGen}
            </button>
          </div>
        </div>

        {/* Competitor Recon Panel */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col min-h-[200px]">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target size={14} className="text-red-500" /> {labels.compRecon}
          </h3>
          
          {reconLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-600" />
            </div>
          ) : competitorVideos.length > 0 ? (
            <div className="space-y-3">
              {competitorVideos.map(video => (
                <div key={video.id} className="bg-slate-950 p-2 rounded border border-slate-800 flex gap-3 group hover:border-red-900/50 transition-colors">
                  <img src={video.thumbnailUrl} className="w-16 h-12 object-cover rounded opacity-70 group-hover:opacity-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 font-bold truncate">{video.title}</p>
                    <p className="text-[10px] text-slate-500">{parseInt(video.viewCount).toLocaleString()} views</p>
                    <button 
                      onClick={() => handleAbsorbIntel(video)}
                      className="mt-1 text-[10px] text-red-500 hover:text-red-400 font-mono uppercase tracking-wide flex items-center gap-1"
                    >
                      {labels.absorb}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-700 text-center p-4">
              <p className="text-xs">{labels.noSignal}</p>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT: Output Panel */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-2xl h-[600px] lg:h-auto">
        {step === 1 && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 bg-[linear-gradient(45deg,rgba(0,0,0,0)_25%,rgba(15,23,42,0.5)_25%,rgba(15,23,42,0.5)_50%,rgba(0,0,0,0)_50%,rgba(0,0,0,0)_75%,rgba(15,23,42,0.5)_75%,rgba(15,23,42,0.5)_100%)] bg-[length:20px_20px]">
            <div className="w-20 h-20 border-2 border-slate-800 border-dashed rounded-full flex items-center justify-center mb-4 bg-slate-950">
              <ArrowRight className="animate-pulse text-slate-600" size={32} />
            </div>
            <p className="font-mono text-sm tracking-widest opacity-50">{labels.waiting}</p>
          </div>
        )}

        {isGenerating && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20">
             <div className="text-red-600 font-mono text-sm space-y-2 text-center">
               <div className="w-full max-w-[200px] h-1 bg-slate-900 mx-auto mb-4 rounded overflow-hidden">
                 <div className="h-full bg-red-600 animate-[loading_2s_ease-in-out_infinite]"></div>
               </div>
               <p className="animate-pulse">{labels.establishing}</p>
               <p className="animate-pulse delay-75">{labels.parsing}</p>
               <p className="animate-pulse delay-150">{labels.synth}</p>
             </div>
           </div>
        )}

        {step === 2 && (
          <>
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
              <input 
                value={generatedTitle}
                onChange={(e) => setGeneratedTitle(e.target.value)}
                className="bg-transparent text-slate-200 font-bold font-sans w-full focus:outline-none focus:border-b border-slate-600 mr-4"
              />
              <div className="flex gap-2 shrink-0">
                 <button 
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
                <button 
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase font-bold tracking-wide"
                >
                  {labels.discard}
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-emerald-900/20 text-emerald-500 border border-emerald-900/50 rounded text-xs font-bold hover:bg-emerald-900/40 flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                >
                  <Save size={14} /> {labels.save}
                </button>
              </div>
            </div>
            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="flex-1 bg-slate-950 p-8 text-slate-300 font-mono text-sm resize-none focus:outline-none leading-relaxed selection:bg-red-900/50 selection:text-white"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ScriptWriter;
