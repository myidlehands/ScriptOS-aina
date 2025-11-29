
import React from 'react';
import { Script, ViewState, ScriptStatus, Language, UserProfile } from '../types';
import { ArrowUpRight, PlayCircle, TrendingUp, Activity, Image as ImageIcon, Plus, Zap, Users, Monitor, Youtube } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { requestAccessToken } from '../services/auth';

interface DashboardProps {
  scripts: Script[];
  onNavigate: (view: ViewState) => void;
  lang: Language;
  userProfile: UserProfile | null;
}

const Dashboard: React.FC<DashboardProps> = ({ scripts, onNavigate, lang, userProfile }) => {
  // Fallback Data for "Demo" Mode
  const demoChartData = [
    { name: 'M', val: 40 }, { name: 'T', val: 30 }, { name: 'W', val: 60 },
    { name: 'T', val: 50 }, { name: 'F', val: 80 }, { name: 'S', val: 90 }, { name: 'S', val: 100 },
  ];
  
  // Use real data if available, otherwise demo
  const chartData = userProfile?.analytics?.chartData || demoChartData;
  
  const audienceData = [
    { name: 'US', val: 45 }, { name: 'BR', val: 30 }, { name: 'UK', val: 15 }, { name: 'DE', val: 10 }
  ];

  const labels = lang === 'pt-br' ? {
    welcome: 'Olá,',
    connect: 'Conectar Canal',
    connectDesc: 'Sincronize com o YouTube para obter insights reais.',
    analytics: 'Analytics do Canal',
    growth: 'Crescimento',
    active: 'Projetos',
    viral: 'Potencial Viral',
    audience: 'Audiência',
    recent: 'Recentes',
    new: 'Novo Projeto',
    subs: 'Inscritos',
    views: 'Visualizações',
    videos: 'Vídeos'
  } : {
    welcome: 'Hello,',
    connect: 'Connect Channel',
    connectDesc: 'Sync with YouTube to unlock real insights.',
    analytics: 'Channel Analytics',
    growth: 'Growth',
    active: 'Projects',
    viral: 'Viral Potential',
    audience: 'Audience',
    recent: 'Recent',
    new: 'New Project',
    subs: 'Subscribers',
    views: 'Total Views',
    videos: 'Videos'
  };

  const hasAuth = !!userProfile?.accessToken;
  const channelName = userProfile?.channelName || (lang === 'pt-br' ? 'Criador' : 'Creator');

  return (
    <div className="animate-fade-in pb-8">
       {/* Welcome Section */}
       <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
               {userProfile?.avatarUrl && (
                  <img src={userProfile.avatarUrl} className="w-10 h-10 rounded-full border-2 border-indigo-500 shadow-[0_0_15px_#6366f1]" />
               )}
               {labels.welcome} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{channelName}</span>
            </h1>
            <p className="text-slate-400 mt-2 font-mono text-sm">
                {hasAuth 
                  ? (lang === 'pt-br' ? 'Sistema sincronizado. Métricas em tempo real.' : 'System synchronized. Real-time metrics active.')
                  : (lang === 'pt-br' ? 'Modo de simulação ativo. Conecte-se para dados reais.' : 'Simulation mode active. Connect for real data.')
                }
            </p>
          </div>
          
          {!hasAuth && (
              <button 
                onClick={requestAccessToken}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105 transition-transform"
              >
                  <Youtube size={20} fill="currentColor" /> {labels.connect}
              </button>
          )}
       </div>

       {/* Asymmetric Grid */}
       <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. HERO ANALYTICS (Nebula Aura) */}
          <div className="col-span-12 md:col-span-8 row-span-2 rounded-[32px] bg-slate-900 border border-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 aura-nebula opacity-40"></div>
             <div className="absolute right-0 bottom-0 w-3/4 h-full gen-art-map mix-blend-screen"></div>
             
             <div className="relative z-10 p-8 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                         <Activity size={14}/> {labels.analytics}
                      </h3>
                      {hasAuth && userProfile?.analytics ? (
                          <div className="flex flex-col">
                              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                  {Number(userProfile.analytics.views).toLocaleString()}
                              </h2>
                              <span className="text-sm text-blue-300">{labels.views}</span>
                          </div>
                      ) : (
                          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{labels.growth}</h2>
                      )}
                   </div>
                   <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${userProfile?.analytics?.growthRate && userProfile.analytics.growthRate < 0 ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                         <TrendingUp size={14} className={userProfile?.analytics?.growthRate && userProfile.analytics.growthRate < 0 ? 'rotate-180' : ''} /> 
                         {userProfile?.analytics?.growthRate ? (userProfile.analytics.growthRate > 0 ? '+' : '') + userProfile.analytics.growthRate : '+128'}%
                      </div>
                   </div>
                </div>
                
                <div className="flex-1 min-h-[200px] w-full mt-4">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                         <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                         />
                         <Area type="monotone" dataKey="val" stroke="#60a5fa" strokeWidth={4} fill="url(#colorVal)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* 2. STATS / AUDIENCE (Logic Aura) */}
          <div className="col-span-12 md:col-span-4 row-span-1 rounded-[32px] bg-slate-900 border border-white/5 relative overflow-hidden p-6 group">
             <div className="absolute inset-0 aura-logic opacity-30"></div>
             
             <div className="relative z-10 h-full flex flex-col justify-center">
                {hasAuth && userProfile?.analytics ? (
                   <div className="space-y-4">
                       <div>
                           <h3 className="text-emerald-200 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-1"><Users size={14}/> {labels.subs}</h3>
                           <p className="text-3xl font-bold text-white">{Number(userProfile.analytics.subscribers).toLocaleString()}</p>
                       </div>
                       <div>
                           <h3 className="text-emerald-200 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-1"><Monitor size={14}/> {labels.videos}</h3>
                           <p className="text-3xl font-bold text-white">{userProfile.analytics.videos}</p>
                       </div>
                   </div>
                ) : (
                    <>
                        <h3 className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Users size={14} /> {labels.audience}
                        </h3>
                        <div className="h-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={audienceData}>
                                <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                    {audienceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#334155'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    </>
                )}
             </div>
          </div>

          {/* 3. DEVICE USAGE (Identity Aura) */}
          <div className="col-span-12 md:col-span-4 row-span-1 rounded-[32px] bg-slate-900 border border-white/5 relative overflow-hidden p-6 group">
             <div className="absolute inset-0 aura-identity opacity-30"></div>
             
             <div className="relative z-10 flex flex-col h-full justify-between">
                <h3 className="text-red-200 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                   <Monitor size={14} /> Active Devices
                </h3>
                <div className="flex items-center justify-center py-2">
                   {/* Simplified Donut Chart Representation using CSS */}
                   <div className="w-24 h-24 rounded-full border-8 border-slate-800 border-t-red-500 border-r-orange-500 rotate-45 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-xl font-bold text-white">3</span>
                      </div>
                   </div>
                </div>
                <div className="flex justify-center gap-4 text-[10px] uppercase font-bold text-slate-500">
                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Mobile</span>
                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Desktop</span>
                </div>
             </div>
          </div>

          {/* 4. ACTIVE PROJECTS (Creative Aura) */}
          <div className="col-span-12 md:col-span-6 row-span-1 rounded-[32px] bg-slate-900 border border-white/5 relative overflow-hidden p-8 cursor-pointer transition-transform hover:-translate-y-1" onClick={() => onNavigate('PRODUCTION')}>
             <div className="absolute inset-0 aura-creative opacity-30"></div>
             <div className="absolute right-0 bottom-0 w-48 h-full gen-art-waveform opacity-20"></div>

             <div className="relative z-10 flex justify-between items-center h-full">
                <div>
                   <h3 className="text-purple-200 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Zap size={14} /> {labels.active}
                   </h3>
                   <span className="text-5xl font-bold text-white">{scripts.filter(s => s.status !== ScriptStatus.PUBLISHED).length}</span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur text-white">
                   <PlayCircle size={32} />
                </div>
             </div>
          </div>

          {/* 5. VIRAL POTENTIAL (Logic Aura) */}
          <div className="col-span-12 md:col-span-6 row-span-1 rounded-[32px] bg-slate-900 border border-white/5 relative overflow-hidden p-8 cursor-pointer transition-transform hover:-translate-y-1" onClick={() => onNavigate('TREND_HUNTER')}>
             <div className="absolute inset-0 aura-logic opacity-30"></div>
             
             <div className="relative z-10 flex justify-between items-center h-full">
                <div>
                   <h3 className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                      <TrendingUp size={14} /> {labels.viral}
                   </h3>
                   <span className="text-5xl font-bold text-white">98%</span>
                </div>
                <div className="w-full max-w-[120px]">
                   <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[98%] shadow-[0_0_10px_#10b981]"></div>
                   </div>
                </div>
             </div>
          </div>

          {/* 6. RECENT FILES (List) */}
          <div className="col-span-12 row-span-1 rounded-[32px] border border-white/5 bg-slate-900/50 p-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">{labels.recent}</h3>
                <button 
                  onClick={() => onNavigate('WRITER')} 
                  className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                >
                   <Plus size={14} /> {labels.new}
                </button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {scripts.slice(0, 4).map(script => (
                   <div 
                      key={script.id}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all"
                      onClick={() => onNavigate('STUDIO')}
                   >
                      {script.thumbnail?.imageBase64 ? (
                         <img src={`data:image/png;base64,${script.thumbnail.imageBase64}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                         <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <ImageIcon className="text-slate-600 opacity-50" size={32} />
                         </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
                         <h4 className="text-white font-bold text-sm truncate">{script.title || 'Untitled'}</h4>
                         <span className="text-[10px] text-slate-400 font-mono">{script.status}</span>
                      </div>
                   </div>
                ))}
             </div>
          </div>

       </div>
    </div>
  );
};

export default Dashboard;
