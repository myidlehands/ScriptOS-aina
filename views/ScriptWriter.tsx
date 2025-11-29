
import React, { useState, useEffect } from 'react';
import { Script, StyleDNA, ScriptStatus, Language, TitleVariant, ThumbnailData, ScriptReference } from '../types';
import * as Storage from '../services/storage';
import * as Gemini from '../services/gemini';
import { Save, Loader2, ArrowRight, Check, Sparkles, Image as ImageIcon, Wand2, RefreshCw, Zap } from 'lucide-react';

interface ScriptWriterProps {
  onScriptCreated: () => void;
  initialData?: {topic?: string, context?: string};
  lang: Language;
}

const ScriptWriter: React.FC<ScriptWriterProps> = ({ onScriptCreated, initialData, lang }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [styles, setStyles] = useState<StyleDNA[]>([]);
  const [topic, setTopic] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState('');
  const [duration, setDuration] = useState(lang === 'pt-br' ? 'Médio (8-12 min)' : 'Medium (8-12 min)');
  const [context, setContext] = useState('');
  
  // Phase 1
  const [titleVariants, setTitleVariants] = useState<TitleVariant[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<TitleVariant | null>(null);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);

  // Phase 2
  const [thumbnailData, setThumbnailData] = useState<ThumbnailData | null>(null);
  const [isGeneratingThumbConcept, setIsGeneratingThumbConcept] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Phase 3
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

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

  const handleGenerateTitles = async () => {
    if (!topic) return;
    setIsGeneratingTitles(true);
    const variants = await Gemini.generateViralTitles(topic, lang);
    setTitleVariants(variants);
    setIsGeneratingTitles(false);
  };
  
  const selectTitle = (t: TitleVariant) => setSelectedTitle(t);
  const proceedToThumbnail = () => { if (selectedTitle) setStep(2); };

  const handleGenerateThumbConcept = async () => {
    if (!selectedTitle || !selectedStyleId) return;
    setIsGeneratingThumbConcept(true);
    const style = styles.find(s => s.id === selectedStyleId)!;
    const data = await Gemini.generateThumbnailConcept(selectedTitle.title, topic, style, lang);
    setThumbnailData({ ...data }); 
    setIsGeneratingThumbConcept(false);
  };

  const handleRenderImage = async () => {
    if (!thumbnailData?.imagePrompt) return;
    setIsGeneratingImage(true);
    const base64 = await Gemini.generateThumbnailImage(thumbnailData.imagePrompt);
    if (base64) setThumbnailData(prev => prev ? ({ ...prev, imageBase64: base64 }) : null);
    setIsGeneratingImage(false);
  };

  const proceedToScript = () => { if (thumbnailData) setStep(3); };

  const handleGenerateScript = async () => {
    if (!selectedTitle || !thumbnailData || !selectedStyleId) return;
    setIsGeneratingScript(true);
    const style = styles.find(s => s.id === selectedStyleId)!;
    const content = await Gemini.generateScript(topic, style, duration, lang, context, selectedTitle.title, thumbnailData.concept, []);
    setGeneratedContent(content);
    setIsGeneratingScript(false);
  };

  const handleSave = () => {
    if (!generatedContent || !selectedTitle) return;
    const newScript: Script = {
      id: crypto.randomUUID(),
      title: selectedTitle.title,
      topic: topic,
      content: generatedContent,
      status: ScriptStatus.IDEA,
      styleId: selectedStyleId,
      createdAt: Date.now(),
      lastModified: Date.now(),
      language: lang,
      selectedTitle: selectedTitle,
      thumbnail: thumbnailData || undefined,
      references: [],
      duration: duration
    };
    Storage.saveScript(newScript);
    onScriptCreated();
  };

  const StepIndicator = ({ num, label, active, completed }: any) => (
    <div className={`relative z-10 flex items-center gap-3 group cursor-pointer ${active ? 'opacity-100' : 'opacity-40'}`} onClick={() => completed && setStep(num)}>
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border-2 transition-all ${
         active ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-110' : 
         completed ? 'bg-slate-800 text-emerald-400 border-emerald-500/50' : 
         'bg-slate-900 border-slate-700 text-slate-500'
       }`}>
          {completed ? <Check size={18} /> : num}
       </div>
       <div className="flex flex-col">
         <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-purple-400' : 'text-slate-500'}`}>Phase 0{num}</span>
         <span className={`font-bold text-sm ${active ? 'text-white' : 'text-slate-400'}`}>{label}</span>
       </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col animate-fade-in max-w-[1600px] mx-auto">
      
      {/* Header / Stepper */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 glass-panel p-6 rounded-2xl">
         <div className="flex items-center gap-8 md:gap-16 relative">
            {/* Connecting Line */}
            <div className="absolute top-5 left-4 right-4 h-0.5 bg-slate-800 -z-0 hidden md:block"></div>
            
            <StepIndicator num={1} label="Concept Core" active={step === 1} completed={step > 1} />
            <StepIndicator num={2} label="Visual Engine" active={step === 2} completed={step > 2} />
            <StepIndicator num={3} label="Neural Writer" active={step === 3} completed={false} />
         </div>
      </div>

      {/* --- STEP 1: CONCEPT --- */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
          <div className="glass-card rounded-[24px] p-8 flex flex-col overflow-y-auto border-l-4 border-l-purple-500">
             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Sparkles className="text-purple-400" size={20} /> Input Parameters</h3>
             
             <div className="space-y-8">
                <div className="relative group">
                   <label className="text-xs text-purple-300 font-bold uppercase tracking-wider ml-1 mb-2 block">Investigation Topic</label>
                   <input 
                     value={topic}
                     onChange={(e) => setTopic(e.target.value)}
                     className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-5 text-lg text-white focus:border-purple-500 focus:bg-slate-950 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all outline-none font-medium placeholder:text-slate-600"
                     placeholder="Enter subject matter..."
                   />
                   <div className="absolute right-4 top-[42px] text-slate-600 group-focus-within:text-purple-500 transition-colors">
                     <Zap size={20} />
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Narrative Style</label>
                      <div className="relative">
                        <select 
                          value={selectedStyleId}
                          onChange={(e) => setSelectedStyleId(e.target.value)}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-sm text-slate-200 outline-none appearance-none focus:border-blue-500 transition-colors"
                        >
                           {styles.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Duration Protocol</label>
                      <div className="relative">
                        <select 
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-sm text-slate-200 outline-none appearance-none focus:border-blue-500 transition-colors"
                        >
                           <option className="bg-slate-900">Short (1m)</option>
                           <option className="bg-slate-900">Standard (8m)</option>
                           <option className="bg-slate-900">Deep Dive (20m+)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                      </div>
                   </div>
                </div>
                
                <button 
                  onClick={handleGenerateTitles}
                  disabled={!topic || isGeneratingTitles}
                  className="w-full bg-white text-slate-950 font-bold py-5 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:shadow-none mt-8"
                >
                  {isGeneratingTitles ? <Loader2 className="animate-spin" /> : <>GENERATE VECTORS <ArrowRight size={18} /></>}
                </button>
             </div>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
             {titleVariants.length > 0 ? (
               titleVariants.map((tv, idx) => (
                 <div 
                   key={idx}
                   onClick={() => selectTitle(tv)}
                   className={`glass-card p-6 rounded-2xl cursor-pointer border transition-all group relative overflow-hidden ${
                     selectedTitle === tv 
                     ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                     : 'border-white/5 hover:border-white/20'
                   }`}
                 >
                    {selectedTitle === tv && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>}
                    <div className="flex justify-between items-start mb-3">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 bg-purple-900/40 px-2 py-1 rounded border border-purple-500/30">{tv.psychology}</span>
                       <span className="text-xs font-mono text-emerald-400 font-bold">{tv.score}% Match</span>
                    </div>
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-purple-100 transition-colors">{tv.title}</h3>
                 </div>
               ))
             ) : (
                <div className="h-full glass-panel rounded-[24px] flex flex-col items-center justify-center text-slate-600 border border-dashed border-white/10 bg-slate-900/20">
                   <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                      <RefreshCw className="opacity-20" size={32} />
                   </div>
                   <p className="font-mono text-sm uppercase tracking-widest opacity-50">Waiting for data stream...</p>
                </div>
             )}
             
             {selectedTitle && (
                <button onClick={proceedToThumbnail} className="mt-4 sticky bottom-0 bg-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 hover:bg-purple-500 transition-all z-20">
                   CONFIRM SELECTION <ArrowRight size={18} />
                </button>
             )}
          </div>
        </div>
      )}

      {/* --- STEP 2: VISUALS --- */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="glass-card rounded-[24px] p-8 space-y-6 flex flex-col border-l-4 border-l-blue-500">
               <div className="flex items-start justify-between">
                 <div>
                    <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Target Narrative</h2>
                    <h3 className="text-2xl font-bold text-white leading-tight">{selectedTitle?.title}</h3>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <ImageIcon size={20} />
                 </div>
               </div>
               
               <div className="flex-1 flex flex-col justify-center">
               {!thumbnailData ? (
                  <button onClick={handleGenerateThumbConcept} className="w-full py-16 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-6 hover:bg-white/5 transition-all group bg-slate-900/30">
                     <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-900/30">
                        {isGeneratingThumbConcept ? <Loader2 className="animate-spin text-white"/> : <Wand2 className="text-white" size={32} />}
                     </div>
                     <div className="text-center">
                        <span className="font-bold text-white text-lg block">Generate Visual Concept</span>
                        <span className="text-slate-500 text-sm">AI analysis of title + emotional tone</span>
                     </div>
                  </button>
               ) : (
                  <div className="space-y-6 animate-fade-in h-full flex flex-col">
                     <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Concept Strategy</h4>
                        <p className="text-sm text-slate-200 leading-relaxed font-medium">{thumbnailData.concept}</p>
                     </div>
                     
                     <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Midjourney / SD Prompt</label>
                        <textarea 
                            value={thumbnailData.imagePrompt}
                            onChange={(e) => setThumbnailData({...thumbnailData, imagePrompt: e.target.value})}
                            className="w-full h-full min-h-[120px] bg-slate-950 border border-white/10 rounded-xl p-4 text-sm font-mono text-blue-200/80 focus:text-blue-100 outline-none resize-none focus:border-blue-500/50 transition-colors"
                        />
                     </div>
                     
                     <button 
                        onClick={handleRenderImage} 
                        className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl hover:scale-[1.01] transition-transform shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                     >
                        {isGeneratingImage ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> RENDERING...</span> : "RENDER PREVIEW"}
                     </button>
                  </div>
               )}
               </div>
            </div>

            <div className="flex flex-col gap-6">
               <div className="aspect-video glass-panel rounded-[24px] overflow-hidden relative flex items-center justify-center group bg-black/40 border border-white/10 shadow-2xl">
                  {thumbnailData?.imageBase64 ? (
                     <>
                        <img src={`data:image/png;base64,${thumbnailData.imageBase64}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <span className="text-white font-mono text-xs uppercase tracking-widest border border-white/30 px-2 py-1 rounded">HD Preview</span>
                        </div>
                     </>
                  ) : (
                     <div className="flex flex-col items-center justify-center text-slate-700">
                        <div className="w-24 h-24 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center mb-4">
                            <ImageIcon size={32} className="opacity-50" />
                        </div>
                        <span className="font-mono text-xs uppercase tracking-widest opacity-50">Visual Feed Offline</span>
                     </div>
                  )}
               </div>
               
               <div className="flex gap-4 mt-auto">
                  <button onClick={() => setStep(1)} className="px-8 py-4 glass-panel rounded-xl font-bold text-slate-400 hover:text-white transition-colors">BACK</button>
                  <button 
                    onClick={proceedToScript} 
                    disabled={!thumbnailData} 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:shadow-none hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    INITIALIZE WRITER <Zap size={18} fill="currentColor" />
                  </button>
               </div>
            </div>
        </div>
      )}

      {/* --- STEP 3: SCRIPT --- */}
      {step === 3 && (
         <div className="h-full glass-card rounded-[24px] flex flex-col overflow-hidden border border-white/10 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-purple-500 to-blue-500"></div>
            
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-950/30 backdrop-blur-md">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Live Link</span>
                  </div>
                  <h3 className="text-sm font-bold text-white hidden md:block">{selectedTitle?.title}</h3>
               </div>
               <div className="flex gap-3">
                  {!generatedContent ? (
                     <button onClick={handleGenerateScript} className="px-6 py-2 bg-white text-slate-950 rounded-lg text-xs font-bold hover:scale-105 transition-transform flex items-center gap-2">
                        <Sparkles size={14} className="text-purple-600" /> GENERATE
                     </button>
                  ) : (
                     <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <Save size={16}/> SAVE PROJECT
                     </button>
                  )}
               </div>
            </div>
            
            <div className="flex-1 relative bg-slate-950/20">
               {isGeneratingScript && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                     <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                     <p className="font-mono text-purple-400 animate-pulse text-sm tracking-widest uppercase">Synthesizing Narrative Structure...</p>
                  </div>
               )}
               <textarea 
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full h-full bg-transparent p-8 md:p-12 text-slate-300 font-mono text-sm md:text-base leading-loose outline-none resize-none focus:text-white transition-colors"
                  placeholder="// Awaiting neural generation..."
                  spellCheck={false}
               />
            </div>
         </div>
      )}
    </div>
  );
};

export default ScriptWriter;
