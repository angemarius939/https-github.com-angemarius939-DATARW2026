
import React, { useState, useEffect } from 'react';
import { Beneficiary, ViewConfig, Project } from '../types';
import { 
  Users, Search, Filter, Plus, MoreVertical, 
  MapPin, GraduationCap, Home, Calendar, 
  Download, UserCheck, UserPlus, X, Check, Loader2, 
  Sliders, Settings, User, Hash, Info, ChevronRight,
  FilterX
} from 'lucide-react';

interface BeneficiaryViewProps {
  initialBeneficiaries: Beneficiary[];
  setGlobalBeneficiaries: (b: Beneficiary[]) => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  activeProjectId: string | null;
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
  const [filterStatus, setFilterStatus] = useState('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [tempConfig, setTempConfig] = useState<ViewConfig>(config);

  useEffect(() => { setTempConfig(config); }, [config]);

  // Form State
  const [newBen, setNewBen] = useState<Partial<Beneficiary>>({
    firstName: '',
    lastName: '',
    location: 'Kigali City',
    gender: 'Female',
    age: 0,
    educationLevel: 'None',
    householdSize: 1,
    status: 'Active'
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(initialBeneficiaries);

  // Filter logic
  const filteredBeneficiaries = beneficiaries.filter(b => {
    const matchesSearch = `${b.firstName} ${b.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = filterDistrict === 'All' || b.location === filterDistrict;
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    
    // Context Logic: Filter by project association if a project is active
    const activeProject = projects.find(p => p.id === activeProjectId);
    const matchesProject = !activeProjectId || b.programs.some(p => p === activeProject?.name);
    
    return matchesSearch && matchesDistrict && matchesStatus && matchesProject;
  });

  const handleRegister = () => {
    if (!newBen.firstName || !newBen.lastName || !newBen.location || !newBen.age) {
        onNotify("Please fill in all mandatory demographic fields", "error");
        return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      const activeProject = projects.find(p => p.id === activeProjectId);
      
      const b: Beneficiary = {
        id: 'ben-' + Date.now(),
        firstName: newBen.firstName || '',
        lastName: newBen.lastName || '',
        gender: (newBen.gender as any) || 'Female',
        age: Number(newBen.age) || 0,
        location: newBen.location || 'Unknown',
        status: 'Active',
        enrollmentDate: new Date().toISOString().split('T')[0],
        educationLevel: newBen.educationLevel as any || 'None',
        householdSize: Number(newBen.householdSize) || 1,
        programs: activeProject ? [activeProject.name] : ['General Registration'],
        cases: []
      };

      const updated = [b, ...beneficiaries];
      setBeneficiaries(updated);
      setGlobalBeneficiaries(updated);
      setIsRegisterModalOpen(false);
      setIsSaving(false);
      
      // Reset form
      setNewBen({
        firstName: '',
        lastName: '',
        location: 'Kigali City',
        gender: 'Female',
        age: 0,
        educationLevel: 'None',
        householdSize: 1,
        status: 'Active'
      });
      
      onNotify(`Demographic profile for ${b.firstName} synced successfully`, "success");
    }, 800);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterDistrict('All');
    setFilterStatus('All');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Dynamic Header based on Organization Context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] mb-3">
             <div className="w-4 h-0.5 bg-indigo-600"></div>
             Beneficiary Management Hub
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{tempConfig.title}</h1>
          <p className="text-slate-500 font-medium mt-1 max-w-xl">{tempConfig.subtitle}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Sliders size={16} /> Configure
          </button>
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100"
          >
            <UserPlus size={18} /> Enroll Profile
          </button>
        </div>
      </div>

      {/* KPI Stats Belt */}
      {!config.hiddenElements.includes('stats') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Registered Context', value: filteredBeneficiaries.length, icon: <Users size={20}/>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Active Status', value: filteredBeneficiaries.filter(b => b.status === 'Active').length, icon: <UserCheck size={20}/>, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Household Average', value: filteredBeneficiaries.length > 0 ? (filteredBeneficiaries.reduce((acc, b) => acc + (b.householdSize || 0), 0) / filteredBeneficiaries.length).toFixed(1) : '0', icon: <Home size={20}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Regions Covered', value: new Set(filteredBeneficiaries.map(b => b.location)).size, icon: <MapPin size={20}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>{stat.icon}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, ID or location..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl">
            <MapPin size={16} className="text-slate-400" />
            <select className="bg-transparent text-xs font-bold uppercase text-slate-600 outline-none cursor-pointer" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}>
                <option value="All">Districts: All</option>
                <option value="Musanze">Musanze</option>
                <option value="Gasabo">Gasabo</option>
                <option value="Kicukiro">Kicukiro</option>
                <option value="Nyarugenge">Nyarugenge</option>
                <option value="Huye">Huye</option>
                <option value="Kayonza">Kayonza</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl">
            <Filter size={16} className="text-slate-400" />
            <select className="bg-transparent text-xs font-bold uppercase text-slate-600 outline-none cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">Status: All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
            </select>
          </div>
          <button onClick={resetFilters} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all" title="Reset Filters">
            <FilterX size={20} />
          </button>
        </div>
      </div>

      {/* Main Registry Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Individual Profile</th>
                <th className="px-8 py-5">Demographics</th>
                <th className="px-8 py-5">Primary Residence</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBeneficiaries.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-black text-sm shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {b.firstName.charAt(0)}{b.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-base">{b.firstName} {b.lastName}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-2">
                           <Calendar size={10} /> Enrolled {new Date(b.enrollmentDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                       <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${b.gender === 'Female' ? 'bg-pink-50 text-pink-700 border-pink-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{b.gender}</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{b.age} Years Old</span>
                       </div>
                       <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                          <GraduationCap size={12}/> {b.educationLevel}
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                       <MapPin size={16} className="text-slate-300" />
                       {b.location}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase mt-1">
                       <Home size={12}/> HH Size: {b.householdSize}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ring-1
                      ${b.status === 'Active' ? 'bg-green-50 text-green-700 ring-green-100' : 
                        b.status === 'Graduated' ? 'bg-indigo-50 text-indigo-700 ring-indigo-100' :
                        'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="View Full Profile">
                          <ChevronRight size={20} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBeneficiaries.length === 0 && (
          <div className="p-24 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Users size={40} />
             </div>
             <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No profiles found</h3>
             <p className="text-slate-400 mt-2">Adjust filters or register a new individual to the registry.</p>
             <button onClick={resetFilters} className="mt-6 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Clear all filters</button>
          </div>
        )}
      </div>

      {/* Profile Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
              <div className="p-8 bg-indigo-600 text-white flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                       <UserPlus size={28} /> Demographic Enrollment
                    </h3>
                    <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Beneficiary Profiling System</p>
                 </div>
                 <button onClick={() => setIsRegisterModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
              </div>

              <div className="p-10 overflow-y-auto custom-scrollbar space-y-8 flex-1">
                 {/* Project Context Reminder */}
                 <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                       <Settings size={20}/>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Enrollment Context</p>
                       <p className="text-sm font-black text-indigo-900">{activeProjectId ? `Project: ${projects.find(p => p.id === activeProjectId)?.name}` : 'Global Organizational Registry'}</p>
                    </div>
                 </div>

                 {/* Personal Info */}
                 <div className="space-y-5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Primary Identity</label>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <input 
                             placeholder="First Name" 
                             className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                             value={newBen.firstName} 
                             onChange={(e) => setNewBen({...newBen, firstName: e.target.value})} 
                          />
                       </div>
                       <div className="space-y-1.5">
                          <input 
                             placeholder="Last Name" 
                             className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                             value={newBen.lastName} 
                             onChange={(e) => setNewBen({...newBen, lastName: e.target.value})} 
                          />
                       </div>
                    </div>
                 </div>

                 {/* Vital Stats */}
                 <div className="space-y-5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Vital Statistics</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Gender</label>
                          <select 
                             className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-xs uppercase tracking-widest" 
                             value={newBen.gender} 
                             onChange={(e) => setNewBen({...newBen, gender: e.target.value as any})}
                          >
                             <option value="Male">Male</option>
                             <option value="Female">Female</option>
                             <option value="Other">Other</option>
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Age</label>
                          <input 
                             type="number" 
                             placeholder="Years" 
                             className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                             value={newBen.age || ''} 
                             onChange={(e) => setNewBen({...newBen, age: Number(e.target.value)})} 
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">HH Size</label>
                          <input 
                             type="number" 
                             placeholder="Members" 
                             className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                             value={newBen.householdSize || ''} 
                             onChange={(e) => setNewBen({...newBen, householdSize: Number(e.target.value)})} 
                          />
                       </div>
                    </div>
                 </div>

                 {/* Social Context */}
                 <div className="space-y-5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Social Context</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">District / Province</label>
                          <select 
                             className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
                             value={newBen.location} 
                             onChange={(e) => setNewBen({...newBen, location: e.target.value})}
                          >
                             <option value="Kigali City">Kigali City</option>
                             <option value="Musanze">Musanze</option>
                             <option value="Gasabo">Gasabo</option>
                             <option value="Kicukiro">Kicukiro</option>
                             <option value="Nyarugenge">Nyarugenge</option>
                             <option value="Huye">Huye</option>
                             <option value="Kayonza">Kayonza</option>
                             <option value="Rubavu">Rubavu</option>
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Education Level</label>
                          <select 
                             className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
                             value={newBen.educationLevel} 
                             onChange={(e) => setNewBen({...newBen, educationLevel: e.target.value as any})}
                          >
                             <option value="None">No Formal Education</option>
                             <option value="Primary">Primary Education</option>
                             <option value="Secondary">Secondary Education</option>
                             <option value="TVET">TVET / Technical</option>
                             <option value="University">University / Higher</option>
                          </select>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50 shrink-0">
                 <button onClick={() => setIsRegisterModalOpen(false)} className="px-6 py-4 text-xs font-black text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest">Discard</button>
                 <button 
                    onClick={handleRegister} 
                    disabled={isSaving} 
                    className="px-12 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl disabled:opacity-50 flex items-center gap-3"
                 >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                    Sync Profile
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* View Customizer Logic (Shared Drawer Style) */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
           <div className="relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                 <h3 className="text-xl font-black uppercase tracking-widest">UI Configuration</h3>
                 <button onClick={() => setIsConfigOpen(false)} className="bg-white/10 p-1 rounded-full"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">View Title</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black focus:ring-2 focus:ring-indigo-500 outline-none" value={tempConfig.title} onChange={(e) => setTempConfig({...tempConfig, title: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Context Description</label>
                    <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 font-medium" value={tempConfig.subtitle} onChange={(e) => setTempConfig({...tempConfig, subtitle: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Registry Modules</label>
                    <div className="space-y-4">
                       <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-colors">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Aggregate Analytics</span>
                          <input type="checkbox" className="w-6 h-6 accent-indigo-600 rounded-lg" checked={!tempConfig.hiddenElements.includes('stats')} onChange={(e) => {
                             const hidden = [...tempConfig.hiddenElements];
                             if (e.target.checked) setTempConfig({...tempConfig, hiddenElements: hidden.filter(h => h !== 'stats')});
                             else setTempConfig({...tempConfig, hiddenElements: [...hidden, 'stats']});
                          }} />
                       </label>
                    </div>
                 </div>
              </div>
              <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
                 <button onClick={() => setIsConfigOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-500 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 uppercase tracking-widest">Discard</button>
                 <button onClick={() => { onSaveConfig(tempConfig); setIsConfigOpen(false); }} className="flex-1 py-4 text-xs font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 uppercase tracking-widest">Apply View</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BeneficiaryView;
