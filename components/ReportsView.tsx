
import React, { useState } from 'react';
import { 
  PieChart, BarChart2, FileText, Download, 
  Plus, Calendar, ArrowRight, CheckCircle, 
  Loader2, Sparkles, Filter, Search, Sliders, X
} from 'lucide-react';
import { ViewConfig } from '../types';

interface ReportsViewProps {
  activeProjectId: string | null;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  config: ViewConfig;
  onSaveConfig: (c: Partial<ViewConfig>) => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ activeProjectId, onNotify, config, onSaveConfig }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReportName, setActiveReportName] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<ViewConfig>(config);

  const templates = [
    { title: 'Project Progress Report', desc: 'Summary of activities and budget for this context.', icon: <BarChart2 size={24} className="text-indigo-600"/>, color: 'indigo' },
    { title: 'Beneficiary Impact Brief', desc: 'KPI achievements and participation analytics.', icon: <PieChart size={24} className="text-green-600"/>, color: 'green' },
    { title: 'Data Audit Summary', desc: 'DQA scores and survey response reliability.', icon: <FileText size={24} className="text-amber-600"/>, color: 'amber' },
  ];

  const handleGenerate = (title: string) => {
    setActiveReportName(title);
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onNotify(`${title} compiled for selected context`, "success");
    }, 2500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{tempConfig.title}</h1>
          <p className="text-slate-500 font-medium">{tempConfig.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsConfigOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Sliders size={14} /> Customize Page
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {templates.map((t, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-20"></div>
            <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-all`}>
              {t.icon}
            </div>
            <h3 className="font-black text-slate-900 mb-2">{t.title}</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">{t.desc}</p>
            <button 
              onClick={() => handleGenerate(t.title)}
              className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all"
            >
              Generate <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
          <Sparkles size={300} />
        </div>
        <div className="flex-1 space-y-6 relative z-10">
          <div className="bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase w-fit tracking-[0.3em] border border-indigo-500/30">Intelligence Hub</div>
          <h2 className="text-4xl font-black leading-tight">Advanced AI Insights Engine</h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">Leverage high-performance AI to analyze {activeProjectId ? 'this specific project' : 'cross-organizational data'} for hidden patterns, risks, and predictive outcomes.</p>
          <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all shadow-xl">Engage Analysis</button>
        </div>
      </div>

      {/* Config Drawer */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
           <div className="relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                 <h3 className="text-lg font-black uppercase tracking-widest">Reports Config</h3>
                 <button onClick={() => setIsConfigOpen(false)} className="bg-white/10 p-1 rounded-full"><X size={20}/></button>
              </div>
              <div className="flex-1 p-6 space-y-8">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Report Hub Title</label>
                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" value={tempConfig.title} onChange={(e) => setTempConfig({...tempConfig, title: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Context Info</label>
                    <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none h-24" value={tempConfig.subtitle} onChange={(e) => setTempConfig({...tempConfig, subtitle: e.target.value})} />
                 </div>
              </div>
              <div className="p-6 bg-slate-50 border-t flex gap-3">
                 <button onClick={() => setIsConfigOpen(false)} className="flex-1 py-3 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl">Discard</button>
                 <button onClick={() => { onSaveConfig(tempConfig); setIsConfigOpen(false); }} className="flex-1 py-3 text-xs font-bold text-white bg-indigo-600 rounded-xl shadow-lg">Apply Settings</button>
              </div>
           </div>
        </div>
      )}

      {isGenerating && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 text-center max-w-sm animate-scale-in">
             <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center relative overflow-hidden">
                <Loader2 className="animate-spin text-indigo-600 z-10" size={48} />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent"></div>
             </div>
             <h4 className="font-black text-2xl text-slate-900">Processing Hub Data</h4>
             <p className="text-slate-500 font-medium text-sm">Validating metrics for {activeReportName} against live Rwandan field data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
