
import React, { useState } from 'react';
import { Search, Loader2, Globe, AlertTriangle, ExternalLink, Youtube, Activity, FileText } from 'lucide-react';
import { trendHunt } from '../services/gemini';
import { searchVideos } from '../services/youtube';
import { TrendReport, YouTubeVideo, Language } from '../types';

interface TrendHunterProps {
  onInitWriter: (data: {topic: string, context: string}) => void;
  lang: Language;
}

const TrendHunter: React.FC<TrendHunterProps> = ({ onInitWriter, lang }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<TrendReport | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);

  const labels = lang === 'pt-br' ? {
    title: 'Vigilância Global',
    subtitle: 'Cruze inteligência da web com dados de mercado do YouTube.',
    placeholder: 'Insira vetor de pesquisa (ex: "mistérios da internet")',
    execute: 'EXECUTAR SCAN',
    webIntel: 'Inteligência Web',
    marketSurv: 'Vigilância de Mercado',
    awaiting: 'AGUARDANDO ANÁLISE',
    decrypting: 'DESCRIPTOGRAFANDO DADOS WEB...',
    noSignal: 'NENHUM SINAL DETECTADO',
    scanning: 'ESCANEANDO FREQUÊNCIAS DE VÍDEO...',
    sources: 'FONTES',
    initProtocol: 'INICIAR PROTOCOLO DE ROTEIRO',
    views: 'views',
    perDay: '/dia'
  } : {
    title: 'Global Surveillance',
    subtitle: 'Cross-reference web intelligence with YouTube market data.',
    placeholder: 'Enter research vector (e.g. "internet mysteries")',
    execute: 'EXECUTE SCAN',
    webIntel: 'Web Intelligence',
    marketSurv: 'Market Surveillance',
    awaiting: 'AWAITING ANALYSIS',
    decrypting: 'DECRYPTING WEB DATA...',
    noSignal: 'NO SIGNAL DETECTED',
    scanning: 'SCANNING VIDEO FREQUENCIES...',
    sources: 'SOURCES',
    initProtocol: 'INITIALIZE SCRIPT PROTOCOL',
    views: 'views',
    perDay: '/day'
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setReport(null);
    setVideos([]);

    const q = lang === 'pt-br' ? `${query} pt-br` : query;

    // Execute both Intelligence (Gemini) and Surveillance (YouTube) in parallel
    const [aiData, youtubeData] = await Promise.all([
      trendHunt(query, lang),
      searchVideos(q)
    ]);

    setReport(aiData);
    setVideos(youtubeData);
    setLoading(false);
  };

  const handleInitScript = () => {
    if (report) {
      onInitWriter({
        topic: query,
        context: `[TREND REPORT SOURCE]\n\n${report.content}`
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-sans font-bold text-slate-100 mb-2 glitch-text">{labels.title}</h2>
        <p className="text-slate-500">{labels.subtitle}</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6 relative max-w-2xl mx-auto w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.placeholder}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-lg text-slate-100 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-900 transition-all placeholder:text-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
        <button
          type="submit"
          disabled={loading || !query}
          className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-slate-800 text-slate-300 px-6 rounded border border-slate-800 transition-colors disabled:opacity-50 font-bold"
        >
          {loading ? <Loader2 className="animate-spin" /> : labels.execute}
        </button>
      </form>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        
        {/* Left: AI Intelligence */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 overflow-y-auto relative flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-transparent opacity-50"></div>
          
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <Globe className="text-purple-500" size={20} />
                <h3 className="font-bold text-slate-200 tracking-wider text-sm uppercase">{labels.webIntel}</h3>
             </div>
             {report && (
               <button 
                 onClick={handleInitScript}
                 className="text-[10px] bg-purple-900/20 text-purple-400 border border-purple-900/50 px-3 py-1.5 rounded flex items-center gap-2 hover:bg-purple-900/40 transition-colors uppercase font-bold"
               >
                 <FileText size={12} /> {labels.initProtocol}
               </button>
             )}
          </div>

          {!report && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
              <p className="uppercase tracking-widest text-xs">{labels.awaiting}</p>
            </div>
          )}

          {loading && (
             <div className="flex-1 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="animate-spin text-purple-600" size={32} />
               <p className="text-purple-500 font-mono text-xs animate-pulse">{labels.decrypting}</p>
             </div>
          )}

          {report && (
            <div className="animate-fade-in space-y-4">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-300">
                  {report.content}
                </div>
              </div>
              
              {report.sources.length > 0 && (
                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{labels.sources}</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.sources.map((source, idx) => (
                      <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="bg-slate-950 hover:bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px] text-slate-400 truncate max-w-[150px]">
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: YouTube Surveillance */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 overflow-y-auto relative flex flex-col">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-50"></div>
           
           <div className="flex items-center gap-2 mb-4">
             <Youtube className="text-red-500" size={20} />
             <h3 className="font-bold text-slate-200 tracking-wider text-sm uppercase">{labels.marketSurv}</h3>
          </div>

          {!videos.length && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
              <p className="uppercase tracking-widest text-xs">{labels.noSignal}</p>
            </div>
          )}

           {loading && (
             <div className="flex-1 flex flex-col items-center justify-center space-y-4">
               <Activity className="animate-pulse text-red-600" size={32} />
               <p className="text-red-500 font-mono text-xs animate-pulse">{labels.scanning}</p>
             </div>
          )}

          {videos.length > 0 && (
            <div className="grid grid-cols-1 gap-3 animate-fade-in">
              {videos.map((video) => (
                <div key={video.id} className="bg-slate-950 border border-slate-800 p-3 rounded flex gap-4 hover:border-red-900/50 transition-colors group">
                  <div className="w-32 h-20 bg-slate-900 rounded overflow-hidden shrink-0 relative">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-200 line-clamp-2 leading-tight mb-1 group-hover:text-red-400 transition-colors">
                      {video.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                       <span className="text-xs text-slate-500">{video.channelTitle}</span>
                       <div className="text-right">
                         <div className="text-xs font-mono text-slate-300">{video.viewCount} {labels.views}</div>
                         <div className="text-[10px] text-red-500 font-mono font-bold flex items-center gap-1">
                           <Activity size={10} /> {video.viralVelocity.toLocaleString()}{labels.perDay}
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TrendHunter;
