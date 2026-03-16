
import React, { useState } from 'react';
/* Import missing Columns icon */
import * as Icons from 'lucide-react';
import { Settings, Layout, Plus, Trash2, Save, Database, Table, Grid, LayoutDashboard, X, FilePlus, Users, Shield, PieChart, BarChart as BarChartIcon, LineChart as LineChartIcon, Check, Columns } from 'lucide-react';
import { CustomPage, DataSourceType, PageWidget, WidgetType, ChartType, AppUser } from '../types';
import { SOURCE_FIELDS } from '../constants';

interface SettingsViewProps {
  customPages: CustomPage[];
  onSavePage: (page: CustomPage) => void;
  onDeletePage: (pageId: string) => void;
}

const AVAILABLE_ICONS = [
  'Layout', 'Database', 'Table', 'Grid', 'PieChart', 'BarChart', 'LineChart', 
  'Users', 'Shield', 'FilePlus', 'Settings', 'Activity', 'AlertCircle', 
  'Archive', 'Award', 'Bell', 'Book', 'Bookmark', 'Briefcase', 'Calendar', 
  'Camera', 'CheckCircle', 'Clipboard', 'Clock', 'Cloud', 'Code', 'Compass', 
  'CreditCard', 'Download', 'Edit', 'Eye', 'File', 'FileText', 'Filter', 
  'Flag', 'Folder', 'Globe', 'Heart', 'Home', 'Image', 'Inbox', 'Info', 
  'Key', 'Layers', 'Link', 'List', 'Lock', 'Mail', 'Map', 'MessageSquare', 
  'Monitor', 'Package', 'Paperclip', 'Phone', 'Play', 'PlusCircle', 'Printer', 
  'Search', 'Send', 'Share', 'ShoppingCart', 'Smartphone', 'Star', 'Tag', 
  'Target', 'Terminal', 'ThumbsUp', 'Tool', 'Trash', 'TrendingUp', 'Truck', 
  'Unlock', 'Upload', 'User', 'UserPlus', 'Video', 'Wifi', 'Zap'
];

const SettingsView: React.FC<SettingsViewProps> = ({ customPages, onSavePage, onDeletePage }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'pages' | 'users'>('pages');
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  
  const [users, setUsers] = useState<AppUser[]>([
    { id: '1', name: 'Alice Admin', email: 'alice@example.com', role: 'Admin', status: 'ACTIVE', lastLogin: '2026-03-15', department: 'IT', permissions: ['all'] },
    { id: '2', name: 'Bob Manager', email: 'bob@example.com', role: 'Project Manager', status: 'ACTIVE', lastLogin: '2026-03-14', department: 'Operations', permissions: ['projects:read', 'projects:write', 'reports:read', 'reports:write'] },
    { id: '3', name: 'Charlie Viewer', email: 'charlie@example.com', role: 'Viewer', status: 'INACTIVE', lastLogin: '2026-02-28', department: 'Finance', permissions: ['projects:read', 'reports:read'] },
  ]);

  const roles = [
    { name: 'Admin', permissions: ['all'] },
    { name: 'Project Manager', permissions: ['projects:read', 'projects:write', 'reports:read', 'reports:write'] },
    { name: 'Field Officer', permissions: ['projects:read', 'data:write'] },
    { name: 'Viewer', permissions: ['projects:read', 'reports:read'] }
  ];

  const handleRoleChange = (userId: string, newRole: 'Admin' | 'Project Manager' | 'Field Officer' | 'Viewer') => {
    const roleObj = roles.find(r => r.name === newRole);
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole, permissions: roleObj?.permissions || [] } : u));
  };

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
      icon: newPage.icon || 'Layout',
      widgets: newPage.widgets || [],
      createdAt: new Date().toISOString(),
      createdBy: 'Admin',
      visibility: newPage.visibility || 'PUBLIC'
    };

    onSavePage(pageToSave);
    setIsPageModalOpen(false);
    setNewPage({ name: '', description: '', icon: 'Layout', widgets: [], visibility: 'PUBLIC' });
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
                
                {customPages.map(page => {
                  const PageIcon = (Icons as any)[page.icon || 'Layout'] || Layout;
                  return (
                  <div key={page.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                         <PageIcon size={24} />
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
                )})}
              </div>
            </div>
          )}
          
          {activeTab === 'general' && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500">
               General Settings Placeholder
            </div>
          )}
          
          {activeTab === 'users' && (
             <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                     <h2 className="text-lg font-bold text-slate-900">User Management</h2>
                     <p className="text-sm text-slate-500">Manage user roles and permissions.</p>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
                    <Plus size={18} /> Add User
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-sm">
                        <th className="pb-3 font-medium">User</th>
                        <th className="pb-3 font-medium">Role</th>
                        <th className="pb-3 font-medium">Permissions</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4">
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </td>
                          <td className="py-4">
                            <select 
                              className="p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                            >
                              {roles.map(r => (
                                <option key={r.name} value={r.name}>{r.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.slice(0, 2).map(p => (
                                <span key={p} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                  {p}
                                </span>
                              ))}
                              {user.permissions.length > 2 && (
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                  +{user.permissions.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button className="text-slate-400 hover:text-indigo-600 p-2">
                              <Settings size={16} />
                            </button>
                            <button className="text-slate-400 hover:text-red-600 p-2">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                     <div className="col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Icon</label>
                        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50 custom-scrollbar">
                          {AVAILABLE_ICONS.map(iconName => {
                            const IconComponent = (Icons as any)[iconName];
                            if (!IconComponent) return null;
                            const isSelected = newPage.icon === iconName || (!newPage.icon && iconName === 'Layout');
                            return (
                              <button
                                key={iconName}
                                type="button"
                                onClick={() => setNewPage({...newPage, icon: iconName})}
                                className={`p-2 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md scale-110' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200'}`}
                                title={iconName}
                              >
                                <IconComponent size={20} />
                              </button>
                            );
                          })}
                        </div>
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
