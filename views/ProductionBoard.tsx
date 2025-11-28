
import React from 'react';
import { Script, ScriptStatus, Language } from '../types';
import * as Storage from '../services/storage';

interface ProductionBoardProps {
  scripts: Script[];
  onUpdate: () => void;
  onOpen: (id: string) => void;
  lang: Language;
}

const ProductionBoard: React.FC<ProductionBoardProps> = ({ scripts, onUpdate, onOpen, lang }) => {
  
  const COLUMNS = lang === 'pt-br' ? [
    { id: ScriptStatus.IDEA, label: 'IDEIAS', color: 'border-slate-700' },
    { id: ScriptStatus.DRAFTING, label: 'ESCREVENDO', color: 'border-blue-900' },
    { id: ScriptStatus.FILMING, label: 'GRAVANDO', color: 'border-yellow-900' },
    { id: ScriptStatus.EDITING, label: 'EDITANDO', color: 'border-purple-900' },
    { id: ScriptStatus.PUBLISHED, label: 'PUBLICADO', color: 'border-emerald-900' },
  ] : [
    { id: ScriptStatus.IDEA, label: 'IDEAS', color: 'border-slate-700' },
    { id: ScriptStatus.DRAFTING, label: 'WRITING', color: 'border-blue-900' },
    { id: ScriptStatus.FILMING, label: 'FILMING', color: 'border-yellow-900' },
    { id: ScriptStatus.EDITING, label: 'EDITING', color: 'border-purple-900' },
    { id: ScriptStatus.PUBLISHED, label: 'PUBLISHED', color: 'border-emerald-900' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('scriptId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: ScriptStatus) => {
    const id = e.dataTransfer.getData('scriptId');
    const script = scripts.find(s => s.id === id);
    if (script && script.status !== status) {
      const updatedScript = { ...script, status, lastModified: Date.now() };
      Storage.saveScript(updatedScript);
      onUpdate();
    }
  };

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-4 min-w-max h-full pb-4">
        {COLUMNS.map(col => (
          <div 
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id as ScriptStatus)}
            className={`w-72 bg-slate-900/20 border-t-4 ${col.color} rounded-lg flex flex-col h-full`}
          >
            <div className="p-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="font-sans font-bold text-slate-400 tracking-wider text-sm">{col.label}</h3>
              <span className="text-xs text-slate-600">
                {scripts.filter(s => s.status === col.id).length} Items
              </span>
            </div>
            
            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
              {scripts.filter(s => s.status === col.id).map(script => (
                <div
                  key={script.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, script.id)}
                  onClick={() => onOpen(script.id)}
                  className="bg-slate-950 border border-slate-800 p-4 rounded shadow-sm hover:border-slate-600 hover:shadow-[0_0_10px_rgba(255,255,255,0.05)] cursor-pointer transition-all active:cursor-grabbing"
                >
                  <h4 className="text-slate-200 font-medium text-sm mb-2">{script.title}</h4>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded uppercase">{script.topic.substring(0, 15)}...</span>
                    <span>{new Date(script.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionBoard;
