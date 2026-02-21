
import React, { useState } from 'react';
/* Import missing Columns icon */
import { Settings, Layout, Plus, Trash2, Save, Database, Table, Grid, LayoutDashboard, X, FilePlus, Users, Shield, PieChart, BarChart as BarChartIcon, LineChart as LineChartIcon, Check, Columns } from 'lucide-react';
import { CustomPage, DataSourceType, PageWidget, WidgetType, ChartType } from '../types';

interface SettingsViewProps {
  customPages: CustomPage[];
  onSavePage: (page: CustomPage) => void;
  onDeletePage: (pageId: string) => void;
}

const SOURCE_FIELDS: Record<DataSourceType, { key: string; label: string }[]> = {
  PROJECTS: [
    { key: 'name', label: 'Project Name' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
    { key: 'progress', label: 'Progress (%)' },
    { key: 'budget', label: 'Total Budget' },
    { key: 'spent', label: 'Actual Spent' },
    { key: 'manager', label: 'Lead Manager' },
    { key: 'startDate', label: 'Launch Date' },
  ],
  SURVEYS: [
    { key: 'title', label: 'Survey Title' },
    { key: 'status', label: 'Current Status' },
    { key: 'responseCount', label: 'Response Volume' },
    { key: 'createdAt', label: 'Date Created' },
  ],
  BENEFICIARIES: [
    { key: 'name', label: 'Full Name' },
    { key: 'location', label: 'Primary Location' },
    { key: 'age', label: 'Age Group' },
    { key: 'status', label: 'Enrollment Status' },
    { key: 'gender', label: 'Gender Identity' },
  ],
  LOGS: [
    { key: 'action', label: 'Action Taken' },
    { key: 'user', label: 'Responsible User' },
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'details', label: 'Audit Details' },
  ],
  VIRTUAL_TABLE: []
};

