import React, { useState } from 'react';
import { Project, ProjectActivity, ProjectPartner, ProjectRisk, ProjectMilestone } from '../types';
import { 
  ArrowLeft, FolderKanban, Calendar, Users, DollarSign, 
  MapPin, CheckCircle, Target, Activity, Clock, User,
  List, LayoutGrid, AlertTriangle, CheckSquare, X,
  PieChart as PieChartIcon, LineChart, Plus, Edit2, Trash2,
  FileText, Upload, Sparkles, Loader2, Network, Link,
  Flag, CheckCircle2, Circle
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { RichTextEditor } from './RichTextEditor';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  onOpenWorkspace: (project: Project) => void;
  onNavigateToAnalysis?: (projectId: string) => void;
  onUpdateProject?: (project: Project) => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onBack, onOpenWorkspace, onNavigateToAnalysis, onUpdateProject }) => {
  const [activityViewMode, setActivityViewMode] = useState<'LIST' | 'BOARD' | 'GANTT' | 'GRAPH'>('LIST');
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [partnerForm, setPartnerForm] = useState<Partial<ProjectPartner>>({
    name: '',
    role: 'Implementing Partner',
    contributionAmount: 0,
    contactPerson: '',
    email: ''
  });

  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [riskForm, setRiskForm] = useState<Partial<ProjectRisk>>({
    description: '',
    category: 'Operational',
    probability: 'Medium',
    impact: 'Medium',
    mitigationStrategy: '',
    status: 'Active',
    owner: ''
  });

  const [isEditingNarrative, setIsEditingNarrative] = useState(false);
  const [narrativeText, setNarrativeText] = useState(project.narrative || '');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkForm, setLinkForm] = useState({ source: '', target: '' });
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState<Partial<ProjectActivity>>({
    name: '',
    category: 'Implementation',
    status: 'Not Started',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    completionPercentage: 0,
    linkedOutputId: '',
    dependencies: []
  });

  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    name: '',
    category: 'Report',
    content: ''
  });

  const [isRecordDataModalOpen, setIsRecordDataModalOpen] = useState(false);
  const [recordingIndicatorId, setRecordingIndicatorId] = useState<string | null>(null);
  const [recordDataForm, setRecordDataForm] = useState<{period: string, actual: number}>({
    period: new Date().getFullYear().toString(),
    actual: 0
  });

  const [isRecordOperationModalOpen, setIsRecordOperationModalOpen] = useState(false);
  const [recordingBudgetLineId, setRecordingBudgetLineId] = useState<string | null>(null);
  const [operationForm, setOperationForm] = useState<{date: string, amount: number, description: string}>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: ''
  });

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [milestoneForm, setMilestoneForm] = useState<Partial<ProjectMilestone>>({
    name: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Not Started'
  });

  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [achievementActivityId, setAchievementActivityId] = useState<string | null>(null);
  const [achievementForm, setAchievementForm] = useState<Partial<ActivityAchievement>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reportedBy: 'Current User'
  });

  const handleOpenMilestoneModal = (milestone?: ProjectMilestone) => {
    if (milestone) {
      setEditingMilestoneId(milestone.id);
      setMilestoneForm(milestone);
    } else {
      setEditingMilestoneId(null);
      setMilestoneForm({
        name: '',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Not Started'
      });
    }
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = () => {
    if (!onUpdateProject || !milestoneForm.name || !milestoneForm.dueDate) return;
    
    const newMilestone: ProjectMilestone = {
      id: editingMilestoneId || `ms-${Date.now()}`,
      name: milestoneForm.name,
      dueDate: milestoneForm.dueDate,
      status: milestoneForm.status as any,
      completionDate: milestoneForm.status === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
    };

    let updatedMilestones;
    if (editingMilestoneId) {
      updatedMilestones = (project.milestones || []).map(m => m.id === editingMilestoneId ? newMilestone : m);
    } else {
      updatedMilestones = [...(project.milestones || []), newMilestone];
    }

    onUpdateProject({
      ...project,
      milestones: updatedMilestones
    });
    setIsMilestoneModalOpen(false);
  };

  const handleDeleteMilestone = (id: string) => {
    if (!onUpdateProject) return;
    if (confirm("Are you sure you want to remove this milestone?")) {
      onUpdateProject({
        ...project,
        milestones: (project.milestones || []).filter(m => m.id !== id)
      });
    }
  };

  const handleSaveNarrative = () => {
    if (!onUpdateProject) return;
    onUpdateProject({
      ...project,
      narrative: narrativeText
    });
    setIsEditingNarrative(false);
  };

  const handleGenerateInsight = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const docsContext = (project.documents || [])
        .map(d => `Document: ${d.name} (${d.category})\nContent: ${d.content || 'No content provided'}`)
        .join('\n\n');
        
      const prompt = `Analyze the following project details, narrative, and documents to provide a strategic insight or summary.
      
Project Name: ${project.name}
Status: ${project.status}
Progress: ${project.progress}%
Narrative: ${project.narrative || 'No narrative provided.'}

Documents:
${docsContext}

Provide a concise, 2-3 sentence strategic insight based on this information.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setAiInsight(response.text || "Analysis complete. No specific insights generated.");
    } catch (e: any) {
      if (e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('RESOURCE_EXHAUSTED')) {
        setAiInsight("AI Insights are currently unavailable due to API quota limits. Please try again later.");
      } else {
        setAiInsight("Failed to generate insight. Please check your API key and try again.");
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveDocument = () => {
    if (!onUpdateProject || !documentForm.name) return;
    
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: documentForm.name,
      type: 'TXT',
      category: documentForm.category,
      size: `${(documentForm.content.length / 1024).toFixed(1)} KB`,
      owner: 'Current User',
      date: new Date().toISOString().split('T')[0],
      content: documentForm.content
    };
    
    onUpdateProject({
      ...project,
      documents: [...(project.documents || []), newDoc]
    });
    
    setIsDocumentModalOpen(false);
    setDocumentForm({ name: '', category: 'Report', content: '' });
  };

  const handleOpenRecordDataModal = (indicatorId: string) => {
    setRecordingIndicatorId(indicatorId);
    setRecordDataForm({
      period: new Date().getFullYear().toString(),
      actual: 0
    });
    setIsRecordDataModalOpen(true);
  };

  const handleOpenRecordOperationModal = (budgetLineId: string) => {
    setRecordingBudgetLineId(budgetLineId);
    setOperationForm({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: ''
    });
    setIsRecordOperationModalOpen(true);
  };

  const handleSaveRecordOperation = () => {
    if (!onUpdateProject || !recordingBudgetLineId || !operationForm.amount) return;

    const updatedBudgetLines = (project.budgetLines || []).map(line => {
      if (line.id === recordingBudgetLineId) {
        const newOperations = [...(line.operations || []), {
          id: `op-${Date.now()}`,
          date: operationForm.date,
          amount: Number(operationForm.amount),
          description: operationForm.description,
          recordedBy: 'Current User' // Ideally from context
        }];
        
        const totalSpent = newOperations.reduce((sum, op) => sum + op.amount, 0);
        const variance = line.allocated - totalSpent;

        return {
          ...line,
          operations: newOperations,
          spent: totalSpent,
          variance: variance
        };
      }
      return line;
    });

    const totalProjectSpent = updatedBudgetLines.reduce((sum, line) => sum + line.spent, 0);

    onUpdateProject({
      ...project,
      budgetLines: updatedBudgetLines,
      spent: totalProjectSpent
    });

    setIsRecordOperationModalOpen(false);
    setRecordingBudgetLineId(null);
  };

  const handleSaveRecordData = () => {
    if (!onUpdateProject || !recordingIndicatorId || !recordDataForm.period) return;

    const updatedIndicators = (project.indicators || []).map(ind => {
      if (ind.id === recordingIndicatorId) {
        const newPeriodicData = [...(ind.periodicData || []), {
          period: recordDataForm.period,
          target: Number(ind.overallTarget),
          actual: Number(recordDataForm.actual)
        }];
        
        const totalAchieved = newPeriodicData.reduce((sum, data) => sum + data.actual, 0);

        return {
          ...ind,
          periodicData: newPeriodicData,
          achieved: totalAchieved
        };
      }
      return ind;
    });

    onUpdateProject({
      ...project,
      indicators: updatedIndicators
    });

    setIsRecordDataModalOpen(false);
    setRecordingIndicatorId(null);
  };

  const handleDeleteDocument = (id: string) => {
    if (!onUpdateProject) return;
    if (confirm("Are you sure you want to remove this document?")) {
      onUpdateProject({
        ...project,
        documents: (project.documents || []).filter(d => d.id !== id)
      });
    }
  };

  const handleOpenActivityModal = (activity?: ProjectActivity) => {
    if (activity) {
      setEditingActivityId(activity.id);
      setActivityForm({ ...activity, dependencies: activity.dependencies || [] });
    } else {
      setEditingActivityId(null);
      setActivityForm({
        name: '',
        category: 'Implementation',
        status: 'Not Started',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        assignedTo: '',
        completionPercentage: 0,
        linkedOutputId: '',
        dependencies: []
      });
    }
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = () => {
    if (!onUpdateProject || !activityForm.name || !activityForm.assignedTo) return;

    const newActivity: ProjectActivity = {
      id: editingActivityId || `act-${Date.now()}`,
      name: activityForm.name,
      category: activityForm.category as any,
      status: activityForm.status as any,
      startDate: activityForm.startDate || new Date().toISOString().split('T')[0],
      endDate: activityForm.endDate || new Date().toISOString().split('T')[0],
      assignedTo: activityForm.assignedTo,
      completionPercentage: Number(activityForm.completionPercentage) || 0,
      linkedOutputId: activityForm.linkedOutputId || '',
      dependencies: activityForm.dependencies || []
    };

    let updatedActivities;
    if (editingActivityId) {
      updatedActivities = (project.activities || []).map(a => a.id === editingActivityId ? newActivity : a);
    } else {
      updatedActivities = [...(project.activities || []), newActivity];
    }

    onUpdateProject({
      ...project,
      activities: updatedActivities
    });
    setIsActivityModalOpen(false);
  };

  const handleSaveLink = () => {
    if (!onUpdateProject || !linkForm.source || !linkForm.target || linkForm.source === linkForm.target) return;
    const targetActivity = project.activities?.find(a => a.id === linkForm.target);
    if (!targetActivity) return;
    
    const newDeps = [...(targetActivity.dependencies || [])];
    if (!newDeps.includes(linkForm.source)) {
      newDeps.push(linkForm.source);
    }
    
    const updatedActivities = (project.activities || []).map(a => 
      a.id === linkForm.target ? { ...a, dependencies: newDeps } : a
    );
    
    onUpdateProject({ ...project, activities: updatedActivities });
    setIsLinkModalOpen(false);
    setLinkForm({ source: '', target: '' });
  };

  const handleOpenAchievementModal = (activityId: string) => {
    setAchievementActivityId(activityId);
    setAchievementForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      reportedBy: 'Current User'
    });
    setIsAchievementModalOpen(true);
  };

  const handleSaveAchievement = () => {
    if (!onUpdateProject || !achievementActivityId) return;
    
    const newAchievement: ActivityAchievement = {
      id: `ach_${Date.now()}`,
      date: achievementForm.date || new Date().toISOString().split('T')[0],
      description: achievementForm.description || '',
      reportedBy: achievementForm.reportedBy || 'Current User'
    };

    const updatedActivities = (project.activities || []).map(a => {
      if (a.id === achievementActivityId) {
        return {
          ...a,
          achievements: [...(a.achievements || []), newAchievement]
        };
      }
      return a;
    });

    onUpdateProject({ ...project, activities: updatedActivities });
    setIsAchievementModalOpen(false);
  };

  const handleDeleteActivity = (id: string) => {
    if (!onUpdateProject) return;
    if (confirm("Are you sure you want to remove this activity?")) {
      onUpdateProject({
        ...project,
        activities: (project.activities || []).filter(a => a.id !== id)
      });
    }
  };

  const handleUpdateActivityStatus = (id: string, newStatus: ProjectActivity['status']) => {
    if (!onUpdateProject) return;
    const updatedActivities = (project.activities || []).map(a => {
      if (a.id === id) {
        return { 
          ...a, 
          status: newStatus,
          completionPercentage: newStatus === 'Completed' ? 100 : (newStatus === 'Not Started' ? 0 : a.completionPercentage)
        };
      }
      return a;
    });
    onUpdateProject({
      ...project,
      activities: updatedActivities
    });
  };

  const handleOpenRiskModal = (risk?: ProjectRisk) => {
    if (risk) {
      setEditingRiskId(risk.id);
      setRiskForm(risk);
    } else {
      setEditingRiskId(null);
      setRiskForm({
        description: '',
        category: 'Operational',
        probability: 'Medium',
        impact: 'Medium',
        mitigationStrategy: '',
        status: 'Active',
        owner: ''
      });
    }
    setIsRiskModalOpen(true);
  };

  const handleSaveRisk = () => {
    if (!onUpdateProject || !riskForm.description || !riskForm.owner) return;

    const newRisk: ProjectRisk = {
      id: editingRiskId || `risk-${Date.now()}`,
      description: riskForm.description,
      category: riskForm.category as any,
      probability: riskForm.probability as any,
      impact: riskForm.impact as any,
      mitigationStrategy: riskForm.mitigationStrategy || '',
      status: riskForm.status as any,
      owner: riskForm.owner
    };

    let updatedRisks;
    if (editingRiskId) {
      updatedRisks = (project.risks || []).map(r => r.id === editingRiskId ? newRisk : r);
    } else {
      updatedRisks = [...(project.risks || []), newRisk];
    }

    onUpdateProject({
      ...project,
      risks: updatedRisks
    });
    setIsRiskModalOpen(false);
  };

  const handleDeleteRisk = (id: string) => {
    if (!onUpdateProject) return;
    if (confirm("Are you sure you want to remove this risk?")) {
      onUpdateProject({
        ...project,
        risks: (project.risks || []).filter(r => r.id !== id)
      });
    }
  };

  const handleOpenPartnerModal = (partner?: ProjectPartner) => {
    if (partner) {
      setEditingPartnerId(partner.id);
      setPartnerForm(partner);
    } else {
      setEditingPartnerId(null);
      setPartnerForm({
        name: '',
        role: 'Implementing Partner',
        contributionAmount: 0,
        contactPerson: '',
        email: ''
      });
    }
    setIsPartnerModalOpen(true);
  };

  const handleSavePartner = () => {
    if (!onUpdateProject || !partnerForm.name || !partnerForm.role || !partnerForm.contactPerson || !partnerForm.email) return;

    const newPartner: ProjectPartner = {
      id: editingPartnerId || `partner-${Date.now()}`,
      name: partnerForm.name,
      role: partnerForm.role as any,
      contributionAmount: partnerForm.contributionAmount,
      contactPerson: partnerForm.contactPerson,
      email: partnerForm.email
    };

    let updatedPartners;
    if (editingPartnerId) {
      updatedPartners = (project.partners || []).map(p => p.id === editingPartnerId ? newPartner : p);
    } else {
      updatedPartners = [...(project.partners || []), newPartner];
    }

    onUpdateProject({
      ...project,
      partners: updatedPartners
    });
    setIsPartnerModalOpen(false);
  };

  const handleDeletePartner = (id: string) => {
    if (!onUpdateProject) return;
    if (confirm("Are you sure you want to remove this partner?")) {
      onUpdateProject({
        ...project,
        partners: (project.partners || []).filter(p => p.id !== id)
      });
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

  const kanbanColumns = ['Not Started', 'In Progress', 'Completed', 'Delayed', 'Cancelled'];

  // Generate mock progress data based on start date and current progress
  const generateProgressData = () => {
    const start = new Date(project.startDate);
    const end = project.endDate ? new Date(project.endDate) : new Date();
    const now = new Date();
    const actualEnd = end > now ? now : end;
    
    const months = [];
    let current = new Date(start);
    
    // Calculate total months
    let totalMonths = (actualEnd.getFullYear() - start.getFullYear()) * 12 + (actualEnd.getMonth() - start.getMonth());
    if (totalMonths <= 0) totalMonths = 1;

    const progressIncrement = project.progress / totalMonths;
    
    let currentProgress = 0;
    while (current <= actualEnd) {
      months.push({
        month: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        progress: Math.min(Math.round(currentProgress), project.progress)
      });
      currentProgress += progressIncrement;
      current.setMonth(current.getMonth() + 1);
    }
    
    // Ensure the last point matches current progress
    if (months.length > 0) {
      months[months.length - 1].progress = project.progress;
    } else {
      months.push({
        month: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        progress: project.progress
      });
    }
    
    return months;
  };

  const progressData = generateProgressData();

  return (
    <div className="flex flex-col h-full animate-fade-in bg-white h-screen overflow-hidden relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-0.5">
              Project Details
            </div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban className="text-indigo-600" size={24}/>
              {project.name}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          {onNavigateToAnalysis && (
            <button 
              onClick={() => onNavigateToAnalysis(project.id)} 
              className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
              <LineChart size={18} />
              Data Analysis
            </button>
          )}
          <button 
            onClick={() => onOpenWorkspace(project)} 
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Open Workspace
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
          
          {/* Hero Section */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${project.status === 'On Track' ? 'bg-green-100 text-green-700' : project.status === 'Delayed' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {project.status}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <MapPin size={12} /> {project.location}
                  </span>
                  {project.thematicAreas && project.thematicAreas.map(area => (
                    <span key={area} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {area}
                    </span>
                  ))}
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 leading-tight">{project.name}</h3>
                <p className="text-slate-500 font-medium mb-8">
                  {project.description || "Comprehensive overview of project metrics, financials, and operational status."}
                </p>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      {project.manager.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Manager</p>
                      <p className="font-bold text-slate-900">{project.manager}</p>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-slate-200"></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Start Date</p>
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar size={14} className="text-indigo-400" />
                      {project.startDate}
                    </p>
                  </div>
                  {project.endDate && (
                    <>
                      <div className="h-10 w-px bg-slate-200"></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">End Date</p>
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar size={14} className="text-indigo-400" />
                          {project.endDate}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex flex-col justify-center">
                <div className="mb-6">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                    <span>Overall Progress</span>
                    <span className="text-indigo-600">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{width: `${project.progress}%`}}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Budget</p>
                    <p className="text-xl font-black text-slate-900 flex items-center gap-1">
                      <DollarSign size={16} className="text-indigo-400" />
                      {(project.budget / 1000000).toFixed(1)}M RWF
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Spent</p>
                    <p className="text-xl font-black text-slate-900 flex items-center gap-1">
                      <DollarSign size={16} className="text-indigo-400" />
                      {(project.spent / 1000000).toFixed(1)}M RWF
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {project.customFields && Object.keys(project.customFields).length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Custom Attributes</p>
                <div className="flex flex-wrap gap-6">
                  {Object.entries(project.customFields).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{key}</p>
                      <p className="font-bold text-slate-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Beneficiaries</p>
                <p className="text-2xl font-black text-slate-900">{project.beneficiaries.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activities</p>
                <p className="text-2xl font-black text-slate-900">{project.activities?.length || 0}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                <Target size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Indicators</p>
                <p className="text-2xl font-black text-slate-900">{project.indicators?.length || 0}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Risks</p>
                <p className="text-2xl font-black text-slate-900">{project.risks?.length || 0}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interventions</p>
                <p className="text-2xl font-black text-slate-900">{project.interventions?.length || 0}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partners</p>
                <p className="text-2xl font-black text-slate-900">{project.partners?.length || 0}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Log Entries</p>
                <p className="text-2xl font-black text-slate-900">{project.activityLog?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity & Budget Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
              <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="text-indigo-600" size={20} /> Recent Activity
              </h4>
              <div className="space-y-6">
                {project.activityLog?.slice(0, 5).map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {log.user.charAt(0)}
                      </div>
                      {index < Math.min(project.activityLog.length, 5) - 1 && (
                        <div className="w-px h-full bg-slate-100 my-1"></div>
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-bold text-slate-900">{log.action}</p>
                      <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {(!project.activityLog || project.activityLog.length === 0) && (
                  <p className="text-sm text-slate-500 italic text-center py-4">No recent activity.</p>
                )}
              </div>
            </div>

            {/* Budget & Resource Distribution */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
              <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <PieChartIcon className="text-indigo-600" size={20} /> Budget & Resource Distribution
              </h4>
              
              {project.budgetLines && project.budgetLines.length > 0 ? (
                <div className="space-y-8">
                  {/* Overall Budget Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(() => {
                      const totalPlanned = project.budgetLines.reduce((sum, line) => sum + line.allocated, 0);
                      const totalSpent = project.budgetLines.reduce((sum, line) => sum + line.spent, 0);
                      const variance = totalPlanned - totalSpent;
                      const variancePercent = totalPlanned > 0 ? (variance / totalPlanned) * 100 : 0;
                      const burnRate = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;
                      const remaining = totalPlanned - totalSpent;
                      const status = burnRate > 100 ? 'Over Budget' : burnRate < 50 ? 'Underutilized' : 'On Track';

                      return (
                        <>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Planned Budget</p>
                            <p className="text-lg font-black text-slate-900">RWF {(totalPlanned / 1000000).toFixed(1)}M</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Actual Expenditure</p>
                            <p className="text-lg font-black text-slate-900">RWF {(totalSpent / 1000000).toFixed(1)}M</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Variance</p>
                            <p className={`text-lg font-black ${variance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                              RWF {(variance / 1000000).toFixed(1)}M ({variancePercent.toFixed(1)}%)
                            </p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Burn Rate</p>
                            <p className="text-lg font-black text-slate-900">{burnRate.toFixed(1)}%</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Remaining Balance</p>
                            <p className="text-lg font-black text-slate-900">RWF {(remaining / 1000000).toFixed(1)}M</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Utilization Status</p>
                            <p className={`text-sm font-bold px-2 py-1 rounded inline-block mt-1 ${
                              status === 'On Track' ? 'bg-emerald-100 text-emerald-700' :
                              status === 'Over Budget' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {status}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Budget Lines Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-tl-xl">Category</th>
                          <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Planned</th>
                          <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Spent</th>
                          <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Variance</th>
                          <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Burn Rate</th>
                          <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                          <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-tr-xl">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.budgetLines.map((line) => {
                          const burnRate = line.allocated > 0 ? (line.spent / line.allocated) * 100 : 0;
                          const variance = line.allocated - line.spent;
                          const status = burnRate > 100 ? 'Over Budget' : burnRate < 50 ? 'Underutilized' : 'On Track';
                          
                          return (
                            <tr key={line.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-bold text-slate-700 text-xs">{line.category}</td>
                              <td className="p-3 text-xs text-slate-600">RWF {(line.allocated / 1000000).toFixed(1)}M</td>
                              <td className="p-3 text-xs text-slate-600">RWF {(line.spent / 1000000).toFixed(1)}M</td>
                              <td className={`p-3 text-xs font-bold ${variance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                RWF {(variance / 1000000).toFixed(1)}M
                              </td>
                              <td className="p-3 text-xs text-slate-600">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-full rounded-full ${burnRate > 100 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{width: `${Math.min(burnRate, 100)}%`}}></div>
                                  </div>
                                  <span>{burnRate.toFixed(0)}%</span>
                                </div>
                              </td>
                              <td className="p-3 text-xs">
                                <span className={`px-2 py-1 rounded font-bold ${
                                  status === 'On Track' ? 'bg-emerald-100 text-emerald-700' :
                                  status === 'Over Budget' ? 'bg-red-100 text-red-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {status}
                                </span>
                              </td>
                              <td className="p-3 text-xs">
                                <button 
                                  onClick={() => handleOpenRecordOperationModal(line.id)}
                                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold"
                                >
                                  <Plus size={14} /> Record Op
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic text-center py-4">No budget breakdown available.</p>
              )}
            </div>
          </div>

          {/* Progress Over Time */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <LineChart className="text-indigo-600" size={20} /> Progress Over Time
            </h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={progressData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value}%`, 'Progress']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Narrative & AI Insights Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="text-indigo-600" size={20} /> Project Narrative
              </h4>
              <div className="flex gap-2">
                {!isEditingNarrative ? (
                  <button 
                    onClick={() => setIsEditingNarrative(true)}
                    className="p-2 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-colors border border-slate-200"
                    title="Edit Narrative"
                  >
                    <Edit2 size={16} />
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsEditingNarrative(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveNarrative}
                      className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="mb-8">
              {isEditingNarrative ? (
                <RichTextEditor 
                  content={narrativeText} 
                  onChange={setNarrativeText} 
                />
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px]">
                  {project.narrative ? (
                    <div 
                      className="prose prose-sm sm:prose-base max-w-none text-slate-700" 
                      dangerouslySetInnerHTML={{ __html: project.narrative }} 
                    />
                  ) : (
                    <p className="text-slate-400 italic">No narrative recorded for this project yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* AI Insights Sub-section */}
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-black text-indigo-900 flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={18} /> AI Strategic Insight
                </h5>
                <button 
                  onClick={handleGenerateInsight}
                  disabled={isAiLoading}
                  className="px-4 py-2 bg-white text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-50 transition-colors border border-indigo-200 shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isAiLoading ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : 'Generate Insight'}
                </button>
              </div>
              
              <div className="bg-white/60 p-4 rounded-xl border border-white/40">
                {aiInsight ? (
                  <p className="text-slate-700 font-medium leading-relaxed">{aiInsight}</p>
                ) : (
                  <p className="text-slate-500 italic text-sm">Click 'Generate Insight' to analyze the project's narrative and documents.</p>
                )}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Upload className="text-indigo-600" size={20} /> Project Documents
              </h4>
              <button 
                onClick={() => setIsDocumentModalOpen(true)}
                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all"
              >
                <Plus size={14} /> Add Document
              </button>
            </div>
            
            {project.documents && project.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.documents.map(doc => (
                  <div key={doc.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-4 group">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{doc.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="font-medium bg-slate-200 px-1.5 py-0.5 rounded">{doc.category}</span>
                        <span>{doc.size}</span>
                        <span>{doc.date}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium text-sm">No documents uploaded yet.</p>
              </div>
            )}
          </div>

          {/* Project Activities Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckSquare className="text-indigo-600" size={20} /> Project Activities
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setActivityViewMode('LIST')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activityViewMode === 'LIST' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <List size={14} /> List View
                  </button>
                  <button 
                    onClick={() => setActivityViewMode('BOARD')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activityViewMode === 'BOARD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <LayoutGrid size={14} /> Board View
                  </button>
                  <button 
                    onClick={() => setActivityViewMode('GANTT')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activityViewMode === 'GANTT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Calendar size={14} /> Gantt View
                  </button>
                  <button 
                    onClick={() => setActivityViewMode('GRAPH')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activityViewMode === 'GRAPH' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Network size={14} /> Dependency Graph
                  </button>
                </div>
                {onUpdateProject && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsLinkModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <Link size={16} /> Link Activities
                    </button>
                    <button 
                      onClick={() => handleOpenActivityModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <Plus size={16} /> Add Activity
                    </button>
                  </div>
                )}
              </div>
            </div>

            {(!project.activities || project.activities.length === 0) ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckSquare size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">No activities recorded for this project yet.</p>
              </div>
            ) : activityViewMode === 'LIST' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Name</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Timeline</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</th>
                      {onUpdateProject && <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>}
                    </tr>
                  </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.activities.map(activity => (
                        <React.Fragment key={activity.id}>
                          <tr className="hover:bg-slate-50 transition-colors group">
                            <td className="py-4 pr-4">
                              <p className="font-bold text-slate-900 text-sm">{activity.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <User size={12} /> {activity.assignedTo}
                                </p>
                                {activity.dependencies && activity.dependencies.length > 0 && (
                                  <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title={`Depends on: ${activity.dependencies.map(d => project.activities?.find(a => a.id === d)?.name).join(', ')}`}>
                                    <AlertTriangle size={10} />
                                    {activity.dependencies.length} dep(s)
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600">
                                {activity.category}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getActivityStatusColor(activity.status)}`}>
                                {getActivityStatusIcon(activity.status)}
                                {activity.status}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Calendar size={12} className="text-slate-400" />
                                {activity.startDate} <ArrowLeft size={10} className="rotate-180 text-slate-300" /> {activity.endDate}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden w-24">
                                  <div 
                                    className={`h-full rounded-full ${activity.completionPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                    style={{width: `${activity.completionPercentage}%`}}
                                  ></div>
                                </div>
                                <span className="text-[10px] font-black text-slate-500 w-8">{activity.completionPercentage}%</span>
                              </div>
                            </td>
                            {onUpdateProject && (
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleOpenAchievementModal(activity.id)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Report Achievement"
                                  >
                                    <FileText size={16} />
                                  </button>
                                  {activity.status !== 'Completed' && (
                                    <button 
                                      onClick={() => handleUpdateActivityStatus(activity.id, 'Completed')}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Mark as Completed"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleOpenActivityModal(activity)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Edit Activity"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteActivity(activity.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Activity"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                          {activity.achievements && activity.achievements.length > 0 && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={6} className="py-3 px-4 border-t border-slate-100">
                                <div className="pl-4 border-l-2 border-indigo-200">
                                  <h5 className="text-xs font-bold text-slate-700 mb-2">Reported Achievements</h5>
                                  <div className="space-y-2">
                                    {activity.achievements.map(ach => (
                                      <div key={ach.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm">
                                        <div className="flex justify-between items-start mb-1">
                                          <span className="font-medium text-slate-800">{ach.description}</span>
                                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{ach.date}</span>
                                        </div>
                                        <div className="text-xs text-slate-500">Reported by: {ach.reportedBy}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                </table>
              </div>
            ) : activityViewMode === 'BOARD' ? (
              <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                {kanbanColumns.map(column => {
                  const columnActivities = project.activities.filter(a => a.status === column);
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
                          <div key={activity.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
                            {onUpdateProject && (
                              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-100">
                                {activity.status !== 'Completed' && (
                                  <button 
                                    onClick={() => handleUpdateActivityStatus(activity.id, 'Completed')}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                    title="Mark as Completed"
                                  >
                                    <CheckCircle size={14} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleOpenActivityModal(activity)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                  title="Edit Activity"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteActivity(activity.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete Activity"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                            <div className="flex justify-between items-start mb-2">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
                                {activity.category}
                              </span>
                            </div>
                            <h6 className="font-bold text-slate-900 text-sm mb-3 leading-tight pr-12">{activity.name}</h6>
                            
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
                                  {activity.assignedTo.charAt(0)}
                                </div>
                              </div>
                            </div>
                            {activity.dependencies && activity.dependencies.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-100">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Dependencies</p>
                                <div className="flex flex-wrap gap-1">
                                  {activity.dependencies.map(depId => {
                                    const dep = project.activities?.find(a => a.id === depId);
                                    return dep ? (
                                      <span key={depId} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold truncate max-w-[120px]" title={dep.name}>
                                        {dep.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}
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
              <div className="overflow-x-auto pb-4 custom-scrollbar">
                {(() => {
                  const activities = project.activities || [];
                  if (activities.length === 0) return null;
                  
                  const minDate = new Date(Math.min(...activities.map(a => new Date(a.startDate).getTime())));
                  const maxDate = new Date(Math.max(...activities.map(a => new Date(a.endDate).getTime())));
                  minDate.setDate(minDate.getDate() - 3);
                  maxDate.setDate(maxDate.getDate() + 3);
                  const totalDays = Math.max((maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24), 1);
                  
                  return (
                    <div className="min-w-[800px]">
                      {/* Timeline Header */}
                      <div className="flex border-b border-slate-200 pb-2 mb-4 relative h-6">
                        <div className="w-48 shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-400">Activity</div>
                        <div className="flex-1 relative">
                          <div className="absolute left-0 text-[10px] font-bold text-slate-400">{minDate.toLocaleDateString()}</div>
                          <div className="absolute right-0 text-[10px] font-bold text-slate-400">{maxDate.toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      {/* Gantt Rows */}
                      <div className="flex relative">
                        {/* Names Column */}
                        <div className="w-48 shrink-0 space-y-4 py-2 z-20 bg-white">
                          {activities.map(activity => (
                            <div key={`name-${activity.id}`} className="h-8 flex items-center pr-4 truncate text-sm font-bold text-slate-700" title={activity.name}>
                              {activity.name}
                            </div>
                          ))}
                        </div>
                        
                        {/* Bars Column */}
                        <div className="flex-1 relative py-2">
                          {/* SVG Overlay */}
                          <svg className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-visible">
                            <defs>
                              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                                <polygon points="0 0, 6 3, 0 6" fill="#94a3b8" />
                              </marker>
                              <marker id="arrowhead-red" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                                <polygon points="0 0, 6 3, 0 6" fill="#ef4444" />
                              </marker>
                            </defs>
                            {activities.map((activity, i) => {
                               if (!activity.dependencies) return null;
                               return activity.dependencies.map(depId => {
                                  const depIndex = activities.findIndex(a => a.id === depId);
                                  if (depIndex === -1) return null;
                                  const depActivity = activities[depIndex];
                                  
                                  const startY = depIndex * 48 + 16;
                                  const endY = i * 48 + 16;
                                  
                                  const depStartOffset = (new Date(depActivity.startDate).getTime() - minDate.getTime()) / (1000 * 3600 * 24);
                                  const depDuration = (new Date(depActivity.endDate).getTime() - new Date(depActivity.startDate).getTime()) / (1000 * 3600 * 24);
                                  const depEndPct = ((depStartOffset + depDuration) / totalDays) * 100;
                                  
                                  const actStartOffset = (new Date(activity.startDate).getTime() - minDate.getTime()) / (1000 * 3600 * 24);
                                  const actStartPct = (actStartOffset / totalDays) * 100;

                                  const isForward = actStartPct >= depEndPct;
                                  
                                  if (isForward) {
                                    const midXPct = depEndPct + Math.max((actStartPct - depEndPct) / 2, 0.5);
                                    return (
                                      <g key={`${depId}-${activity.id}`}>
                                        <line x1={`${depEndPct}%`} y1={startY} x2={`${midXPct}%`} y2={startY} stroke="#94a3b8" strokeWidth="1.5" />
                                        <line x1={`${midXPct}%`} y1={startY} x2={`${midXPct}%`} y2={endY} stroke="#94a3b8" strokeWidth="1.5" />
                                        <line x1={`${midXPct}%`} y1={endY} x2={`${actStartPct}%`} y2={endY} stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                                      </g>
                                    );
                                  } else {
                                    return (
                                      <g key={`${depId}-${activity.id}`}>
                                        <line x1={`${depEndPct}%`} y1={startY} x2={`${depEndPct + 1}%`} y2={startY} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
                                        <line x1={`${depEndPct + 1}%`} y1={startY} x2={`${depEndPct + 1}%`} y2={endY - 12} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
                                        <line x1={`${depEndPct + 1}%`} y1={endY - 12} x2={`${actStartPct - 1}%`} y2={endY - 12} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
                                        <line x1={`${actStartPct - 1}%`} y1={endY - 12} x2={`${actStartPct - 1}%`} y2={endY} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
                                        <line x1={`${actStartPct - 1}%`} y1={endY} x2={`${actStartPct}%`} y2={endY} stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrowhead-red)" strokeDasharray="4 2" />
                                      </g>
                                    );
                                  }
                               });
                            })}
                          </svg>

                          <div className="space-y-4">
                            {activities.map((activity, index) => {
                              const startOffset = (new Date(activity.startDate).getTime() - minDate.getTime()) / (1000 * 3600 * 24);
                              const duration = (new Date(activity.endDate).getTime() - new Date(activity.startDate).getTime()) / (1000 * 3600 * 24);
                              const leftPct = (startOffset / totalDays) * 100;
                              const widthPct = Math.max((duration / totalDays) * 100, 1);
                              
                              return (
                                <div key={`bar-${activity.id}`} className="relative h-8 bg-slate-50/50 rounded-full w-full">
                                  <div 
                                    className={`absolute top-1 bottom-1 rounded-full shadow-sm flex items-center px-2 overflow-hidden z-20 ${activity.status === 'Completed' ? 'bg-emerald-500' : activity.status === 'In Progress' ? 'bg-indigo-500' : 'bg-slate-400'}`}
                                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                                    title={`${activity.name} (${activity.startDate} to ${activity.endDate})`}
                                  >
                                    <div 
                                      className="absolute left-0 top-0 bottom-0 bg-white/30" 
                                      style={{ width: `${activity.completionPercentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : activityViewMode === 'GRAPH' ? (
              <div className="overflow-x-auto pb-4 custom-scrollbar min-h-[400px]">
                {(() => {
                  const activities = project.activities || [];
                  if (activities.length === 0) return null;

                  // Topological sort to group by levels
                  const levels: Record<string, number> = {};
                  const adj: Record<string, string[]> = {};
                  const inDegree: Record<string, number> = {};
                  
                  activities.forEach(a => {
                    adj[a.id] = [];
                    inDegree[a.id] = 0;
                  });
                  
                  activities.forEach(a => {
                    (a.dependencies || []).forEach(depId => {
                      if (adj[depId]) {
                        adj[depId].push(a.id);
                        inDegree[a.id]++;
                      }
                    });
                  });
                  
                  const q: string[] = [];
                  activities.forEach(a => {
                    if (inDegree[a.id] === 0) {
                      q.push(a.id);
                      levels[a.id] = 0;
                    }
                  });
                  
                  while (q.length > 0) {
                    const u = q.shift()!;
                    adj[u].forEach(v => {
                      inDegree[v]--;
                      levels[v] = Math.max(levels[v] || 0, levels[u] + 1);
                      if (inDegree[v] === 0) {
                        q.push(v);
                      }
                    });
                  }
                  
                  const byLevel: ProjectActivity[][] = [];
                  activities.forEach(a => {
                    const lvl = levels[a.id] || 0;
                    if (!byLevel[lvl]) byLevel[lvl] = [];
                    byLevel[lvl].push(a);
                  });

                  // Calculate positions
                  const nodeWidth = 200;
                  const nodeHeight = 80;
                  const gapX = 100;
                  const gapY = 40;
                  
                  const positions: Record<string, {x: number, y: number}> = {};
                  
                  byLevel.forEach((levelActs, lvlIdx) => {
                    const startY = (Math.max(...byLevel.map(l => l.length)) * (nodeHeight + gapY)) / 2 - (levelActs.length * (nodeHeight + gapY)) / 2;
                    levelActs.forEach((act, actIdx) => {
                      positions[act.id] = {
                        x: lvlIdx * (nodeWidth + gapX) + 50,
                        y: startY + actIdx * (nodeHeight + gapY) + 50
                      };
                    });
                  });

                  const totalWidth = byLevel.length * (nodeWidth + gapX) + 100;
                  const totalHeight = Math.max(...byLevel.map(l => l.length)) * (nodeHeight + gapY) + 100;

                  return (
                    <div className="relative" style={{ minWidth: totalWidth, minHeight: totalHeight }}>
                      <svg className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-visible">
                        <defs>
                          <marker id="arrowhead-graph" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                            <polygon points="0 0, 6 3, 0 6" fill="#94a3b8" />
                          </marker>
                        </defs>
                        {activities.map(activity => {
                          if (!activity.dependencies) return null;
                          return activity.dependencies.map(depId => {
                            const sourcePos = positions[depId];
                            const targetPos = positions[activity.id];
                            if (!sourcePos || !targetPos) return null;
                            
                            const startX = sourcePos.x + nodeWidth;
                            const startY = sourcePos.y + nodeHeight / 2;
                            const endX = targetPos.x;
                            const endY = targetPos.y + nodeHeight / 2;
                            
                            // Draw a curved path
                            const path = `M ${startX} ${startY} C ${startX + gapX/2} ${startY}, ${endX - gapX/2} ${endY}, ${endX} ${endY}`;
                            
                            return (
                              <path 
                                key={`${depId}-${activity.id}`} 
                                d={path} 
                                fill="none" 
                                stroke="#cbd5e1" 
                                strokeWidth="2" 
                                markerEnd="url(#arrowhead-graph)" 
                              />
                            );
                          });
                        })}
                      </svg>
                      
                      {activities.map(activity => {
                        const pos = positions[activity.id];
                        if (!pos) return null;
                        
                        return (
                          <div 
                            key={activity.id}
                            className="absolute bg-white border border-slate-200 rounded-xl shadow-sm p-4 z-20 hover:shadow-md transition-shadow cursor-pointer"
                            style={{ 
                              left: pos.x, 
                              top: pos.y, 
                              width: nodeWidth, 
                              height: nodeHeight 
                            }}
                            onClick={() => handleOpenActivityModal(activity)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-bold text-slate-800 text-sm truncate pr-2" title={activity.name}>{activity.name}</h5>
                              <span className={`shrink-0 w-2 h-2 rounded-full ${
                                activity.status === 'Completed' ? 'bg-emerald-500' : 
                                activity.status === 'In Progress' ? 'bg-indigo-500' : 
                                activity.status === 'Delayed' ? 'bg-red-500' : 'bg-slate-300'
                              }`}></span>
                            </div>
                            <div className="flex justify-between items-center mt-auto">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{activity.assignedTo}</span>
                              <span className="text-[10px] font-black text-indigo-600">{activity.completionPercentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </div>

          {/* Milestones Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Flag className="text-indigo-600" size={20} /> Project Milestones
              </h4>
              <button 
                onClick={() => handleOpenMilestoneModal()}
                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all">
                <Plus size={14} /> Add Milestone
              </button>
            </div>
            
            {project.milestones && project.milestones.length > 0 ? (
              <div className="space-y-4">
                {project.milestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(milestone => (
                  <div key={milestone.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        milestone.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                        milestone.status === 'In Progress' ? 'bg-indigo-100 text-indigo-600' :
                        'bg-slate-200 text-slate-500'
                      }`}>
                        {milestone.status === 'Completed' ? <CheckCircle2 size={20} /> : 
                         milestone.status === 'In Progress' ? <Clock size={20} /> : 
                         <Circle size={20} />}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900">{milestone.name}</h5>
                        <p className="text-xs text-slate-500 mt-1">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        milestone.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        milestone.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {milestone.status}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenMilestoneModal(milestone)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteMilestone(milestone.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white rounded-xl border border-slate-200 hover:border-red-200 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                <Flag className="mx-auto text-slate-300 mb-4" size={32} />
                <p className="text-slate-500 font-medium">No milestones defined yet.</p>
                <button 
                  onClick={() => handleOpenMilestoneModal()}
                  className="mt-4 text-indigo-600 font-bold text-sm hover:underline">
                  Add the first milestone
                </button>
              </div>
            )}
          </div>

          {/* Interventions Section */}
          {project.interventions && project.interventions.length > 0 && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
              <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="text-indigo-600" size={20} /> Project Interventions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.interventions.map(intervention => (
                  <div key={intervention.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h5 className="font-bold text-slate-900">{intervention.name}</h5>
                        <p className="text-xs text-slate-500 mt-1">{intervention.type} • {intervention.targetDemographic}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        intervention.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        intervention.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                        intervention.status === 'Suspended' ? 'bg-red-100 text-red-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {intervention.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{intervention.description}</p>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Budget</p>
                        <p className="font-bold text-slate-900">RWF {(intervention.budgetAllocated / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reached</p>
                        <p className="font-bold text-slate-900">{intervention.beneficiariesReached.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Framework Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Target className="text-indigo-600" size={20} /> Results Framework (M&E)
              </h4>
              <button className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all">
                <Plus size={14} /> Add Indicator
              </button>
            </div>
            {project.indicators && project.indicators.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-tl-xl">Level</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Expected Results</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Indicators</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Baseline Data</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Targets</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Achieved</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Data Sources</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Data Collection Methods</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Frequency</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Responsibility</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Timeline/Years</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-tr-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.indicators.map((indicator, idx) => (
                      <tr key={indicator.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            indicator.level === 'Goal' ? 'bg-purple-100 text-purple-700' :
                            indicator.level === 'Impact' ? 'bg-indigo-100 text-indigo-700' :
                            indicator.level === 'Outcome' || indicator.level === 'Secondary Outcome' ? 'bg-blue-100 text-blue-700' :
                            indicator.level === 'Output' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {indicator.level}
                          </span>
                        </td>
                        <td className="p-3 text-xs font-medium text-slate-700">{indicator.expectedResult || '-'}</td>
                        <td className="p-3 text-xs font-bold text-slate-900">{indicator.name}</td>
                        <td className="p-3 text-xs text-slate-600">{indicator.baseline} {indicator.unit}</td>
                        <td className="p-3 text-xs font-bold text-indigo-600">{indicator.overallTarget} {indicator.unit}</td>
                        <td className="p-3 text-xs font-bold text-emerald-600">
                          {indicator.name === 'Number of beneficiaries reached' && indicator.frequency !== 'Monthly' 
                            ? '-' 
                            : `${indicator.achieved || 0} ${indicator.unit}`}
                        </td>
                        <td className="p-3 text-xs text-slate-600">{indicator.dataSource || '-'}</td>
                        <td className="p-3 text-xs text-slate-600">{indicator.dataCollectionMethod || '-'}</td>
                        <td className="p-3 text-xs text-slate-600">{indicator.frequency}</td>
                        <td className="p-3 text-xs text-slate-600">{indicator.responsible}</td>
                        <td className="p-3 text-xs text-slate-600">{indicator.timeline || '-'}</td>
                        <td className="p-3 text-xs">
                          <button 
                            onClick={() => handleOpenRecordDataModal(indicator.id)}
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            <Plus size={14} /> Record Data
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Target size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium text-sm">No indicators defined for this project.</p>
              </div>
            )}
          </div>

          {/* Risks Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="text-indigo-600" size={20} /> Risk Register
              </h4>
              <button 
                onClick={() => handleOpenRiskModal()}
                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all"
              >
                <Plus size={14} /> Add Risk
              </button>
            </div>
            {project.risks && project.risks.length > 0 ? (
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/2">
                  <div className="grid grid-cols-3 grid-rows-3 gap-2 aspect-square relative pl-6 pb-6">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-slate-400 tracking-widest uppercase origin-center">Probability</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400 tracking-widest uppercase">Impact</span>
                    
                    {[
                      { prob: 'High', impact: 'Low' }, { prob: 'High', impact: 'Medium' }, { prob: 'High', impact: 'High' },
                      { prob: 'Medium', impact: 'Low' }, { prob: 'Medium', impact: 'Medium' }, { prob: 'Medium', impact: 'High' },
                      { prob: 'Low', impact: 'Low' }, { prob: 'Low', impact: 'Medium' }, { prob: 'Low', impact: 'High' }
                    ].map((cell, i) => {
                      const cellRisks = project.risks!.filter(r => r.probability === cell.prob && r.impact === cell.impact);
                      const getRiskColor = (category: string) => {
                        switch (category) {
                          case 'Financial': return 'bg-blue-500';
                          case 'Operational': return 'bg-emerald-500';
                          case 'Strategic': return 'bg-purple-500';
                          case 'Compliance': return 'bg-amber-500';
                          case 'Reputational': return 'bg-rose-500';
                          default: return 'bg-slate-500';
                        }
                      };
                      const getBgColor = (prob: string, impact: string) => {
                        if (prob === 'High' && impact === 'High') return 'bg-red-50';
                        if (prob === 'High' && impact === 'Medium') return 'bg-orange-50';
                        if (prob === 'High' && impact === 'Low') return 'bg-amber-50';
                        if (prob === 'Medium' && impact === 'High') return 'bg-orange-50';
                        if (prob === 'Medium' && impact === 'Medium') return 'bg-amber-50';
                        if (prob === 'Medium' && impact === 'Low') return 'bg-emerald-50';
                        if (prob === 'Low' && impact === 'High') return 'bg-amber-50';
                        if (prob === 'Low' && impact === 'Medium') return 'bg-emerald-50';
                        if (prob === 'Low' && impact === 'Low') return 'bg-emerald-50';
                        return 'bg-slate-50';
                      };
                      
                      return (
                        <div key={i} className={`rounded-xl border border-slate-200 p-2 flex flex-col items-center justify-center ${getBgColor(cell.prob, cell.impact)} transition-all relative group`}>
                          <span className="text-[10px] font-bold text-slate-400 mb-2 opacity-0 group-hover:opacity-100 absolute top-2 transition-opacity">{cell.prob} / {cell.impact}</span>
                          <div className="flex flex-wrap gap-1.5 justify-center z-10">
                            {cellRisks.map(r => (
                              <button 
                                key={r.id}
                                onClick={() => setSelectedRiskId(r.id === selectedRiskId ? null : r.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm transition-transform hover:scale-110 ${getRiskColor(r.category)} ${selectedRiskId === r.id ? 'ring-4 ring-offset-2 ring-indigo-600 scale-110' : ''}`}
                                title={`${r.category}: ${r.description}`}
                              >
                                {r.id.substring(0, 2).toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  {selectedRiskId ? (() => {
                    const risk = project.risks!.find(r => r.id === selectedRiskId);
                    if (!risk) return null;
                    const isHighImpact = risk.impact === 'High';
                    const isHighProb = risk.probability === 'High';
                    const isCritical = isHighImpact && isHighProb;
                    return (
                      <div className={`p-6 rounded-2xl border flex flex-col h-full relative group transition-all ${
                        isCritical ? 'bg-red-50/50 border-red-100' : 
                        isHighImpact ? 'bg-orange-50/50 border-orange-100' :
                        'bg-slate-50 border-slate-100'
                      }`}>
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                          <button onClick={() => handleOpenRiskModal(risk)} className="p-1.5 bg-white text-slate-400 hover:text-indigo-600 rounded-lg shadow-sm border border-slate-200 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => {
                            handleDeleteRisk(risk.id);
                            setSelectedRiskId(null);
                          }} className="p-1.5 bg-white text-slate-400 hover:text-red-600 rounded-lg shadow-sm border border-slate-200 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              risk.impact === 'High' ? 'bg-red-100 text-red-700' :
                              risk.impact === 'Medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`} title="Impact">
                              {risk.impact} Impact
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              risk.probability === 'High' ? 'bg-orange-100 text-orange-700' :
                              risk.probability === 'Medium' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-200 text-slate-700'
                            }`} title="Probability">
                              {risk.probability} Prob
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-500 ml-auto pr-16">{risk.category}</span>
                        </div>
                        
                        <p className={`font-bold text-lg mb-4 flex-1 ${isCritical ? 'text-red-900' : 'text-slate-900'}`}>
                          {isCritical && <AlertTriangle size={18} className="inline mr-1.5 text-red-500 mb-0.5" />}
                          {risk.description}
                        </p>
                        
                        <div className="bg-white/80 p-4 rounded-xl border border-white/40 mb-6 text-sm">
                          <span className="font-bold text-slate-700 block mb-2">Mitigation Strategy:</span> 
                          <span className="text-slate-600 leading-relaxed">{risk.mitigationStrategy || 'No mitigation strategy defined.'}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-slate-200/50 mt-auto">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Owner</p>
                            <p className="text-sm font-bold text-slate-900">{risk.owner}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                            <p className={`text-sm font-bold ${
                              risk.status === 'Open' || risk.status === 'Active' ? 'text-amber-600' : 
                              risk.status === 'Realized' ? 'text-red-600' : 
                              'text-emerald-600'
                            }`}>{risk.status}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <LayoutGrid size={48} className="text-slate-300 mb-4" />
                      <p className="text-slate-600 font-bold text-lg mb-2">Select a Risk</p>
                      <p className="text-slate-500 text-sm">Click on any risk bubble in the grid to view its full details and mitigation strategy.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <AlertTriangle size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium text-sm">No risks recorded yet.</p>
              </div>
            )}
          </div>

          {/* Partners Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="text-indigo-600" size={20} /> Project Partners
              </h4>
              <button 
                onClick={() => handleOpenPartnerModal()}
                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all"
              >
                <Plus size={14} /> Add Partner
              </button>
            </div>
            {project.partners && project.partners.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.partners.map(partner => (
                  <div key={partner.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative group">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={() => handleOpenPartnerModal(partner)} className="p-1.5 bg-white text-slate-400 hover:text-indigo-600 rounded-lg shadow-sm border border-slate-200 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeletePartner(partner.id)} className="p-1.5 bg-white text-slate-400 hover:text-red-600 rounded-lg shadow-sm border border-slate-200 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h5 className="font-bold text-slate-900 mb-1 pr-16">{partner.name}</h5>
                    <p className="text-xs text-indigo-600 font-semibold mb-4">{partner.role}</p>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p><span className="text-slate-400">Contact:</span> {partner.contactPerson}</p>
                      <p><span className="text-slate-400">Email:</span> {partner.email}</p>
                      {partner.contributionAmount !== undefined && (
                        <p><span className="text-slate-400">Contribution:</span> RWF {(partner.contributionAmount / 1000000).toFixed(1)}M</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Users size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium text-sm">No partners added yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Partner Modal */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black tracking-tight">{editingPartnerId ? 'Edit Partner' : 'Add Partner'}</h3>
              <button onClick={() => setIsPartnerModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Partner Name</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                  placeholder="e.g. UNICEF" 
                  value={partnerForm.name} 
                  onChange={e => setPartnerForm({...partnerForm, name: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Role</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                  value={partnerForm.role} 
                  onChange={e => setPartnerForm({...partnerForm, role: e.target.value as any})}
                >
                  <option value="Funder">Funder</option>
                  <option value="Implementing Partner">Implementing Partner</option>
                  <option value="Government">Government</option>
                  <option value="Community Based Organization">Community Based Organization</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contribution Amount (RWF)</label>
                <input 
                  type="number"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                  placeholder="0" 
                  value={partnerForm.contributionAmount || ''} 
                  onChange={e => setPartnerForm({...partnerForm, contributionAmount: Number(e.target.value)})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Person</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                    placeholder="John Doe" 
                    value={partnerForm.contactPerson} 
                    onChange={e => setPartnerForm({...partnerForm, contactPerson: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                  <input 
                    type="email"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                    placeholder="john@example.com" 
                    value={partnerForm.email} 
                    onChange={e => setPartnerForm({...partnerForm, email: e.target.value})} 
                  />
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
              <button 
                onClick={handleSavePartner} 
                disabled={!partnerForm.name || !partnerForm.role || !partnerForm.contactPerson || !partnerForm.email}
                className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
              >
                {editingPartnerId ? 'Save Changes' : 'Add Partner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Risk Modal */}
      {isRiskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center shrink-0">
              <h3 className="text-2xl font-black tracking-tight">{editingRiskId ? 'Edit Risk' : 'Add Risk'}</h3>
              <button onClick={() => setIsRiskModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28} /></button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold resize-none h-24" 
                  placeholder="Describe the risk..." 
                  value={riskForm.description} 
                  onChange={e => setRiskForm({...riskForm, description: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                    value={riskForm.category} 
                    onChange={e => setRiskForm({...riskForm, category: e.target.value as any})}
                  >
                    <option value="Financial">Financial</option>
                    <option value="Operational">Operational</option>
                    <option value="Strategic">Strategic</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Reputational">Reputational</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                    value={riskForm.status} 
                    onChange={e => setRiskForm({...riskForm, status: e.target.value as any})}
                  >
                    <option value="Active">Active</option>
                    <option value="Open">Open</option>
                    <option value="Mitigated">Mitigated</option>
                    <option value="Realized">Realized</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Probability</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                    value={riskForm.probability} 
                    onChange={e => setRiskForm({...riskForm, probability: e.target.value as any})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Impact</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                    value={riskForm.impact} 
                    onChange={e => setRiskForm({...riskForm, impact: e.target.value as any})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mitigation Strategy</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold resize-none h-24" 
                  placeholder="How will this risk be mitigated?" 
                  value={riskForm.mitigationStrategy} 
                  onChange={e => setRiskForm({...riskForm, mitigationStrategy: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Owner</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                  placeholder="Risk Owner" 
                  value={riskForm.owner} 
                  onChange={e => setRiskForm({...riskForm, owner: e.target.value})} 
                />
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50 shrink-0">
              <button 
                onClick={handleSaveRisk} 
                disabled={!riskForm.description || !riskForm.owner}
                className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
              >
                {editingRiskId ? 'Save Changes' : 'Add Risk'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {isDocumentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="text-xl font-black text-slate-900">Add Project Document</h3>
              <button 
                onClick={() => setIsDocumentModalOpen(false)} 
                className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 rounded-full flex items-center justify-center transition-all shadow-sm"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Document Name</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                  placeholder="e.g., Q3 Progress Report" 
                  value={documentForm.name} 
                  onChange={e => setDocumentForm({...documentForm, name: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                  value={documentForm.category} 
                  onChange={e => setDocumentForm({...documentForm, category: e.target.value})}
                >
                  <option value="Report">Report</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Agreement">Agreement</option>
                  <option value="Field Data">Field Data</option>
                  <option value="Media">Media</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Document Content (Text)</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium resize-none h-48" 
                  placeholder="Paste the document content here for AI analysis..." 
                  value={documentForm.content} 
                  onChange={e => setDocumentForm({...documentForm, content: e.target.value})} 
                />
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50 shrink-0">
              <button 
                onClick={handleSaveDocument} 
                disabled={!documentForm.name}
                className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
              >
                Save Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Modal */}
      {isAchievementModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Report Achievement</h2>
              <button onClick={() => setIsAchievementModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                <input 
                  type="date" 
                  value={achievementForm.date}
                  onChange={(e) => setAchievementForm({...achievementForm, date: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  value={achievementForm.description}
                  onChange={(e) => setAchievementForm({...achievementForm, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[120px]"
                  placeholder="Describe what was achieved..."
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Reported By</label>
                <input 
                  type="text" 
                  value={achievementForm.reportedBy}
                  onChange={(e) => setAchievementForm({...achievementForm, reportedBy: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50 shrink-0">
              <button 
                onClick={handleSaveAchievement} 
                disabled={!achievementForm.description}
                className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
              >
                Save Achievement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <CheckSquare size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingActivityId ? 'Edit Activity' : 'Add Activity'}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Track project tasks and milestones</p>
                </div>
              </div>
              <button 
                onClick={() => setIsActivityModalOpen(false)} 
                className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 rounded-full flex items-center justify-center transition-all shadow-sm"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Activity Name</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                  placeholder="e.g., Community Sensitization" 
                  value={activityForm.name} 
                  onChange={e => setActivityForm({...activityForm, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                    value={activityForm.category} 
                    onChange={e => setActivityForm({...activityForm, category: e.target.value as any})}
                  >
                    <option value="Planning">Planning</option>
                    <option value="Implementation">Implementation</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Closure">Closure</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                    value={activityForm.status} 
                    onChange={e => {
                      const newStatus = e.target.value as any;
                      setActivityForm({
                        ...activityForm, 
                        status: newStatus,
                        completionPercentage: newStatus === 'Completed' ? 100 : (newStatus === 'Not Started' ? 0 : activityForm.completionPercentage)
                      });
                    }}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Date</label>
                  <input 
                    type="date"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                    value={activityForm.startDate} 
                    onChange={e => setActivityForm({...activityForm, startDate: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Date</label>
                  <input 
                    type="date"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                    value={activityForm.endDate} 
                    onChange={e => setActivityForm({...activityForm, endDate: e.target.value})} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assigned To</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                    placeholder="e.g., John Doe" 
                    value={activityForm.assignedTo} 
                    onChange={e => setActivityForm({...activityForm, assignedTo: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress (%)</label>
                    <span className="text-xs font-bold text-indigo-600">{activityForm.completionPercentage}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    className="w-full accent-indigo-600" 
                    value={activityForm.completionPercentage} 
                    onChange={e => setActivityForm({
                      ...activityForm, 
                      completionPercentage: Number(e.target.value),
                      status: Number(e.target.value) === 100 ? 'Completed' : (Number(e.target.value) === 0 ? 'Not Started' : 'In Progress')
                    })} 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Dependencies (Activities that must finish before this)</label>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-40 overflow-y-auto custom-scrollbar">
                  {project.activities && project.activities.filter(a => a.id !== editingActivityId).length > 0 ? (
                    <div className="space-y-2">
                      {project.activities.filter(a => a.id !== editingActivityId).map(activity => (
                        <label key={activity.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            checked={(activityForm.dependencies || []).includes(activity.id)}
                            onChange={(e) => {
                              const deps = activityForm.dependencies || [];
                              if (e.target.checked) {
                                setActivityForm({...activityForm, dependencies: [...deps, activity.id]});
                              } else {
                                setActivityForm({...activityForm, dependencies: deps.filter(id => id !== activity.id)});
                              }
                            }}
                          />
                          <span className="text-sm font-bold text-slate-700">{activity.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No other activities available to set as dependencies.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50 shrink-0">
              <button 
                onClick={handleSaveActivity} 
                disabled={!activityForm.name || !activityForm.assignedTo}
                className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
              >
                Save Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Link Activities</h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Source Activity (Must finish first)</label>
                <select 
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all"
                  value={linkForm.source}
                  onChange={e => setLinkForm({...linkForm, source: e.target.value})}
                >
                  <option value="">Select Source Activity</option>
                  {project.activities?.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Activity (Depends on Source)</label>
                <select 
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all"
                  value={linkForm.target}
                  onChange={e => setLinkForm({...linkForm, target: e.target.value})}
                >
                  <option value="">Select Target Activity</option>
                  {project.activities?.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50 shrink-0">
              <button 
                onClick={handleSaveLink} 
                disabled={!linkForm.source || !linkForm.target || linkForm.source === linkForm.target}
                className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
              >
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}

      {isRecordDataModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Record Indicator Data</h3>
              <button onClick={() => setIsRecordDataModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Period (e.g., Year, Q1 2025)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium" 
                  placeholder="e.g., 2025"
                  value={recordDataForm.period} 
                  onChange={e => setRecordDataForm({...recordDataForm, period: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Actual Value</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium" 
                  placeholder="0"
                  value={recordDataForm.actual || ''} 
                  onChange={e => setRecordDataForm({...recordDataForm, actual: Number(e.target.value)})} 
                />
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50 shrink-0">
              <button 
                onClick={handleSaveRecordData} 
                disabled={!recordDataForm.period || recordDataForm.actual === 0}
                className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
              >
                Save Data
              </button>
            </div>
          </div>
        </div>
      )}

      {isRecordOperationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Record Expenditure</h3>
              <button onClick={() => setIsRecordOperationModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium" 
                  value={operationForm.date} 
                  onChange={e => setOperationForm({...operationForm, date: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount (RWF)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium" 
                  placeholder="0"
                  value={operationForm.amount || ''} 
                  onChange={e => setOperationForm({...operationForm, amount: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                <textarea 
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium resize-none" 
                  placeholder="What was this expenditure for?"
                  rows={3}
                  value={operationForm.description} 
                  onChange={e => setOperationForm({...operationForm, description: e.target.value})} 
                />
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50 shrink-0">
              <button 
                onClick={handleSaveRecordOperation} 
                disabled={!operationForm.date || operationForm.amount <= 0 || !operationForm.description}
                className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
              >
                Save Expenditure
              </button>
            </div>
          </div>
        </div>
      )}

      {isMilestoneModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingMilestoneId ? 'Edit Milestone' : 'Add Milestone'}</h3>
              <button onClick={() => setIsMilestoneModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Milestone Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all"
                  value={milestoneForm.name}
                  onChange={e => setMilestoneForm({...milestoneForm, name: e.target.value})}
                  placeholder="e.g., Phase 1 Completion"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Due Date</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all"
                  value={milestoneForm.dueDate}
                  onChange={e => setMilestoneForm({...milestoneForm, dueDate: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                <select 
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all"
                  value={milestoneForm.status}
                  onChange={e => setMilestoneForm({...milestoneForm, status: e.target.value as any})}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50 shrink-0">
              <button 
                onClick={handleSaveMilestone} 
                disabled={!milestoneForm.name || !milestoneForm.dueDate}
                className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectDetailView;
