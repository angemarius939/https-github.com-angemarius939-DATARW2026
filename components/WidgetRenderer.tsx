import React from 'react';
import { PageWidget, DataSourceType } from '../types';
import { Table, Grid, Database, FileText, FolderKanban, Users, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const getFullMockData = (source: DataSourceType) => {
  switch(source) {
    case 'PROJECTS':
      return [
        { name: 'Clean Water Initiative', location: 'Northern Prov.', status: 'On Track', progress: 75, budget: 45000000, spent: 32000000, manager: 'Jean Bosco', startDate: '2024-01-10' },
        { name: 'Rural Education', location: 'Eastern Prov.', status: 'Delayed', progress: 45, budget: 32000000, spent: 12000000, manager: 'Marie Claire', startDate: '2024-03-15' },
        { name: 'Agri-Tech Training', location: 'Southern Prov.', status: 'At Risk', progress: 20, budget: 15000000, spent: 5000000, manager: 'Eric M.', startDate: '2025-01-05' },
        { name: 'Health Resilience V2', location: 'Kigali City', status: 'On Track', progress: 90, budget: 120000000, spent: 110000000, manager: 'Admin', startDate: '2023-11-20' },
      ];
    case 'BENEFICIARIES':
      return [
        { name: 'John Doe', location: 'Musanze', age: '25-35', status: 'Active', gender: 'Male' },
        { name: 'Jane Smith', location: 'Kayonza', age: '18-24', status: 'Active', gender: 'Female' },
        { name: 'Peter Jones', location: 'Huye', age: '45+', status: 'Inactive', gender: 'Male' },
        { name: 'Sarah M.', location: 'Kigali City', age: '25-35', status: 'Active', gender: 'Female' },
      ];
    case 'SURVEYS':
      return [
        { title: 'Community Needs Assessment', status: 'Active', responseCount: 150, createdAt: '2025-02-10' },
        { title: 'Post-Training Feedback', status: 'Closed', responseCount: 45, createdAt: '2025-01-20' },
        { title: 'Health Clinic Satisfaction', status: 'Active', responseCount: 320, createdAt: '2025-03-01' },
        { title: 'Agricultural Yield Survey', status: 'Draft', responseCount: 0, createdAt: '2025-03-15' },
      ];
    case 'LOGS':
      return [
        { action: 'User Login', user: 'Admin', timestamp: '2025-03-16 08:30', details: 'Successful login from IP 192.168.1.1' },
        { action: 'Data Export', user: 'Jean Bosco', timestamp: '2025-03-15 14:20', details: 'Exported Beneficiaries list to CSV' },
        { action: 'Project Update', user: 'Marie Claire', timestamp: '2025-03-14 09:15', details: 'Changed status of Rural Education to Delayed' },
        { action: 'Survey Created', user: 'Admin', timestamp: '2025-03-13 11:00', details: 'Created Agricultural Yield Survey' },
      ];
    default: return [];
  }
};

export const getColumnLabel = (source: DataSourceType, key: string) => {
  const labels: Record<string, string> = {
    name: 'Item Name',
    location: 'Location',
    status: 'Status',
    progress: 'Progress',
    budget: 'Budget (FRW)',
    spent: 'Actual Spent',
    manager: 'Manager',
    startDate: 'Start Date',
    responseCount: 'Responses',
    age: 'Age Group',
    gender: 'Gender'
  };
  return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface WidgetRendererProps {
  widget: PageWidget;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  const rawData = getFullMockData(widget.dataSource);
  const selectedFields = widget.selectedFields || ['name', 'location', 'status'];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col animate-fade-in">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
         <div className="flex items-center gap-3">
           <div className="p-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl shadow-sm">
              {widget.dataSource === 'PROJECTS' ? <FolderKanban size={20}/> : 
               widget.dataSource === 'SURVEYS' ? <FileText size={20}/> :
               <Users size={20}/>}
           </div>
           <div>
              <h3 className="font-black text-slate-800">{widget.title}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Source: {widget.dataSource}</p>
           </div>
         </div>
      </div>
      
      <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
         {widget.widgetType === 'TABLE' && (
            <div className="overflow-x-auto">
               {selectedFields.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-bold">No fields selected for this table.</div>
               ) : (
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                         {selectedFields.map((field) => (
                           <th key={field} className="px-6 py-4">{getColumnLabel(widget.dataSource, field)}</th>
                         ))}
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {rawData.map((row: any, idx) => (
                         <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            {selectedFields.map((field) => (
                              <td key={field} className="px-6 py-4">
                                 {field === 'budget' || field === 'spent' ? (
                                    <span className="font-mono font-bold text-slate-900">{row[field].toLocaleString()}</span>
                                 ) : field === 'status' ? (
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${row[field] === 'On Track' || row[field] === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {row[field]}
                                    </span>
                                 ) : (
                                    <span className="font-bold text-slate-700">{row[field]}</span>
                                 )}
                              </td>
                            ))}
                         </tr>
                      ))}
                  </tbody>
               </table>
               )}
            </div>
         )}

         {widget.widgetType === 'CARD_GRID' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {selectedFields.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-slate-400 font-bold">No fields selected for this grid.</div>
                ) : (
                rawData.map((row: any, idx) => (
                    <div key={idx} className="p-6 rounded-[2rem] border border-slate-200 hover:border-indigo-300 transition-all bg-white shadow-sm group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{selectedFields.length > 0 ? row[selectedFields[0]] : 'No field selected'}</div>
                            <div className={`w-2 h-2 rounded-full ${row.status === 'On Track' || row.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-amber-500'}`}></div>
                        </div>
                        <div className="space-y-3">
                            {selectedFields.slice(1).map(field => (
                              <div key={field}>
                                 <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{getColumnLabel(widget.dataSource, field)}</span>
                                 <span className="text-sm font-bold text-slate-700">
                                    {field === 'budget' ? `RWF ${row[field].toLocaleString()}` : row[field]}
                                 </span>
                              </div>
                            ))}
                        </div>
                    </div>
                ))
                )}
            </div>
         )}

         {widget.widgetType === 'CHART' && (
             <div className="h-[350px] w-full">
                 {selectedFields.length < 2 ? (
                     <div className="h-full flex items-center justify-center text-slate-400 font-bold">Please select at least 2 fields for the chart.</div>
                 ) : (
                 <ResponsiveContainer width="100%" height="100%">
                     {widget.chartType === 'BAR' ? (
                         <BarChart data={rawData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                             <XAxis dataKey={selectedFields[0]} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}/>
                             <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}/>
                             <Tooltip 
                                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700}}
                                cursor={{fill: '#f8fafc'}}
                             />
                             <Bar dataKey={selectedFields[selectedFields.length - 1]} fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                             <Legend verticalAlign="bottom" height={36}/>
                         </BarChart>
                     ) : widget.chartType === 'LINE' ? (
                         <LineChart data={rawData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                             <XAxis dataKey={selectedFields[0]} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}/>
                             <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}/>
                             <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700}}/>
                             <Line type="monotone" dataKey={selectedFields[selectedFields.length - 1]} stroke="#4f46e5" strokeWidth={4} dot={{r: 6, fill: '#fff', stroke: '#4f46e5', strokeWidth: 3}} activeDot={{r: 8}} />
                             <Legend verticalAlign="bottom" height={36}/>
                         </LineChart>
                     ) : (
                         <PieChart>
                             <Pie
                                 data={rawData}
                                 cx="50%"
                                 cy="50%"
                                 innerRadius={80}
                                 outerRadius={110}
                                 paddingAngle={8}
                                 dataKey={selectedFields[selectedFields.length - 1]}
                                 nameKey={selectedFields[0]}
                             >
                                 {rawData.map((_, index) => (
                                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                 ))}
                             </Pie>
                             <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700}}/>
                             <Legend verticalAlign="bottom" height={36}/>
                         </PieChart>
                     )}
                 </ResponsiveContainer>
                 )}
             </div>
         )}
      </div>
    </div>
  );
};
