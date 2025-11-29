
import React, { useState, useEffect } from 'react';
import { UserProfile, Language } from '../types';
import { fetchChannelDeepData } from '../services/youtube';
import { getUserProfile, saveUserProfile } from '../services/storage';
import { User, Youtube, Save, Loader2, Fingerprint, Target, ScrollText, CheckCircle } from 'lucide-react';

interface ChannelProfileProps {
  lang: Language;
}

const ChannelProfile: React.FC<ChannelProfileProps> = ({ lang }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Inputs
  const [channelInput, setChannelInput] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [manifesto, setManifesto] = useState('');

  const labels = lang === 'pt-br' ? {
    title: 'Identity Core',
    subtitle: 'Defina a alma do seu canal. A AINA usará isso para personalizar cada roteiro.',
    connect: 'Conectar Canal',
    connectDesc: 'Insira ID ou Handle (@nome) do YouTube',
    brandBible: 'Bíblia da Marca',
    voice: 'Voz da Marca',
    voiceDesc: 'Ex: Sarcástico, Investigativo, Acelerado...',
    audience: 'Público Alvo',
    audienceDesc: 'Ex: Gen Z, Amantes de True Crime...',
    manifesto: 'Manifesto / Missão',
    manifestoDesc: 'Por que este canal existe? Qual a verdade que você busca?',
    save: 'Salvar Identidade',
    saved: 'Identidade Sincronizada',
    search: 'Buscar Dados'
  } : {
    title: 'Identity Core',
    subtitle: 'Define your channel\'s soul. AINA will use this to personalize every script.',
    connect: 'Connect Channel',
    connectDesc: 'Enter YouTube ID or Handle (@name)',
    brandBible: 'Brand Bible',
    voice: 'Brand Voice',
    voiceDesc: 'E.g. Sarcastic, Investigative, Fast-paced...',
    audience: 'Target Audience',
    audienceDesc: 'E.g. Gen Z, True Crime lovers...',
    manifesto: 'Manifesto / Mission',
    manifestoDesc: 'Why does this channel exist? What truth do you seek?',
    save: 'Save Identity',
    saved: 'Identity Synchronized',
    search: 'Fetch Data'
  };

  useEffect(() => {
    const existing = getUserProfile();
    if (existing) {
      setProfile(existing);
      setChannelInput(existing.channelHandle || '');
      setBrandVoice(existing.identity.brandVoice);
      setTargetAudience(existing.identity.targetAudience);
      setManifesto(existing.identity.manifesto);
    }
  }, []);

  const handleConnect = async () => {
    if (!channelInput) return;
    setLoading(true);
    const data = await fetchChannelDeepData(channelInput);
    if (data) {
      const newProfile: UserProfile = {
        ...profile,
        channelName: data.title,
        channelHandle: data.customUrl,
        subscriberCount: data.subscribers,
        identity: {
          brandVoice: brandVoice || 'Professional, Deep, Analytical', // Defaults
          targetAudience: targetAudience || 'General Audience',
          manifesto: manifesto || 'To uncover the truth.'
        }
      };
      setProfile(newProfile);
      saveUserProfile(newProfile);
    }
    setLoading(false);
  };

  const handleSaveIdentity = () => {
    if (profile) {
      const updated: UserProfile = {
        ...profile,
        identity: {
          brandVoice,
          targetAudience,
          manifesto
        }
      };
      setProfile(updated);
      saveUserProfile(updated);
      alert(labels.saved);
    } else {
      // Create profile without channel connection if needed
      const newProfile: UserProfile = {
        identity: { brandVoice, targetAudience, manifesto }
      };
      setProfile(newProfile);
      saveUserProfile(newProfile);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col animate-fade-in">
      
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30">
          <Fingerprint className="text-white" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{labels.title}</h2>
          <p className="text-slate-400">{labels.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Channel Connection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-purple-500"></div>
             
             <h3 className="font-bold text-white mb-4 flex items-center gap-2">
               <Youtube className="text-red-500" /> {labels.connect}
             </h3>

             <div className="space-y-4">
                <input 
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  placeholder={labels.connectDesc}
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-red-500 outline-none"
                />
                <button 
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : labels.search}
                </button>
             </div>

             {profile?.channelName && (
               <div className="mt-6 pt-6 border-t border-white/5 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-800 mx-auto mb-3 flex items-center justify-center border-2 border-red-500 overflow-hidden">
                     {/* Placeholder for avatar if URL available later */}
                     <span className="text-2xl font-bold text-red-500">{profile.channelName[0]}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{profile.channelName}</h4>
                  <p className="text-slate-500 text-sm">{profile.channelHandle}</p>
                  <div className="mt-2 inline-block px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-mono font-bold">
                    {Number(profile.subscriberCount).toLocaleString()} Subs
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* Right Column: Brand Bible */}
        <div className="lg:col-span-2">
           <div className="glass-card rounded-3xl p-8 relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <ScrollText size={120} />
              </div>
              
              <h3 className="font-bold text-2xl text-white mb-6 flex items-center gap-2">
                <Target className="text-blue-400" /> {labels.brandBible}
              </h3>

              <div className="space-y-6 relative z-10">
                 
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-blue-400">{labels.voice}</label>
                    <input 
                      value={brandVoice}
                      onChange={(e) => setBrandVoice(e.target.value)}
                      placeholder={labels.voiceDesc}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-400">{labels.audience}</label>
                    <input 
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder={labels.audienceDesc}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">{labels.manifesto}</label>
                    <textarea 
                      value={manifesto}
                      onChange={(e) => setManifesto(e.target.value)}
                      placeholder={labels.manifestoDesc}
                      className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-emerald-500 outline-none transition-colors resize-none"
                    />
                 </div>

                 <div className="pt-4 flex justify-end">
                    <button 
                      onClick={handleSaveIdentity}
                      className="bg-white text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                       <Save size={18} /> {labels.save}
                    </button>
                 </div>

              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ChannelProfile;