const SettingsView: React.FC<SettingsViewProps> = ({ customPages, onSavePage, onDeletePage }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'pages' | 'users'>('pages');
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  
  const [newPage, setNewPage] = useState<Partial<CustomPage>>({
    name: '',
    description: '',
    widgets: [],
    visibility: 'PUBLIC'
  });

  const handleAddWidget = () => {
    const newWidget: PageWidget = {
      id: Date.now().toString(),
      title: 'New Data Section',
      dataSource: 'PROJECTS',
      widgetType: 'TABLE',
      selectedFields: ['name', 'location', 'status', 'budget']
    };
    setNewPage({
      ...newPage,
      widgets: [...(newPage.widgets || []), newWidget]
    });
  };

  const updateWidget = (index: number, field: keyof PageWidget, value: any) => {
    if (!newPage.widgets) return;
    const updatedWidgets = [...newPage.widgets];
    updatedWidgets[index] = { ...updatedWidgets[index], [field]: value };
    
    if (field === 'widgetType' && value === 'CHART' && !updatedWidgets[index].chartType) {
        updatedWidgets[index].chartType = 'BAR';
    }

    // Default fields if data source changes
    if (field === 'dataSource') {
        const defaultFields = SOURCE_FIELDS[value as DataSourceType].slice(0, 4).map(f => f.key);
        updatedWidgets[index].selectedFields = defaultFields;
    }

    setNewPage({ ...newPage, widgets: updatedWidgets });
  };

  const toggleField = (widgetIndex: number, fieldKey: string) => {
    if (!newPage.widgets) return;
    const widget = newPage.widgets[widgetIndex];
    const currentFields = widget.selectedFields || [];
    const updatedFields = currentFields.includes(fieldKey)
        ? currentFields.filter(f => f !== fieldKey)
        : [...currentFields, fieldKey];
    
    updateWidget(widgetIndex, 'selectedFields', updatedFields);
  };

  const removeWidget = (index: number) => {
    if (!newPage.widgets) return;
    const updatedWidgets = [...newPage.widgets];
    updatedWidgets.splice(index, 1);
    setNewPage({ ...newPage, widgets: updatedWidgets });
  };

  const handleSave = () => {
    if (!newPage.name) return;
    
    const pageToSave: CustomPage = {
      id: newPage.id || Date.now().toString(),
      name: newPage.name,
      description: newPage.description || '',
      icon: 'Layout',
      widgets: newPage.widgets || [],
      createdAt: new Date().toISOString(),
      createdBy: 'Admin',
      visibility: newPage.visibility || 'PUBLIC'
    };

    onSavePage(pageToSave);
    setIsPageModalOpen(false);
    setNewPage({ name: '', description: '', widgets: [], visibility: 'PUBLIC' });
  };

  const handleEditPage = (page: CustomPage) => {
    setNewPage({ ...page });
    setIsPageModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="text-indigo-600" /> Organization Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage pages, users, and system configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 ${activeTab === 'general' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
            >
              <Settings size={18} /> General
            </button>
            <button 
              onClick={() => setActiveTab('pages')}
              className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 ${activeTab === 'pages' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
            >
              <Layout size={18} /> Page Builder
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
            >
              <Users size={18} /> User Management
            </button>
             <button 
              className="w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 text-slate-400 cursor-not-allowed border-l-4 border-transparent"
            >
              <Shield size={18} /> Security (Enterprise)
            </button>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'pages' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-lg font-bold text-slate-900">Custom Pages</h2>
                   <p className="text-sm text-slate-500">Create and manage new pages for your organization's dashboard.</p>
                </div>
                <button 
                  onClick={() => {
                    setNewPage({ name: '', description: '', widgets: [], visibility: 'PUBLIC' });
                    setIsPageModalOpen(true);
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
                >
                  <Plus size={18} /> Create New Page
                </button>
              </div>

              <div className="grid gap-4">
                {customPages.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <Layout className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500 font-medium">No custom pages created yet.</p>
                    <p className="text-slate-400 text-sm">Click "Create New Page" to build one.</p>
                  </div>
                )}
                
                {customPages.map(page => (
                  <div key={page.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                         <Layout size={24} />
                       </div>
                       <div>
                         <h3 className="font-bold text-slate-900">{page.name}</h3>
                         <p className="text-sm text-slate-500">{page.description || 'No description'} • {page.widgets.length} Data Sections</p>
                       </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleEditPage(page)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                         <Settings size={18} />
                       </button>
                       <button onClick={() => onDeletePage(page.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'general' && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500">
               General Settings Placeholder
            </div>
          )}
          
          {activeTab === 'users' && (
             <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500">
               User Management Placeholder
            </div>
          )}
        </div>
      </div>

      {isPageModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col animate-scale-in">
            <div className="bg-indigo-600 p-6 flex justify-between items-center shrink-0 text-white rounded-t-2xl">
              <div>
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <FilePlus size={24} /> {newPage.id ? 'Edit Page' : 'Create New Page'}
                </h3>
                <p className="text-indigo-100 text-sm mt-1">Define layout and map database columns.</p>
              </div>
              <button onClick={() => setIsPageModalOpen(false)} className="text-indigo-100 hover:text-white bg-white/10 p-2 rounded-full hover:bg-white/20">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Page Name</label>
                        <input 
                          type="text" 
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="e.g. Field Operations"
                          value={newPage.name}
                          onChange={(e) => setNewPage({...newPage, name: e.target.value})}
                        />
                     </div>
                     <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <input 
                          type="text" 
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Short description of page purpose"
                          value={newPage.description}
                          onChange={(e) => setNewPage({...newPage, description: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                     <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-slate-900">Page Content (Widgets)</h4>
                        <button 
                          onClick={handleAddWidget}
                          className="text-sm bg-white border border-indigo-200 text-indigo-600 px-3 py-2 rounded-lg font-medium hover:bg-indigo-50 flex items-center gap-2"
                        >
                          <Plus size={16} /> Add Data Section
                        </button>
                     </div>

                     <div className="space-y-6">
                        {newPage.widgets?.length === 0 && (
                          <div className="text-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-100/50">
                             <p className="text-slate-400 italic">No content added. Add a section to display data.</p>
                          </div>
                        )}
                        
                        {newPage.widgets?.map((widget, idx) => (
                           <div key={widget.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group border-l-4 border-l-indigo-500">
                              <div className="absolute top-4 right-4">
                                 <button onClick={() => removeWidget(idx)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={18}/></button>
                              </div>
                              
                              <h5 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Section {idx + 1} Configuration</h5>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 <div className="col-span-1 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Section Title</label>
                                        <input 
                                          type="text"
                                          className="w-full p-2 border border-slate-300 rounded-md text-sm font-medium"
                                          value={widget.title}
                                          onChange={(e) => updateWidget(idx, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><Database size={12}/> Connect Data Source</label>
                                        <select 
                                          className="w-full p-2 border border-slate-300 rounded-md text-sm bg-slate-50 font-bold text-indigo-600"
                                          value={widget.dataSource}
                                          onChange={(e) => updateWidget(idx, 'dataSource', e.target.value as DataSourceType)}
                                        >
                                           <option value="PROJECTS">Projects (Virtual Table)</option>
                                           <option value="SURVEYS">Surveys Database</option>
                                           <option value="BENEFICIARIES">Beneficiaries List</option>
                                           <option value="LOGS">Activity Logs</option>
                                        </select>
                                    </div>
                                 </div>

                                 <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><Layout size={12}/> View Type</label>
                                    <div className="flex bg-slate-100 p-1 rounded-md mb-4">
                                       <button 
                                         onClick={() => updateWidget(idx, 'widgetType', 'TABLE')}
                                         className={`flex-1 text-xs py-1.5 rounded flex items-center justify-center gap-1 ${widget.widgetType === 'TABLE' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500'}`}
                                         title="Table View"
                                       >
                                          <Table size={14}/> Table
                                       </button>
                                       <button 
                                         onClick={() => updateWidget(idx, 'widgetType', 'CARD_GRID')}
                                         className={`flex-1 text-xs py-1.5 rounded flex items-center justify-center gap-1 ${widget.widgetType === 'CARD_GRID' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500'}`}
                                         title="Card Grid"
                                       >
                                          <Grid size={14}/> Grid
                                       </button>
                                       <button 
                                         onClick={() => updateWidget(idx, 'widgetType', 'CHART')}
                                         className={`flex-1 text-xs py-1.5 rounded flex items-center justify-center gap-1 ${widget.widgetType === 'CHART' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500'}`}
                                         title="Chart View"
                                       >
                                          <PieChart size={14}/> Chart
                                       </button>
                                    </div>

                                    {widget.widgetType === 'CHART' && (
                                         <div className="space-y-2">
                                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Chart Type</label>
                                             <div className="flex gap-2">
                                                 <button 
                                                    onClick={() => updateWidget(idx, 'chartType', 'BAR')}
                                                    className={`p-2 rounded-lg border flex-1 flex justify-center ${widget.chartType === 'BAR' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}
                                                 >
                                                     <BarChartIcon size={16}/>
                                                 </button>
                                                 <button 
                                                    onClick={() => updateWidget(idx, 'chartType', 'LINE')}
                                                    className={`p-2 rounded-lg border flex-1 flex justify-center ${widget.chartType === 'LINE' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}
                                                 >
                                                     <LineChartIcon size={16}/>
                                                 </button>
                                                 <button 
                                                    onClick={() => updateWidget(idx, 'chartType', 'PIE')}
                                                    className={`p-2 rounded-lg border flex-1 flex justify-center ${widget.chartType === 'PIE' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}
                                                 >
                                                     <PieChart size={16}/>
                                                 </button>
                                             </div>
                                         </div>
                                    )}
                                 </div>

                                 <div className="col-span-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <label className="block text-xs font-bold text-slate-600 mb-3 flex items-center gap-1">
                                        <Columns size={12}/> Map Database Columns
                                    </label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                        {SOURCE_FIELDS[widget.dataSource].map(field => (
                                            <button 
                                                key={field.key}
                                                onClick={() => toggleField(idx, field.key)}
                                                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all border ${
                                                    (widget.selectedFields || []).includes(field.key) 
                                                    ? 'bg-white border-indigo-200 text-indigo-700 shadow-sm' 
                                                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-100'
                                                }`}
                                            >
                                                <span>{field.label}</span>
                                                {(widget.selectedFields || []).includes(field.key) && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-3 tracking-wider">
                                        {(widget.selectedFields || []).length} Columns selected
                                    </p>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-white rounded-b-2xl flex justify-end gap-3 shrink-0">
               <button onClick={() => setIsPageModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-lg">Cancel</button>
               <button onClick={handleSave} className="px-8 py-2.5 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-lg hover:bg-indigo-700 shadow-lg flex items-center gap-2">
                 <Save size={18} /> Publish Configuration
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
