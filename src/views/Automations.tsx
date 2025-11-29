
import React, { useState } from 'react';
import { AutomationNode, AutomationFlow, NodeType, Language } from '../types';
import { Play, Plus, Zap, Filter, FileText, Bell, Clock, Settings, MoreHorizontal, LayoutGrid, X } from 'lucide-react';

interface AutomationsProps {
  lang: Language;
}

const Automations: React.FC<AutomationsProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState('flow-1');
  const [flows, setFlows] = useState<AutomationFlow[]>([
    {
      id: 'flow-1',
      name: 'Discovery Pipeline',
      active: true,
      nodes: [
        { id: '1', type: 'TRIGGER_TREND', position: { x: 100, y: 150 }, data: { label: 'Daily Trend Scan' } },
        { id: '2', type: 'FILTER_STYLE', position: { x: 450, y: 150 }, data: { label: 'Style Match: Noir' } },
        { id: '3', type: 'ACTION_SCRIPT', position: { x: 800, y: 150 }, data: { label: 'Draft Script' } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' }
      ]
    }
  ]);

  const [simulating, setSimulating] = useState(false);

  const labels = lang === 'pt-br' ? {
    addFlow: 'Novo Fluxo',
    simulate: 'Simular',
    trigger: 'Gatilho',
    logic: 'Lógica',
    action: 'Ação',
    nodes: {
      trend: 'Scan Tendência',
      style: 'Filtro Estilo',
      script: 'Gerar Roteiro',
      notify: 'Notificar',
      delay: 'Delay'
    }
  } : {
    addFlow: 'New Flow',
    simulate: 'Simulate',
    trigger: 'Trigger',
    logic: 'Logic',
    action: 'Action',
    nodes: {
      trend: 'Trend Scan',
      style: 'Style Filter',
      script: 'Gen Script',
      notify: 'Notify',
      delay: 'Delay'
    }
  };

  const activeFlow = flows.find(f => f.id === activeTab) || flows[0];

  const handleAddNode = (type: NodeType) => {
    const updatedFlows = flows.map(f => {
      if (f.id === activeTab) {
        const newNode: AutomationNode = {
          id: crypto.randomUUID(),
          type,
          position: { x: 200, y: 300 }, // Default center-ish
          data: { label: 'New Node' }
        };
        return { ...f, nodes: [...f.nodes, newNode] };
      }
      return f;
    });
    setFlows(updatedFlows);
  };

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => setSimulating(false), 3000);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in relative">
      
      {/* 1. Top Bar: Tabs & Controls */}
      <div className="flex items-center justify-between mb-4 px-1">
         <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-[60%] scrollbar-hide">
            {flows.map(flow => (
               <button
                 key={flow.id}
                 onClick={() => setActiveTab(flow.id)}
                 className={`px-4 py-2 rounded-t-lg border-b-2 text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                   activeTab === flow.id 
                     ? 'bg-slate-800/50 border-emerald-500 text-emerald-400' 
                     : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/30'
                 }`}
               >
                 {flow.name}
                 {activeTab === flow.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>}
               </button>
            ))}
            <button className="p-2 text-slate-500 hover:text-white transition-colors">
               <Plus size={18} />
            </button>
         </div>

         <div className="flex items-center gap-3">
            <div className="bg-slate-900 rounded-lg p-1 border border-slate-700 flex text-xs font-mono text-slate-400">
               <span className="px-3 py-1 bg-slate-800 rounded text-white">Grid</span>
               <span className="px-3 py-1 hover:text-white cursor-pointer">List</span>
            </div>
            <button 
              onClick={handleSimulate}
              className={`bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all ${simulating ? 'opacity-80' : ''}`}
            >
              {simulating ? <Settings className="animate-spin" size={14} /> : <Play size={14} fill="currentColor" />}
              {labels.simulate}
            </button>
         </div>
      </div>

      {/* 2. Main Canvas (Blueprint Style) */}
      <div className="flex-1 bg-grid-blueprint rounded-xl relative overflow-hidden border border-slate-800 shadow-inner group">
         
         {/* Floating Toolbar (Manual Controls) */}
         <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 p-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl shadow-xl transition-transform -translate-x-full group-hover:translate-x-0 opacity-0 group-hover:opacity-100 duration-300">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">{labels.trigger}</span>
            <ToolbarBtn icon={<Zap className="text-yellow-400"/>} label={labels.nodes.trend} onClick={() => handleAddNode('TRIGGER_TREND')} />
            
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 mt-2">{labels.logic}</span>
            <ToolbarBtn icon={<Filter className="text-purple-400"/>} label={labels.nodes.style} onClick={() => handleAddNode('FILTER_STYLE')} />
            <ToolbarBtn icon={<Clock className="text-blue-400"/>} label={labels.nodes.delay} onClick={() => handleAddNode('LOGIC_DELAY')} />

            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 mt-2">{labels.action}</span>
            <ToolbarBtn icon={<FileText className="text-red-400"/>} label={labels.nodes.script} onClick={() => handleAddNode('ACTION_SCRIPT')} />
            <ToolbarBtn icon={<Bell className="text-emerald-400"/>} label={labels.nodes.notify} onClick={() => handleAddNode('OUTPUT_NOTIFY')} />
         </div>

         {/* Edges */}
         <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
            {activeFlow.edges.map(edge => {
               const source = activeFlow.nodes.find(n => n.id === edge.source);
               const target = activeFlow.nodes.find(n => n.id === edge.target);
               if(!source || !target) return null;

               const sx = source.position.x + 220;
               const sy = source.position.y + 40;
               const tx = target.position.x;
               const ty = target.position.y + 40;

               const path = `M ${sx} ${sy} C ${sx + 80} ${sy}, ${tx - 80} ${ty}, ${tx} ${ty}`;

               return (
                  <g key={edge.id}>
                     <path d={path} stroke="#1e293b" strokeWidth="4" fill="none" />
                     <path 
                        d={path} 
                        stroke={simulating ? "#10b981" : "#475569"} 
                        strokeWidth="2" 
                        fill="none" 
                        strokeDasharray={simulating ? "5,5" : "0"}
                        className={simulating ? "animate-pulse" : ""}
                     />
                     {simulating && (
                        <circle r="4" fill="#10b981">
                           <animateMotion dur="1s" repeatCount="indefinite" path={path} />
                        </circle>
                     )}
                  </g>
               );
            })}
         </svg>

         {/* Nodes */}
         {activeFlow.nodes.map(node => (
            <div 
              key={node.id}
              className={`absolute w-60 rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur shadow-2xl p-0 overflow-hidden cursor-move transition-all hover:scale-105 hover:border-slate-500 z-10 ${simulating ? 'ring-2 ring-emerald-500/50' : ''}`}
              style={{ left: node.position.x, top: node.position.y }}
            >
               {/* Node Header */}
               <div className={`px-4 py-2 border-b border-slate-800 flex items-center justify-between ${
                  node.type.includes('TRIGGER') ? 'bg-yellow-900/20' : 
                  node.type.includes('FILTER') ? 'bg-purple-900/20' : 
                  node.type.includes('ACTION') ? 'bg-red-900/20' : 'bg-emerald-900/20'
               }`}>
                  <div className="flex items-center gap-2">
                     {node.type === 'TRIGGER_TREND' && <Zap size={14} className="text-yellow-500" />}
                     {node.type === 'FILTER_STYLE' && <Filter size={14} className="text-purple-500" />}
                     {node.type === 'ACTION_SCRIPT' && <FileText size={14} className="text-red-500" />}
                     {node.type === 'LOGIC_DELAY' && <Clock size={14} className="text-blue-500" />}
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        {node.type.split('_')[0]}
                     </span>
                  </div>
                  <MoreHorizontal size={14} className="text-slate-500 cursor-pointer hover:text-white"/>
               </div>

               {/* Node Body */}
               <div className="p-4">
                  <h4 className="font-bold text-slate-200 text-sm mb-1">{node.data.label}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">ID: {node.id.substring(0,6)}</p>
               </div>

               {/* Connectors */}
               <div className="absolute top-[40px] -left-1.5 w-3 h-3 bg-slate-400 rounded-full border-2 border-slate-900 hover:bg-emerald-400 transition-colors"></div>
               <div className="absolute top-[40px] -right-1.5 w-3 h-3 bg-slate-400 rounded-full border-2 border-slate-900 hover:bg-emerald-400 transition-colors"></div>
            </div>
         ))}
      </div>
    </div>
  );
};

const ToolbarBtn = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex items-center gap-3 p-2 rounded hover:bg-white/10 w-full text-left transition-colors group">
     <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-slate-500">
        {React.cloneElement(icon, { size: 16 })}
     </div>
     <span className="text-xs font-bold text-slate-300">{label}</span>
  </button>
);

export default Automations;
