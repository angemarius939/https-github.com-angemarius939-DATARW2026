
import React, { useState } from 'react';
import { 
  Wrench, Database, Layout, Smartphone, 
  Plus, Search, Trash2, Save, X, Edit3, 
  Settings, ChevronRight, Zap, Mail, 
  Shield, CheckCircle, Code, List, Table as TableIcon,
  Columns, Type, Calendar, CheckSquare, Layers, 
  Eye, Rocket, History, Workflow, Play, FilePlus,
  ArrowRight, ToggleLeft, GripVertical, MoreHorizontal,
  Bell, CheckSquare as CheckSquareIcon, Send, RefreshCw,
  Clock, AlertTriangle, ChevronUp, ChevronDown, Settings2,
  Trash
} from 'lucide-react';
import { 
  CustomPage, VirtualTable, VirtualField, 
  WorkflowAction, PageWidget, DataSourceType,
  FormDefinition, FormFieldDefinition 
} from '../types';

interface AdminPanelProps {
  customPages: CustomPage[];
  setCustomPages: (p: CustomPage[]) => void;
  virtualTables: VirtualTable[];
  setVirtualTables: (t: VirtualTable[]) => void;
  workflows: WorkflowAction[];
  setWorkflows: (w: WorkflowAction[]) => void;
  dynamicForms: FormDefinition[];
  setDynamicForms: (f: FormDefinition[]) => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  customPages, setCustomPages, virtualTables, setVirtualTables, 
  workflows, setWorkflows, dynamicForms, setDynamicForms, onNotify 
}) => {
  const [activeSection, setActiveSection] = useState<'pages' | 'database' | 'workflows' | 'forms'>('pages');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // --- Form Builder Helpers ---
  const addFormField = () => {
    const newField: FormFieldDefinition = {
      id: 'fld-' + Date.now(),
      type: 'text',
      label: 'New Input Field',
      placeholder: 'Enter data...',
      required: false,
      options: []
    };
    setEditingItem({
      ...editingItem,
      fields: [...(editingItem.fields || []), newField]
    });
  };

  const updateFormField = (index: number, updates: Partial<FormFieldDefinition>) => {
    const fields = [...editingItem.fields];
    fields[index] = { ...fields[index], ...updates };
    setEditingItem({ ...editingItem, fields });
  };

  const removeFormField = (index: number) => {
    const fields = [...editingItem.fields];
    fields.splice(index, 1);
    setEditingItem({ ...editingItem, fields });
  };

  const moveFormField = (index: number, direction: 'up' | 'down') => {
    const fields = [...editingItem.fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const temp = fields[index];
    fields[index] = fields[newIndex];
    fields[newIndex] = temp;
    setEditingItem({ ...editingItem, fields });
  };

  // --- Page Builder Logic ---
  const handleCreatePage = () => {
    setEditingItem({ id: '', name: '', description: '', widgets: [], visibility: 'PUBLIC' });
    setIsEditorOpen(true);
  };

  const handleSavePage = (page: CustomPage) => {
    const updated = page.id 
      ? customPages.map(p => p.id === page.id ? page : p)
      : [{ ...page, id: 'pg-' + Date.now(), createdAt: new Date().toISOString(), createdBy: 'Admin' }, ...customPages];
    setCustomPages(updated);
    setIsEditorOpen(false);
    onNotify("Page configuration published successfully");
  };

  // --- Database Logic ---
  const handleCreateTable = () => {
    setEditingItem({ id: '', name: '', description: '', fields: [] });
    setIsEditorOpen(true);
  };

  const handleSaveTable = (table: VirtualTable) => {
    const updated = table.id
      ? virtualTables.map(t => t.id === table.id ? table : t)
      : [{ ...table, id: 'tb-' + Date.now(), recordsCount: 0, fields: table.fields || [] }, ...virtualTables];
    setVirtualTables(updated);
    setIsEditorOpen(false);
    onNotify("Virtual table schema deployed");
  };

  const handleAddFieldToTable = (tableId: string) => {
    const table = virtualTables.find(t => t.id === tableId);
    if (!table) return;
    const newField: VirtualField = {
      id: 'f-' + Date.now(),
      name: 'new_column',
      label: 'New Column',
      type: 'TEXT',
      validation: { required: false }
    };
    const updatedTable = { ...table, fields: [...table.fields, newField] };
    setVirtualTables(virtualTables.map(t => t.id === tableId ? updatedTable : t));
    onNotify("New column added to table schema");
  };

  // --- Form Builder Logic ---
  const handleCreateForm = () => {
    setEditingItem({ id: '', name: '', description: '', fields: [], publishStatus: 'DRAFT', targetTableId: '' });
    setIsEditorOpen(true);
  };

  const handleSaveForm = (form: FormDefinition) => {
    const updated = form.id
      ? dynamicForms.map(f => f.id === form.id ? form : f)
      : [{ ...form, id: 'frm-' + Date.now() }, ...dynamicForms];
    setDynamicForms(updated);
    setIsEditorOpen(false);
    onNotify("Form structure updated");
  };

  // --- Workflow Logic ---
  const handleCreateWorkflow = () => {
    setEditingItem({ 
      id: '', 
      name: '', 
      trigger: 'ON_SUBMIT', 
      triggerSourceId: '', 
      action: 'NOTIFY', 
      config: { message: '', subject: '', recipient: '' } 
    });
    setIsEditorOpen(true);
  };

  const handleSaveWorkflow = (workflow: WorkflowAction) => {
    const updated = workflow.id
      ? workflows.map(w => w.id === workflow.id ? workflow : w)
      : [{ ...workflow, id: 'wf-' + Date.now() }, ...workflows];
    setWorkflows(updated);
    setIsEditorOpen(false);
    onNotify("Automation workflow deployed");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fade-in">
      {/* Admin Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-1">
               <Wrench size={14} /> Platform Architect
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Organization Admin Panel</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Design your organization's digital workspace with no-code tools.</p>
          </div>
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors">
                <History size={16}/> Audit Logs
             </button>
             <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all">
                Publish Changes
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex max-w-7xl mx-auto w-full p-8 gap-8">
        {/* Admin Navigation */}
        <aside className="w-64 space-y-1 shrink-0">
           <button 
             onClick={() => setActiveSection('pages')}
             className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSection === 'pages' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-white'}`}
           >
              <div className="flex items-center gap-3 font-bold text-sm">
                <Layout size={18} /> Page Builder
              </div>
              <ChevronRight size={14} className={activeSection === 'pages' ? 'opacity-100' : 'opacity-0'} />
           </button>
           <button 
             onClick={() => setActiveSection('database')}
             className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSection === 'database' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-white'}`}
           >
              <div className="flex items-center gap-3 font-bold text-sm">
                <Database size={18} /> Database & Tables
              </div>
              <ChevronRight size={14} className={activeSection === 'database' ? 'opacity-100' : 'opacity-0'} />
           </button>
           <button 
             onClick={() => setActiveSection('forms')}
             className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSection === 'forms' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-white'}`}
           >
              <div className="flex items-center gap-3 font-bold text-sm">
                <FilePlus size={18} /> Form Builder
              </div>
              <ChevronRight size={14} className={activeSection === 'forms' ? 'opacity-100' : 'opacity-0'} />
           </button>
           <button 
             onClick={() => setActiveSection('workflows')}
             className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSection === 'workflows' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-white'}`}
           >
              <div className="flex items-center gap-3 font-bold text-sm">
                <Workflow size={18} /> Automations
              </div>
              <ChevronRight size={14} className={activeSection === 'workflows' ? 'opacity-100' : 'opacity-0'} />
           </button>
        </aside>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {activeSection === 'pages' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-black text-slate-900">Custom Dashboard Pages</h2>
                   <button onClick={handleCreatePage} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-600 hover:shadow-md transition-all">
                      <Plus size={16} /> New Page
                   </button>
                </div>
                <div className="grid gap-4">
                   {customPages.map(page => (
                      <div key={page.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Layout size={24}/></div>
                            <div>
                               <h4 className="font-black text-slate-900">{page.name}</h4>
                               <p className="text-xs text-slate-400 uppercase font-black tracking-widest mt-0.5">{page.widgets.length} Components • {page.visibility}</p>
                            </div>
                         </div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => {setEditingItem(page); setIsEditorOpen(true)}} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 size={18}/></button>
                            <button onClick={() => setCustomPages(customPages.filter(p => p.id !== page.id))} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                         </div>
                      </div>
                   ))}
                   {customPages.length === 0 && (
                     <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/50">
                        <Layout className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No custom pages configured</p>
                     </div>
                   )}
                </div>
             </div>
           )}

           {activeSection === 'database' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-black text-slate-900">Virtual Data Tables</h2>
                   <button onClick={handleCreateTable} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-600 hover:shadow-md transition-all">
                      <Plus size={16} /> Define Table
                   </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                   {virtualTables.map(table => (
                      <div key={table.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group">
                         <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                  <Database size={20} />
                               </div>
                               <div>
                                  <h4 className="font-black text-lg">{table.name}</h4>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{table.description || 'No description'}</p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => handleAddFieldToTable(table.id)}
                                 className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                               >
                                  <Plus size={14}/> Add Column
                               </button>
                               <button onClick={() => {setEditingItem(table); setIsEditorOpen(true)}} className="p-2 text-slate-500 hover:text-white transition-colors"><Edit3 size={18}/></button>
                            </div>
                         </div>
                         <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                               {table.fields.map(field => (
                                 <div key={field.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1 relative group/field">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.type}</span>
                                    <span className="font-bold text-slate-800 text-sm">{field.label}</span>
                                    <button className="absolute top-2 right-2 opacity-0 group-hover/field:opacity-100 text-slate-300 hover:text-red-500 transition-all"><X size={12}/></button>
                                 </div>
                               ))}
                               <button 
                                  onClick={() => handleAddFieldToTable(table.id)}
                                  className="p-3 border-2 border-dashed border-slate-100 rounded-xl text-slate-300 hover:text-indigo-500 hover:border-indigo-200 transition-all flex items-center justify-center"
                               >
                                  <Plus size={20}/>
                                </button>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {activeSection === 'forms' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-black text-slate-900">Digital Data Forms</h2>
                   <button onClick={handleCreateForm} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-600 hover:shadow-md transition-all">
                      <Plus size={16} /> New Form Builder
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {dynamicForms.map(form => (
                      <div key={form.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                         <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                               <FilePlus size={24} />
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${form.publishStatus === 'PUBLISHED' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{form.publishStatus}</span>
                         </div>
                         <h4 className="font-black text-slate-900 text-lg leading-tight">{form.name}</h4>
                         <p className="text-sm text-slate-500 mt-1 line-clamp-2 flex-1">{form.description || 'Custom organizational data capture form.'}</p>
                         
                         <div className="mt-6 flex items-center gap-3">
                            <div className="flex -space-x-2">
                               {form.fields.slice(0, 4).map((_, i) => (
                                 <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                                    <Type size={10} className="text-slate-400" />
                                 </div>
                               ))}
                               {form.fields.length > 4 && (
                                 <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-indigo-600">+{form.fields.length - 4}</div>
                               )}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{form.fields.length} Fields Defined</span>
                         </div>

                         <div className="mt-6 flex gap-2">
                            <button onClick={() => {setEditingItem(form); setIsEditorOpen(true)}} className="flex-1 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.1em] rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100">Configure Logic</button>
                            <button onClick={() => setDynamicForms(dynamicForms.filter(f => f.id !== form.id))} className="p-3 text-slate-300 hover:text-red-500 transition-colors border border-slate-100 rounded-xl"><Trash2 size={18}/></button>
                         </div>
                      </div>
                   ))}
                   {dynamicForms.length === 0 && (
                      <div className="col-span-2 py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <FilePlus className="text-slate-300" size={32} />
                         </div>
                         <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">No forms deployed</h3>
                         <p className="text-sm text-slate-400 mt-1">Start collecting data by defining your first form structure.</p>
                      </div>
                   )}
                </div>
             </div>
           )}

           {activeSection === 'workflows' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-black text-slate-900">Automation Workflows</h2>
                   <button onClick={handleCreateWorkflow} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-600 hover:shadow-md transition-all">
                      <Plus size={16} /> New Workflow
                   </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                   {workflows.map(wf => (
                     <div key={wf.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                              <Zap size={24} />
                           </div>
                           <div>
                              <h4 className="font-black text-slate-900">{wf.name || 'Untitled Workflow'}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="text-[9px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500 tracking-widest">{wf.trigger}</span>
                                 <ArrowRight size={10} className="text-slate-300" />
                                 <span className="text-[9px] font-black uppercase bg-indigo-50 px-2 py-0.5 rounded text-indigo-600 tracking-widest">{wf.action}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => {setEditingItem(wf); setIsEditorOpen(true)}} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 size={18}/></button>
                           <button onClick={() => setWorkflows(workflows.filter(w => w.id !== wf.id))} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                        </div>
                     </div>
                   ))}
                   {workflows.length === 0 && (
                     <div className="bg-indigo-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                           <div className="bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Advanced Logic Engine</div>
                           <h3 className="text-4xl font-black max-w-md leading-tight">Automate Approval Workflows.</h3>
                           <p className="text-indigo-200 max-w-sm">Trigger email notifications or update records automatically based on form submissions.</p>
                           <button onClick={handleCreateWorkflow} className="bg-white text-indigo-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl">
                              Create First Automation
                           </button>
                        </div>
                        <Zap className="absolute top-0 right-0 p-12 opacity-5" size={320} />
                     </div>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Builder Editor Overlay */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[100] flex">
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsEditorOpen(false)}></div>
           <div className="relative w-full max-w-6xl bg-white shadow-2xl ml-auto h-full flex flex-col animate-in slide-in-from-right duration-500">
              {/* Editor Header */}
              <div className="bg-slate-900 text-white px-8 py-6 flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                       {activeSection === 'pages' ? <Layout className="text-indigo-400" /> : 
                        activeSection === 'forms' ? <FilePlus className="text-indigo-400" /> :
                        activeSection === 'workflows' ? <Zap className="text-amber-400" /> :
                        <Database className="text-indigo-400" />}
                       {editingItem?.id ? `Modify ${activeSection.slice(0,-1)}` : `New ${activeSection.slice(0,-1)} Builder`}
                    </h3>
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => setIsEditorOpen(false)} className="px-5 py-2 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest">Discard</button>
                    <button 
                      onClick={() => {
                        if(activeSection === 'pages') handleSavePage(editingItem);
                        else if(activeSection === 'forms') handleSaveForm(editingItem);
                        else if(activeSection === 'workflows') handleSaveWorkflow(editingItem);
                        else handleSaveTable(editingItem);
                      }}
                      className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg"
                    >
                       Deploy Component
                    </button>
                 </div>
              </div>

              {/* Editor Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 p-12">
                  <div className="max-w-4xl mx-auto space-y-8 pb-20">
                     
                     {/* Identity Section */}
                     <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                        <div className="space-y-4">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Component Identity</label>
                           <input 
                              className="w-full text-4xl font-black text-slate-900 bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-200" 
                              placeholder={`${activeSection.slice(0,-1).charAt(0).toUpperCase() + activeSection.slice(1,-1)} Title...`}
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                           />
                           <input 
                              className="w-full text-slate-500 font-medium bg-transparent border-none outline-none focus:ring-0" 
                              placeholder="Describe the purpose of this component for your organization..."
                              value={editingItem.description || ''}
                              onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                           />
                        </div>

                        {activeSection === 'forms' && (
                           <div className="pt-6 border-t border-slate-100">
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-3">Database Target</label>
                              <div className="flex items-center gap-4">
                                 <select 
                                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editingItem.targetTableId || ''}
                                    onChange={(e) => setEditingItem({...editingItem, targetTableId: e.target.value})}
                                 >
                                    <option value="">-- Select Virtual Table --</option>
                                    {virtualTables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                 </select>
                                 <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button 
                                      onClick={() => setEditingItem({...editingItem, publishStatus: 'DRAFT'})}
                                      className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${editingItem.publishStatus === 'DRAFT' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                    >Draft</button>
                                    <button 
                                      onClick={() => setEditingItem({...editingItem, publishStatus: 'PUBLISHED'})}
                                      className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${editingItem.publishStatus === 'PUBLISHED' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                    >Live</button>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Form Builder Specific Section */}
                     {activeSection === 'forms' && (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center px-2">
                              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                 <List size={20} className="text-indigo-600" /> 
                                 Interactive Field Designer
                              </h3>
                              <button 
                                 onClick={addFormField}
                                 className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                              >
                                 <Plus size={16}/> Add New Input
                              </button>
                           </div>

                           <div className="space-y-4">
                              {editingItem.fields.map((field: FormFieldDefinition, idx: number) => (
                                 <div key={field.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 group/field hover:border-indigo-300 transition-all relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover/field:opacity-100 transition-opacity"></div>
                                    
                                    <div className="flex flex-col md:flex-row gap-8">
                                       <div className="flex flex-col gap-2 shrink-0 md:border-r md:border-slate-100 md:pr-8">
                                          <div className="flex items-center gap-2 mb-4">
                                             <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">{idx + 1}</div>
                                             <div className="flex items-center bg-slate-50 p-1 rounded-lg">
                                                <button onClick={() => moveFormField(idx, 'up')} className="p-1 text-slate-400 hover:text-indigo-600"><ChevronUp size={14}/></button>
                                                <button onClick={() => moveFormField(idx, 'down')} className="p-1 text-slate-400 hover:text-indigo-600"><ChevronDown size={14}/></button>
                                             </div>
                                          </div>
                                          <select 
                                             className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500"
                                             value={field.type}
                                             onChange={(e) => updateFormField(idx, { type: e.target.value as any })}
                                          >
                                             <option value="text">TEXT STRING</option>
                                             <option value="number">NUMERIC DATA</option>
                                             <option value="date">DATE PICKER</option>
                                             <option value="dropdown">DROPDOWN LIST</option>
                                             <option value="checkbox">CHECKBOX (YES/NO)</option>
                                             <option value="file">FILE UPLOAD</option>
                                          </select>
                                          <label className="flex items-center gap-2 mt-4 cursor-pointer">
                                             <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" 
                                                checked={field.required}
                                                onChange={(e) => updateFormField(idx, { required: e.target.checked })}
                                             />
                                             <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Required</span>
                                          </label>
                                       </div>

                                       <div className="flex-1 space-y-6">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                             <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Field Label</label>
                                                <input 
                                                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                                   value={field.label}
                                                   onChange={(e) => updateFormField(idx, { label: e.target.value })}
                                                />
                                             </div>
                                             <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Instructional Placeholder</label>
                                                <input 
                                                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                                   value={field.placeholder}
                                                   onChange={(e) => updateFormField(idx, { placeholder: e.target.value })}
                                                />
                                             </div>
                                          </div>

                                          {field.type === 'dropdown' && (
                                             <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Options (Comma Separated)</label>
                                                <input 
                                                   className="w-full p-3 bg-white border border-indigo-200 rounded-xl font-medium text-indigo-700 outline-none"
                                                   placeholder="Choice 1, Choice 2, Choice 3"
                                                   value={field.options?.join(', ')}
                                                   onChange={(e) => updateFormField(idx, { options: e.target.value.split(',').map(s => s.trim()) })}
                                                />
                                             </div>
                                          )}

                                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                             <div className="flex items-center gap-4">
                                                <div className="space-y-1">
                                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Table Mapping</label>
                                                   <select 
                                                      className="p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                                                      value={field.mapping || ''}
                                                      onChange={(e) => updateFormField(idx, { mapping: e.target.value })}
                                                   >
                                                      <option value="">-- No Mapping --</option>
                                                      {editingItem.targetTableId && virtualTables.find(t => t.id === editingItem.targetTableId)?.fields.map(f => (
                                                         <option key={f.id} value={f.name}>{f.label} ({f.name})</option>
                                                      ))}
                                                   </select>
                                                </div>
                                             </div>
                                             <button 
                                                onClick={() => removeFormField(idx)}
                                                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-widest"
                                             >
                                                <Trash size={14}/> Delete Field
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              ))}

                              {editingItem.fields.length === 0 && (
                                 <div className="py-24 text-center border-4 border-dashed border-slate-200 rounded-[3rem] bg-white flex flex-col items-center">
                                    <div className="w-20 h-20 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mb-6">
                                       <Plus size={48} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Canvas is empty</h3>
                                    <button onClick={addFormField} className="mt-4 text-indigo-600 font-black text-sm uppercase tracking-widest hover:underline">Insert Your First Data Point</button>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Workflow Specific Editor */}
                     {activeSection === 'workflows' && (
                        <div className="space-y-10 py-10 border-t border-slate-200">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-600 tracking-widest">
                                    <Play size={12}/> Trigger Condition
                                 </div>
                                 <div className="space-y-4">
                                    <select 
                                       className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                       value={editingItem.trigger}
                                       onChange={(e) => setEditingItem({...editingItem, trigger: e.target.value})}
                                    >
                                       <option value="ON_SUBMIT">When a Form is Submitted</option>
                                       <option value="ON_CREATE">When a Record is Created</option>
                                       <option value="ON_STATUS_CHANGE">When a Status Changes</option>
                                    </select>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Source Component</label>
                                    <select 
                                       className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                       value={editingItem.triggerSourceId}
                                       onChange={(e) => setEditingItem({...editingItem, triggerSourceId: e.target.value})}
                                    >
                                       <option value="">-- Select Source --</option>
                                       <optgroup label="Forms">
                                          {dynamicForms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                       </optgroup>
                                       <optgroup label="Virtual Tables">
                                          {virtualTables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                       </optgroup>
                                    </select>
                                 </div>
                              </div>

                              <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                                    <RefreshCw size={12}/> Resulting Action
                                 </div>
                                 <div className="space-y-4">
                                    <select 
                                       className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                       value={editingItem.action}
                                       onChange={(e) => setEditingItem({...editingItem, action: e.target.value})}
                                    >
                                       <option value="NOTIFY">In-App Notification</option>
                                       <option value="EMAIL">Send External Email</option>
                                       <option value="UPDATE_RECORD">Update Database Record</option>
                                       <option value="APPROVAL">Start Approval Flow</option>
                                    </select>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Action Configuration</label>
                                       <input 
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" 
                                          placeholder="Recipient Email / Role" 
                                          value={editingItem.config.recipient}
                                          onChange={(e) => setEditingItem({...editingItem, config: {...editingItem.config, recipient: e.target.value}})}
                                       />
                                       <textarea 
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium h-24" 
                                          placeholder="Message body content..." 
                                          value={editingItem.config.message}
                                          onChange={(e) => setEditingItem({...editingItem, config: {...editingItem.config, message: e.target.value}})}
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex gap-4">
                              <AlertTriangle className="text-indigo-600 shrink-0" />
                              <div className="text-xs text-indigo-700 font-medium leading-relaxed">
                                 Automations are executed server-side. Ensure that the source data component matches the expected schema for the resulting action.
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Page Builder Logic */}
                     {activeSection === 'pages' && (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center mb-4">
                              <h4 className="text-lg font-bold text-slate-900">Layout Components</h4>
                              <button onClick={() => setEditingItem({...editingItem, widgets: [...editingItem.widgets, { id: 'w-'+Date.now(), title: 'New Widget', dataSource: 'PROJECTS', widgetType: 'SUMMARY_STATS' }]})} className="bg-white border border-slate-200 p-2 rounded-xl text-indigo-600 hover:bg-indigo-50"><Plus size={20}/></button>
                           </div>
                           {editingItem.widgets.map((w: PageWidget, i: number) => (
                              <div key={w.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
                                 <GripVertical className="text-slate-200" />
                                 <div className="flex-1 grid grid-cols-2 gap-4">
                                    <input className="font-bold border-none bg-slate-50 rounded-lg p-2" value={w.title} onChange={(e) => {
                                       const copy = [...editingItem.widgets];
                                       copy[i].title = e.target.value;
                                       setEditingItem({...editingItem, widgets: copy});
                                    }} />
                                    <select className="text-xs font-bold border-none bg-slate-50 rounded-lg p-2" value={w.widgetType} onChange={(e) => {
                                       const copy = [...editingItem.widgets];
                                       copy[i].widgetType = e.target.value as any;
                                       setEditingItem({...editingItem, widgets: copy});
                                    }}>
                                       <option value="SUMMARY_STATS">Stats Summary</option>
                                       <option value="TABLE">Data Table</option>
                                       <option value="CHART">Visual Chart</option>
                                       <option value="CARD_GRID">Card Grid</option>
                                    </select>
                                 </div>
                                 <button onClick={() => {
                                    const copy = [...editingItem.widgets];
                                    copy.splice(i, 1);
                                    setEditingItem({...editingItem, widgets: copy});
                                 }} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                              </div>
                           ))}
                        </div>
                     )}

                     {/* Database Schema Editor (Placeholder) */}
                     {activeSection === 'database' && (
                        <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50 text-slate-400 font-bold uppercase text-xs tracking-widest">
                           Design Mode active for Database Schema. Use the builder tools to configure columns and validation rules.
                        </div>
                     )}

                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
