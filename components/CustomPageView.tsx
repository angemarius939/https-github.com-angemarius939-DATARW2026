
import React from 'react';
import { CustomPage, PageWidget } from '../types';
import { Table, Grid, Database, FileText, FolderKanban, Users, Activity, Layout, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CustomPageViewProps {
  page: CustomPage;
}

const CustomPageView: React.FC<CustomPageViewProps> = ({ page }) => {

  // Mock Data Generators (In a real app, this would be an API call based on dataSource)
  const getMockData = (source: string) => {
      switch(source) {
          case 'PROJECTS':
              return [
                  { id: 1, col1: 'Clean Water Initiative', col2: 'Northern Prov.', col3: 'On Track', col4: '45,000,000' },
                  { id: 2, col1: 'Rural Education', col2: 'Eastern Prov.', col3: 'Delayed', col4: '32,000,000' },
                  { id: 3, col1: 'Agri-Tech Training', col2: 'Southern Prov.', col3: 'At Risk', col4: '15,000,000' },
                  { id: 4, col1: 'Health V2', col2: 'Kigali City', col3: 'On Track', col4: '120,000,000' },
              ];
          case 'SURVEYS':
              return [
                  { id: 1, col1: 'Baseline Survey Q1', col2: 'Active', col3: '1,204 Responses', col4: '2024-01-15' },
                  { id: 2, col1: 'Beneficiary Feedback', col2: 'Draft', col3: '0 Responses', col4: '2024-03-01' },
                  { id: 3, col1: 'Endline Assessment', col2: 'Closed', col3: '856 Responses', col4: '2023-12-10' },
              ];
          case 'BENEFICIARIES':
              return [
                  { id: 1, col1: 'John Doe', col2: 'Farmer', col3: 'Musanze', col4: 'Active' },
                  { id: 2, col1: 'Jane Smith', col2: 'Teacher', col3: 'Kayonza', col4: 'Active' },
                  { id: 3, col1: 'Peter Jones', col2: 'Student', col3: 'Huye', col4: 'Pending' },
                  { id: 4, col1: 'Sarah M.', col2: 'Nurse', col3: 'Kigali', col4: 'Active' },
              ];
          default: return [];
      }
  };

  const getChartData = (source: string) => {
      // Mock data suitable for charts
      switch(source) {
          case 'PROJECTS':
              return [
                  { name: 'Water', value: 45000000, status: 'On Track' },
                  { name: 'Edu', value: 32000000, status: 'Delayed' },
                  { name: 'Agri', value: 15000000, status: 'At Risk' },
                  { name: 'Health', value: 120000000, status: 'On Track' },
              ];
          case 'SURVEYS':
              return [
                  { name: 'Baseline', value: 1204 },
                  { name: 'Feedback', value: 0 },
                  { name: 'Endline', value: 856 },
              ];
          case 'BENEFICIARIES':
              return [
                  { name: 'Farmers', value: 450 },
                  { name: 'Teachers', value: 120 },
                  { name: 'Students', value: 300 },
                  { name: 'Health', value: 80 },
              ];
          default: return [];
      }
  };

  const getColumns = (source: string) => {
      switch(source) {
          case 'PROJECTS': return ['Project Name', 'Location', 'Status', 'Budget (FRW)'];
          case 'SURVEYS': return ['Survey Title', 'Status', 'Volume', 'Created Date'];
          case 'BENEFICIARIES': return ['Name', 'Occupation', 'District', 'Status'];
          default: return ['Column 1', 'Column 2', 'Column 3', 'Column 4'];
      }
  };

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const renderWidget = (widget: PageWidget) => {
    const data = getMockData(widget.dataSource);
    const chartData = getChartData(widget.dataSource);
    const columns = getColumns(widget.dataSource);

    return (
      <div key={widget.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
             {widget.dataSource === 'PROJECTS' ? <FolderKanban size={20} className="text-indigo-600"/> : 
              widget.dataSource === 'SURVEYS' ? <FileText size={20} className="text-blue-600"/> :
              <Users size={20} className="text-green-600"/>}
             {widget.title}
           </h3>
           <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded uppercase tracking-wider">
              Source: {widget.dataSource}
           </span>
        </div>
        
        <div className="p-6">
           {widget.widgetType === 'TABLE' && (
              <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                           {columns.map((col, i) => <th key={i} className="px-4 py-3">{col}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row: any) => (
                           <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-900">{row.col1}</td>
                              <td className="px-4 py-3 text-slate-600">{row.col2}</td>
                              <td className="px-4 py-3 text-slate-600">{row.col3}</td>
                              <td className="px-4 py-3 text-slate-600">{row.col4}</td>
                           </tr>
                        ))}
                    </tbody>
                 </table>
              </div>
           )}

           {widget.widgetType === 'CARD_GRID' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.map((row: any) => (
                      <div key={row.id} className="p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors bg-slate-50/30">
                          <div className="flex items-start justify-between mb-2">
                              <div className="font-bold text-slate-900 text-lg">{row.col1}</div>
                              {row.col3 === 'On Track' || row.col4 === 'Active' ? (
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              ) : (
                                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              )}
                          </div>
                          <div className="space-y-1 text-sm text-slate-600">
                              <p>{columns[1]}: <span className="font-medium text-slate-800">{row.col2}</span></p>
                              <p>{columns[2]}: <span className="font-medium text-slate-800">{row.col3}</span></p>
                              <p className="text-xs text-slate-400 mt-2">{columns[3]}: {row.col4}</p>
                          </div>
                      </div>
                  ))}
              </div>
           )}

           {widget.widgetType === 'CHART' && (
               <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       {widget.chartType === 'BAR' ? (
                           <BarChart data={chartData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}}/>
                               <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}}/>
                               <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                               <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                           </BarChart>
                       ) : widget.chartType === 'LINE' ? (
                           <LineChart data={chartData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}}/>
                               <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}}/>
                               <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                               <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                           </LineChart>
                       ) : (
                           <PieChart>
                               <Pie
                                   data={chartData}
                                   cx="50%"
                                   cy="50%"
                                   innerRadius={60}
                                   outerRadius={80}
                                   paddingAngle={5}
                                   dataKey="value"
                               >
                                   {chartData.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                   ))}
                               </Pie>
                               <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                               <Legend />
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
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
       <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-indigo-600 text-white rounded-lg">
                {page.icon === 'Layout' ? <Layout size={24} /> : <Database size={24} />}
             </div>
             <h1 className="text-3xl font-bold text-slate-900">{page.name}</h1>
          </div>
          <p className="text-slate-500 text-lg">{page.description}</p>
       </div>

       <div className="space-y-8">
          {page.widgets.map(widget => renderWidget(widget))}
          
          {page.widgets.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400">This page has no content yet.</p>
                  <p className="text-slate-400 text-xs">Go to Settings to add data sections.</p>
              </div>
          )}
       </div>
    </div>
  );
};

export default CustomPageView;
