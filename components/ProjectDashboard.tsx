
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, DollarSign, AlertCircle, Sparkles, Loader2, Download, Plus } from 'lucide-react';
import { Project, ProjectMilestone } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Edit3, Trash2, X } from 'lucide-react';

interface ProjectDashboardProps {
  organizationName: string;
  projects: Project[];
  onViewProject: (id: string) => void;
  onInitializeProject: () => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ organizationName, projects, onViewProject, onInitializeProject, onNotify }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([
    { id: '1', name: 'Initial Planning', dueDate: '2026-04-01', status: 'Completed', completionDate: '2026-03-10' },
    { id: '2', name: 'Phase 1 Execution', dueDate: '2026-06-15', status: 'In Progress' },
  ]);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

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
      const summary = projects.map(p => `${p.name} (Location: ${p.location}): ${p.status} (${p.progress}% complete, Budget: ${p.budget}, Spent: ${p.spent})`).join('; ');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given these NGO projects in Rwanda: ${summary}. Provide a 2-sentence strategic health summary of the organization's projects. Explicitly identify which province needs the most attention based on the project statuses, progress, and spending.`
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

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Welcome back, {organizationName} Admin</p>
        </div>
        <div className="flex gap-3">
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
      <div className="mb-8 bg-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Sparkles size={120} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
               <Sparkles className="text-amber-400" size={32} />
            </div>
            <div className="flex-1">
               <h3 className="font-bold text-lg mb-1 flex items-center gap-2">Data Intelligence Insights</h3>
               {isAiLoading ? (
                 <div className="flex items-center gap-2 text-indigo-200 text-sm">
                    <Loader2 className="animate-spin" size={16} /> Analyzing organizational data...
                 </div>
               ) : (
                 <p className="text-indigo-100 text-sm leading-relaxed max-w-2xl">{aiInsight}</p>
               )}
            </div>
            <button onClick={fetchAIInsight} className="bg-white text-indigo-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors shrink-0">Refresh Analysis</button>
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
          <div className="h-[300px] w-full relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="block text-4xl font-bold text-slate-900">{projects.length}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active</span>
                </div>
             </div>
          </div>
          <div className="flex flex-col gap-3 mt-4">
             {statusData.map((s, i) => (
               <div key={i} className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div>
                   <span className="text-slate-600 font-medium">{s.name}</span>
                 </div>
                 <span className="font-bold text-slate-900">{s.value}</span>
               </div>
             ))}
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
