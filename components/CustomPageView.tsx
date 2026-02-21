
import React from 'react';
import { CustomPage, PageWidget, DataSourceType } from '../types';
import { Table, Grid, Database, FileText, FolderKanban, Users, Activity, Layout, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CustomPageViewProps {
  page: CustomPage;
}

const CustomPageView: React.FC<CustomPageViewProps> = ({ page }) => {

  const getFullMockData = (source: DataSourceType) => {
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
      default: return [];
    }
  };

  const getColumnLabel = (source: DataSourceType, key: string) => {
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

  const renderWidget = (widget: PageWidget) => {
    const rawData = getFullMockData(widget.dataSource);
    const selectedFields = widget.selectedFields || ['name', 'location', 'status'];

    return (
      <div key={widget.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8 animate-fade-in">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
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
        
        <div className="p-8">
           {widget.widgetType === 'TABLE' && (
              <div className="overflow-x-auto">
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
              </div>
           )}

           {widget.widgetType === 'CARD_GRID' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {rawData.map((row: any, idx) => (
                      <div key={idx} className="p-6 rounded-[2rem] border border-slate-200 hover:border-indigo-300 transition-all bg-white shadow-sm group">
                          <div className="flex items-start justify-between mb-4">
                              <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{row[selectedFields[0]]}</div>
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
                  ))}
              </div>
           )}

           {widget.widgetType === 'CHART' && (
               <div className="h-[350px] w-full">
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
                           </BarChart>
                       ) : widget.chartType === 'LINE' ? (
                           <LineChart data={rawData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                               <XAxis dataKey={selectedFields[0]} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}/>
                               <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}/>
                               <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700}}/>
                               <Line type="monotone" dataKey={selectedFields[selectedFields.length - 1]} stroke="#4f46e5" strokeWidth={4} dot={{r: 6, fill: '#fff', stroke: '#4f46e5', strokeWidth: 3}} activeDot={{r: 8}} />
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
               </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-8 animate-fade-in pb-20">
       <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100/50">
                {page.icon === 'Layout' ? <Layout size={32} /> : <Database size={32} />}
             </div>
             <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{page.name}</h1>
                <p className="text-slate-500 font-medium text-lg mt-1">{page.description}</p>
             </div>
          </div>
       </div>

       <div className="space-y-12">
          {page.widgets.map(widget => renderWidget(widget))}
          
          {page.widgets.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                  <Layout className="mx-auto text-slate-100 mb-6" size={80} />
                  <h3 className="text-xl font-black text-slate-300 uppercase tracking-[0.2em]">Canvas is empty</h3>
                  <p className="text-slate-300 font-bold mt-2">Map database columns in Settings to populate this page.</p>
              </div>
          )}
       </div>
    </div>
  );
};

export default CustomPageView;
