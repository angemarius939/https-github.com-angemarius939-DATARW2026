
import React, { useState, useEffect, useMemo } from 'react';
import { Project, BudgetLine, ActivityLogEntry, ProjectActivity, Beneficiary, ProjectIndicator, IndicatorTarget } from '../types';
import { 
  FolderKanban, Plus, Search, Filter, MoreVertical, 
  X, Trash2, Calendar, Users, DollarSign, Layout, 
  History, Settings, ChevronRight, ArrowLeft, Save, Activity, FileText,
  CheckCircle, Target, List, Smartphone, ArrowRight, Play, Database,
  Pencil, AlertTriangle, CheckSquare, Clock, Link as LinkIcon, Check,
  UserPlus, UserCheck, GraduationCap, Home, Archive, Copy, AlertOctagon, Download, MapPin, Loader2, User,
  Trophy, ClipboardCheck, BarChart3, ChevronDown, Layers, Link2, Info, TrendingUp, Briefcase, ExternalLink,
  ShieldCheck, Zap, LineChart, Network
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
  const [activeMETab, setActiveMETab] = useState<'indicators' | 'framework'>('indicators');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isLinkIndicatorModalOpen, setIsLinkIndicatorModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Linking state
  const [linkingLogframeId, setLinkingLogframeId] = useState<string | null>(null);

  // Editing states
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'On Track' | 'Delayed' | 'At Risk'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Settings Form State
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

  // Mock Logframe Outputs
  const logframeOutputs = [
    { id: 'out-1.1', code: 'Output 1.1', text: 'Infrastructure established and community sites operational' },
    { id: 'out-1.2', code: 'Output 1.2', text: 'Technical training for local maintenance committees completed' },
    { id: 'out-2.1', code: 'Output 2.1', text: 'Community awareness of hygiene and sanitation increased' },
    { id: 'out-2.2', code: 'Output 2.2', text: 'Regional water management policy recommendations drafted' },
  ];

  // Initialize Workspace with Indicators if none exist
  useEffect(() => {
    if (activeProject && (!activeProject.indicators || activeProject.indicators.length === 0)) {
        const mockIndicators: ProjectIndicator[] = [
            {
                id: 'ind-1',
                code: 'KPI 1.1',
                name: '% of households with access to basic water services',
                level: 'Outcome',
                unit: 'Percentage',
                frequency: 'Quarterly',
                baseline: 45,
                overallTarget: 85,
                achieved: 62,
                dataSource: 'Household Survey',
                responsible: 'M&E Officer',
                linkedLogframeId: 'out-1.1',
                periodicData: [
                    { period: 'Q1 2024', target: 50, actual: 48 },
                    { period: 'Q2 2024', target: 55, actual: 58 },
                    { period: 'Q3 2024', target: 60, actual: 62 },
                    { period: 'Q4 2024', target: 65, actual: 0 }
                ]
            },
            {
                id: 'ind-2',
                code: 'KPI 2.1',
                name: 'Number of community members trained in sanitation',
                level: 'Output',
                unit: 'Individuals',
                frequency: 'Monthly',
                baseline: 0,
                overallTarget: 1200,
                achieved: 850,
                dataSource: 'Training Attendance Logs',
                responsible: 'Field Coordinator',
                linkedLogframeId: 'out-1.2',
                periodicData: [
                    { period: 'Jan 2024', target: 100, actual: 120 },
                    { period: 'Feb 2024', target: 100, actual: 95 },
                    { period: 'Mar 2024', target: 100, actual: 110 }
                ]
            }
        ];
        setActiveProject({ ...activeProject, indicators: mockIndicators });
    }
  }, [activeProject?.id]);

  useEffect(() => {
    if (deepLinkProjectId) {
      const project = projects.find(p => p.id === deepLinkProjectId);
      if (project) openWorkspace(project);
      clearDeepLink?.();
    }
  }, [deepLinkProjectId]);

  useEffect(() => {
    setGlobalProjects(projects);
  }, [projects]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumSignificantDigits: 4 }).format(amount);
  };

  const openWorkspace = (project: Project) => {
    setActiveProject(project);
    setSettingsForm({
      name: project.name,
      location: project.location,
      manager: project.manager,
      status: project.status,
      startDate: project.startDate
    });
    setViewMode('WORKSPACE');
    setActiveTab('overview');
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
            details: `Project '${newProjectData.name}' initialized.`,
            timestamp: new Date().toISOString(),
            user: 'Admin'
        }]
      };

      setProjects([newProject, ...projects]);
      setIsCreateModalOpen(false);
      setIsSaving(false);
      setNewProjectData({ name: '', location: '', budget: 0, startDate: new Date().toISOString().split('T')[0], manager: '' });
      onNotify("Project created successfully", "success");
    }, 800);
  };

  const handleUpdateSettings = () => {
    if (!activeProject) return;
    setIsSaving(true);
    setTimeout(() => {
        const updatedProject = {
            ...activeProject,
            ...settingsForm,
            activityLog: [
                {
                    id: 'log-' + Date.now(),
                    action: 'Settings Updated',
                    details: 'Project metadata and configuration updated by administrator.',
                    timestamp: new Date().toISOString(),
                    user: 'Admin'
                },
                ...(activeProject.activityLog || [])
            ]
        } as Project;

        const updatedProjects = projects.map(p => p.id === activeProject.id ? updatedProject : p);
        setProjects(updatedProjects);
        setActiveProject(updatedProject);
        setIsSaving(false);
        onNotify("Project configuration synced", "success");
    }, 1000);
  };

  const handleOpenActivityModal = (activity?: ProjectActivity) => {
    if (activity) {
      setEditingActivityId(activity.id);
      setActivityForm({ ...activity });
    } else {
      setEditingActivityId(null);
      setActivityForm({
        name: '',
        category: 'Implementation',
        status: 'Not Started',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        assignedTo: '',
        linkedOutputId: '',
        completionPercentage: 0
      });
    }
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = () => {
    if (!activeProject || !activityForm.name) return;
    
    setIsSaving(true);
    setTimeout(() => {
      let updatedActivities = [...(activeProject.activities || [])];
      
      if (editingActivityId) {
        updatedActivities = updatedActivities.map(a => a.id === editingActivityId ? { ...a, ...activityForm } as ProjectActivity : a);
      } else {
        const newActivity: ProjectActivity = {
          id: 'act-' + Date.now(),
          ...activityForm as ProjectActivity
        };
        updatedActivities.push(newActivity);
      }

      const updatedProject: Project = {
        ...activeProject,
        activities: updatedActivities,
        progress: Math.round(updatedActivities.reduce((acc, a) => acc + (a.completionPercentage || 0), 0) / (updatedActivities.length || 1)),
        activityLog: [
            {
                id: 'log-' + Date.now(),
                action: editingActivityId ? 'Activity Updated' : 'Activity Deployed',
                details: `Activity '${activityForm.name}' state change registered.`,
                timestamp: new Date().toISOString(),
                user: 'Admin'
            },
            ...(activeProject.activityLog || [])
        ]
      };

      const updatedProjects = projects.map(p => p.id === activeProject.id ? updatedProject : p);
      setProjects(updatedProjects);
      setActiveProject(updatedProject);
      setIsActivityModalOpen(false);
      setIsSaving(false);
      onNotify(editingActivityId ? "Activity updated" : "Activity deployed", "success");
    }, 600);
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
      spent: (activeProject.spent || 0) + (budgetLineForm.spent || 0),
      activityLog: [
          {
              id: 'log-' + Date.now(),
              action: 'Budget Line Added',
              details: `New financial node '${newLine.code}' initialized for ${formatCurrency(newLine.allocated)}.`,
              timestamp: new Date().toISOString(),
              user: 'Admin'
          },
          ...(activeProject.activityLog || [])
      ]
    };

    const updatedProjects = projects.map(p => p.id === activeProject.id ? updatedProject : p);
    setProjects(updatedProjects);
    setActiveProject(updatedProject);
    setIsBudgetModalOpen(false);
    setBudgetLineForm({ code: '', description: '', category: 'Operational', allocated: 0, spent: 0 });
    onNotify("Budget line added", "success");
  };

  const handleLinkIndicator = (indicatorId: string) => {
    if (!activeProject || !linkingLogframeId) return;

    const updatedIndicators = (activeProject.indicators || []).map(ind => 
      ind.id === indicatorId ? { ...ind, linkedLogframeId: linkingLogframeId } : ind
    );

    const updatedProject: Project = {
      ...activeProject,
      indicators: updatedIndicators,
      activityLog: [
        {
          id: 'log-' + Date.now(),
          action: 'Indicator Linked',
          details: `Indicator linked to Logframe Output ${linkingLogframeId}.`,
          timestamp: new Date().toISOString(),
          user: 'Admin'
        },
        ...(activeProject.activityLog || [])
      ]
    };

    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === activeProject.id ? updatedProject : p));
    onNotify("Indicator successfully associated with Logframe element");
  };

  const handleUnlinkIndicator = (indicatorId: string) => {
    if (!activeProject) return;

    const updatedIndicators = (activeProject.indicators || []).map(ind => 
      ind.id === indicatorId ? { ...ind, linkedLogframeId: undefined } : ind
    );

    const updatedProject: Project = {
      ...activeProject,
      indicators: updatedIndicators
    };

    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === activeProject.id ? updatedProject : p));
    onNotify("Indicator association removed", "error");
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
            {/* Workspace Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewMode('LIST')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-0.5">
                           Live Project Node
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                             <FolderKanban className="text-indigo-600" size={24}/>
                             {activeProject.name}
                        </h2>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onNotify("DQA Report Exported")} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Export Performance Report"><Download size={20}/></button>
                    <button onClick={handleUpdateSettings} disabled={isSaving} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50">
                        {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                        Sync Workspace
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Workspace Sidebar */}
                <div className="w-64 bg-slate-50 border-r border-slate-200 py-6 px-3 flex flex-col gap-1 shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Management</div>
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><Layout size={18} /> Dashboard</button>
                    <button onClick={() => setActiveTab('activities')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'activities' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><CheckSquare size={18} /> Activities</button>
                    <button onClick={() => setActiveTab('budget')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'budget' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><DollarSign size={18} /> Budget Lines</button>
                    
                    <div className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">M&E & Performance</div>
                    <button onClick={() => setActiveTab('me_system')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'me_system' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><Target size={18} /> M&E Registry</button>
                    <button onClick={() => setActiveTab('activity_log')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'activity_log' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><History size={18} /> Audit Log</button>
                    <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><Settings size={18} /> Project Config</button>
                </div>

                {/* Workspace Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
                    {activeTab === 'overview' && (
                        <div className="max-w-6xl space-y-8 animate-fade-in pb-12">
                             <div className="bg-indigo-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
                                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                   <div>
                                      <h3 className="text-4xl font-black mb-4 leading-tight">{activeProject.name}</h3>
                                      <p className="text-indigo-200 text-lg mb-8 max-w-sm">Integrated performance synthesis for operations in {activeProject.location}.</p>
                                      <div className="flex gap-4">
                                         <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                                            <p className="text-[10px] font-black uppercase text-indigo-300 mb-1 tracking-widest">Execution</p>
                                            <p className="text-3xl font-black">{activeProject.progress}%</p>
                                         </div>
                                         <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                                            <p className="text-[10px] font-black uppercase text-indigo-300 mb-1 tracking-widest">Status</p>
                                            <p className="text-lg font-black uppercase">{activeProject.status}</p>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                      {['Activities', 'M&E Metrics', 'Budget Lines', 'Field Data'].map((label, idx) => (
                                         <div key={idx} className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col justify-center items-center hover:bg-white/10 transition-colors">
                                            <ShieldCheck className="text-indigo-400 mb-2" size={28} />
                                            <span className="text-xs font-black uppercase tracking-widest">{label}</span>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                                <Layers className="absolute -bottom-12 -right-12 opacity-5" size={320} />
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div onClick={() => setActiveTab('activities')} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-all cursor-pointer">
                                   <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><CheckSquare size={32}/></div>
                                   <h4 className="font-black text-slate-900 text-lg mb-2">Activity Tasks</h4>
                                   <p className="text-sm text-slate-500 mb-6">{activeProject.activities?.length || 0} implementation nodes active.</p>
                                   <button className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">Manage Grid <ChevronRight size={14}/></button>
                                </div>
                                <div onClick={() => setActiveTab('me_system')} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-all cursor-pointer">
                                   <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Target size={32}/></div>
                                   <h4 className="font-black text-slate-900 text-lg mb-2">M&E Indicators</h4>
                                   <p className="text-sm text-slate-500 mb-6">Outcome verification & periodic tracking engine.</p>
                                   <button className="text-green-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">Verify Metrics <ChevronRight size={14}/></button>
                                </div>
                                <div onClick={() => setActiveTab('budget')} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-all cursor-pointer">
                                   <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><DollarSign size={32}/></div>
                                   <h4 className="font-black text-slate-900 text-lg mb-2">Finance Node</h4>
                                   <p className="text-sm text-slate-500 mb-6">Current burn rate and multi-line item tracking.</p>
                                   <button className="text-amber-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">Financials <ChevronRight size={14}/></button>
                                </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'activities' && (
                        <div className="animate-fade-in space-y-8 max-w-6xl mx-auto pb-12">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900">Activity Roadmap</h3>
                                 <p className="text-slate-500 font-medium">Link implementation tasks directly to Logframe Outputs to verify progress.</p>
                              </div>
                              <button onClick={() => handleOpenActivityModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                                 <Plus size={18}/> Deploy Node
                              </button>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                               {['Planning', 'Implementation', 'Monitoring', 'Closure'].map(cat => (
                                  <div key={cat} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 h-fit">
                                     <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center justify-between">
                                        {cat}
                                        <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-600 font-black">
                                           {activeProject.activities?.filter(a => a.category === cat).length || 0}
                                        </span>
                                     </h4>
                                     <div className="space-y-4">
                                        {(activeProject.activities || []).filter(a => a.category === cat).map(act => {
                                           const linkedOutput = logframeOutputs.find(o => o.id === act.linkedOutputId);
                                           return (
                                              <div 
                                                key={act.id} 
                                                onClick={() => handleOpenActivityModal(act)}
                                                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer group relative"
                                              >
                                                 <div className="flex justify-between items-start gap-4 mb-2">
                                                    <div className="flex-1">
                                                       <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors leading-tight mb-2">{act.name}</p>
                                                       {linkedOutput ? (
                                                          <div className="mb-3">
                                                             <span className="bg-indigo-50 text-indigo-700 text-[8px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit border border-indigo-100" title={linkedOutput.text}>
                                                                <Link2 size={10}/> {linkedOutput.code}
                                                             </span>
                                                          </div>
                                                       ) : (
                                                          <div className="mb-3">
                                                             <span className="bg-amber-50 text-amber-600 text-[9px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit border border-amber-100">
                                                                <AlertTriangle size={10}/> Unlinked
                                                             </span>
                                                          </div>
                                                       )}
                                                    </div>
                                                    
                                                    {/* Circular Progress Indicator */}
                                                    <div className="relative w-12 h-12 shrink-0 group-hover:scale-110 transition-transform">
                                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                            <circle
                                                                cx="18" cy="18" r="16"
                                                                className="text-slate-100 stroke-current"
                                                                strokeWidth="3.5"
                                                                fill="none"
                                                            />
                                                            <circle
                                                                cx="18" cy="18" r="16"
                                                                className={`${act.completionPercentage === 100 ? 'text-green-500' : 'text-indigo-600'} stroke-current transition-all duration-1000`}
                                                                strokeWidth="3.5"
                                                                strokeDasharray={`${act.completionPercentage}, 100`}
                                                                strokeLinecap="round"
                                                                fill="none"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-[10px] font-black text-slate-700">{act.completionPercentage}%</span>
                                                        </div>
                                                    </div>
                                                 </div>

                                                 <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest border-t border-slate-50 pt-2">
                                                    <span className="flex items-center gap-1"><User size={8}/> {act.assignedTo || 'Unassigned'}</span>
                                                    <span className="flex items-center gap-1"><Clock size={8}/> {act.status}</span>
                                                 </div>
                                                 
                                                 <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden shadow-inner">
                                                    <div className="bg-indigo-500 h-full transition-all duration-1000" style={{width: `${act.completionPercentage}%`}}></div>
                                                 </div>
                                              </div>
                                           );
                                        })}
                                        {(activeProject.activities || []).filter(a => a.category === cat).length === 0 && (
                                           <div className="py-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-slate-200 rounded-3xl">
                                              No tasks active
                                           </div>
                                        )}
                                     </div>
                                  </div>
                               ))}
                           </div>
                        </div>
                    )}

                    {activeTab === 'me_system' && (
                       <div className="animate-fade-in space-y-10 max-w-6xl mx-auto pb-12">
                          <div className="flex justify-between items-end">
                             <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">M&E Performance Registry</h3>
                                <p className="text-slate-500 font-medium">Verify outcome achievement against quarterly targets.</p>
                             </div>
                             <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-sm">
                                <button 
                                  onClick={() => setActiveMETab('indicators')}
                                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeMETab === 'indicators' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                   Indicators
                                </button>
                                <button 
                                  onClick={() => setActiveMETab('framework')}
                                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeMETab === 'framework' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                   Framework
                                </button>
                             </div>
                          </div>

                          {activeMETab === 'indicators' ? (
                            <div className="grid grid-cols-1 gap-8">
                               {activeProject.indicators?.map((indicator) => (
                                  <div key={indicator.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-200 transition-all">
                                     <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex gap-6">
                                           <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg font-black text-lg">
                                              {indicator.code}
                                           </div>
                                           <div className="space-y-1">
                                              <h4 className="text-xl font-black text-slate-900 leading-tight">{indicator.name}</h4>
                                              <div className="flex flex-wrap gap-3">
                                                  <span className="text-[10px] font-black uppercase bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-500 tracking-widest">Level: {indicator.level}</span>
                                                  <span className="text-[10px] font-black uppercase bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-500 tracking-widest">Owner: {indicator.responsible}</span>
                                                  <span className="text-[10px] font-black uppercase bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-500 tracking-widest">Freq: {indicator.frequency}</span>
                                                  {indicator.linkedLogframeId && (
                                                     <span className="text-[10px] font-black uppercase bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-indigo-600 tracking-widest flex items-center gap-1">
                                                        <Network size={10}/> Linked to {indicator.linkedLogframeId}
                                                     </span>
                                                  )}
                                              </div>
                                           </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                           <div className="text-4xl font-black text-indigo-600">{indicator.achieved}{indicator.unit === 'Percentage' ? '%' : ''}</div>
                                           <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">Status vs {indicator.overallTarget} target</p>
                                        </div>
                                     </div>
                                     <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                           {indicator.periodicData?.map((period, pIdx) => (
                                              <div key={pIdx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative overflow-hidden group/period">
                                                 <div className="relative z-10">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                                                       {period.period}
                                                       {period.actual >= period.target ? <CheckCircle className="text-green-500" size={12}/> : <Clock className="text-amber-400" size={12}/>}
                                                    </p>
                                                    <div className="space-y-3">
                                                       <div className="flex justify-between items-baseline">
                                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual</span>
                                                          <span className="text-lg font-black text-slate-900">{period.actual}</span>
                                                       </div>
                                                       <div className="w-full bg-white h-1 rounded-full overflow-hidden shadow-inner">
                                                          <div className="bg-indigo-500 h-full transition-all duration-1000" style={{width: `${Math.min(100, (period.actual / period.target) * 100)}%`}}></div>
                                                       </div>
                                                       <div className="flex justify-between items-baseline">
                                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</span>
                                                          <span className="text-xs font-bold text-slate-500">{period.target}</span>
                                                       </div>
                                                    </div>
                                                 </div>
                                                 <div className="absolute bottom-0 right-0 p-2 opacity-5 group-hover/period:opacity-10 transition-opacity">
                                                    <LineChart size={48} className="text-indigo-900"/>
                                                 </div>
                                              </div>
                                           ))}
                                           <button className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all flex flex-col items-center justify-center gap-2 group/add">
                                              <Plus size={20} className="group-hover/add:scale-110 transition-transform"/>
                                              <span className="text-[10px] font-black uppercase tracking-widest">Add Period</span>
                                           </button>
                                        </div>
                                     </div>
                                  </div>
                               ))}
                            </div>
                          ) : (
                            <div className="space-y-6">
                               {logframeOutputs.map((output) => {
                                  const linkedInds = (activeProject.indicators || []).filter(ind => ind.linkedLogframeId === output.id);
                                  return (
                                    <div key={output.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                                       <div className="p-8 md:w-1/3 bg-slate-50/50 border-r border-slate-100">
                                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-indigo-600 mb-4">
                                             {output.code}
                                          </div>
                                          <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">{output.text}</h4>
                                          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                             <Layers size={12}/> Output Level Element
                                          </div>
                                       </div>
                                       <div className="p-8 flex-1">
                                          <div className="flex justify-between items-center mb-6">
                                             <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                                <Target size={14} className="text-indigo-500"/> Performance Indicators ({linkedInds.length})
                                             </h5>
                                             <button 
                                               onClick={() => { setLinkingLogframeId(output.id); setIsLinkIndicatorModalOpen(true); }}
                                               className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1"
                                             >
                                                <LinkIcon size={12}/> Link Indicators
                                             </button>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             {linkedInds.map(ind => (
                                                <div key={ind.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all flex justify-between items-center group/ind">
                                                   <div className="flex gap-4 items-center">
                                                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                                                         {ind.code}
                                                      </div>
                                                      <div>
                                                         <p className="font-bold text-slate-900 text-xs leading-tight">{ind.name}</p>
                                                         <p className="text-[9px] font-black uppercase text-slate-400 mt-1">{ind.achieved} / {ind.overallTarget} {ind.unit}</p>
                                                      </div>
                                                   </div>
                                                   <button 
                                                     onClick={() => handleUnlinkIndicator(ind.id)}
                                                     className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/ind:opacity-100 transition-all"
                                                   >
                                                      <X size={14}/>
                                                   </button>
                                                </div>
                                             ))}
                                             {linkedInds.length === 0 && (
                                                <div className="col-span-2 py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                                                   <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No indicators associated</p>
                                                </div>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                  );
                               })}
                            </div>
                          )}
                       </div>
                    )}

                    {activeTab === 'budget' && (
                        <div className="animate-fade-in space-y-8 max-w-6xl mx-auto pb-12">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Execution Node</h3>
                                 <p className="text-slate-500 font-medium">Categorized expenditure tracking and variance monitoring.</p>
                              </div>
                              <button onClick={() => setIsBudgetModalOpen(true)} className="bg-amber-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-amber-700 transition-all flex items-center gap-2">
                                 <Plus size={18}/> Add Line
                              </button>
                           </div>

                           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                              <table className="w-full text-left text-sm">
                                 <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                       <th className="px-8 py-5">Code</th>
                                       <th className="px-8 py-5">Description</th>
                                       <th className="px-8 py-5">Category</th>
                                       <th className="px-8 py-5 text-right">Allocated</th>
                                       <th className="px-8 py-5 text-right">Spent</th>
                                       <th className="px-8 py-5 text-right">Remaining</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50 font-medium">
                                    {(activeProject.budgetLines || []).map((line) => (
                                       <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                                          <td className="px-8 py-4 font-mono text-xs font-bold text-indigo-600">{line.code}</td>
                                          <td className="px-8 py-4 text-slate-900">{line.description}</td>
                                          <td className="px-8 py-4"><span className="text-[10px] bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-indigo-600 font-black uppercase tracking-widest">{line.category}</span></td>
                                          <td className="px-8 py-4 text-right font-black text-slate-900">{formatCurrency(line.allocated)}</td>
                                          <td className="px-8 py-4 text-right text-slate-500">{formatCurrency(line.spent)}</td>
                                          <td className={`px-8 py-4 text-right font-black ${line.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(line.variance)}</td>
                                       </tr>
                                    ))}
                                    {(activeProject.budgetLines || []).length === 0 && (
                                       <tr>
                                          <td colSpan={6} className="px-8 py-24 text-center text-slate-300 font-black uppercase tracking-[0.2em] text-xs italic">No financial nodes initialized.</td>
                                       </tr>
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                    )}

                    {activeTab === 'activity_log' && (
                        <div className="animate-fade-in space-y-8 max-w-4xl mx-auto pb-12">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Audit History</h3>
                                 <p className="text-slate-500 font-medium">Immutable log of system actions and state changes.</p>
                              </div>
                              <button className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:shadow-sm transition-all flex items-center gap-2">
                                <Download size={14}/> Export Log
                              </button>
                           </div>

                           <div className="relative space-y-4">
                              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100"></div>
                              {(activeProject.activityLog || []).map((log, idx) => (
                                 <div key={log.id} className="relative pl-14 group">
                                    <div className={`absolute left-4 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 transition-transform group-hover:scale-125 ${idx === 0 ? 'bg-indigo-600 ring-4 ring-indigo-50' : 'bg-slate-300'}`}></div>
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all flex flex-col md:flex-row justify-between gap-4">
                                       <div className="space-y-1">
                                          <p className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                                             {log.action}
                                             {idx === 0 && <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded tracking-widest">LATEST</span>}
                                          </p>
                                          <p className="text-sm text-slate-500 font-medium">{log.details}</p>
                                       </div>
                                       <div className="text-right shrink-0 flex flex-col md:items-end justify-center">
                                          <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-1 flex items-center gap-1.5 md:justify-end">
                                             <User size={10}/> {log.user}
                                          </p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 md:justify-end">
                                             <Clock size={10}/> {new Date(log.timestamp).toLocaleString()}
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                              {(!activeProject.activityLog || activeProject.activityLog.length === 0) && (
                                 <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs border-2 border-dashed border-slate-100 rounded-3xl">Log empty</div>
                              )}
                           </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="animate-fade-in space-y-10 max-w-4xl mx-auto pb-12">
                           <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Project Configuration</h3>
                              <p className="text-slate-500 font-medium">Modify core metadata and operational constraints.</p>
                           </div>

                           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Identity</label>
                                    <input 
                                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-lg"
                                       value={settingsForm.name}
                                       onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Implementation Status</label>
                                    <select 
                                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-lg"
                                       value={settingsForm.status}
                                       onChange={(e) => setSettingsForm({...settingsForm, status: e.target.value as any})}
                                    >
                                       <option value="On Track">On Track</option>
                                       <option value="At Risk">At Risk</option>
                                       <option value="Delayed">Delayed</option>
                                    </select>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lead Manager</label>
                                    <input 
                                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                       value={settingsForm.manager}
                                       onChange={(e) => setSettingsForm({...settingsForm, manager: e.target.value})}
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Operational Area</label>
                                    <input 
                                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                       value={settingsForm.location}
                                       onChange={(e) => setSettingsForm({...settingsForm, location: e.target.value})}
                                    />
                                 </div>
                              </div>

                              <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                                 <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                                    <ShieldCheck className="text-indigo-600" size={24}/>
                                    <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest leading-relaxed">
                                       Configuration changes are logged in the audit history<br/>and visible to organizational auditors.
                                    </div>
                                 </div>
                                 <button 
                                    onClick={handleUpdateSettings}
                                    disabled={isSaving}
                                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                 >
                                    {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                                    Sync Global Config
                                 </button>
                              </div>
                           </div>

                           <div className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                              <div className="flex gap-4">
                                 <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Trash2 size={24}/></div>
                                 <div className="space-y-1">
                                    <p className="font-black text-red-900 uppercase text-xs tracking-widest">Destructive Zone</p>
                                    <p className="text-sm text-red-700 font-medium">Archive this project node and all associated performance data.</p>
                                 </div>
                              </div>
                              <button className="bg-white border border-red-200 px-8 py-3 rounded-2xl text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm">Archive Project</button>
                           </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reusable Modals */}
            {isLinkIndicatorModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
                  <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                     <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                        <div>
                           <h3 className="text-2xl font-black tracking-tight">Associate Indicators</h3>
                           <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Linking to Output {linkingLogframeId}</p>
                        </div>
                        <button onClick={() => setIsLinkIndicatorModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
                     </div>
                     <div className="p-8 max-h-[50vh] overflow-y-auto custom-scrollbar space-y-3">
                        {(activeProject.indicators || []).filter(ind => ind.linkedLogframeId !== linkingLogframeId).map(ind => (
                           <div key={ind.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all flex justify-between items-center group">
                              <div>
                                 <p className="font-bold text-slate-900 text-sm">{ind.code}: {ind.name}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Level: {ind.level} • {ind.linkedLogframeId ? `Currently linked to ${ind.linkedLogframeId}` : 'Unlinked'}</p>
                              </div>
                              <button 
                                onClick={() => handleLinkIndicator(ind.id)}
                                className="bg-white border border-slate-200 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                              >
                                 Link
                              </button>
                           </div>
                        ))}
                        {(activeProject.indicators || []).filter(ind => ind.linkedLogframeId !== linkingLogframeId).length === 0 && (
                           <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">No available indicators to link.</div>
                        )}
                     </div>
                     <div className="p-8 border-t border-slate-100 flex justify-end bg-slate-50/50">
                        <button onClick={() => setIsLinkIndicatorModalOpen(false)} className="px-10 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-xl">Done</button>
                     </div>
                  </div>
               </div>
            )}

            {isActivityModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
                  <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                     <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                        <div>
                           <h3 className="text-2xl font-black tracking-tight">{editingActivityId ? 'Modify Node' : 'Initialize Node'}</h3>
                           <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Activity Deployment</p>
                        </div>
                        <button onClick={() => setIsActivityModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
                     </div>
                     <div className="p-8 space-y-6">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Task Identity</label>
                           <input 
                             className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" 
                             placeholder="e.g. Field Training Phase 1" 
                             value={activityForm.name} 
                             onChange={(e) => setActivityForm({...activityForm, name: e.target.value})} 
                           />
                        </div>
                        
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                              <Link2 size={12} className="text-indigo-600"/> Logframe Alignment
                           </label>
                           <select 
                             className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
                             value={activityForm.linkedOutputId} 
                             onChange={(e) => setActivityForm({...activityForm, linkedOutputId: e.target.value})}
                           >
                              <option value="">-- No Output Link --</option>
                              {logframeOutputs.map(o => (
                                 <option key={o.id} value={o.id}>{o.code}: {o.text.substring(0, 50)}...</option>
                              ))}
                           </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lifecycle Stage</label>
                              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" value={activityForm.category} onChange={(e) => setActivityForm({...activityForm, category: e.target.value as any})}>
                                 <option value="Planning">Planning</option>
                                 <option value="Implementation">Implementation</option>
                                 <option value="Monitoring">Monitoring</option>
                                 <option value="Closure">Closure</option>
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Progress (%)</label>
                              <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={activityForm.completionPercentage} onChange={(e) => setActivityForm({...activityForm, completionPercentage: parseInt(e.target.value) || 0})} />
                           </div>
                        </div>
                        
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assigned Lead</label>
                           <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" placeholder="Assigned User" value={activityForm.assignedTo} onChange={(e) => setActivityForm({...activityForm, assignedTo: e.target.value})} />
                        </div>
                     </div>
                     <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                        <button onClick={() => setIsActivityModalOpen(false)} className="px-6 py-3 text-sm font-black text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest">Discard</button>
                        <button onClick={handleSaveActivity} disabled={isSaving || !activityForm.name} className="px-10 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50">
                           {isSaving ? <Loader2 className="animate-spin" size={18} /> : (editingActivityId ? 'Update Node' : 'Deploy Node')}
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {isBudgetModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
                  <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                     <div className="p-8 bg-amber-600 text-white flex justify-between items-center">
                        <div>
                           <h3 className="text-2xl font-black tracking-tight">Financial Provision</h3>
                           <p className="text-amber-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Budget Allocation</p>
                        </div>
                        <button onClick={() => setIsBudgetModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
                     </div>
                     <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Item Code</label>
                              <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold" placeholder="e.g. PERS-01" value={budgetLineForm.code} onChange={(e) => setBudgetLineForm({...budgetLineForm, code: e.target.value})} />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Node Type</label>
                              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={budgetLineForm.category} onChange={(e) => setBudgetLineForm({...budgetLineForm, category: e.target.value as any})}>
                                 <option value="Personnel">Personnel</option>
                                 <option value="Operational">Operational</option>
                                 <option value="Equipment">Equipment</option>
                                 <option value="Travel">Travel</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                           <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold" placeholder="e.g. Logistical support" value={budgetLineForm.description} onChange={(e) => setBudgetLineForm({...budgetLineForm, description: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Allocation (RWF)</label>
                              <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={budgetLineForm.allocated} onChange={(e) => setBudgetLineForm({...budgetLineForm, allocated: parseInt(e.target.value) || 0})} />
                           </div>
                        </div>
                     </div>
                     <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                        <button onClick={() => setIsBudgetModalOpen(false)} className="px-6 py-3 text-sm font-black text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest">Discard</button>
                        <button onClick={handleAddBudgetLine} className="px-10 py-3 bg-amber-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-700 transition-all shadow-xl shadow-amber-100">Initialize Node</button>
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
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Active Programs</h1>
           <p className="text-slate-500 font-medium text-lg mt-1">Multi-tenant project management and data orchestration hub.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-2xl">
          <Plus size={20} /> Initialize Program
        </button>
      </div>

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
                       <div className="flex items-center gap-2 text-sm font-black text-slate-900"><CheckSquare size={14} className="text-indigo-400" />{project.activities?.length || 0} nodes</div>
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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Program Lead</label>
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
