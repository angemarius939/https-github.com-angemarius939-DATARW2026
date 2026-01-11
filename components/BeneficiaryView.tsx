

import React, { useState, useEffect } from 'react';
// Added Project to imports to fix type usage in props
import { Beneficiary, ViewConfig, Project } from '../types';
import { 
  Users, Search, Filter, Plus, MoreVertical, 
  MapPin, GraduationCap, Home, Calendar, 
  Download, UserCheck, UserPlus, X, Check, Loader2, Sliders, Settings
} from 'lucide-react';

interface BeneficiaryViewProps {
  initialBeneficiaries: Beneficiary[];
  setGlobalBeneficiaries: (b: Beneficiary[]) => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  activeProjectId: string | null;
  // Added projects to props interface to fix line 202 reference error
  projects: Project[];
  config: ViewConfig;
  onSaveConfig: (c: Partial<ViewConfig>) => void;
}

const BeneficiaryView: React.FC<BeneficiaryViewProps> = ({ 
  initialBeneficiaries, setGlobalBeneficiaries, onNotify, activeProjectId, projects, config, onSaveConfig 
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [tempConfig, setTempConfig] = useState<ViewConfig>(config);

  useEffect(() => { setTempConfig(config); }, [config]);

  const [newBen, setNewBen] = useState({ firstName: '', lastName: '', location: 'Musanze', gender: 'Female' as any });
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(initialBeneficiaries);

  // Filter based on context and user search
  const filteredBeneficiaries = beneficiaries.filter(b => {
    const matchesSearch = `${b.firstName} ${b.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = filterDistrict === 'All' || b.location === filterDistrict;
    
    // Project Logic: if activeProjectId is set, show only those who have this project in their programs
    // (In a real system, we'd have a project_beneficiaries join table)
    const matchesProject = !activeProjectId || b.programs.some(p => p.includes(activeProjectId) || p.toLowerCase().includes('clean water'));
    
    return matchesSearch && matchesDistrict && matchesProject;
  });

  const handleRegister = () => {
    if (!newBen.firstName || !newBen.lastName) return;
    setIsSaving(true);
    setTimeout(() => {
      const b: Beneficiary = {
        id: 'b' + Date.now(),
        ...newBen,
        age: 25,
        status: 'Active',
        enrollmentDate: new Date().toISOString().split('T')[0],
        educationLevel: 'Secondary',
        householdSize: 4,
        programs: activeProjectId ? [`Project ${activeProjectId}`] : ['General Program'],
        cases: []
      };
      const updated = [b, ...beneficiaries];
      setBeneficiaries(updated);
      setGlobalBeneficiaries(updated);
      setIsRegisterModalOpen(false);
      setIsSaving(false);
      onNotify(`Registered successfully under project context`, "success");
    }, 1000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Project Contextual Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{tempConfig.title}</h1>
          <p className="text-slate-500 font-medium">{tempConfig.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Sliders size={14} /> Customize View
          </button>
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
          >
            <UserPlus size={18} /> Register New
          </button>
        </div>
      </div>

      {/* Customizable Stats Section */}
      {!config.hiddenElements.includes('stats') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
          {[
            { label: 'Registered', value: filteredBeneficiaries.length, icon: <Users size={18}/>, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Enrolled Today', value: '3', icon: <Calendar size={18}/>, color: 'bg-green-50 text-green-600' },
            { label: 'Avg HH Size', value: '4.8', icon: <Home size={18}/>, color: 'bg-blue-50 text-blue-600' },
            { label: 'Risk Flagged', value: '0', icon: <Filter size={18}/>, color: 'bg-red-50 text-red-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-inner`}>{stat.icon}</div>
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Filter current list..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <select className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}>
              <option value="All">All Regions</option>
              <option value="Musanze">Musanze</option>
              <option value="Gasabo">Gasabo</option>
          </select>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Participant</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBeneficiaries.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-xs">{b.firstName.charAt(0)}{b.lastName.charAt(0)}</div><div><div className="font-bold text-slate-900">{b.firstName} {b.lastName}</div><div className="text-[10px] text-slate-400 font-bold uppercase">{b.gender}, {b.age}y</div></div></div></td>
                <td className="px-6 py-4 text-slate-600"><div className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-300" />{b.location}</div></td>
                <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{b.status}</span></td>
                <td className="px-6 py-4 text-right"><button className="text-slate-300 hover:text-indigo-600"><MoreVertical size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBeneficiaries.length === 0 && (
          <div className="p-20 text-center text-slate-300 font-medium">No records found for this project context.</div>
        )}
      </div>

      {/* View Customizer Panel */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
           <div className="relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                 <h3 className="text-lg font-black uppercase tracking-widest">Page Configurator</h3>
                 <button onClick={() => setIsConfigOpen(false)} className="bg-white/10 p-1 rounded-full"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Title</label>
                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={tempConfig.title} onChange={(e) => setTempConfig({...tempConfig, title: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description / Instructions</label>
                    <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24" value={tempConfig.subtitle} onChange={(e) => setTempConfig({...tempConfig, subtitle: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Module Visibility</label>
                    <div className="space-y-3">
                       <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                          <span className="text-xs font-bold text-slate-700">Summary Statistics</span>
                          <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={!tempConfig.hiddenElements.includes('stats')} onChange={(e) => {
                             const hidden = [...tempConfig.hiddenElements];
                             if (e.target.checked) setTempConfig({...tempConfig, hiddenElements: hidden.filter(h => h !== 'stats')});
                             else setTempConfig({...tempConfig, hiddenElements: [...hidden, 'stats']});
                          }} />
                       </label>
                    </div>
                 </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                 <button onClick={() => setIsConfigOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-100">Cancel</button>
                 <button onClick={() => { onSaveConfig(tempConfig); setIsConfigOpen(false); }} className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100">Save Changes</button>
              </div>
           </div>
        </div>
      )}

      {/* Register Modal (Standard) */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="p-8 pb-4 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-slate-900">Registration</h3>
                 <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={24}/></button>
              </div>
              <div className="p-8 pt-0 space-y-6 text-sm">
                 <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                    <Settings className="text-indigo-600" size={20}/>
                    {/* Accessing projects from props to fix line 202 error */}
                    <span className="text-xs font-bold text-indigo-800">Assigning to Context: <span className="underline">{activeProjectId ? projects.find(p => p.id === activeProjectId)?.name : 'Global Registry'}</span></span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <input placeholder="First Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={newBen.firstName} onChange={(e) => setNewBen({...newBen, firstName: e.target.value})} />
                    <input placeholder="Last Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={newBen.lastName} onChange={(e) => setNewBen({...newBen, lastName: e.target.value})} />
                 </div>
                 <button onClick={handleRegister} disabled={isSaving || !newBen.firstName} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                    Finalize Enrollment
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BeneficiaryView;
