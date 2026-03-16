
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, DollarSign, AlertCircle, Sparkles, Loader2, Download, Plus } from 'lucide-react';
import { Project, ProjectMilestone, PageWidget, DataSourceType } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Edit3, Trash2, X, Settings, Database, Layout, Table, Grid, PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon, Check, Columns } from 'lucide-react';
import { WidgetRenderer } from './WidgetRenderer';
import { SOURCE_FIELDS } from '../constants';

interface ProjectDashboardProps {
  organizationName: string;
  projects: Project[];
  dashboardWidgets: PageWidget[];
  setDashboardWidgets: (widgets: PageWidget[]) => void;
  onViewProject: (id: string) => void;
  onInitializeProject: () => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  globalDocuments?: any[];
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ organizationName, projects, dashboardWidgets, setDashboardWidgets, onViewProject, onInitializeProject, onNotify, globalDocuments = [] }) => {
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [editingWidgets, setEditingWidgets] = useState<PageWidget[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([
    { id: '1', name: 'Initial Planning', dueDate: '2026-04-01', status: 'Completed', completionDate: '2026-03-10' },
    { id: '2', name: 'Phase 1 Execution', dueDate: '2026-06-15', status: 'In Progress' },
  ]);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  const handleAddWidget = () => {
    const newWidget: PageWidget = {
      id: Date.now().toString(),
      title: 'New Dashboard Widget',
      dataSource: 'PROJECTS',
      widgetType: 'CARD_GRID',
      selectedFields: ['name', 'location', 'status', 'budget']
    };
    setEditingWidgets([...editingWidgets, newWidget]);
  };

  const updateWidget = (index: number, field: keyof PageWidget, value: any) => {
    const updatedWidgets = [...editingWidgets];
    updatedWidgets[index] = { ...updatedWidgets[index], [field]: value };
    
    if (field === 'widgetType' && value === 'CHART' && !updatedWidgets[index].chartType) {
        updatedWidgets[index].chartType = 'BAR';
    }

    if (field === 'dataSource') {
        const defaultFields = SOURCE_FIELDS[value as DataSourceType].slice(0, 4).map(f => f.key);
        updatedWidgets[index].selectedFields = defaultFields;
    }

    setEditingWidgets(updatedWidgets);
  };

  const toggleField = (widgetIndex: number, fieldKey: string) => {
    const widget = editingWidgets[widgetIndex];
    const currentFields = widget.selectedFields || [];
    const updatedFields = currentFields.includes(fieldKey)
        ? currentFields.filter(f => f !== fieldKey)
        : [...currentFields, fieldKey];
    
    updateWidget(widgetIndex, 'selectedFields', updatedFields);
  };

  const removeWidget = (index: number) => {
    const updatedWidgets = [...editingWidgets];
    updatedWidgets.splice(index, 1);
    setEditingWidgets(updatedWidgets);
  };

  const handleSaveWidgets = () => {
    setDashboardWidgets(editingWidgets);
    setIsCustomizeModalOpen(false);
    onNotify("Dashboard customized successfully", "success");
  };

  const openCustomizeModal = () => {
    setEditingWidgets([...dashboardWidgets]);
    setIsCustomizeModalOpen(true);
  };

  const handleSaveMilestone = () => {
    if (!editingMilestone?.name || !editingMilestone?.dueDate) {
      onNotify("Name and Due Date are required", "error");
      return;
    }
    
    if (editingMilestone.id) {
      setMilestones(milestones.map(m => m.id === editingMilestone.id ? editingMilestone : m));
      onNotify("Milestone updated successfully", "success");
    } else {
      setMilestones([...milestones, { ...editingMilestone, id: Date.now().toString() }]);
      onNotify("Milestone added successfully", "success");
    }
    setIsMilestoneModalOpen(false);
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
    onNotify("Milestone deleted", "success");
  };

  // Mock Data for charts based on actual projects
  const budgetData = projects.map(p => ({
    name: p.name.substring(0, 10),
    budget: (p.budget || 0) / 1000000,
    spent: (p.spent || 0) / 1000000
  }));

  const statusData = [
    { name: 'On Track', value: projects.filter(p => p.status === 'On Track').length, color: '#10b981' },
    { name: 'Delayed', value: projects.filter(p => p.status === 'Delayed').length, color: '#f59e0b' },
    { name: 'At Risk', value: projects.filter(p => p.status === 'At Risk').length, color: '#ef4444' },
  ];

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalBeneficiaries = projects.reduce((sum, p) => sum + (p.beneficiaries || 0), 0);

  // Mock M&E Trend Data
  const meTrendData = [
    { month: 'Jan', reach: 1200, impact: 72 },
    { month: 'Feb', reach: 2100, impact: 75 },
    { month: 'Mar', reach: 3500, impact: 78 },
    { month: 'Apr', reach: 4200, impact: 82 },
    { month: 'May', reach: 5800, impact: 85 },
    { month: 'Jun', reach: 7200, impact: 88 },
  ];

  const fetchAIInsight = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const summary = projects.map(p => {
        const docSummary = (p.documents || []).map(d => `${d.name} (${d.category}): ${d.content || 'No content'}`).join(' | ');
        return `${p.name} (Location: ${p.location}): ${p.status} (${p.progress}% complete, Budget: ${p.budget}, Spent: ${p.spent}). Narrative: ${p.narrative || 'None'}. Documents: ${docSummary || 'None'}`;
      }).join('\n\n');
      
      const globalDocsContext = globalDocuments.map(d => `${d.name} (${d.category}): ${d.content || 'No content'}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given these NGO projects in Rwanda:\n\n${summary}\n\nGlobal Documents:\n${globalDocsContext}\n\nProvide a 2-sentence strategic health summary of the organization's projects. Explicitly identify which province needs the most attention based on the project statuses, progress, spending, narrative, and documents.`
      });
      setAiInsight(response.text || "Operations are stable across the portfolio. Continue standard monitoring protocols.");
    } catch (e) {
      console.error("AI Insight Error:", e);
      setAiInsight("Operations are currently on track. Ensure budgetary compliance in the Eastern Province next month.");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsight();
  }, [projects]);

  // Aggregate all risks
  const allRisks = projects.flatMap(p => 
    (p.risks || []).map(r => ({ ...r, projectName: p.name, projectId: p.id }))
  );

  const riskMatrix = {
    High: { High: [] as any[], Medium: [] as any[], Low: [] as any[] },
    Medium: { High: [] as any[], Medium: [] as any[], Low: [] as any[] },
    Low: { High: [] as any[], Medium: [] as any[], Low: [] as any[] }
  };

  allRisks.forEach(risk => {
    if (risk.probability && risk.impact && riskMatrix[risk.probability] && riskMatrix[risk.probability][risk.impact]) {
      riskMatrix[risk.probability][risk.impact].push(risk);
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Welcome back, {organizationName} Admin</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={openCustomizeModal}
            className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all"
          >
            <Settings size={16} /> Customize Dashboard
          </button>
          <button 
            onClick={onInitializeProject}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus size={16} /> Initialize New Project
          </button>
          <button 
            onClick={() => onNotify("Full organization report is being generated. Check your email in 5 minutes.")}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg"
          >
            <Download size={16} /> Download Report
          </button>
        </div>
      </div>

      {/* AI Hub Highlight */}
      <div className="mb-8 bg-gradient-to-r from-indigo-900 to-violet-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group border border-indigo-500/30">
         <div className="absolute -top-24 -right-24 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Sparkles size={240} />
         </div>
         <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
         <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-8">
            <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner shrink-0">
               <Sparkles className="text-amber-300" size={40} />
            </div>
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-3">
                 <h3 className="font-black text-2xl tracking-tight text-white">Strategic Health Summary</h3>
                 <span className="px-3 py-1 bg-indigo-500/40 border border-indigo-400/50 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-100">AI Generated</span>
               </div>
               {isAiLoading ? (
                 <div className="flex items-center gap-3 text-indigo-200 text-base py-4">
                    <Loader2 className="animate-spin" size={20} /> 
                    <span className="font-medium">Analyzing organizational data and province metrics...</span>
                 </div>
               ) : (
                 <div className="prose prose-invert max-w-none">
                   <p className="text-indigo-50 text-lg leading-relaxed font-medium">{aiInsight}</p>
                 </div>
               )}
            </div>
            <div className="shrink-0 self-start md:self-center mt-4 md:mt-0">
              <button 
                onClick={fetchAIInsight} 
                disabled={isAiLoading}
                className="bg-white text-indigo-900 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAiLoading ? 'Analyzing...' : 'Refresh Analysis'}
              </button>
            </div>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg"><DollarSign size={20} className="text-indigo-600"/></div>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">FRW</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{(totalBudget/1000000).toFixed(1)}M</div>
          <p className="text-sm text-slate-500">Total Budget Deployed</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-100 p-2 rounded-lg"><Users size={20} className="text-green-600"/></div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalBeneficiaries.toLocaleString()}</div>
          <p className="text-sm text-slate-500">Active Beneficiaries</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-100 p-2 rounded-lg"><TrendingUp size={20} className="text-blue-600"/></div>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Avg</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">85%</div>
          <p className="text-sm text-slate-500">Overall Impact Score</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-red-100 p-2 rounded-lg"><AlertCircle size={20} className="text-red-600"/></div>
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Attention</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{projects.filter(p => p.status !== 'On Track').length}</div>
          <p className="text-sm text-slate-500">Alert Flags</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Budget vs Expenditure (Millions FRW)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={budgetData}>
                <defs>
                  {/* Fix duplicate x1 attribute by changing the second x1 to y1 */}
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  {/* Fix duplicate x1 attribute by changing the second x1 to y1 */}
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <Area type="monotone" dataKey="budget" stroke="#4f46e5" fillOpacity={1} fill="url(#colorBudget)" />
                <Area type="monotone" dataKey="spent" stroke="#10b981" fillOpacity={1} fill="url(#colorSpent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Project Distribution</h3>
          {projects.length > 0 ? (
            <>
              <div className="h-[300px] w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1000}
                        animationBegin={200}
                      >
                        {statusData.filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        itemStyle={{fontWeight: 'bold'}}
                      />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <span className="block text-4xl font-black text-slate-900">{projects.length}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projects</span>
                    </div>
                 </div>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                 {statusData.map((s, i) => (
                   <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: s.color}}></div>
                       <span className="text-slate-600 font-bold">{s.name}</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className="font-black text-slate-900">{s.value}</span>
                       <span className="text-xs font-bold text-slate-400 w-8 text-right">
                         {projects.length > 0 ? Math.round((s.value / projects.length) * 100) : 0}%
                       </span>
                     </div>
                   </div>
                 ))}
              </div>
            </>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
              <PieChartIcon size={48} className="mb-4 opacity-20" />
              <p className="font-bold">No projects available</p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Matrix Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">Project Risk Matrix</h3>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
            <AlertCircle size={12} /> {allRisks.length} Total Risks
          </div>
        </div>
        
        <div className="flex">
          {/* Y-axis label */}
          <div className="flex items-center justify-center w-8">
            <span className="transform -rotate-90 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Probability</span>
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-2">
              {/* Row 1: High Probability */}
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 min-h-[100px]">
                <div className="text-[10px] font-black uppercase text-amber-800/50 mb-2">High Prob / Low Impact</div>
                {riskMatrix.High.Low.map(r => (
                  <div key={r.id} className="text-xs font-medium text-amber-900 bg-white p-1.5 rounded border border-amber-200 mb-1 truncate cursor-pointer hover:bg-amber-50" title={`${r.projectName}: ${r.description}`} onClick={() => onViewProject(r.projectId)}>
                    {r.projectName}
                  </div>
                ))}
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 min-h-[100px]">
                <div className="text-[10px] font-black uppercase text-orange-800/50 mb-2">High Prob / Med Impact</div>
                {riskMatrix.High.Medium.map(r => (
                  <div key={r.id} className="text-xs font-medium text-orange-900 bg-white p-1.5 rounded border border-orange-200 mb-1 truncate cursor-pointer hover:bg-orange-50" title={`${r.projectName}: ${r.description}`} onClick={() => onViewProject(r.projectId)}>
                    {r.projectName}
                  </div>
                ))}
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 min-h-[100px]">
                <div className="text-[10px] font-black uppercase text-red-800/50 mb-2">High Prob / High Impact</div>
                {riskMatrix.High.High.map(r => (
                  <div key={r.id} className="text-xs font-medium text-red-900 bg-white p-1.5 rounded border border-red-200 mb-1 truncate cursor-pointer hover:bg-red-50" title={`${r.projectName}: ${r.description}`} onClick={() => onViewProject(r.projectId)}>
                    {r.projectName}
                  </div>
                ))}
              </div>

              {/* Row 2: Medium Probability */}
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 min-h-[100px]">
                <div className="text-[10px] font-black uppercase text-green-800/50 mb-2">Med Prob / Low Impact</div>
                {riskMatrix.Medium.Low.map(r => (
                  <div key={r.id} className="text-xs font-medium text-green-900 bg-white p-1.5 rounded border border-green-200 mb-1 truncate cursor-pointer hover:bg-green-50" title={`${r.projectName}: ${r.description}`} onClick={() => onViewProject(r.projectId)}>
                    {r.projectName}
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 min-h-[100px]">
                <div className="text-[10px] font-black uppercase text-amber-800/50 mb-2">Med Prob / Med Impact</div>
                {riskMatrix.Medium.Medium.map(r => (
                  <div key={r.id} className="text-xs font-medium text-amber-900 bg-white p-1.5 rounded border border-amber-200 mb-1 truncate cursor-pointer hover:bg-amber-50" title={`${r.projectName}: ${r.description}`} onClick={() => onViewProject(r.projectId)}>
                    {r.projectName}
                  </div>
                ))}
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 min-h-[100px]">
                <div className="text-[10px] font-black uppercase text-orange-800/50 mb-2">Med Prob / High Impact</div>
                {riskMatrix.Medium.High.map(r => (
                  <div key={r.id} className="text-xs font-medium text-orange-900 bg-white p-1.5 rounded border border-orange-200 mb-1 truncate cursor-pointer hover:bg-orange-50" title={`${r.projectName}: ${r.description}`} onClick={() => onViewProject(r.projectId)}>
                    {r.projectName}
                  </div>
                ))}
              </div>

              {/* Row 3: Low Probability */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 min-h-[100px]">
                <div className="text-[10px] font-black uppercase text-slate-500/50 mb-2">Low Prob / Low Impact</div>
                {riskMatrix.Low.Low.map(r => (
                  <div key={r.id} className="text-xs font-medium text-slate-700 bg-white p-1.5 rounded border border-slate-200 mb-1 truncate cursor-pointer hover:bg-slate-50" title={`${r.projectName}: ${r.description}`} onClick={() => onViewProject(r.projectId)}>
                    {r.projectName}
                  </div>
                ))}
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 min-h-[100px]">
                <div className="text-[10px] font-black uppercase text-green-800/50 mb-2">Low Prob / Med Impact</div>
                {riskMatrix.Low.Medium.map(r => (
                  <div key={r.id} className="text-xs font-medium text-green-900 bg-white p-1.5 rounded border border-green-200 mb-1 truncate cursor-pointer hover:bg-green-50" title={`${r.projectName}: ${r.description}`} onClick={() => onViewProject(r.projectId)}>
                    {r.projectName}
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 min-h-[100px]">
                <div className="text-[10px] font-black uppercase text-amber-800/50 mb-2">Low Prob / High Impact</div>
                {riskMatrix.Low.High.map(r => (
                  <div key={r.id} className="text-xs font-medium text-amber-900 bg-white p-1.5 rounded border border-amber-200 mb-1 truncate cursor-pointer hover:bg-amber-50" title={`${r.projectName}: ${r.description}`} onClick={() => onViewProject(r.projectId)}>
                    {r.projectName}
                  </div>
                ))}
              </div>
            </div>
            
            {/* X-axis label */}
            <div className="flex justify-around mt-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-1/3 text-center">Low Impact</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-1/3 text-center">Medium Impact</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-1/3 text-center">High Impact</span>
            </div>
          </div>
        </div>
      </div>

      {/* M&E Specific Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Beneficiary Reach Trend</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
              <TrendingUp size={12} /> +24% Growth
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={meTrendData}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="reach" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Impact Quality Score</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              <Sparkles size={12} /> High Reliability
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={meTrendData}>
                <defs>
                  <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="impact" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorImpact)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Portfolio Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Portfolio Performance</h3>
          <button onClick={() => onNotify("Detailed analytical dashboard loading...")} className="text-xs text-indigo-600 font-bold hover:underline">Full Analytics</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Project Name</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Completion</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                  <td className="px-6 py-4 text-slate-600">{p.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[100px] overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${p.progress > 80 ? 'bg-green-500' : p.progress > 40 ? 'bg-indigo-500' : 'bg-amber-500'}`} 
                            style={{width: `${p.progress}%`}}
                          ></div>
                       </div>
                       <span className="text-xs font-bold text-slate-500">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${p.status === 'On Track' ? 'bg-green-50 text-green-700' : 
                        p.status === 'At Risk' ? 'bg-red-50 text-red-700' : 
                        'bg-amber-50 text-amber-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onViewProject(p.id)}
                      className="text-indigo-600 hover:text-white hover:bg-indigo-600 px-3 py-1.5 rounded-lg font-bold text-xs transition-all border border-indigo-100"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-12 text-center text-slate-400 italic font-medium">No projects available in this context.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Risk Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Project Risk Matrix</h3>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
            <AlertCircle size={12} /> {allRisks.length} Total Risks
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-2">
            {/* Header Row */}
            <div className="flex items-end justify-end p-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Impact →<br/>Probability ↓
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-center font-bold text-slate-600">Low</div>
            <div className="bg-slate-50 p-3 rounded-xl text-center font-bold text-slate-600">Medium</div>
            <div className="bg-slate-50 p-3 rounded-xl text-center font-bold text-slate-600">High</div>

            {/* High Probability Row */}
            <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-end font-bold text-slate-600">High</div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 min-h-[100px] flex flex-col gap-2">
              {riskMatrix.High.Low.map((r: any) => (
                <div key={r.id} className="text-[10px] bg-white p-2 rounded shadow-sm border border-amber-200 font-medium leading-tight">
                  <span className="font-bold text-slate-800 block mb-0.5">{r.projectName}</span>
                  {r.description}
                </div>
              ))}
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 min-h-[100px] flex flex-col gap-2">
              {riskMatrix.High.Medium.map((r: any) => (
                <div key={r.id} className="text-[10px] bg-white p-2 rounded shadow-sm border border-orange-200 font-medium leading-tight">
                  <span className="font-bold text-slate-800 block mb-0.5">{r.projectName}</span>
                  {r.description}
                </div>
              ))}
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 min-h-[100px] flex flex-col gap-2">
              {riskMatrix.High.High.map((r: any) => (
                <div key={r.id} className="text-[10px] bg-white p-2 rounded shadow-sm border border-red-200 font-medium leading-tight">
                  <span className="font-bold text-slate-800 block mb-0.5">{r.projectName}</span>
                  {r.description}
                </div>
              ))}
            </div>

            {/* Medium Probability Row */}
            <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-end font-bold text-slate-600">Medium</div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 min-h-[100px] flex flex-col gap-2">
              {riskMatrix.Medium.Low.map((r: any) => (
                <div key={r.id} className="text-[10px] bg-white p-2 rounded shadow-sm border border-emerald-200 font-medium leading-tight">
                  <span className="font-bold text-slate-800 block mb-0.5">{r.projectName}</span>
                  {r.description}
                </div>
              ))}
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 min-h-[100px] flex flex-col gap-2">
              {riskMatrix.Medium.Medium.map((r: any) => (
                <div key={r.id} className="text-[10px] bg-white p-2 rounded shadow-sm border border-amber-200 font-medium leading-tight">
                  <span className="font-bold text-slate-800 block mb-0.5">{r.projectName}</span>
                  {r.description}
                </div>
              ))}
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 min-h-[100px] flex flex-col gap-2">
              {riskMatrix.Medium.High.map((r: any) => (
                <div key={r.id} className="text-[10px] bg-white p-2 rounded shadow-sm border border-orange-200 font-medium leading-tight">
                  <span className="font-bold text-slate-800 block mb-0.5">{r.projectName}</span>
                  {r.description}
                </div>
              ))}
            </div>

            {/* Low Probability Row */}
            <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-end font-bold text-slate-600">Low</div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[100px] flex flex-col gap-2">
              {riskMatrix.Low.Low.map((r: any) => (
                <div key={r.id} className="text-[10px] bg-white p-2 rounded shadow-sm border border-slate-200 font-medium leading-tight">
                  <span className="font-bold text-slate-800 block mb-0.5">{r.projectName}</span>
                  {r.description}
                </div>
              ))}
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 min-h-[100px] flex flex-col gap-2">
              {riskMatrix.Low.Medium.map((r: any) => (
                <div key={r.id} className="text-[10px] bg-white p-2 rounded shadow-sm border border-emerald-200 font-medium leading-tight">
                  <span className="font-bold text-slate-800 block mb-0.5">{r.projectName}</span>
                  {r.description}
                </div>
              ))}
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 min-h-[100px] flex flex-col gap-2">
              {riskMatrix.Low.High.map((r: any) => (
                <div key={r.id} className="text-[10px] bg-white p-2 rounded shadow-sm border border-amber-200 font-medium leading-tight">
                  <span className="font-bold text-slate-800 block mb-0.5">{r.projectName}</span>
                  {r.description}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Milestones */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Project Milestones</h3>
          <button 
            onClick={() => {
              setEditingMilestone({ id: '', name: '', dueDate: '', status: 'Not Started' });
              setIsMilestoneModalOpen(true);
            }} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            <Plus size={14} /> Add Milestone
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Milestone Name</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Completion Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {milestones.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{m.name}</td>
                  <td className="px-6 py-4 text-slate-600">{m.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${m.status === 'Completed' ? 'bg-green-50 text-green-700' : 
                        m.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700' : 
                        'bg-slate-100 text-slate-600'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{m.completionDate || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingMilestone(m);
                          setIsMilestoneModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMilestone(m.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {milestones.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-12 text-center text-slate-400 italic font-medium">No milestones defined yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Widgets Section */}
      {dashboardWidgets.length > 0 && (
        <div className="space-y-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-slate-900">Custom Widgets</h2>
            <div className="h-px bg-slate-200 flex-1 ml-4"></div>
          </div>
          {dashboardWidgets.map(widget => (
            <div key={widget.id} className="h-[500px]">
              <WidgetRenderer widget={widget} />
            </div>
          ))}
        </div>
      )}

      {/* Customize Dashboard Modal */}
      {isCustomizeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-800">Customize Dashboard</h2>
                <p className="text-sm text-slate-500 font-medium">Add, remove, and configure widgets for your dashboard.</p>
              </div>
              <button onClick={() => setIsCustomizeModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Dashboard Layout</h3>
                  <button 
                    onClick={handleAddWidget}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    <Plus size={16} /> Add Widget
                  </button>
               </div>

               <div className="space-y-6">
                  {editingWidgets.length === 0 && (
                    <div className="text-center p-12 border-2 border-dashed border-slate-300 rounded-2xl bg-white">
                       <Layout className="mx-auto text-slate-300 mb-4" size={48} />
                       <p className="text-slate-500 font-bold">No custom widgets added yet.</p>
                       <p className="text-sm text-slate-400 mt-1">Click "Add Widget" to start customizing your dashboard.</p>
                    </div>
                  )}
                  
                  {editingWidgets.map((widget, idx) => (
                     <div key={widget.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group border-l-4 border-l-indigo-500">
                        <div className="absolute top-4 right-4">
                           <button onClick={() => removeWidget(idx)} className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={18}/></button>
                        </div>
                        
                        <h5 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">Widget {idx + 1} Configuration</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           <div className="col-span-1 md:col-span-2 space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-600 mb-2">Widget Title</label>
                                      <input 
                                        type="text"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={widget.title}
                                        onChange={(e) => updateWidget(idx, 'title', e.target.value)}
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1"><Database size={14}/> Data Source</label>
                                      <select 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={widget.dataSource}
                                        onChange={(e) => updateWidget(idx, 'dataSource', e.target.value as DataSourceType)}
                                      >
                                         <option value="PROJECTS">Projects</option>
                                         <option value="SURVEYS">Surveys</option>
                                         <option value="BENEFICIARIES">Beneficiaries</option>
                                         <option value="LOGS">System Logs</option>
                                      </select>
                                  </div>
                              </div>

                              <div>
                                 <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1"><Layout size={14}/> Display Format</label>
                                 <div className="flex bg-slate-100 p-1.5 rounded-xl mb-4">
                                    <button 
                                      onClick={() => updateWidget(idx, 'widgetType', 'TABLE')}
                                      className={`flex-1 text-xs py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${widget.widgetType === 'TABLE' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
                                    >
                                       <Table size={16}/> Table
                                    </button>
                                    <button 
                                      onClick={() => updateWidget(idx, 'widgetType', 'CARD_GRID')}
                                      className={`flex-1 text-xs py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${widget.widgetType === 'CARD_GRID' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
                                    >
                                       <Grid size={16}/> Grid
                                    </button>
                                    <button 
                                      onClick={() => updateWidget(idx, 'widgetType', 'CHART')}
                                      className={`flex-1 text-xs py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${widget.widgetType === 'CHART' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
                                    >
                                       <PieChartIcon size={16}/> Chart
                                    </button>
                                 </div>

                                 {widget.widgetType === 'CHART' && (
                                       <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Chart Visualization</label>
                                           <div className="flex gap-3">
                                               <button 
                                                  onClick={() => updateWidget(idx, 'chartType', 'BAR')}
                                                  className={`p-3 rounded-xl border flex-1 flex justify-center transition-all ${widget.chartType === 'BAR' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                                               >
                                                   <BarChartIcon size={20}/>
                                               </button>
                                               <button 
                                                  onClick={() => updateWidget(idx, 'chartType', 'LINE')}
                                                  className={`p-3 rounded-xl border flex-1 flex justify-center transition-all ${widget.chartType === 'LINE' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                                               >
                                                   <LineChartIcon size={20}/>
                                               </button>
                                               <button 
                                                  onClick={() => updateWidget(idx, 'chartType', 'PIE')}
                                                  className={`p-3 rounded-xl border flex-1 flex justify-center transition-all ${widget.chartType === 'PIE' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                                               >
                                                   <PieChartIcon size={20}/>
                                               </button>
                                           </div>
                                       </div>
                                 )}
                              </div>
                           </div>

                           <div className="col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                              <label className="block text-xs font-bold text-slate-600 mb-4 flex items-center gap-1">
                                  <Columns size={14}/> Select Columns to Display
                              </label>
                              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                  {SOURCE_FIELDS[widget.dataSource]?.map(field => (
                                      <button 
                                          key={field.key}
                                          onClick={() => toggleField(idx, field.key)}
                                          className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border ${
                                              (widget.selectedFields || []).includes(field.key) 
                                              ? 'bg-white border-indigo-200 text-indigo-700 shadow-sm' 
                                              : 'bg-transparent border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300'
                                          }`}
                                      >
                                          <span>{field.label}</span>
                                          {(widget.selectedFields || []).includes(field.key) && <Check size={14} />}
                                      </button>
                                  ))}
                              </div>
                              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                                    {(widget.selectedFields || []).length} Selected
                                </span>
                                {widget.widgetType === 'CHART' && (widget.selectedFields || []).length < 2 && (
                                  <span className="text-[10px] text-amber-500 font-bold">Need 2+ for chart</span>
                                )}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsCustomizeModalOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveWidgets}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2"
              >
                <Check size={16} /> Save Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {isMilestoneModalOpen && editingMilestone && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-800">
                {editingMilestone.id ? 'Edit Milestone' : 'New Milestone'}
              </h2>
              <button onClick={() => setIsMilestoneModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Milestone Name</label>
                <input 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                  value={editingMilestone.name}
                  onChange={(e) => setEditingMilestone({...editingMilestone, name: e.target.value})}
                  placeholder="e.g., Phase 1 Completion"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Due Date</label>
                <input 
                  type="date"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600"
                  value={editingMilestone.dueDate}
                  onChange={(e) => setEditingMilestone({...editingMilestone, dueDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Status</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600"
                  value={editingMilestone.status}
                  onChange={(e) => setEditingMilestone({...editingMilestone, status: e.target.value as any})}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              {editingMilestone.status === 'Completed' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Completion Date</label>
                  <input 
                    type="date"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600"
                    value={editingMilestone.completionDate || ''}
                    onChange={(e) => setEditingMilestone({...editingMilestone, completionDate: e.target.value})}
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsMilestoneModalOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveMilestone}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md transition-all"
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

export default ProjectDashboard;
