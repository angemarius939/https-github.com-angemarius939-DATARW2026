
import React, { useState, useEffect, useMemo } from 'react';
import { Project, BudgetLine, ActivityLogEntry, ProjectActivity, Beneficiary, ProjectIndicator, IndicatorTarget } from '../types';
import { 
  FolderKanban, Plus, Search, Filter, MoreVertical, 
  X, Trash2, Calendar, Users, DollarSign, Layout, 
  History, Settings, ChevronRight, ArrowLeft, Save, Activity, FileText,
  CheckCircle, Target, List, Smartphone, ArrowRight, Play, Database,
  Pencil, AlertTriangle, CheckSquare, Clock, Link as LinkIcon, Check,
  UserPlus, UserCheck, GraduationCap, Home, Archive, Copy, AlertOctagon, Download, MapPin, Loader2, User,
  Trophy, ClipboardCheck, BarChart3, ChevronDown, Layers, Link2, Info, TrendingUp, Briefcase
} from 'lucide-react';

interface ProjectsViewProps {
  initialProjects: Project[];
  setGlobalProjects: (p: Project[]) => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  deepLinkProjectId?: string | null;
  clearDeepLink?: () => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ initialProjects, setGlobalProjects, onNotify, deepLinkProjectId, clearDeepLink }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [viewMode, setViewMode] = useState<'LIST' | 'WORKSPACE'>('LIST');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeMETab, setActiveMETab] = useState<'framework' | 'indicators' | 'tools'>('framework');

  const [filterStatus, setFilterStatus] = useState<'All' | 'On Track' | 'Delayed' | 'At Risk'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [beneficiarySearch, setBeneficiarySearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [settingsForm, setSettingsForm] = useState<Partial<Project>>({});
  const [newProjectData, setNewProjectData] = useState<Partial<Project>>({
    name: '',
    location: '',
    budget: 0,
    startDate: new Date().toISOString().split('T')[0],
    manager: ''
  });

  const [budgetLineForm, setBudgetLineForm] = useState<Partial<BudgetLine>>({
    code: '',
    description: '',
    category: 'Operational',
    allocated: 0,
    spent: 0
  });

  const [activityForm, setActivityForm] = useState<Partial<ProjectActivity>>({
    name: '',
    category: 'Implementation',
    status: 'Not Started',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    assignedTo: '',
    linkedOutputId: '',
    completionPercentage: 0
  });

  // Handle Deep Linking from Dashboard
  useEffect(() => {
    if (deepLinkProjectId) {
      const project = projects.find(p => p.id === deepLinkProjectId);
      if (project) {
        openWorkspace(project);
      }
      clearDeepLink?.();
    }
  }, [deepLinkProjectId]);

  // Sync state with parent
  useEffect(() => {
    setGlobalProjects(projects);
  }, [projects]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumSignificantDigits: 4 }).format(amount);
  };

  const handleCreateProject = () => {
    if (!newProjectData.name || !newProjectData.location) {
      onNotify("Please fill in required project fields", "error");
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectData.name || 'Untitled Project',
        location: newProjectData.location || 'Unknown',
        budget: newProjectData.budget || 0,
        spent: 0,
        progress: 0,
        status: 'On Track',
        beneficiaries: 0,
        startDate: newProjectData.startDate || new Date().toISOString().split('T')[0],
        manager: newProjectData.manager || 'Unassigned',
        budgetLines: [],
        indicators: [],
        activities: [],
        beneficiaryList: [],
        activityLog: [{
            id: Date.now().toString(),
            action: 'Project Created',
            details: `Project '${newProjectData.name}' initialized. Manager: ${newProjectData.manager || 'Unassigned'}.`,
            timestamp: new Date().toISOString(),
            user: 'Admin'
        }]
      };

      setProjects([newProject, ...projects]);
      setIsCreateModalOpen(false);
      setIsSaving(false);
      setNewProjectData({ name: '', location: '', budget: 0, startDate: new Date().toISOString().split('T')[0], manager: '' });
      onNotify("Project created successfully", "success");
    }, 1200);
  };

  const handleAddBudgetLine = () => {
    if (!activeProject || !budgetLineForm.description || !budgetLineForm.allocated) return;
    
    const newLine: BudgetLine = {
      id: 'bl-' + Date.now(),
      code: budgetLineForm.code || 'UN-01',
      description: budgetLineForm.description || '',
      category: budgetLineForm.category as any,
      allocated: budgetLineForm.allocated || 0,
      spent: budgetLineForm.spent || 0,
      variance: (budgetLineForm.allocated || 0) - (budgetLineForm.spent || 0)
    };

    const updatedProject: Project = {
      ...activeProject,
      budgetLines: [...(activeProject.budgetLines || []), newLine],
      budget: (activeProject.budget || 0) + (budgetLineForm.allocated || 0),
      spent: (activeProject.spent || 0) + (budgetLineForm.spent || 0)
    };

    const updatedProjects = projects.map(p => p.id === activeProject.id ? updatedProject : p);
    setProjects(updatedProjects);
    setActiveProject(updatedProject);
    setIsBudgetModalOpen(false);
    setBudgetLineForm({ code: '', description: '', category: 'Operational', allocated: 0, spent: 0 });
    onNotify("Budget line added", "success");
  };

  const handleAddActivity = () => {
    if (!activeProject || !activityForm.name) return;
    
    const newActivity: ProjectActivity = {
      id: 'act-' + Date.now(),
      name: activityForm.name || '',
      category: activityForm.category as any,
      status: activityForm.status as any,
      startDate: activityForm.startDate || '',
      endDate: activityForm.endDate || '',
      assignedTo: activityForm.assignedTo || 'Unassigned',
      linkedOutputId: activityForm.linkedOutputId || '',
      completionPercentage: activityForm.completionPercentage || 0
    };

    const updatedProject: Project = {
      ...activeProject,
      activities: [...(activeProject.activities || []), newActivity],
      progress: Math.round([...(activeProject.activities || []), newActivity].reduce((acc, a) => acc + a.completionPercentage, 0) / ([...(activeProject.activities || []), newActivity].length || 1))
    };

    const updatedProjects = projects.map(p => p.id === activeProject.id ? updatedProject : p);
    setProjects(updatedProjects);
    setActiveProject(updatedProject);
    setIsActivityModalOpen(false);
    setActivityForm({ name: '', category: 'Implementation', status: 'Not Started', startDate: new Date().toISOString().split('T')[0], endDate: '', assignedTo: '', linkedOutputId: '', completionPercentage: 0 });
    onNotify("Activity deployed", "success");
  };

  const openWorkspace = (project: Project) => {
    setActiveProject(project);
    setSettingsForm(JSON.parse(JSON.stringify(project)));
    setViewMode('WORKSPACE');
    setActiveTab('overview');
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              project.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || project.status === filterStatus;
        return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, filterStatus]);

  if (viewMode === 'WORKSPACE' && activeProject) {
      return (
        <div className="flex flex-col h-full animate-fade-in bg-white h-screen overflow-hidden relative">
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewMode('LIST')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-0.5">
                           Complex Project Environment
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                             <FolderKanban className="text-indigo-600" size={24}/>
                             {activeProject.name}
                        </h2>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onNotify("DQA Report Exported")} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Download size={20}/></button>
                    <button onClick={() => onNotify("Project Baseline Snapshotted")} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
                        <Briefcase size={16}/> Baseline
                    </button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg">
                        <Save size={16}/> Save Environment
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-64 bg-slate-50 border-r border-slate-200 py-6 px-3 flex flex-col gap-1 shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Workspace Controls</div>
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><Layout size={18} /> Dashboard</button>
                    <button onClick={() => setActiveTab('activities')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'activities' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><CheckSquare size={18} /> Activities</button>
                    <button onClick={() => setActiveTab('budget')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'budget' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><DollarSign size={18} /> Budget Lines</button>
                    <button onClick={() => setActiveTab('beneficiaries')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'beneficiaries' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><Users size={18} /> Beneficiaries</button>
                    
                    <div className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Performance & M&E</div>
                    <button onClick={() => setActiveTab('me_system')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'me_system' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><Target size={18} /> M&E Registry</button>
                    <button onClick={() => setActiveTab('activity_log')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'activity_log' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><History size={18} /> Audit Log</button>
                    <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><Settings size={18} /> Project Config</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
                    {activeTab === 'overview' && (
                        <div className="max-w-6xl space-y-8 animate-fade-in">
                             {/* Large Context Card */}
                             <div className="bg-indigo-900 rounded-[2rem] p-10 text-white relative overflow-hidden shadow-2xl">
                                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                   <div>
                                      <h3 className="text-4xl font-black mb-4 leading-tight">{activeProject.name} Performance Hub</h3>
                                      <p className="text-indigo-200 text-lg mb-8 leading-relaxed">Integrated monitoring of {activeProject.activities?.length || 0} activities across {activeProject.location}. Supporting {activeProject.beneficiaries.toLocaleString()} verified participants.</p>
                                      <div className="flex gap-4">
                                         <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 text-center min-w-[120px]">
                                            <p className="text-[10px] font-black uppercase text-indigo-300 mb-1">Execution</p>
                                            <p className="text-2xl font-black">{activeProject.progress}%</p>
                                         </div>
                                         <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 text-center min-w-[120px]">
                                            <p className="text-[10px] font-black uppercase text-indigo-300 mb-1">Burn Rate</p>
                                            <p className="text-2xl font-black">{Math.round((activeProject.spent / (activeProject.budget || 1)) * 100)}%</p>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                      {['On Track', 'Achieved', 'Operational', 'Verified'].map((label, idx) => (
                                         <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-center items-center">
                                            <CheckCircle className="text-indigo-400 mb-2" size={24} />
                                            <span className="text-xs font-bold">{label}</span>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                                <Layers className="absolute -bottom-12 -right-12 opacity-5" size={320} />
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
                                   <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Target size={32}/></div>
                                   <h4 className="font-black text-slate-900 text-lg mb-2">M&E Indicators</h4>
                                   <p className="text-sm text-slate-500 mb-6">Tracking {activeProject.indicators?.length || 0} outcome-level performance metrics.</p>
                                   <button onClick={() => setActiveTab('me_system')} className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">Verify Metrics <ChevronRight size={14}/></button>
                                </div>
                                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
                                   <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><DollarSign size={32}/></div>
                                   <h4 className="font-black text-slate-900 text-lg mb-2">Financial Health</h4>
                                   <p className="text-sm text-slate-500 mb-6">{activeProject.budgetLines?.length || 0} active budget lines under monitoring.</p>
                                   <button onClick={() => setActiveTab('budget')} className="text-green-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">Financial Review <ChevronRight size={14}/></button>
                                </div>
                                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
                                   <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Activity size={32}/></div>
                                   <h4 className="font-black text-slate-900 text-lg mb-2">Field Activities</h4>
                                   <p className="text-sm text-slate-500 mb-6">{activeProject.activities?.filter(a => a.status === 'In Progress').length || 0} activities currently in active implementation.</p>
                                   <button onClick={() => setActiveTab('activities')} className="text-amber-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">Ops Roadmap <ChevronRight size={14}/></button>
                                </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'budget' && (
                        <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900">Multi-Line Budgetary Control</h3>
                                 <p className="text-slate-500 font-medium">Categorized expenditure tracking and variance analysis.</p>
                              </div>
                              <button onClick={() => setIsBudgetModalOpen(true)} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-green-700 transition-all flex items-center gap-2">
                                 <Plus size={18}/> New Line Item
                              </button>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Allocation</p>
                                 <p className="text-xl font-black text-slate-900">{formatCurrency(activeProject.budget)}</p>
                              </div>
                              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Expended</p>
                                 <p className="text-xl font-black text-slate-900">{formatCurrency(activeProject.spent)}</p>
                              </div>
                              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Remaining</p>
                                 <p className="text-xl font-black text-green-600">{formatCurrency(activeProject.budget - activeProject.spent)}</p>
                              </div>
                              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Variance Status</p>
                                 <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-[9px] font-black uppercase">Within Limits</span>
                              </div>
                           </div>

                           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                              <table className="w-full text-left text-sm">
                                 <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                       <th className="px-6 py-5">Item Code</th>
                                       <th className="px-6 py-5">Description</th>
                                       <th className="px-6 py-5">Category</th>
                                       <th className="px-6 py-5 text-right">Allocated</th>
                                       <th className="px-6 py-5 text-right">Spent</th>
                                       <th className="px-6 py-5 text-right">Variance</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50">
                                    {(activeProject.budgetLines || []).map((line) => (
                                       <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                                          <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{line.code}</td>
                                          <td className="px-6 py-4 font-bold text-slate-900">{line.description}</td>
                                          <td className="px-6 py-4"><span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-black uppercase">{line.category}</span></td>
                                          <td className="px-6 py-4 text-right font-bold">{formatCurrency(line.allocated)}</td>
                                          <td className="px-6 py-4 text-right font-medium text-slate-600">{formatCurrency(line.spent)}</td>
                                          <td className={`px-6 py-4 text-right font-black ${line.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(line.variance)}</td>
                                       </tr>
                                    ))}
                                    {(activeProject.budgetLines || []).length === 0 && (
                                       <tr>
                                          <td colSpan={6} className="px-6 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic">No detailed budget lines initialized for this project.</td>
                                       </tr>
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                    )}

                    {activeTab === 'me_system' && (
                       <div className="animate-fade-in space-y-10 max-w-6xl mx-auto">
                          <div>
                             <h3 className="text-2xl font-black text-slate-900">M&E Periodic Performance Registry</h3>
                             <p className="text-slate-500 font-medium">Tracking time-series data against organizational targets.</p>
                          </div>

                          <div className="space-y-8">
                             {/* Example Complex Indicator Card */}
                             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
                                <div className="flex justify-between items-start mb-8">
                                   <div className="flex items-center gap-4">
                                      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><TrendingUp size={28}/></div>
                                      <div>
                                         <h4 className="text-xl font-black text-slate-900">Indicator 1.1: Percentage of targeted households with regular access to safe water</h4>
                                         <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Level: Outcome • Frequency: Quarterly • Source: Mobile HH Survey</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-3xl font-black text-indigo-600">85%</p>
                                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Achieved to Date</p>
                                   </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                   {[
                                      { period: 'Q1 2024', target: '20%', actual: '22%' },
                                      { period: 'Q2 2024', target: '40%', actual: '45%' },
                                      { period: 'Q3 2024', target: '60%', actual: '58%' },
                                      { period: 'Q4 2024', target: '80%', actual: '85%' },
                                   ].map((m, i) => (
                                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group overflow-hidden">
                                         <div className="relative z-10">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{m.period}</p>
                                            <div className="flex justify-between items-end">
                                               <div>
                                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Target: {m.target}</p>
                                                  <p className="text-xl font-black text-slate-900">Actual: {m.actual}</p>
                                               </div>
                                            </div>
                                         </div>
                                         <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-full opacity-50"></div>
                                      </div>
                                   ))}
                                </div>
                             </div>
                             
                             <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 text-slate-300 font-black uppercase tracking-widest text-sm">
                                Full results framework visualization engine active. Use "Customize View" to modify periodic tracking.
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'activities' && (
                        <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900">Operational Roadmap</h3>
                                 <p className="text-slate-500 font-medium">Granular activity tracking and resource allocation.</p>
                              </div>
                              <button onClick={() => setIsActivityModalOpen(true)} className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2">
                                 <Plus size={18}/> New Activity
                              </button>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                               {['Planning', 'Implementation', 'Monitoring', 'Closure'].map(cat => (
                                  <div key={cat} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                     <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center justify-between">
                                        {cat}
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-black">
                                           {activeProject.activities?.filter(a => a.category === cat).length || 0}
                                        </span>
                                     </h4>
                                     <div className="space-y-4">
                                        {(activeProject.activities || []).filter(a => a.category === cat).map(act => (
                                           <div key={act.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group">
                                              <p className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors">{act.name}</p>
                                              <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                                                 <span>{act.status}</span>
                                                 <span>{act.completionPercentage}%</span>
                                              </div>
                                              <div className="w-full bg-white h-1 rounded-full mt-2 overflow-hidden shadow-inner">
                                                 <div className="bg-amber-500 h-full transition-all duration-500" style={{width: `${act.completionPercentage}%`}}></div>
                                              </div>
                                           </div>
                                        ))}
                                     </div>
                                  </div>
                               ))}
                           </div>
                        </div>
                    )}
                    
                    {activeTab === 'beneficiaries' && (
                        <div className="animate-fade-in text-center p-20">
                            <Users size={64} className="mx-auto text-slate-200 mb-6" />
                            <h3 className="text-xl font-bold text-slate-900">Beneficiary Management</h3>
                            <p className="text-slate-500 mb-8">Detailed case management and participant tracking for {activeProject.name}.</p>
                            <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Access Registry</button>
                        </div>
                    )}

                    {activeTab === 'activity_log' && (
                       <div className="max-w-4xl mx-auto space-y-6">
                          <h3 className="text-xl font-black text-slate-900">Project Audit History</h3>
                          <div className="space-y-4">
                             {(activeProject.activityLog || []).map(log => (
                                <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex gap-4 items-start shadow-sm">
                                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"><History size={20}/></div>
                                   <div className="flex-1">
                                      <p className="font-bold text-slate-900">{log.action}</p>
                                      <p className="text-sm text-slate-500">{log.details}</p>
                                      <div className="mt-3 flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                         <span>{log.user}</span>
                                         <span>•</span>
                                         <span>{new Date(log.timestamp).toLocaleString()}</span>
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}
                </div>
            </div>

            {/* Budget Line Modal */}
            {isBudgetModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
                  <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                     <div className="p-8 bg-green-600 text-white flex justify-between items-center">
                        <div>
                           <h3 className="text-2xl font-black tracking-tight">New Budget Item</h3>
                           <p className="text-green-100 text-xs font-bold uppercase tracking-widest mt-1">Financial Allocation</p>
                        </div>
                        <button onClick={() => setIsBudgetModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
                     </div>
                     <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Item Code</label>
                              <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold" placeholder="e.g. PERS-001" value={budgetLineForm.code} onChange={(e) => setBudgetLineForm({...budgetLineForm, code: e.target.value})} />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expense Type</label>
                              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold" value={budgetLineForm.category} onChange={(e) => setBudgetLineForm({...budgetLineForm, category: e.target.value as any})}>
                                 <option value="Personnel">Personnel</option>
                                 <option value="Operational">Operational</option>
                                 <option value="Equipment">Equipment</option>
                                 <option value="Travel">Travel</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                           <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold" placeholder="e.g. Fuel for project vehicles" value={budgetLineForm.description} onChange={(e) => setBudgetLineForm({...budgetLineForm, description: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Allocated (RWF)</label>
                              <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold" value={budgetLineForm.allocated} onChange={(e) => setBudgetLineForm({...budgetLineForm, allocated: parseInt(e.target.value) || 0})} />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expended (RWF)</label>
                              <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold" value={budgetLineForm.spent} onChange={(e) => setBudgetLineForm({...budgetLineForm, spent: parseInt(e.target.value) || 0})} />
                           </div>
                        </div>
                     </div>
                     <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                        <button onClick={() => setIsBudgetModalOpen(false)} className="px-6 py-3 text-sm font-black text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest">Cancel</button>
                        <button onClick={handleAddBudgetLine} className="px-10 py-3 bg-green-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-100">Initialize Line</button>
                     </div>
                  </div>
               </div>
            )}

            {/* Activity Modal */}
            {isActivityModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
                  <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                     <div className="p-8 bg-amber-500 text-white flex justify-between items-center">
                        <div>
                           <h3 className="text-2xl font-black tracking-tight">Activity Deployment</h3>
                           <p className="text-amber-100 text-xs font-bold uppercase tracking-widest mt-1">Field Implementation</p>
                        </div>
                        <button onClick={() => setIsActivityModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
                     </div>
                     <div className="p-8 space-y-6">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Activity Identity</label>
                           <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold" placeholder="e.g. Community Health Training" value={activityForm.name} onChange={(e) => setActivityForm({...activityForm, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Operational Stage</label>
                              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={activityForm.category} onChange={(e) => setActivityForm({...activityForm, category: e.target.value as any})}>
                                 <option value="Planning">Planning</option>
                                 <option value="Implementation">Implementation</option>
                                 <option value="Monitoring">Monitoring</option>
                                 <option value="Closure">Closure</option>
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Completion (%)</label>
                              <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={activityForm.completionPercentage} onChange={(e) => setActivityForm({...activityForm, completionPercentage: parseInt(e.target.value) || 0})} />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Focal Point / Lead</label>
                           <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold" placeholder="Assigned Staff Name" value={activityForm.assignedTo} onChange={(e) => setActivityForm({...activityForm, assignedTo: e.target.value})} />
                        </div>
                     </div>
                     <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                        <button onClick={() => setIsActivityModalOpen(false)} className="px-6 py-3 text-sm font-black text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest">Discard</button>
                        <button onClick={handleAddActivity} className="px-10 py-3 bg-amber-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-600 transition-all shadow-xl shadow-amber-100">Activate Activity</button>
                     </div>
                  </div>
               </div>
            )}
        </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in pb-20">
      <div className="flex justify-between items-end mb-12">
        <div>
           <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mb-3">Organization Portfolio</div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Integrated Projects</h1>
           <p className="text-slate-500 font-medium text-lg mt-1">Manage complex NGO programs with multi-level monitoring.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-2xl">
          <Plus size={20} /> Initialize Program
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search programs by name, manager or location..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 border-none rounded-2xl">
           <Filter size={18} className="text-slate-400" />
           <select 
             className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer pr-4"
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value as any)}
           >
              <option value="All">All Statuses</option>
              <option value="On Track">On Track</option>
              <option value="Delayed">Delayed</option>
              <option value="At Risk">At Risk</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredProjects.map(project => (
          <div key={project.id} onClick={() => openWorkspace(project)} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full">
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><FolderKanban size={28} /></div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{project.location}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                   <span>Overall Delivery</span>
                   <span className="text-indigo-600">{project.progress}%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{width: `${project.progress}%`}}></div>
                 </div>
                 <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Budget</p>
                       <div className="flex items-center gap-2 text-sm font-black text-slate-900"><DollarSign size={14} className="text-indigo-400" />{(project.budget/1000000).toFixed(1)}M</div>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activities</p>
                       <div className="flex items-center gap-2 text-sm font-black text-slate-900"><CheckSquare size={14} className="text-indigo-400" />{project.activities?.length || 0} items</div>
                    </div>
                 </div>
              </div>
            </div>
            <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex justify-between items-center group-hover:bg-indigo-50/50 transition-colors">
               <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black uppercase text-indigo-600 shadow-sm">{project.manager?.charAt(0) || 'U'}</div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PM: {project.manager || 'Unassigned'}</span>
               </div>
               <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${project.status === 'On Track' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{project.status}</span>
            </div>
          </div>
        ))}
      </div>

       {isCreateModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
             <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                   <div>
                      <h3 className="text-2xl font-black tracking-tight">Initialize Program</h3>
                      <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-1">Platform Orchestration</p>
                   </div>
                   <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Program Identity</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300" placeholder="e.g. Resilience & WASH Phase II" value={newProjectData.name} onChange={(e) => setNewProjectData({...newProjectData, name: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Regional Context</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300" placeholder="Location (e.g. Northern Province, Rwanda)" value={newProjectData.location} onChange={(e) => setNewProjectData({...newProjectData, location: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Program Focal Point</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300" placeholder="Manager Name" value={newProjectData.manager} onChange={(e) => setNewProjectData({...newProjectData, manager: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Launch Date</label>
                          <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" value={newProjectData.startDate} onChange={(e) => setNewProjectData({...newProjectData, startDate: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Envelope (RWF)</label>
                          <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" placeholder="0" value={newProjectData.budget || ''} onChange={(e) => setNewProjectData({...newProjectData, budget: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>
                </div>
                <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                    <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-3 text-sm font-black text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest">Cancel</button>
                    <button onClick={handleCreateProject} disabled={isSaving || !newProjectData.name} className="px-10 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl disabled:opacity-50">
                      {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Initialize Node'}
                    </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export default ProjectsView;
