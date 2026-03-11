import React, { useState } from 'react';
import { Project, ProjectActivity } from '../types';
import { 
  ArrowLeft, FolderKanban, Calendar, Users, DollarSign, 
  MapPin, CheckCircle, Target, Activity, Clock, User,
  List, LayoutGrid, AlertTriangle, CheckSquare, X,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  onOpenWorkspace: (project: Project) => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onBack, onOpenWorkspace }) => {
  const [activityViewMode, setActivityViewMode] = useState<'LIST' | 'BOARD'>('LIST');

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
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${project.status === 'On Track' ? 'bg-green-100 text-green-700' : project.status === 'Delayed' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {project.status}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <MapPin size={12} /> {project.location}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 leading-tight">{project.name}</h3>
                <p className="text-slate-500 font-medium mb-8">
                  Comprehensive overview of project metrics, financials, and operational status.
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
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <Activity size={24} />
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

            {/* Budget Breakdown */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
              <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <PieChartIcon className="text-indigo-600" size={20} /> Budget Allocation
              </h4>
              <div className="space-y-6">
                {project.budgetLines && project.budgetLines.length > 0 ? (
                  <>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={project.budgetLines}
                            dataKey="allocated"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={50}
                            paddingAngle={5}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {project.budgetLines.map((entry, index) => {
                              const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];
                              return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                            })}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => `RWF ${value.toLocaleString()}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      {project.budgetLines.map((line) => {
                        const percent = project.budget > 0 ? Math.round((line.allocated / project.budget) * 100) : 0;
                        return (
                          <div key={line.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-slate-700 text-sm">{line.category}</span>
                              <span className="font-black text-slate-900 text-sm">{(line.allocated / 1000000).toFixed(1)}M RWF</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-indigo-400 rounded-full" style={{width: `${percent}%`}}></div>
                              </div>
                              <span className="text-[10px] font-black text-slate-400 w-8 text-right">{percent}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 italic text-center py-4">No budget breakdown available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Project Activities Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckSquare className="text-indigo-600" size={20} /> Project Activities
              </h4>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {project.activities.map(activity => (
                      <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-slate-900 text-sm">{activity.name}</p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <User size={12} /> {activity.assignedTo}
                          </p>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
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
                          <div key={activity.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
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
                                  {activity.assignedTo.charAt(0)}
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
            )}
          </div>

        </div>
      </div>
    </div>
  );
};


export default ProjectDetailView;
