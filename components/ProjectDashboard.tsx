
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, DollarSign, AlertCircle, Sparkles, Loader2, Download, Plus } from 'lucide-react';
import { Project } from '../types';
import { GoogleGenAI } from "@google/genai";

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

  const fetchAIInsight = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const summary = projects.map(p => `${p.name}: ${p.status} (${p.progress}%)`).join(', ');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given these NGO projects in Rwanda: ${summary}. Provide a 2-sentence strategic health summary. Mention which province needs most attention.`
      });
      setAiInsight(response.text || "Operations are stable across the portfolio. Continue standard monitoring protocols.");
    } catch (e) {
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
    </div>
  );
};

export default ProjectDashboard;
