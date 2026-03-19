import React, { useState, useEffect, useMemo } from 'react';
import { Project, BudgetLine, ActivityLogEntry, ProjectActivity, Beneficiary, ProjectIndicator, IndicatorTarget, LogframeElement, Survey, VirtualTable } from '../types';
import ProjectDetailView from './ProjectDetailView';
import { 
  FolderKanban, Plus, Search, Filter, MoreVertical, 
  X, Trash2, Calendar, Users, DollarSign, Layout, 
  History, Settings, ChevronRight, ArrowLeft, Save, Activity, FileText,
  CheckCircle, Target, List, Smartphone, ArrowRight, Play, Database,
  Pencil, AlertTriangle, CheckSquare, Clock, Link as LinkIcon, Check,
  UserPlus, UserCheck, GraduationCap, Home, Archive, Copy, AlertOctagon, Download, MapPin, Loader2, User,
  Trophy, ClipboardCheck, BarChart3, ChevronDown, Layers, Link2, Info, TrendingUp, Briefcase, ExternalLink,
  ShieldCheck, Zap, LineChart, Network, GitGraph, BookOpen, TreePalm, GitBranch, HardDrive, Folder, UploadCloud,
  GanttChartSquare, ClipboardList, TabletSmartphone, PieChart as PieChartIcon, Binary, LayoutGrid, ListTodo, Sparkles, Shield,
  ArrowLeftRight, Settings2, Lightbulb, Clipboard, Calculator, GitMerge, TreeDeciduous
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProjectsViewProps {
  initialProjects: Project[];
  setGlobalProjects: (p: Project[]) => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  deepLinkProjectId?: string | null;
  onProjectSelect?: (id: string | null) => void;
  clearDeepLink?: () => void;
  triggerCreate?: boolean;
  onTriggerCreateHandled?: () => void;
  virtualTables?: VirtualTable[];
  onNavigateToAnalysis?: (projectId: string) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ 
  initialProjects, 
  setGlobalProjects, 
  onNotify, 
  deepLinkProjectId, 
  onProjectSelect, 
  clearDeepLink,
  triggerCreate,
  onTriggerCreateHandled,
  virtualTables = [],
  onNavigateToAnalysis
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [viewMode, setViewMode] = useState<'LIST' | 'WORKSPACE' | 'DETAIL'>('LIST');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activityViewMode, setActivityViewMode] = useState<'LIST' | 'BOARD' | 'GANTT'>('LIST');
  const kanbanColumns = ['Not Started', 'In Progress', 'Completed', 'Delayed', 'Cancelled'];
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isLogframeModalOpen, setIsLogframeModalOpen] = useState(false);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [editingIndicatorId, setEditingIndicatorId] = useState<string | null>(null);
  const [isPostCreatePromptOpen, setIsPostCreatePromptOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // M&E Builder States
  const [logframeForm, setLogframeForm] = useState<Partial<LogframeElement>>({
    type: 'Impact',
    code: '',
    description: '',
    parentId: undefined
  });

  const [indicatorForm, setIndicatorForm] = useState<Partial<ProjectIndicator>>({
    code: '',
    name: '',
    level: 'Output',
    unit: '',
    frequency: 'Monthly',
    overallTarget: 0,
    baseline: 0,
    dataSource: '',
    responsible: ''
  });

  // Planning states
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'On Track' | 'Delayed' | 'At Risk'>('All');
  const [filterLocation, setFilterLocation] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'Name' | 'Status' | 'Manager' | 'Progress'>('Name');

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<Partial<Project>>({});

  const customFields = virtualTables.find(t => t.id === 'projects')?.fields || [];

  // New Project State with Budget Breakdown
  const [newProjectData, setNewProjectData] = useState<Partial<Project> & { breakdown: Record<string, number>, customFields?: Record<string, any> }>({
    name: '',
    description: '',
    location: '',
    budget: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    manager: '',
    breakdown: {
      'Personnel': 0,
      'Operational': 0,
      'Equipment': 0,
      'Travel': 0,
      'Sub-grants': 0,
      'Other': 0
    },
    customFields: {}
  });

  // Automatically sync total budget from breakdown
  useEffect(() => {
    const total = Object.values(newProjectData.breakdown).reduce((sum: number, val: number) => sum + val, 0);
    if (total !== newProjectData.budget) {
      setNewProjectData(prev => ({ ...prev, budget: total }));
    }
  }, [newProjectData.breakdown]);

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

  useEffect(() => {
    if (triggerCreate) {
      setIsCreateModalOpen(true);
      onTriggerCreateHandled?.();
    }
  }, [triggerCreate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdFromUrl = urlParams.get('projectId');
    const viewFromUrl = urlParams.get('view');
    if (projectIdFromUrl) {
      const project = projects.find(p => p.id === projectIdFromUrl);
      if (project) {
        if (viewFromUrl === 'detail') {
          openProjectDetail(project);
        } else {
          openWorkspace(project);
        }
      }
    }
  }, []); // Run once on mount to check URL

  useEffect(() => {
    if (deepLinkProjectId) {
      const project = projects.find(p => p.id === deepLinkProjectId);
      if (project) {
        const urlParams = new URLSearchParams(window.location.search);
        const currentView = urlParams.get('view');
        const currentProjectId = urlParams.get('projectId');
        
        // If the URL already matches the deep link project and has a specific view, 
        // it means this was triggered internally by openProjectDetail or openWorkspace.
        // We do nothing here to avoid overriding the view mode.
        if (currentProjectId === deepLinkProjectId && (currentView === 'detail' || currentView === 'workspace')) {
          return;
        }
        
        // Triggered externally (e.g., from App.tsx dropdown), default to workspace
        openWorkspace(project);
      }
    }
  }, [deepLinkProjectId]);

  useEffect(() => {
    setGlobalProjects(projects);
  }, [projects]);

  const openWorkspace = (project: Project) => {
    setActiveProject(project);
    onProjectSelect?.(project.id);
    
    // Update URL for deep linking
    const url = new URL(window.location.href);
    url.searchParams.set('projectId', project.id);
    url.searchParams.set('view', 'workspace');
    window.history.pushState({}, '', url.toString());

    setSettingsForm({
      name: project.name,
      description: project.description,
      location: project.location,
      manager: project.manager,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget
    });
    setViewMode('WORKSPACE');
    setActiveTab('overview');
  };

  const closeWorkspace = () => {
    setViewMode('LIST');
    onProjectSelect?.(null);
    setActiveProject(null);
    
    // Remove projectId from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('projectId');
    url.searchParams.delete('view');
    window.history.pushState({}, '', url.toString());
  };

  const openProjectDetail = (project: Project) => {
    setActiveProject(project);
    onProjectSelect?.(project.id);
    
    // Update URL for deep linking
    const url = new URL(window.location.href);
    url.searchParams.set('projectId', project.id);
    url.searchParams.set('view', 'detail');
    window.history.pushState({}, '', url.toString());

    setViewMode('DETAIL');
  };

  const handleCreateProject = () => {
    if (!newProjectData.name || !newProjectData.location || !newProjectData.manager || !newProjectData.budget) {
      onNotify("Please fill in all mandatory fields (Name, Location, Manager, Budget)", "error");
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      // Fix: Explicitly cast 'val' as number to resolve TypeScript error where val is inferred as unknown
      const budgetLines: BudgetLine[] = Object.entries(newProjectData.breakdown).map(([cat, val], idx) => ({
        id: `bl-${Date.now()}-${idx}`,
        code: `B${idx + 1}`,
        category: cat as any,
        description: `Initial allocation for ${cat}`,
        allocated: val as number,
        spent: 0,
        variance: val as number
      }));

      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectData.name || '',
        description: newProjectData.description || '',
        location: newProjectData.location || '',
        budget: newProjectData.budget || 0,
        spent: 0,
        progress: 0,
        status: 'On Track',
        beneficiaries: 0,
        startDate: newProjectData.startDate || new Date().toISOString().split('T')[0],
        endDate: newProjectData.endDate || '',
        manager: newProjectData.manager || '',
        budgetLines: budgetLines,
        indicators: [],
        activities: [],
        beneficiaryList: [],
        customFields: newProjectData.customFields || {},
        logframe: [
           { id: 'lf-1', type: 'Impact', code: 'IMPACT-1', description: `Improve socio-economic wellbeing in ${newProjectData.location}.` }
        ],
        activityLog: [{
            id: Date.now().toString(),
            action: 'Project Node Initialized',
            details: `Project record created with an initial envelope of RWF ${newProjectData.budget?.toLocaleString()}. Breakdown configured for ${budgetLines.length} categories.`,
            timestamp: new Date().toISOString(),
            user: 'Admin'
        }]
      };

      const updatedProjects = [newProject, ...projects];
      setProjects(updatedProjects);
      setGlobalProjects(updatedProjects);
      setIsCreateModalOpen(false);
      setIsSaving(false);
      
      openWorkspace(newProject);
      setIsPostCreatePromptOpen(true);
      setNewProjectData({ 
        name: '', description: '', location: '', budget: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', manager: '',
        breakdown: { 'Personnel': 0, 'Operational': 0, 'Equipment': 0, 'Travel': 0, 'Sub-grants': 0, 'Other': 0 }
      });
      onNotify("Project initialized successfully.", "success");
    }, 800);
  };

  const handleOpenActivityModal = (activity?: ProjectActivity) => {
    if (activity) {
      setEditingActivityId(activity.id);
      setActivityForm(activity);
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
            { id: 'log-' + Date.now(), action: editingActivityId ? 'Activity Updated' : 'Activity Deployed', details: `Task '${activityForm.name}' configured in work plan.`, timestamp: new Date().toISOString(), user: 'Manager' },
            ...(activeProject.activityLog || [])
        ]
      };

      setProjects(projects.map(p => p.id === activeProject.id ? updatedProject : p));
      setActiveProject(updatedProject);
      setIsActivityModalOpen(false);
      setIsSaving(false);
      onNotify("Work plan updated");
    }, 600);
  };

  const handleSaveLogframe = () => {
    if (!activeProject || !logframeForm.description || !logframeForm.code) return;
    
    const newElement: LogframeElement = {
      id: 'lf-' + Date.now(),
      ...logframeForm as LogframeElement
    };

    const updatedProject = {
      ...activeProject,
      logframe: [...(activeProject.logframe || []), newElement],
      activityLog: [
          { id: 'l-' + Date.now(), action: 'Framework Modified', details: `Logical element ${logframeForm.code} added to Theory of Change.`, timestamp: new Date().toISOString(), user: 'Admin' },
          ...(activeProject.activityLog || [])
      ]
    };
    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === activeProject.id ? updatedProject : p));
    setIsLogframeModalOpen(false);
    setLogframeForm({ type: 'Impact', code: '', description: '', parentId: undefined });
    onNotify("Theory of Change updated");
  };

  const handleOpenIndicatorModal = (indicator?: ProjectIndicator) => {
    if (indicator) {
      setEditingIndicatorId(indicator.id);
      setIndicatorForm(indicator);
    } else {
      setEditingIndicatorId(null);
      setIndicatorForm({
        code: '',
        name: '',
        level: 'Output',
        unit: '',
        frequency: 'Monthly',
        overallTarget: 0,
        baseline: 0,
        dataSource: '',
        responsible: ''
      });
    }
    setIsIndicatorModalOpen(true);
  };

  const handleSaveIndicator = () => {
    if (!activeProject || !indicatorForm.name || !indicatorForm.code) return;
    
    let updatedIndicators = [...(activeProject.indicators || [])];
    
    if (editingIndicatorId) {
      updatedIndicators = updatedIndicators.map(ind => 
        ind.id === editingIndicatorId ? { ...ind, ...indicatorForm } as ProjectIndicator : ind
      );
    } else {
      const newIndicator: ProjectIndicator = {
          id: 'ind-' + Date.now(),
          ...indicatorForm as any,
          achieved: 0,
          periodicData: []
      };
      updatedIndicators.push(newIndicator);
    }

    const updatedProject = {
        ...activeProject,
        indicators: updatedIndicators,
        activityLog: [
            { id: 'l-' + Date.now(), action: editingIndicatorId ? 'Indicator Updated' : 'Indicator Defined', details: `KPI ${indicatorForm.code} ${editingIndicatorId ? 'modified' : 'added'} in registry.`, timestamp: new Date().toISOString(), user: 'Admin' },
            ...(activeProject.activityLog || [])
        ]
    };
    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === activeProject.id ? updatedProject : p));
    setIsIndicatorModalOpen(false);
    onNotify(editingIndicatorId ? "Indicator updated successfully" : "Indicator registered successfully");
  };

  const handleDeleteIndicator = (indicatorId: string) => {
    if (!activeProject) return;
    
    const updatedIndicators = (activeProject.indicators || []).filter(ind => ind.id !== indicatorId);
    
    const updatedProject = {
        ...activeProject,
        indicators: updatedIndicators,
        activityLog: [
            { id: 'l-' + Date.now(), action: 'Indicator Deleted', details: `A KPI was removed from the registry.`, timestamp: new Date().toISOString(), user: 'Admin' },
            ...(activeProject.activityLog || [])
        ]
    };
    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === activeProject.id ? updatedProject : p));
    onNotify("Indicator deleted successfully");
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
                    details: 'Project configuration synchronized with organization global parameters.',
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
        onNotify("Project configuration synchronized");
    }, 1000);
  };

  const handleDeleteProject = () => {
    if (!activeProject) return;
    if (confirm("Are you absolutely sure? This will purge all project data, activities, and indicators permanently.")) {
      const updated = projects.filter(p => p.id !== activeProject.id);
      setProjects(updated);
      setGlobalProjects(updated);
      closeWorkspace();
      onNotify("Project purged from organization registry", "error");
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Delayed': return 'bg-red-100 text-red-700 border-red-200';
      case 'Cancelled': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getActivityStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle size={14} />;
      case 'In Progress': return <Activity size={14} />;
      case 'Delayed': return <AlertTriangle size={14} />;
      case 'Cancelled': return <X size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const uniqueLocations = useMemo(() => {
    const locations = projects.map(p => p.location).filter(Boolean);
    return ['All', ...Array.from(new Set(locations))];
  }, [projects]);

  const uniqueYears = useMemo(() => {
    const years = projects.map(p => p.startDate ? new Date(p.startDate).getFullYear().toString() : '').filter(Boolean);
    return ['All', ...Array.from(new Set(years))].sort((a, b) => b.localeCompare(a));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let result = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              project.manager.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || project.status === filterStatus;
        const matchesLocation = filterLocation === 'All' || project.location === filterLocation;
        const projectYear = project.startDate ? new Date(project.startDate).getFullYear().toString() : '';
        const matchesYear = filterYear === 'All' || projectYear === filterYear;
        return matchesSearch && matchesStatus && matchesLocation && matchesYear;
    });

    result.sort((a, b) => {
      if (sortBy === 'Name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'Status') {
        return a.status.localeCompare(b.status);
      } else if (sortBy === 'Manager') {
        return a.manager.localeCompare(b.manager);
      } else if (sortBy === 'Progress') {
        return b.progress - a.progress;
      }
      return 0;
    });

    return result;
  }, [projects, searchQuery, filterStatus, filterLocation, filterYear, sortBy]);

  const createModal = isCreateModalOpen && (
      <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white shrink-0">
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Initialize Program Node</h3>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-1">Multi-Tenant Platform Logic</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                     <div className="w-4 h-0.5 bg-indigo-600"></div> Core Identity
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Identity</label>
                      <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300" placeholder="e.g. WASH Resilience Phase II" value={newProjectData.name} onChange={(e) => setNewProjectData({...newProjectData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                      <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300 resize-none h-24" placeholder="Brief project description..." value={newProjectData.description || ''} onChange={(e) => setNewProjectData({...newProjectData, description: e.target.value})}></textarea>
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lead Project Manager</label>
                      <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300" placeholder="Assigned PM Name" value={newProjectData.manager} onChange={(e) => setNewProjectData({...newProjectData, manager: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Operational Area</label>
                      <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300" placeholder="Location" value={newProjectData.location} onChange={(e) => setNewProjectData({...newProjectData, location: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Launch Date</label>
                         <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" value={newProjectData.startDate} onChange={(e) => setNewProjectData({...newProjectData, startDate: e.target.value})} />
                     </div>
                     <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Date</label>
                         <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" value={newProjectData.endDate || ''} onChange={(e) => setNewProjectData({...newProjectData, endDate: e.target.value})} />
                     </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                     <div className="w-4 h-0.5 bg-indigo-600"></div> Financial Envelope
                  </div>
                  <div className="bg-slate-900 rounded-[2rem] p-6 text-white mb-6 relative overflow-hidden">
                     <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Initial Budget</p>
                        <div className="flex items-baseline gap-2">
                           <span className="text-3xl font-black">RWF {newProjectData.budget?.toLocaleString()}</span>
                           <Calculator size={16} className="text-indigo-400" />
                        </div>
                     </div>
                     <DollarSign className="absolute -bottom-6 -right-6 opacity-5" size={140} />
                  </div>
                  
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Allocation by Category (RWF)</label>
                     <div className="grid grid-cols-2 gap-4">
                        {Object.keys(newProjectData.breakdown).map(cat => (
                           <div key={cat} className="space-y-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">{cat}</label>
                              <input 
                                 type="number" 
                                 className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                                 value={newProjectData.breakdown[cat] || ''}
                                 onChange={(e) => setNewProjectData({
                                    ...newProjectData, 
                                    breakdown: { ...newProjectData.breakdown, [cat]: Number(e.target.value) || 0 }
                                 })}
                              />
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>

              {customFields.length > 0 && (
                 <div className="mt-12 space-y-6 border-t border-slate-100 pt-8">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                       <div className="w-4 h-0.5 bg-indigo-600"></div> Custom Attributes
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {customFields.map(field => (
                          <div key={field.id} className="space-y-1.5">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{field.label}</label>
                             <input 
                                type={field.type === 'NUMBER' ? 'number' : field.type === 'DATE' ? 'date' : 'text'}
                                placeholder={field.label} 
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300" 
                                value={newProjectData.customFields?.[field.name] || ''} 
                                onChange={(e) => setNewProjectData({
                                   ...newProjectData, 
                                   customFields: {
                                      ...(newProjectData.customFields || {}),
                                      [field.name]: e.target.value
                                   }
                                })}
                             />
                          </div>
                       ))}
                    </div>
                 </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50 shrink-0">
                <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
                <button onClick={handleCreateProject} disabled={isSaving || !newProjectData.name} className="px-12 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Synchronize Project Node'}
                </button>
            </div>
          </div>
      </div>
  );

  if (viewMode === 'DETAIL' && activeProject) {
    return (
      <ProjectDetailView 
        project={activeProject} 
        onBack={closeWorkspace}
        onOpenWorkspace={openWorkspace}
        onNavigateToAnalysis={onNavigateToAnalysis}
        onUpdateProject={(updatedProject) => {
          const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
          setProjects(updatedProjects);
          setGlobalProjects(updatedProjects);
          setActiveProject(updatedProject);
        }}
      />
    );
  }

  if (viewMode === 'WORKSPACE' && activeProject) {
      return (
        <div className="flex flex-col h-full animate-fade-in bg-white h-screen overflow-hidden relative">
            {/* Workspace Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={closeWorkspace} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-0.5">
                           Active Project Node
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                             <FolderKanban className="text-indigo-600" size={24}/>
                             {activeProject.name}
                        </h2>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsCreateModalOpen(true)} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg mr-2">
                        <Plus size={16}/>
                        New Project
                    </button>
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-100 mr-4">
                       <User size={14} className="text-slate-400" />
                       <span className="text-xs font-black uppercase text-slate-500 tracking-tight">PM: {activeProject.manager}</span>
                    </div>
                    <button onClick={handleUpdateSettings} disabled={isSaving} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50">
                        {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                        Sync Workspace
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Workspace Sidebar */}
                <div className="w-64 bg-slate-50 border-r border-slate-200 py-6 px-3 flex flex-col gap-1 shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Strategy & Framework</div>
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><Layout size={18} /> Dash Overview</button>
                    <button onClick={() => setActiveTab('framework')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'framework' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><GitGraph size={18} /> Results Framework</button>
                    
                    <div className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Planning & Execution</div>
                    <button onClick={() => setActiveTab('activities')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'activities' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><GanttChartSquare size={18} /> Detailed Work Plan</button>
                    <button onClick={() => setActiveTab('indicator_registry')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'indicator_registry' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><Target size={18} /> Indicator Registry</button>
                    
                    <div className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Monitoring & Data</div>
                    <button onClick={() => setActiveTab('data_tools')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'data_tools' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><TabletSmartphone size={18} /> Digital Data Tools</button>
                    
                    <div className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">System</div>
                    <button onClick={() => setActiveTab('activity_log')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'activity_log' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><History size={18} /> Audit Ledger</button>
                    <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}><Settings size={18} /> Project Config</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
                    {activeTab === 'overview' && (
                        <div className="max-w-6xl space-y-8 animate-fade-in pb-12">
                             <div className="bg-indigo-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
                                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                   <div>
                                      <h3 className="text-4xl font-black mb-4 leading-tight">{activeProject.name}</h3>
                                      <p className="text-indigo-200 text-lg mb-8 max-w-sm">Strategic performance overview for {activeProject.location}.</p>
                                      <div className="flex gap-4">
                                         <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                                            <p className="text-[10px] font-black uppercase text-indigo-300 mb-1 tracking-widest">Progress</p>
                                            <p className="text-3xl font-black">{activeProject.progress}%</p>
                                         </div>
                                         <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                                            <p className="text-[10px] font-black uppercase text-indigo-300 mb-1 tracking-widest">Budget Utility</p>
                                            <p className="text-xl font-black">{activeProject.budget > 0 ? Math.round((activeProject.spent / activeProject.budget) * 100) : 0}%</p>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                      {[
                                        { label: 'Work Plan', count: activeProject.activities?.length || 0, icon: <GanttChartSquare className="text-indigo-400" /> },
                                        { label: 'M&E Metrics', count: activeProject.indicators?.length || 0, icon: <Target className="text-indigo-400" /> },
                                        { label: 'Results Node', count: activeProject.logframe?.length || 0, icon: <GitGraph className="text-indigo-400" /> },
                                        { label: 'Beneficiaries', count: activeProject.beneficiaries || 0, icon: <Users className="text-indigo-400" /> },
                                      ].map((item, idx) => (
                                         <div key={idx} className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col justify-center items-center hover:bg-white/10 transition-colors">
                                            {item.icon}
                                            <span className="text-xl font-black mt-2">{item.count}</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{item.label}</span>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                                <Layers className="absolute -bottom-12 -right-12 opacity-5" size={320} />
                             </div>

                             {/* Budget Breakdown Chart */}
                             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                   <PieChartIcon className="text-indigo-600" size={24} /> Budget Breakdown
                                </h4>
                                {activeProject.budgetLines && activeProject.budgetLines.length > 0 ? (
                                   <div className="h-[300px] w-full">
                                      <ResponsiveContainer width="100%" height="100%">
                                         <PieChart>
                                            <Pie
                                               data={activeProject.budgetLines}
                                               dataKey="allocated"
                                               nameKey="category"
                                               cx="50%"
                                               cy="50%"
                                               outerRadius={100}
                                               innerRadius={60}
                                               paddingAngle={5}
                                               label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                               {activeProject.budgetLines.map((entry, index) => {
                                                  const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];
                                                  return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                                               })}
                                            </Pie>
                                            <Tooltip 
                                               formatter={(value: number) => `RWF ${value.toLocaleString()}`}
                                            />
                                            <Legend />
                                         </PieChart>
                                      </ResponsiveContainer>
                                   </div>
                                ) : (
                                   <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                      <PieChartIcon size={48} className="mx-auto text-slate-300 mb-4" />
                                      <p className="text-slate-500 font-medium">No budget breakdown available.</p>
                                   </div>
                                )}
                             </div>

                             {/* Quick Actions */}
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                   <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                      <Target size={28} />
                                   </div>
                                   <h4 className="text-xl font-black text-slate-900 mb-2">New M&E Indicator</h4>
                                   <p className="text-sm text-slate-500 font-medium mb-6">Define a new metric to track project performance and impact.</p>
                                   <button 
                                      onClick={() => handleOpenIndicatorModal()}
                                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                   >
                                      <Plus size={16} /> Create Indicator
                                   </button>
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                   <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                      <CheckSquare size={28} />
                                   </div>
                                   <h4 className="text-xl font-black text-slate-900 mb-2">Deploy Task</h4>
                                   <p className="text-sm text-slate-500 font-medium mb-6">Add a new activity to the work plan and assign a lead officer.</p>
                                   <button 
                                      onClick={() => handleOpenActivityModal()}
                                      className="w-full py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                   >
                                      <Plus size={16} /> Add Activity
                                   </button>
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                   <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                      <GitGraph size={28} />
                                   </div>
                                   <h4 className="text-xl font-black text-slate-900 mb-2">Logic Node</h4>
                                   <p className="text-sm text-slate-500 font-medium mb-6">Expand the Results Framework with new outcomes or outputs.</p>
                                   <button 
                                      onClick={() => { setLogframeForm({ type: 'Outcome' }); setIsLogframeModalOpen(true); }}
                                      className="w-full py-3 bg-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                                   >
                                      <Plus size={16} /> Add Logic
                                   </button>
                                </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'framework' && (
                        <div className="animate-fade-in space-y-8 max-w-6xl mx-auto pb-12">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Results Framework Builder</h3>
                                 <p className="text-slate-500 font-medium">Construct your Theory of Change (Logframe) hierarchy.</p>
                              </div>
                              <button onClick={() => { setLogframeForm({ type: 'Outcome' }); setIsLogframeModalOpen(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                                 <Plus size={18}/> Add Logic Node
                              </button>
                           </div>

                           <div className="space-y-10">
                              {/* Impact Level */}
                              <div className="space-y-4">
                                 <div className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest px-2">
                                    <Trophy size={14}/> Primary Impact
                                 </div>
                                 {activeProject.logframe?.filter(lf => lf.type === 'Impact').map(item => (
                                    <div key={item.id} className="bg-indigo-50 border-2 border-indigo-100 rounded-[2rem] p-8 shadow-sm group">
                                       <div className="flex justify-between items-start mb-2">
                                          <span className="font-black text-indigo-700 text-xs tracking-tighter bg-indigo-100 px-2 py-0.5 rounded">{item.code}</span>
                                          <button onClick={() => {
                                             const updated = activeProject.logframe?.filter(lf => lf.id !== item.id);
                                             setActiveProject({...activeProject, logframe: updated});
                                          }} className="text-indigo-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                                       </div>
                                       <p className="text-xl font-black text-indigo-900 leading-tight">{item.description}</p>
                                       
                                       {/* Nested Outcomes */}
                                       <div className="mt-8 space-y-6 pl-8 border-l-2 border-indigo-200">
                                          <div className="flex items-center gap-3 text-[9px] font-black text-blue-600 uppercase tracking-widest mb-4">
                                             <GitBranch size={12}/> Program Outcomes
                                          </div>
                                          {activeProject.logframe?.filter(lf => lf.type === 'Outcome' && (lf.parentId === item.id || !lf.parentId)).map(outcome => (
                                             <div key={outcome.id} className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm group/outcome">
                                                <div className="flex justify-between items-start mb-1">
                                                   <span className="font-black text-blue-600 text-[10px] bg-blue-50 px-2 py-0.5 rounded">{outcome.code}</span>
                                                   <button onClick={() => {
                                                      const updated = activeProject.logframe?.filter(lf => lf.id !== outcome.id);
                                                      setActiveProject({...activeProject, logframe: updated});
                                                   }} className="text-slate-200 hover:text-red-500 opacity-0 group-hover/outcome:opacity-100 transition-all"><Trash2 size={14}/></button>
                                                </div>
                                                <p className="font-bold text-slate-800 text-sm">{outcome.description}</p>
                                                
                                                {/* Nested Outputs */}
                                                <div className="mt-6 space-y-3 pl-6 border-l border-slate-100">
                                                   {activeProject.logframe?.filter(lf => lf.type === 'Output' && lf.parentId === outcome.id).map(output => (
                                                      <div key={output.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center group/output">
                                                         <div>
                                                            <span className="font-black text-slate-400 text-[9px] tracking-widest">{output.code}</span>
                                                            <p className="text-xs font-bold text-slate-600 mt-0.5">{output.description}</p>
                                                         </div>
                                                         <button onClick={() => {
                                                            const updated = activeProject.logframe?.filter(lf => lf.id !== output.id);
                                                            setActiveProject({...activeProject, logframe: updated});
                                                         }} className="text-slate-200 hover:text-red-500 opacity-0 group-hover/output:opacity-100 transition-all"><Trash2 size={14}/></button>
                                                      </div>
                                                   ))}
                                                   <button 
                                                      onClick={() => { setLogframeForm({ type: 'Output', parentId: outcome.id }); setIsLogframeModalOpen(true); }}
                                                      className="w-full py-2 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-300 hover:border-blue-200 hover:text-blue-500 transition-all"
                                                   >
                                                      + Link Output
                                                   </button>
                                                </div>
                                             </div>
                                          ))}
                                          <button 
                                             onClick={() => { setLogframeForm({ type: 'Outcome', parentId: item.id }); setIsLogframeModalOpen(true); }}
                                             className="w-full py-3 border-2 border-dashed border-indigo-200 rounded-2xl text-xs font-black uppercase text-indigo-300 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                                          >
                                             + Define New Outcome
                                          </button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                    )}

                    {activeTab === 'activities' && (
                        <div className="animate-fade-in space-y-8 max-w-6xl mx-auto pb-12">
                           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Detailed Work Plan</h3>
                                 <p className="text-slate-500 font-medium">Operational scheduling linked to strategic outputs.</p>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="bg-slate-100 p-1 rounded-xl flex">
                                    <button onClick={() => setActivityViewMode('BOARD')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activityViewMode === 'BOARD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                       <LayoutGrid size={14}/> Board View
                                    </button>
                                    <button onClick={() => setActivityViewMode('LIST')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activityViewMode === 'LIST' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                       <ListTodo size={14}/> List View
                                    </button>
                                    <button onClick={() => setActivityViewMode('GANTT')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activityViewMode === 'GANTT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                       <GanttChartSquare size={14}/> Gantt View
                                    </button>
                                 </div>
                                 <button onClick={() => handleOpenActivityModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                                    <Plus size={18}/> Deploy Task
                                 </button>
                              </div>
                           </div>

                           {activityViewMode === 'LIST' ? (
                               <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                                   <table className="w-full text-left text-sm">
                                       <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                           <tr>
                                               <th className="px-8 py-5">Task Identity & Lead</th>
                                               <th className="px-8 py-5">Strategic Alignment</th>
                                               <th className="px-8 py-5">Launch Period</th>
                                               <th className="px-8 py-5 text-right">Completion</th>
                                           </tr>
                                       </thead>
                                       <tbody className="divide-y divide-slate-50">
                                           {activeProject.activities?.map(act => (
                                               <tr key={act.id} onClick={() => handleOpenActivityModal(act)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                                   <td className="px-8 py-5">
                                                       <div className="flex items-center gap-4">
                                                           <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"><CheckSquare size={18}/></div>
                                                           <div>
                                                               <p className="font-bold text-slate-900">{act.name}</p>
                                                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><User size={10}/> {act.assignedTo || 'Unassigned'}</p>
                                                           </div>
                                                       </div>
                                                   </td>
                                                   <td className="px-8 py-5">
                                                       {activeProject.logframe?.find(l => l.id === act.linkedOutputId) ? (
                                                           <div className="flex flex-col gap-1">
                                                              <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 w-fit">{activeProject.logframe.find(l => l.id === act.linkedOutputId)?.code}</span>
                                                              <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{activeProject.logframe.find(l => l.id === act.linkedOutputId)?.description}</p>
                                                           </div>
                                                       ) : (
                                                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Unaligned Task</span>
                                                       )}
                                                   </td>
                                                   <td className="px-8 py-5 text-xs font-bold text-slate-500">{act.startDate}</td>
                                                   <td className="px-8 py-5 text-right">
                                                       <span className="font-black text-slate-900">{act.completionPercentage}%</span>
                                                   </td>
                                               </tr>
                                           ))}
                                           {activeProject.activities?.length === 0 && (
                                              <tr><td colSpan={4} className="py-24 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.2em]">No activities scheduled in work plan</td></tr>
                                           )}
                                       </tbody>
                                   </table>
                               </div>
                           ) : activityViewMode === 'BOARD' ? (
                               <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                                   {kanbanColumns.map(column => {
                                       const columnActivities = activeProject.activities?.filter(a => a.status === column) || [];
                                       return (
                                           <div key={column} className="flex-1 min-w-[280px] bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col h-full">
                                               <div className="flex justify-between items-center mb-4">
                                                   <h5 className="text-xs font-black uppercase tracking-widest text-slate-700">{column}</h5>
                                                   <span className="bg-white text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                                       {columnActivities.length}
                                                   </span>
                                               </div>
                                               <div className="space-y-3 flex-1">
                                                   {columnActivities.map(activity => (
                                                       <div key={activity.id} onClick={() => handleOpenActivityModal(activity)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                                           <div className="flex justify-between items-start mb-2">
                                                               <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
                                                                   {activity.category}
                                                               </span>
                                                               <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${getActivityStatusColor(activity.status)}`}>
                                                                   {getActivityStatusIcon(activity.status)}
                                                               </span>
                                                           </div>
                                                           <h6 className="font-bold text-slate-900 text-sm mb-3 leading-tight">{activity.name}</h6>
                                                           
                                                           <div className="mb-3">
                                                               <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
                                                                   <span>Progress</span>
                                                                   <span>{activity.completionPercentage}%</span>
                                                               </div>
                                                               <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                                                                   <div 
                                                                       className={`h-full rounded-full ${activity.completionPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                                                       style={{width: `${activity.completionPercentage}%`}}
                                                                   ></div>
                                                               </div>
                                                           </div>
                                                           
                                                           <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                                               <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                                                   <Calendar size={10} />
                                                                   {activity.endDate}
                                                               </div>
                                                               <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium" title={activity.assignedTo}>
                                                                   <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[8px]">
                                                                       {activity.assignedTo?.charAt(0) || '?'}
                                                                   </div>
                                                               </div>
                                                           </div>
                                                       </div>
                                                   ))}
                                                   {columnActivities.length === 0 && (
                                                       <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
                                                           No activities
                                                       </div>
                                                   )}
                                               </div>
                                           </div>
                                       );
                                   })}
                               </div>
                           ) : activityViewMode === 'GANTT' ? (
                               <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8">
                                   <div className="overflow-x-auto custom-scrollbar pb-6">
                                       <div className="min-w-[800px]">
                                           {(() => {
                                               const activities = activeProject.activities || [];
                                               if (activities.length === 0) {
                                                   return <div className="py-24 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.2em]">No activities scheduled in work plan</div>;
                                               }
                                               
                                               const dates = activities.flatMap(a => {
                                                   const s = new Date(a.startDate).getTime();
                                                   const e = new Date(a.endDate).getTime();
                                                   return isNaN(s) || isNaN(e) ? [] : [s, e];
                                               });
                                               
                                               if (dates.length === 0) {
                                                   return <div className="py-24 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.2em]">Invalid activity dates</div>;
                                               }

                                               const minDate = new Date(Math.min(...dates));
                                               const maxDate = new Date(Math.max(...dates));
                                               
                                               minDate.setDate(minDate.getDate() - 7);
                                               maxDate.setDate(maxDate.getDate() + 7);
                                               
                                               const totalDays = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
                                               
                                               const months: { label: string, days: number }[] = [];
                                               let current = new Date(minDate);
                                               while (current <= maxDate) {
                                                   const month = current.toLocaleString('default', { month: 'short', year: 'numeric' });
                                                   const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
                                                   const daysRemainingInMonth = daysInMonth - current.getDate() + 1;
                                                   
                                                   const daysToCount = Math.min(
                                                       daysRemainingInMonth,
                                                       Math.ceil((maxDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)) + 1
                                                   );
                                                   
                                                   months.push({ label: month, days: daysToCount });
                                                   current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
                                               }

                                               return (
                                                   <div className="relative">
                                                       <div className="flex border-b border-slate-200 mb-4">
                                                           <div className="w-64 shrink-0 py-2 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest border-r border-slate-200">
                                                               Activity
                                                           </div>
                                                           <div className="flex-1 flex">
                                                               {months.map((m, i) => (
                                                                   <div key={i} className="py-2 text-center font-black text-[10px] text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-r-0" style={{ width: `${(m.days / totalDays) * 100}%` }}>
                                                                       {m.label}
                                                                   </div>
                                                               ))}
                                                           </div>
                                                       </div>
                                                       
                                                       <div className="space-y-3">
                                                           {activities.map(act => {
                                                               const start = new Date(act.startDate);
                                                               const end = new Date(act.endDate);
                                                               if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
                                                               
                                                               const leftPercent = ((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100;
                                                               const widthPercent = ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100;
                                                               
                                                               return (
                                                                   <div key={act.id} className="flex items-center group cursor-pointer" onClick={() => handleOpenActivityModal(act)}>
                                                                       <div className="w-64 shrink-0 pr-4 border-r border-slate-200 py-1">
                                                                           <div className="text-xs font-bold text-slate-900 truncate" title={act.name}>{act.name}</div>
                                                                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{act.assignedTo || 'Unassigned'}</div>
                                                                       </div>
                                                                       <div className="flex-1 relative h-8 bg-slate-50 rounded-r-lg group-hover:bg-slate-100 transition-colors">
                                                                           <div className="absolute inset-0 flex">
                                                                               {months.map((m, i) => (
                                                                                   <div key={i} className="h-full border-r border-slate-200/50 last:border-r-0" style={{ width: `${(m.days / totalDays) * 100}%` }}></div>
                                                                               ))}
                                                                           </div>
                                                                           
                                                                           <div 
                                                                               className={`absolute top-1.5 bottom-1.5 rounded-md shadow-sm flex items-center px-2 overflow-hidden ${act.completionPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                                               style={{ left: `${Math.max(0, leftPercent)}%`, width: `${Math.max(1, widthPercent)}%` }}
                                                                           >
                                                                               <div className="absolute inset-0 bg-black/20" style={{ width: `${act.completionPercentage}%` }}></div>
                                                                               <span className="relative text-[8px] font-black text-white mix-blend-overlay z-10">{act.completionPercentage}%</span>
                                                                           </div>
                                                                       </div>
                                                                   </div>
                                                               );
                                                           })}
                                                       </div>
                                                   </div>
                                               );
                                           })()}
                                       </div>
                                   </div>
                               </div>
                           ) : null}
                        </div>
                    )}

                    {activeTab === 'indicator_registry' && (
                        <div className="animate-fade-in space-y-10 max-w-6xl mx-auto pb-12">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Indicator Performance Registry</h3>
                                 <p className="text-slate-500 font-medium">Standardized measurement framework linked to strategic outcomes.</p>
                              </div>
                              <button onClick={() => handleOpenIndicatorModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                                 <Plus size={18}/> New Metric
                              </button>
                           </div>

                           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                              <table className="w-full text-left text-sm">
                                 <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                       <th className="px-8 py-5">Code & Indicator Label</th>
                                       <th className="px-8 py-5">Logical Link</th>
                                       <th className="px-8 py-5 text-right">Baseline / Target</th>
                                       <th className="px-8 py-5 text-right">Actual</th>
                                       <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50 font-medium">
                                    {(activeProject.indicators || []).map(ind => {
                                        const logNode = activeProject.logframe?.find(l => l.id === ind.linkedLogframeId);
                                        return (
                                            <tr key={ind.id} className="hover:bg-slate-50/50 transition-colors">
                                               <td className="px-8 py-5">
                                                  <p className="font-mono text-[10px] font-bold text-indigo-600 mb-0.5">{ind.code}</p>
                                                  <p className="font-bold text-slate-900">{ind.name}</p>
                                                  <div className="flex items-center gap-2 mt-1">
                                                     <span className="text-[9px] font-black uppercase text-slate-400">{ind.level}</span>
                                                     <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded">{ind.frequency}</span>
                                                  </div>
                                               </td>
                                               <td className="px-8 py-5">
                                                  {logNode ? (
                                                      <span className="text-[10px] font-bold text-slate-500 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{logNode.code}</span>
                                                  ) : (
                                                      <span className="text-xs font-bold text-slate-300">N/A</span>
                                                  )}
                                               </td>
                                               <td className="px-8 py-5 text-right">
                                                   <p className="text-xs text-slate-400">Baseline: {ind.baseline}</p>
                                                   <p className="font-black text-slate-900">{ind.overallTarget} {ind.unit}</p>
                                               </td>
                                               <td className="px-8 py-5 text-right">
                                                  <div className="flex flex-col items-end gap-1.5">
                                                     <span className="font-black text-indigo-600">{ind.achieved} {ind.unit}</span>
                                                     <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div 
                                                           className={`h-full rounded-full ${Number(ind.achieved) >= Number(ind.overallTarget) ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                           style={{ width: `${Math.min(100, Number(ind.overallTarget) > 0 ? (Number(ind.achieved) / Number(ind.overallTarget)) * 100 : 0)}%` }}
                                                        ></div>
                                                     </div>
                                                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                        {Number(ind.overallTarget) > 0 ? Math.round((Number(ind.achieved) / Number(ind.overallTarget)) * 100) : 0}% Achieved
                                                     </span>
                                                  </div>
                                               </td>
                                               <td className="px-8 py-5 text-right">
                                                  <div className="flex justify-end gap-2">
                                                      <button onClick={() => handleOpenIndicatorModal(ind)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                                         <Pencil size={16} />
                                                      </button>
                                                      <button onClick={() => handleDeleteIndicator(ind.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                         <Trash2 size={16} />
                                                      </button>
                                                  </div>
                                               </td>
                                            </tr>
                                        );
                                    })}
                                    {(activeProject.indicators || []).length === 0 && (
                                        <tr><td colSpan={5} className="py-20 text-center text-slate-400 italic">No indicators registered. Build your framework first.</td></tr>
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                    )}

                    {activeTab === 'data_tools' && (
                        <div className="animate-fade-in space-y-10 max-w-6xl mx-auto pb-12">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Digital Collection Tools</h3>
                                 <p className="text-slate-500 font-medium">Associate mobile-enabled surveys with this project context.</p>
                              </div>
                              <button onClick={() => onNotify("Redirecting to AI Survey Builder...")} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                                 <Plus size={18}/> Deploy Survey
                              </button>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                                   <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                       <Lightbulb size={24} />
                                   </div>
                                   <h4 className="text-xl font-black text-slate-900">Link Global Surveys</h4>
                                   <p className="text-slate-500 text-sm font-medium">Select existing questionnaires from your organization's AI HUB to use for field monitoring in this project.</p>
                                   <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all">Select Survey to Link</button>
                               </div>

                               <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl space-y-6 relative overflow-hidden">
                                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative z-10">
                                       <Smartphone size={24} className="text-indigo-400" />
                                   </div>
                                   <h4 className="text-xl font-black relative z-10">Field Sync Status</h4>
                                   <p className="text-slate-400 text-sm font-medium relative z-10">No active data streams detected. Deploy a survey to begin receiving real-time field insights.</p>
                                   <div className="pt-4 border-t border-white/10 relative z-10">
                                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                           <span>Active Devices</span>
                                           <span className="text-indigo-400">0 Connected</span>
                                       </div>
                                   </div>
                                   <Smartphone className="absolute -bottom-10 -right-10 opacity-10" size={200} />
                               </div>
                           </div>
                        </div>
                    )}

                    {activeTab === 'activity_log' && (
                        <div className="animate-fade-in space-y-8 max-w-6xl mx-auto pb-12">
                           <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Audit Ledger</h3>
                              <p className="text-slate-500 font-medium">Historical record of project modifications and field activities.</p>
                           </div>

                           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                              <table className="w-full text-left text-sm">
                                 <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                       <th className="px-8 py-5">Action & User</th>
                                       <th className="px-8 py-5">Log Details</th>
                                       <th className="px-8 py-5 text-right">Timestamp</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100 font-medium">
                                    {activeProject.activityLog?.map((log) => (
                                       <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                          <td className="px-8 py-6">
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-[10px]">{log.user.charAt(0)}</div>
                                                <div>
                                                   <p className="font-black text-slate-900 text-sm">{log.action}</p>
                                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.user}</p>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-8 py-6 text-slate-600 text-xs leading-relaxed max-w-md">{log.details}</td>
                                          <td className="px-8 py-6 text-right font-mono text-[10px] text-slate-400 uppercase">{new Date(log.timestamp).toLocaleString()}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="animate-fade-in space-y-10 max-w-4xl mx-auto pb-12">
                           <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Project Config</h3>
                              <p className="text-slate-500 font-medium">Update operational identity and core project parameters.</p>
                           </div>

                           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 space-y-8">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Name</label>
                                    <input 
                                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-lg"
                                       value={settingsForm.name}
                                       onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Manager</label>
                                    <input 
                                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                       value={settingsForm.manager}
                                       onChange={(e) => setSettingsForm({...settingsForm, manager: e.target.value})}
                                    />
                                 </div>
                              </div>

                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                                 <textarea 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold resize-none h-24"
                                    value={settingsForm.description || ''}
                                    onChange={(e) => setSettingsForm({...settingsForm, description: e.target.value})}
                                 />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Location</label>
                                    <input 
                                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                       value={settingsForm.location}
                                       onChange={(e) => setSettingsForm({...settingsForm, location: e.target.value})}
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Total Budget (RWF)</label>
                                    <input 
                                       type="number"
                                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                       value={settingsForm.budget}
                                       onChange={(e) => setSettingsForm({...settingsForm, budget: Number(e.target.value)})}
                                    />
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Date</label>
                                    <input 
                                       type="date"
                                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                       value={settingsForm.startDate}
                                       onChange={(e) => setSettingsForm({...settingsForm, startDate: e.target.value})}
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Date</label>
                                    <input 
                                       type="date"
                                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                       value={settingsForm.endDate || ''}
                                       onChange={(e) => setSettingsForm({...settingsForm, endDate: e.target.value})}
                                    />
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Status</label>
                                    <select 
                                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                       value={settingsForm.status}
                                       onChange={(e) => setSettingsForm({...settingsForm, status: e.target.value as any})}
                                    >
                                       <option value="On Track">On Track</option>
                                       <option value="At Risk">At Risk</option>
                                       <option value="Delayed">Delayed</option>
                                    </select>
                                 </div>
                              </div>

                              <div className="pt-12 mt-12 border-t border-slate-100 flex justify-between items-center">
                                 <div className="space-y-1">
                                    <h4 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                                       <AlertOctagon size={16}/> Danger Zone
                                    </h4>
                                    <p className="text-xs text-slate-400 font-medium">Permanently remove this project node and all linked data.</p>
                                 </div>
                                 <button 
                                    onClick={handleDeleteProject}
                                    className="px-6 py-3 border-2 border-red-100 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                                 >
                                    Purge Project
                                 </button>
                              </div>

                              <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                                 <button 
                                    onClick={handleUpdateSettings}
                                    disabled={isSaving}
                                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                 >
                                    {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                                    Save Configuration
                                 </button>
                              </div>
                           </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Logframe Element Modal */}
            {isLogframeModalOpen && (
               <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
                  <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                     <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                        <h3 className="text-2xl font-black tracking-tight">Define Framework Node</h3>
                        <button onClick={() => setIsLogframeModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
                     </div>
                     <div className="p-8 space-y-6">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Logic Level</label>
                           <select 
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                              value={logframeForm.type} 
                              onChange={(e) => setLogframeForm({...logframeForm, type: e.target.value as any})}
                           >
                              <option value="Impact">Impact (Highest Level)</option>
                              <option value="Outcome">Program Outcome</option>
                              <option value="Output">Direct Output</option>
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reference Code</label>
                           <input 
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-indigo-600" 
                              placeholder="e.g. OUTCOME-1" 
                              value={logframeForm.code} 
                              onChange={(e) => setLogframeForm({...logframeForm, code: e.target.value.toUpperCase()})} 
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description / Statement</label>
                           <textarea 
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium h-32" 
                              placeholder="Describe the intended result..." 
                              value={logframeForm.description} 
                              onChange={(e) => setLogframeForm({...logframeForm, description: e.target.value})} 
                           />
                        </div>
                     </div>
                     <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                        <button onClick={handleSaveLogframe} disabled={!logframeForm.code || !logframeForm.description} className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50">Deploy Logic Node</button>
                     </div>
                  </div>
               </div>
            )}

            {/* Post-Creation Setup Prompt */}
            {isPostCreatePromptOpen && (
               <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-900/40">
                  <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in border border-slate-100">
                     <div className="relative h-48 bg-indigo-600 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-white">
                           <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                              <CheckCircle size={32} className="text-white" />
                           </div>
                           <h3 className="text-2xl font-black tracking-tight">Project Successfully Initialized</h3>
                        </div>
                        <Sparkles className="absolute top-8 right-8 text-indigo-300 opacity-50" size={40} />
                        <Zap className="absolute bottom-8 left-8 text-indigo-300 opacity-50" size={40} />
                     </div>

                     <div className="p-10 space-y-8">
                        <div className="text-center space-y-2">
                           <p className="text-slate-500 font-medium text-lg">
                              The operational node for <span className="text-indigo-600 font-black">"{activeProject?.name}"</span> is now live.
                           </p>
                           <p className="text-slate-400 text-sm">
                              Would you like to proceed with the strategic M&E configuration now?
                           </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center text-center gap-2">
                              <GitGraph size={20} className="text-indigo-600" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Results Framework</span>
                           </div>
                           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center text-center gap-2">
                              <Target size={20} className="text-indigo-600" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Indicator Registry</span>
                           </div>
                           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center text-center gap-2">
                              <TabletSmartphone size={20} className="text-indigo-600" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Digital Data Tools</span>
                           </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                           <button 
                              onClick={() => {
                                 setIsPostCreatePromptOpen(false);
                                 setIsSetupWizardOpen(true);
                                 setWizardStep(1);
                              }}
                              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 group"
                           >
                              Launch Setup Wizard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                           </button>
                           <button 
                              onClick={() => setIsPostCreatePromptOpen(false)}
                              className="w-full py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                           >
                              Skip for now, go to Dashboard
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Existing Modals (Setup Wizard, Create Project, Activity, Indicator) */}
            {isSetupWizardOpen && (
               <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/60">
                  <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
                     <div className="p-12 text-center space-y-8">
                        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto text-white shadow-2xl rotate-3">
                           {wizardStep === 1 ? <GitGraph size={40} /> : wizardStep === 2 ? <Target size={40} /> : <TabletSmartphone size={40} />}
                        </div>
                        <div>
                           <div className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.3em] mb-2">Guided Implementation: Step {wizardStep} of 3</div>
                           <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                              {wizardStep === 1 ? 'Define Your Theory of Change' : 
                               wizardStep === 2 ? 'Establish Key Performance Indicators' : 
                               'Configure Field Collection Tools'}
                           </h3>
                           <p className="text-slate-500 text-lg font-medium mt-2">
                              {wizardStep === 1 ? 'Build your Results Framework by mapping high-level Impacts to direct Outputs.' : 
                               wizardStep === 2 ? 'Register specific metrics with baselines and targets to track your progress.' : 
                               'Deploy mobile-ready digital surveys for real-time field monitoring and data sync.'}
                           </p>
                        </div>
                        
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-4 text-left">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${wizardStep >= 1 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                                <span className={`text-xs font-black uppercase tracking-widest ${wizardStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>1. Results Framework</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${wizardStep >= 2 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                                <span className={`text-xs font-black uppercase tracking-widest ${wizardStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>2. Indicator Registry</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${wizardStep >= 3 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                                <span className={`text-xs font-black uppercase tracking-widest ${wizardStep >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>3. Data Collection Tools</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <button onClick={() => setIsSetupWizardOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Configure Manually</button>
                            {wizardStep < 3 ? (
                                <button 
                                    onClick={() => {
                                        const tabs = ['framework', 'indicator_registry', 'data_tools'];
                                        setActiveTab(tabs[wizardStep - 1]);
                                        setWizardStep(prev => prev + 1);
                                    }}
                                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
                                >
                                    Initialize & Continue <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        setActiveTab('data_tools');
                                        setIsSetupWizardOpen(false);
                                    }}
                                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
                                >
                                    Launch Project Workspace
                                </button>
                            )}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {createModal}

            {isActivityModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
                  <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                     <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                        <h3 className="text-2xl font-black tracking-tight">{editingActivityId ? 'Modify Field Task' : 'Deploy Activity Node'}</h3>
                        <button onClick={() => setIsActivityModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
                     </div>
                     <div className="p-8 space-y-6">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Task Definition</label>
                           <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="e.g. Household Health Screening" value={activityForm.name} onChange={(e) => setActivityForm({...activityForm, name: e.target.value})} />
                        </div>
                        
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-1 flex items-center gap-1.5"><Link2 size={12} /> Strategic Alignment (Framework Output)</label>
                           <select 
                                className="w-full p-4 bg-slate-50 border border-indigo-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                                value={activityForm.linkedOutputId || ''}
                                onChange={(e) => setActivityForm({...activityForm, linkedOutputId: e.target.value})}
                           >
                                <option value="">-- No Output Linked --</option>
                                {(activeProject.logframe || []).filter(lf => lf.type === 'Output').map(o => (
                                    <option key={o.id} value={o.id}>{o.code}: {o.description.substring(0, 40)}...</option>
                                ))}
                           </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assigned Lead</label>
                              <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="Officer Name" value={activityForm.assignedTo} onChange={(e) => setActivityForm({...activityForm, assignedTo: e.target.value})} />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={activityForm.status} onChange={(e) => setActivityForm({...activityForm, status: e.target.value as any})}>
                                 <option value="Not Started">Not Started</option>
                                 <option value="In Progress">In Progress</option>
                                 <option value="Completed">Completed</option>
                                 <option value="Delayed">Delayed</option>
                                 <option value="Cancelled">Cancelled</option>
                              </select>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Implementation Date</label>
                              <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={activityForm.startDate} onChange={(e) => setActivityForm({...activityForm, startDate: e.target.value})} />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Current Progress (%)</label>
                              <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={activityForm.completionPercentage} onChange={(e) => setActivityForm({...activityForm, completionPercentage: Number(e.target.value)})} />
                           </div>
                        </div>
                     </div>
                     <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                        <button onClick={handleSaveActivity} disabled={isSaving || !activityForm.name} className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50">
                           {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Sync Activity node'}
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {isIndicatorModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
                  <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                     <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                        <h3 className="text-2xl font-black tracking-tight">{editingIndicatorId ? 'Update KPI Metric' : 'Define KPI Metric'}</h3>
                        <button onClick={() => setIsIndicatorModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
                     </div>
                     <div className="p-8 space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5 col-span-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Code</label>
                                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="KPI 1.1" value={indicatorForm.code} onChange={e => setIndicatorForm({...indicatorForm, code: e.target.value})} />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Indicator Name</label>
                                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Measurement description..." value={indicatorForm.name} onChange={e => setIndicatorForm({...indicatorForm, name: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unit</label>
                                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="e.g. Percentage" value={indicatorForm.unit} onChange={e => setIndicatorForm({...indicatorForm, unit: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Frequency</label>
                                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={indicatorForm.frequency} onChange={e => setIndicatorForm({...indicatorForm, frequency: e.target.value as any})}>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Annually">Annually</option>
                                 </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Baseline</label>
                                <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="0" value={indicatorForm.baseline || 0} onChange={e => setIndicatorForm({...indicatorForm, baseline: Number(e.target.value)})} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Overall Target</label>
                                <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="100" value={indicatorForm.overallTarget || 0} onChange={e => setIndicatorForm({...indicatorForm, overallTarget: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Linked Logframe Element</label>
                            <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={indicatorForm.linkedLogframeId || ''} onChange={e => setIndicatorForm({...indicatorForm, linkedLogframeId: e.target.value})}>
                                <option value="">None</option>
                                {activeProject.logframe?.map(l => (
                                    <option key={l.id} value={l.id}>{l.code} - {l.description}</option>
                                ))}
                            </select>
                        </div>
                     </div>
                     <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                        <button onClick={handleSaveIndicator} className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl">
                            {editingIndicatorId ? 'Update Indicator' : 'Deploy Indicator'}
                         </button>
                     </div>
                  </div>
               </div>
            )}
        </div>
      );
  }

  return (
    <>
    <div className="max-w-7xl mx-auto p-6 animate-fade-in pb-20">
      <div className="flex justify-between items-end mb-12">
        <div>
           <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mb-3">Portfolio Management</div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Active Program Hub</h1>
           <p className="text-slate-500 font-medium text-lg mt-1">Orchestrating Rwandan NGO and corporate operations across provinces.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-2xl">
          <Plus size={20} /> Initialize New Project
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search projects by name, manager or location..." 
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
        <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 border-none rounded-2xl">
           <Calendar size={18} className="text-slate-400" />
           <select 
             className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer pr-4"
             value={filterYear}
             onChange={(e) => setFilterYear(e.target.value)}
           >
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
              ))}
           </select>
        </div>
        <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 border-none rounded-2xl">
           <MapPin size={18} className="text-slate-400" />
           <select 
             className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer pr-4"
             value={filterLocation}
             onChange={(e) => setFilterLocation(e.target.value)}
           >
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
              ))}
           </select>
        </div>
        <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 border-none rounded-2xl">
           <BarChart3 size={18} className="text-slate-400" />
           <select 
             className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer pr-4"
             value={sortBy}
             onChange={(e) => setSortBy(e.target.value as any)}
           >
              <option value="Name">Sort by Name</option>
              <option value="Status">Sort by Status</option>
              <option value="Manager">Sort by Manager</option>
              <option value="Progress">Sort by Progress</option>
           </select>
        </div>
        {(searchQuery || filterStatus !== 'All' || filterLocation !== 'All' || filterYear !== 'All' || sortBy !== 'Name') && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('All');
              setFilterLocation('All');
              setFilterYear('All');
              setSortBy('Name');
            }}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
          >
            <X size={16} /> Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredProjects.map(project => (
          <div key={project.id} onClick={() => openProjectDetail(project)} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full">
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><FolderKanban size={28} /></div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{project.location}</p>
                  </div>
                </div>
              </div>
              {project.description && (
                <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              )}
              <div className="space-y-6">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                   <span>Global Completion</span>
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
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PM Lead</p>
                       <div className="flex items-center gap-2 text-sm font-black text-slate-900 truncate"><User size={14} className="text-indigo-400" />{project.manager}</div>
                    </div>
                 </div>
                 {project.thematicAreas && project.thematicAreas.length > 0 && (
                   <div className="pt-2 flex flex-wrap gap-1.5">
                     {project.thematicAreas.slice(0, 2).map(area => (
                       <span key={area} className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                         {area}
                       </span>
                     ))}
                     {project.thematicAreas.length > 2 && (
                       <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                         +{project.thematicAreas.length - 2}
                       </span>
                     )}
                   </div>
                 )}
              </div>
            </div>
            <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex justify-between items-center group-hover:bg-indigo-50/50 transition-colors">
               <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black uppercase text-indigo-600 shadow-sm">{project.manager?.charAt(0) || 'U'}</div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Context</span>
               </div>
               <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${project.status === 'On Track' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{project.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    {createModal}
    </>
  );
};

export default ProjectsView;
