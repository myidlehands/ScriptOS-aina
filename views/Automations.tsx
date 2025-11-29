
import React, { useState } from 'react';
import { AutomationNode, AutomationEdge, NodeType, Language } from '../types';
import { PlayCircle, GitCommit, FileText, Bell, Zap, Plus } from 'lucide-react';

interface AutomationsProps {
  lang: Language;
}

const Automations: React.FC<AutomationsProps> = ({ lang }) => {
  // Mock initial state
  const [nodes, setNodes] = useState<AutomationNode[]>([
    { id: '1', type: 'TRIGGER_TREND', position: { x: 100, y: 100 }, data: { label: 'Daily Trend Scan' } },
    { id: '2', type: 'FILTER_STYLE', position: { x: 400, y: 100 }, data: { label: 'Apply: Noir Style' } },
    { id: '3', type: 'ACTION_SCRIPT', position: { x: 700, y: 100 }, data: { label: 'Auto-Draft Script' } }
  ]);
  
  const [edges, setEdges] = useState<AutomationEdge[]>([
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' }
  ]);

  const labels = lang === 'pt-br' ? {
    title: 'Automações de Fluxo (AINA Flows)',
    subtitle: 'Crie pipelines visuais para automatizar a descoberta e criação de conteúdo.',
    newNode: 'Adicionar Nó',
    trigger: 'Gatilho',
    filter: 'Filtro',
    action: 'Ação',
    output: 'Saída',
    simulate: 'SIMULAR FLUXO'
  } : {
    title: 'Flow Automations (AINA Flows)',
    subtitle: 'Create visual pipelines to automate content discovery and creation.',
    newNode: 'Add Node',
    trigger: 'Trigger',
    filter: 'Filter',
    action: 'Action',
    output: 'Output',
    simulate: 'SIMULATE FLOW'
  };

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'TRIGGER_TREND': return <Zap className="text-yellow-500" />;
      case 'FILTER_STYLE': return <GitCommit className="text-purple-500" />;
      case 'ACTION_SCRIPT': return <FileText className="text-red-500" />;
      case 'OUTPUT_NOTIFY': return <Bell className="text-emerald-500" />;
    }
  };

  const getNodeColor = (type: NodeType) => {
    switch (type) {
      case 'TRIGGER_TREND': return 'border-yellow-900/50 bg-yellow-900/10';
      case 'FILTER_STYLE': return 'border-purple-900/50 bg-purple-900/10';
      case 'ACTION_SCRIPT': return 'border-red-900/50 bg-red-900/10';
      case 'OUTPUT_NOTIFY': return 'border-emerald-900/50 bg-emerald-900/10';
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
       <div className="mb-6 flex justify-between items-end">
         <div>
            <h2 className="text-2xl font-bold font-sans text-slate-100 flex items-center gap-2">
              <GitCommit className="text-red-500" /> {labels.title}
            </h2>
            <p className="text-slate-500">{labels.subtitle}</p>
         </div>
         <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded font-bold text-xs flex items-center gap-2">
               <Plus size={14} /> {labels.newNode}
            </button>
            <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-900/20">
               <PlayCircle size={14} /> {labels.simulate}
            </button>
         </div>
       </div>

       {/* Canvas */}
       <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden automation-grid shadow-inner">
          <svg className="absolute inset-0 pointer-events-none w-full h-full">
            {edges.map(edge => {
               const sourceNode = nodes.find(n => n.id === edge.source);
               const targetNode = nodes.find(n => n.id === edge.target);
               if(!sourceNode || !targetNode) return null;
               
               // Simple layout calculation
               const sx = sourceNode.position.x + 200; // Right side of source
               const sy = sourceNode.position.y + 40; // Center Y
               const tx = targetNode.position.x; // Left side of target
               const ty = targetNode.position.y + 40;

               return (
                 <path 
                   key={edge.id}
                   d={`M ${sx} ${sy} C ${sx + 50} ${sy}, ${tx - 50} ${ty}, ${tx} ${ty}`}
                   stroke="#475569" 
                   strokeWidth="2"
                   fill="none"
                   strokeDasharray="5,5"
                   className="animate-pulse"
                 />
               );
            })}
          </svg>

          {nodes.map(node => (
             <div 
               key={node.id}
               className={`absolute w-48 rounded-lg border-2 p-4 cursor-move transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] ${getNodeColor(node.type)}`}
               style={{ left: node.position.x, top: node.position.y }}
             >
                <div className="flex items-center gap-3 mb-2">
                   {getNodeIcon(node.type)}
                   <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{node.type.split('_')[1]}</span>
                </div>
                <h4 className="font-bold text-slate-200 text-sm leading-tight">{node.data.label}</h4>
                
                {/* Connectors */}
                <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-slate-600 rounded-full border border-slate-900"></div>
                <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-slate-600 rounded-full border border-slate-900"></div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default Automations;
