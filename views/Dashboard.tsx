
import React from 'react';
import { Script, ViewState, ScriptStatus, Language } from '../types';
import { ArrowUpRight, PlayCircle, TrendingUp, Activity, Image as ImageIcon, Plus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  scripts: Script[];
  onNavigate: (view: ViewState) => void;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ scripts, onNavigate, lang }) => {
  const chartData = [
    { name: 'M', val: 40 }, { name: 'T', val: 30 }, { name: 'W', val: 60 },
    { name: 'T', val: 50 }, { name: 'F', val: 80 }, { name: 'S', val: 90 }, { name: 'S', val: 100 },
  ];

  const labels = lang === 'pt-br' ? {
    welcome: 'Central de Comando',
    stats: 'Estatísticas Vitais',
    activeProjects: 'Projetos Ativos',
    viralPotential: 'Potencial Viral',
    growth: 'Crescimento',
    recent: 'Arquivos Recentes',
    empty: 'Sem dados.',
    new: 'Novo Projeto',
    analytics: 'Analytics'
  } : {
    welcome: 'Command Center',
    stats: 'Vital Statistics',
    activeProjects: 'Active Projects',
    viralPotential: 'Viral Potential',
    growth: 'Growth',
    recent: 'Recent Files',
    empty: 'No data.',
    new: 'New Project',
    analytics: 'Analytics'
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-8">
      
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 grid-rows-[minmax(280px,auto)_minmax(280px,auto)]">
        
        {/* Card 1: Main Analytics (Blue Theme) */}
        <div className="col-span-2 row-span-1 rounded-[24px] bg-nebula relative overflow-hidden p-8 flex flex-col shadow-lg transition-all hover:scale-[1.01] border border-white/5 group">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
           <div className="absolute top-0 right-0 p-20 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>
           
           <div className="relative z-10 flex justify-between items-start mb-2">
              <div>
                 <div className="flex items-center gap-2 mb-1">
                   <Activity size={16} className="text-blue-400" />
                   <h3 className="text-blue-200 text-xs font-bold uppercase tracking-widest">{labels.analytics}</h3>
                 </div>
                 <h2 className="text-white text-3xl font-bold tracking-tight">{labels.growth}</h2>
              </div>
              <div className="text-right">
                 <span className="text-3xl font-mono font-bold text-white block">+128%</span>
                 <span className="text-xs text-blue-300/60">vs Last Cycle</span>
              </div>
           </div>

           <div className="flex-1 w-[110%] -ml-[5%] relative -bottom-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fill="url(#blueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Card 2: Active Projects (Red/Mars Theme) */}
        <div 
          onClick={() => onNavigate('PRODUCTION')}
          className="col-span-1 row-span-1 rounded-[24px] bg-mars relative overflow-hidden p-8 flex flex-col justify-between shadow-lg group cursor-pointer border border-white/5 transition-all hover:-translate-y-1"
        >
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
           <div className="absolute bottom-0 left-0 p-16 bg-red-600/10 blur-2xl rounded-full pointer-events-none"></div>
           
           <div className="relative z-10 flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
                 <PlayCircle className="text-white fill-white/20" size={24} />
              </div>
              <ArrowUpRight className="text-white/50 group-hover:text-white transition-colors" />
           </div>
           
           <div className="relative z-10">
              <h3 className="text-white text-5xl font-bold mb-1">{scripts.filter(s => s.status !== ScriptStatus.PUBLISHED).length}</h3>
              <p className="text-red-100/80 font-medium text-sm tracking-wide">{labels.activeProjects}</p>
              
              <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-red-500 w-2/3 rounded-full shadow-[0_0_10px_#ef4444]"></div>
              </div>
           </div>
        </div>

        {/* Card 3: Viral Potential (Emerald/Aurora Theme) */}
        <div 
           onClick={() => onNavigate('TREND_HUNTER')}
           className="col-span-1 row-span-1 rounded-[24px] bg-aurora relative overflow-hidden p-8 flex flex-col justify-between shadow-lg group cursor-pointer border border-white/5 transition-all hover:-translate-y-1"
        >
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
           <div className="absolute top-right p-16 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none"></div>
           
           <div className="relative z-10 flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
                 <TrendingUp className="text-white" size={24} />
              </div>
              <ArrowUpRight className="text-white/50 group-hover:text-white transition-colors" />
           </div>
           
           <div className="relative z-10">
              <h3 className="text-white text-5xl font-bold mb-1">98<span className="text-2xl opacity-60 font-light">%</span></h3>
              <p className="text-emerald-100/80 font-medium text-sm tracking-wide">{labels.viralPotential}</p>
              
              <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[98%] rounded-full shadow-[0_0_10px_#10b981]"></div>
              </div>
           </div>
        </div>

        {/* Card 4: Recent Files (Wide Glass Card) */}
        <div className="col-span-2 lg:col-span-4 row-span-1 glass-card rounded-[24px] p-8 flex flex-col relative overflow-hidden">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                {labels.recent}
              </h3>
              <button 
                onClick={() => onNavigate('WRITER')}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                 <Plus size={16} className="transition-transform group-hover:rotate-90" /> {labels.new}
              </button>
           </div>
           
           <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex gap-4">
              {scripts.length > 0 ? (
                scripts.slice(0, 5).map(script => (
                   <div 
                     key={script.id} 
                     className="min-w-[240px] h-[200px] bg-slate-900/40 rounded-2xl border border-white/5 p-3 flex flex-col hover:bg-slate-800/40 hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden"
                   >
                      <div className="flex-1 w-full rounded-xl bg-slate-950 mb-3 overflow-hidden relative">
                         {script.thumbnail?.imageBase64 ? (
                           <>
                           <img src={`data:image/png;base64,${script.thumbnail.imageBase64}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                           </>
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                             <ImageIcon size={32} className="mb-2 opacity-50" />
                             <span className="text-[10px] font-mono uppercase tracking-widest">No Signal</span>
                           </div>
                         )}
                         <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-white font-mono border border-white/10">
                           {script.duration || '00:00'}
                         </div>
                      </div>
                      <div className="px-1">
                         <h4 className="text-white font-bold truncate text-sm group-hover:text-blue-400 transition-colors">{script.title || 'Untitled Project'}</h4>
                         <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{script.status}</span>
                            <span className="text-[10px] text-slate-600 font-mono">{new Date(script.lastModified).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>
                ))
              ) : (
                 <div className="w-full h-[200px] flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <p className="text-sm italic mb-2">{labels.empty}</p>
                    <button onClick={() => onNavigate('WRITER')} className="text-xs text-blue-400 hover:underline">Start your first masterpiece</button>
                 </div>
              )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
