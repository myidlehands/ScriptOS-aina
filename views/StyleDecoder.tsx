
import React, { useState } from 'react';
import { StyleDNA, Language } from '../types';
import * as Gemini from '../services/gemini';
import * as YouTube from '../services/youtube';
import * as Storage from '../services/storage';
import { Cpu, Save, Loader2, Music, Mic2, Layout, AlertOctagon, Search, Youtube, Globe, Terminal } from 'lucide-react';

type DecoderMode = 'SEARCH' | 'CHANNEL_API';

interface StyleDecoderProps {
  lang: Language;
}

const StyleDecoder: React.FC<StyleDecoderProps> = ({ lang }) => {
  const [mode, setMode] = useState<DecoderMode>('SEARCH');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [decodedStyle, setDecodedStyle] = useState<StyleDNA | null>(null);

  const labels = lang === 'pt-br' ? {
    title: 'Decodificador de Estilo',
    subtitle: 'Faça engenharia reversa do DNA de canais virais. Escolha seu método.',
    scanWeb: 'SCAN DE SINAL (WEB)',
    deepDive: 'ANÁLISE PROFUNDA (API)',
    placeholderWeb: 'Cole Link do YouTube ou Descrição...',
    placeholderApi: 'Insira Handle do Canal (ex: @Nexpo)...',
    decode: 'DECODIFICAR',
    testWeb: 'Usar Sinal de Teste (MagnatesMedia)',
    testApi: 'Usar Sujeito de Teste (@Nexpo)',
    interfacing: 'INTERFACEANDO COM MAINFRAME YOUTUBE...',
    accessing: 'ACESSANDO REDE GLOBAL...',
    extracting: 'EXTRAINDO METADADOS',
    tone: 'Tom & Mood',
    structure: 'Estrutura Narrativa',
    audio: 'Assinatura Sonora',
    save: 'SALVAR NO BANCO DE DADOS',
    error: 'DADOS CORROMPIDOS',
    match: 'DNA COMPATÍVEL'
  } : {
    title: 'Style Decoder',
    subtitle: 'Reverse engineer the DNA of viral channels. Choose your method.',
    scanWeb: 'SIGNAL SCAN (WEB)',
    deepDive: 'CHANNEL DEEP DIVE (API)',
    placeholderWeb: 'Paste YouTube Link or Description...',
    placeholderApi: 'Enter Channel Handle (e.g. @Nexpo) or ID...',
    decode: 'DECODE',
    testWeb: 'Use Test Signal (MagnatesMedia)',
    testApi: 'Use Test Subject (@Nexpo)',
    interfacing: 'INTERFACING WITH YOUTUBE MAINFRAME...',
    accessing: 'ACCESSING GLOBAL NETWORK...',
    extracting: 'EXTRACTING METADATA',
    tone: 'Tone & Mood',
    structure: 'Narrative Structure',
    audio: 'Audio Signature',
    save: 'SAVE TO DATABASE',
    error: 'CANNOT SAVE CORRUPTED DATA',
    match: 'DNA MATCH'
  };

  const handleDecode = async () => {
    if (!input) return;
    setLoading(true);
    setDecodedStyle(null);

    let result: StyleDNA | null = null;

    if (mode === 'SEARCH') {
      result = await Gemini.decodeStyle(input, lang);
    } else {
      const rawData = await YouTube.fetchChannelDeepData(input);
      if (rawData) {
        result = await Gemini.decodeChannelFromData(rawData, lang);
      } else {
        result = {
          id: 'error',
          name: lang === 'pt-br' ? 'Canal Não Encontrado' : 'Channel Not Found',
          tone: 'N/A',
          structure: 'N/A',
          audioSignature: 'N/A',
          description: lang === 'pt-br' ? 'Falha ao conectar stream de dados. Verifique o ID.' : 'Could not connect to YouTube Data stream. Check handle/ID.'
        };
      }
    }

    setDecodedStyle(result);
    setLoading(false);
  };

  const handleSave = () => {
    if (decodedStyle && decodedStyle.id !== 'error') {
      Storage.saveStyle(decodedStyle);
      setInput('');
      setDecodedStyle(null);
      alert(lang === 'pt-br' ? 'Perfil Arquivado com Sucesso.' : 'Style Profile Archived Successfully.');
    }
  };

  const handleQuickTest = () => {
    setInput('https://www.youtube.com/@MagnatesMedia');
    setMode('SEARCH');
  };
  
  const handleQuickChannel = () => {
    setInput('@Nexpo');
    setMode('CHANNEL_API');
  };

  const isError = decodedStyle?.id === 'error';

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-sans font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Cpu className="text-purple-500" />
          {labels.title}
        </h2>
        <p className="text-slate-500">{labels.subtitle}</p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => { setMode('SEARCH'); setInput(''); setDecodedStyle(null); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-300 ${
            mode === 'SEARCH' 
              ? 'bg-purple-900/20 border-purple-500 text-purple-400' 
              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          <Globe size={18} />
          <span className="font-bold tracking-wide text-sm">{labels.scanWeb}</span>
        </button>
        <button
           onClick={() => { setMode('CHANNEL_API'); setInput(''); setDecodedStyle(null); }}
           className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-300 ${
            mode === 'CHANNEL_API' 
              ? 'bg-red-900/20 border-red-500 text-red-400' 
              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          <Youtube size={18} />
          <span className="font-bold tracking-wide text-sm">{labels.deepDive}</span>
        </button>
      </div>

      {/* Input Area */}
      <div className={`bg-slate-900/50 border ${mode === 'CHANNEL_API' ? 'border-red-900/50' : 'border-slate-800'} rounded-xl p-6 mb-4 relative overflow-hidden group transition-colors duration-500`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${mode === 'CHANNEL_API' ? 'bg-red-600' : 'bg-purple-600'} transition-colors duration-500`}></div>
        <div className="flex gap-4 relative z-10">
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'CHANNEL_API' ? labels.placeholderApi : labels.placeholderWeb}
              className={`w-full bg-slate-950 border border-slate-700 rounded p-4 pl-12 text-slate-200 focus:outline-none transition-colors font-mono text-sm ${mode === 'CHANNEL_API' ? 'focus:border-red-500' : 'focus:border-purple-500'}`}
              onKeyDown={(e) => e.key === 'Enter' && handleDecode()}
            />
            {mode === 'CHANNEL_API' ? (
               <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            ) : (
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            )}
          </div>
          <button
            onClick={handleDecode}
            disabled={loading || !input}
            className={`px-8 rounded font-bold tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 border ${
              mode === 'CHANNEL_API' 
              ? 'bg-red-900/30 text-red-400 border-red-900 hover:bg-red-900/50' 
              : 'bg-purple-900/30 text-purple-400 border-purple-900 hover:bg-purple-900/50'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : labels.decode}
          </button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex justify-end gap-3 mb-8">
        {mode === 'SEARCH' ? (
           <button onClick={handleQuickTest} className="text-xs text-slate-500 hover:text-purple-400 underline decoration-dashed">
            {labels.testWeb}
          </button>
        ) : (
           <button onClick={handleQuickChannel} className="text-xs text-slate-500 hover:text-red-400 underline decoration-dashed">
            {labels.testApi}
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-12 space-y-4">
          <div className="relative w-24 h-24 mx-auto">
             <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
             <div className={`absolute inset-0 border-4 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin ${mode === 'CHANNEL_API' ? 'border-t-red-500' : 'border-t-purple-500'}`}></div>
          </div>
          <p className={`font-mono animate-pulse text-sm ${mode === 'CHANNEL_API' ? 'text-red-400' : 'text-purple-400'}`}>
            {mode === 'CHANNEL_API' ? labels.interfacing : labels.accessing}
            <br/>
            {labels.extracting}
          </p>
        </div>
      )}

      {decodedStyle && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
          {/* Output Card */}
          <div className={`bg-slate-950 border ${isError ? 'border-red-600' : mode === 'CHANNEL_API' ? 'border-red-500/50' : 'border-purple-500/50'} rounded-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden transition-colors`}>
            
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
            
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isError ? 'from-red-600 via-red-500 to-transparent' : mode === 'CHANNEL_API' ? 'from-transparent via-red-500 to-transparent' : 'from-transparent via-purple-500 to-transparent'}`}></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <h3 className={`text-2xl font-bold font-sans ${isError ? 'text-red-500' : 'text-white'}`}>{decodedStyle.name}</h3>
              {isError ? <AlertOctagon className="text-red-600 animate-pulse" /> : <div className={`px-2 py-1 bg-opacity-20 border bg-slate-900 rounded text-xs font-mono ${mode === 'CHANNEL_API' ? 'text-red-400 border-red-500/30' : 'text-purple-400 border-purple-500/30'}`}>{labels.match}</div>}
            </div>

            <div className="space-y-6 relative z-10">
              <div className="group">
                <div className={`flex items-center gap-2 mb-1 transition-colors ${mode === 'CHANNEL_API' ? 'text-red-400 group-hover:text-red-300' : 'text-purple-400 group-hover:text-purple-300'}`}>
                  <Mic2 size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">{labels.tone}</span>
                </div>
                <p className={`text-slate-300 font-mono text-sm pl-6 border-l ${mode === 'CHANNEL_API' ? 'border-red-900/50' : 'border-purple-900/50'}`}>{decodedStyle.tone}</p>
              </div>

              <div className="group">
                <div className={`flex items-center gap-2 mb-1 transition-colors ${mode === 'CHANNEL_API' ? 'text-red-400 group-hover:text-red-300' : 'text-purple-400 group-hover:text-purple-300'}`}>
                  <Layout size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">{labels.structure}</span>
                </div>
                <p className={`text-slate-300 font-mono text-sm pl-6 border-l ${mode === 'CHANNEL_API' ? 'border-red-900/50' : 'border-purple-900/50'}`}>{decodedStyle.structure}</p>
              </div>

              <div className="group">
                <div className={`flex items-center gap-2 mb-1 transition-colors ${mode === 'CHANNEL_API' ? 'text-red-400 group-hover:text-red-300' : 'text-purple-400 group-hover:text-purple-300'}`}>
                  <Music size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">{labels.audio}</span>
                </div>
                <p className={`text-slate-300 font-mono text-sm pl-6 border-l ${mode === 'CHANNEL_API' ? 'border-red-900/50' : 'border-purple-900/50'}`}>{decodedStyle.audioSignature}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-4">
                <p className={`text-xs italic ${isError ? 'text-red-400 font-mono' : 'text-slate-500'}`}>
                  {isError ? `ERROR LOG: ${decodedStyle.description}` : `"${decodedStyle.description}"`}
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isError}
              className={`w-full mt-8 font-bold py-3 rounded flex items-center justify-center gap-2 transition-all transform active:scale-95
                ${isError 
                  ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800' 
                  : mode === 'CHANNEL_API'
                    ? 'bg-red-700 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]'}
              `}
            >
              <Save size={18} /> {labels.save}
            </button>
          </div>

          {/* Visualization / Decor */}
          <div className="flex flex-col gap-4">
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col items-center justify-center text-slate-700 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: `radial-gradient(circle at 2px 2px, ${mode === 'CHANNEL_API' ? '#dc2626' : '#a855f7'} 1px, transparent 0)`, backgroundSize: '20px 20px'}}></div>
                <div className={`w-40 h-40 rounded-full border-2 ${isError ? 'border-red-900 bg-red-900/10' : mode === 'CHANNEL_API' ? 'border-red-900 bg-red-900/10' : 'border-purple-900 bg-purple-900/10'} flex items-center justify-center relative`}>
                    <div className={`absolute inset-0 rounded-full border border-dashed ${isError ? 'border-red-600' : mode === 'CHANNEL_API' ? 'border-red-500' : 'border-purple-500'} animate-spin-slow opacity-50`}></div>
                    <div className={`font-mono text-3xl font-bold ${isError ? 'text-red-600' : mode === 'CHANNEL_API' ? 'text-red-500' : 'text-purple-500'} glitch-text`}>
                      {isError ? '404' : 'OK'}
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleDecoder;
