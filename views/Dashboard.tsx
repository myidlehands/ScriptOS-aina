
import React from 'react';
import { Script, ViewState, ScriptStatus, Language } from '../types';
import { FileText, TrendingUp, AlertCircle, PlayCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardProps {
  scripts: Script[];
  onNavigate: (view: ViewState) => void;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ scripts, onNavigate, lang }) => {
  const publishedCount = scripts.filter(s => s.status === ScriptStatus.PUBLISHED).length;
  const draftingCount = scripts.filter(s => s.status === ScriptStatus.DRAFTING).length;
  const ideaCount = scripts.filter(s => s.status === ScriptStatus.IDEA).length;

  const labels = lang === 'pt-br' ? {
    totalScripts: 'Total de Roteiros',
    inProduction: 'Em Produção',
    estViralReach: 'Alcance Viral Est.',
    draftsPending: 'Rascunhos Pendentes',
    pipelineAnalytics: 'Análise de Pipeline',
    recentTransmissions: 'Transmissões Recentes',
    noSignals: 'Nenhum sinal detectado. Comece a escrever.',
    newOp: '+ Nova Operação',
    week: 'esta semana',
    basedOn: 'Baseado em'
  } : {
    totalScripts: 'Total Scripts',
    inProduction: 'In Production',
    estViralReach: 'Est. Viral Reach',
    draftsPending: 'Drafts Pending',
    pipelineAnalytics: 'Pipeline Analytics',
    recentTransmissions: 'Recent Transmissions',
    noSignals: 'No signals detected. Start writing.',
    newOp: '+ New Operation',
    week: 'this week',
    basedOn: 'Based on'
  };

  const chartData = [
    { name: lang === 'pt-br' ? 'Ideias' : 'Ideas', count: ideaCount },
    { name: lang === 'pt-br' ? 'Rascunho' : 'Drafting', count: draftingCount },
    { name: lang === 'pt-br' ? 'Gravando' : 'Filming', count: scripts.filter(s => s.status === ScriptStatus.FILMING).length },
    { name: lang === 'pt-br' ? 'Publicado' : 'Published', count: publishedCount },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label={labels.totalScripts} 
          value={scripts.length} 
          icon={<FileText className="text-purple-500" />} 
          trend={`+2 ${labels.week}`}
        />
        <StatCard 
          label={labels.inProduction} 
          value={scripts.filter(s => s.status === ScriptStatus.FILMING || s.status === ScriptStatus.EDITING).length} 
          icon={<PlayCircle className="text-red-500" />} 
          borderColor="border-red-900/50"
        />
        <StatCard 
          label={labels.estViralReach} 
          value="1.2M" 
          icon={<TrendingUp className="text-emerald-500" />} 
          trend={`${labels.basedOn} 4 scripts`}
        />
        <StatCard 
          label={labels.draftsPending} 
          value={draftingCount} 
          icon={<AlertCircle className="text-amber-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-sans font-bold text-slate-100 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-red-600 block"></span>
            {labels.pipelineAnalytics}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  cursor={{fill: '#1e293b'}}
                />
                <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex flex-col">
          <h3 className="text-lg font-sans font-bold text-slate-100 mb-4">{labels.recentTransmissions}</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {scripts.slice(0, 5).map(script => (
              <div key={script.id} className="p-3 bg-slate-950 border border-slate-800 rounded hover:border-slate-600 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-slate-300 group-hover:text-red-400 truncate">{script.title}</h4>
                  <span className="text-[10px] uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-500">
                    {script.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 truncate">{script.topic}</p>
              </div>
            ))}
            {scripts.length === 0 && (
              <div className="text-slate-600 text-center py-8 text-sm italic">
                {labels.noSignals}
              </div>
            )}
          </div>
          <button 
            onClick={() => onNavigate('WRITER')}
            className="w-full mt-4 py-2 border border-dashed border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-900 transition-colors text-sm uppercase tracking-wider font-bold"
          >
            {labels.newOp}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, trend, borderColor = 'border-slate-800' }: any) => (
  <div className={`bg-slate-900/50 border ${borderColor} p-6 rounded-xl hover:bg-slate-900 transition-colors`}>
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">{label}</p>
        <h2 className="text-3xl font-sans font-bold text-slate-100 mt-1">{value}</h2>
      </div>
      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
        {icon}
      </div>
    </div>
    {trend && <p className="text-xs text-slate-500">{trend}</p>}
  </div>
);

export default Dashboard;
