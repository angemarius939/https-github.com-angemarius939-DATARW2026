
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import SurveyBuilder from './components/SurveyBuilder';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectsView from './components/ProjectsView';
import BeneficiaryView from './components/BeneficiaryView';
import DocumentsView from './components/DocumentsView';
import ReportsView from './components/ReportsView';
import TeamView from './components/TeamView';
import SettingsView from './components/SettingsView';
import AdminPanel from './components/AdminPanel';
import CustomPageView from './components/CustomPageView';
import RegisterView from './components/RegisterView';
import { ViewState, CustomPage, Project, Survey, Beneficiary, PageConfigs, ViewConfig, VirtualTable, WorkflowAction, FormDefinition } from './types';
import { 
  LayoutDashboard, FileText, FolderKanban, Settings, LogOut, 
  Bell, Users, PieChart, ShieldAlert, UserPlus, 
  Layout, CheckCircle2, ChevronDown, Layers, Wrench,
  FolderOpen, BarChart3, Database, MessageSquare,
  Edit3, Plus, Table as TableIcon, FilePlus
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeCustomPage, setActiveCustomPage] = useState<CustomPage | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminActionsOpen, setIsAdminActionsOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Multi-tenant & Admin State
  const [organizationName, setOrganizationName] = useState<string>('SaveRwanda');
  const [userName, setUserName] = useState<string>('Admin User');
  const [virtualTables, setVirtualTables] = useState<VirtualTable[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowAction[]>([]);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [dynamicForms, setDynamicForms] = useState<FormDefinition[]>([]);

  const [pageConfigs, setPageConfigs] = useState<PageConfigs>({});
  const [shouldTriggerProjectCreate, setShouldTriggerProjectCreate] = useState(false);

  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: 'Clean Water Initiative', location: 'Northern Prov.', status: 'On Track', progress: 75, budget: 45000000, spent: 32000000, beneficiaries: 1200, startDate: '2024-01-10', manager: 'Jean Bosco', beneficiaryList: [], activityLog: [], activities: [] },
    { id: '2', name: 'Rural Education Support', location: 'Eastern Prov.', status: 'Delayed', progress: 45, budget: 32000000, spent: 12000000, beneficiaries: 850, startDate: '2024-03-15', manager: 'Marie Claire', beneficiaryList: [], activityLog: [], activities: [] }
  ]);

  const [surveys, setSurveys] = useState<Survey[]>([
    { id: 's1', title: 'Agricultural Impact Assessment', description: 'Q1 2025 Survey', status: 'Active', responseCount: 1240, createdAt: '2025-01-15', linkedProjectId: '3' }
  ]);

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: 'b1', firstName: 'Ange', lastName: 'Mutoni', gender: 'Female', age: 28, location: 'Musanze', status: 'Active', enrollmentDate: '2024-01-12', educationLevel: 'Secondary', householdSize: 4, programs: ['Clean Water Initiative'], cases: [] }
  ]);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRegisterSuccess = (org: string, user: string) => {
    setOrganizationName(org);
    setUserName(user);
    setView(ViewState.DASHBOARD_HOME);
    notify(`Organization '${org}' established successfully.`);
  };

  const handleLogout = () => {
    setView(ViewState.LANDING);
    setOrganizationName('SaveRwanda');
    setUserName('Admin User');
    setActiveProjectId(null);
  };

  const handleCustomPageClick = (page: CustomPage) => {
    setActiveCustomPage(page);
    setView(ViewState.CUSTOM_PAGE);
  };

  const getPageConfig = (viewName: string): ViewConfig => {
    const contextId = activeProjectId || 'global';
    return pageConfigs[contextId]?.[viewName] || {
      title: viewName.charAt(0) + viewName.slice(1).toLowerCase(),
      subtitle: activeProjectId ? `Context: ${projects.find(p => p.id === activeProjectId)?.name}` : 'Organization wide data',
      hiddenElements: []
    };
  };

  const openAdminBuilder = (section: 'pages' | 'database' | 'forms' | 'workflows') => {
    setView(ViewState.ADMIN_PANEL);
    setIsAdminActionsOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {view !== ViewState.LANDING && view !== ViewState.REGISTER && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform md:relative md:translate-x-0 flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
             <div className="bg-indigo-600 text-white p-1 rounded-md font-bold mr-2 text-sm">D</div>
             <span className="font-bold text-lg">DataRW</span>
          </div>

          <div className="px-4 py-6 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
             <div className="pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">Main Navigation</div>
             <button onClick={() => setView(ViewState.DASHBOARD_HOME)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.DASHBOARD_HOME ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <LayoutDashboard size={18} /> Dashboard
             </button>
             <button onClick={() => { setView(ViewState.PROJECTS); setActiveProjectId(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.PROJECTS ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <FolderKanban size={18} /> Projects
             </button>
             <button onClick={() => setView(ViewState.BENEFICIARIES)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.BENEFICIARIES ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <Users size={18} /> Beneficiaries
             </button>
             <button onClick={() => setView(ViewState.SURVEYS)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.SURVEYS ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <MessageSquare size={18} /> Surveys (AI)
             </button>

             <div className="pt-4 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">Organization Assets</div>
             <button onClick={() => setView(ViewState.DOCUMENTS)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.DOCUMENTS ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <FolderOpen size={18} /> Documents
             </button>
             <button onClick={() => setView(ViewState.REPORTS)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.REPORTS ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <BarChart3 size={18} /> Reports Hub
             </button>
             
             {customPages.length > 0 && (
               <>
                 <div className="pt-4 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">Custom Modules</div>
                 {customPages.map(page => (
                    <button key={page.id} onClick={() => handleCustomPageClick(page)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.CUSTOM_PAGE && activeCustomPage?.id === page.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                      <Layout size={18} /> {page.name}
                    </button>
                 ))}
               </>
             )}

             <div className="pt-6 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">System Admin</div>
             <button onClick={() => setView(ViewState.ADMIN_PANEL)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${view === ViewState.ADMIN_PANEL ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-white hover:bg-indigo-900/50'}`}>
               <Wrench size={18} /> Admin Panel
             </button>
             <button onClick={() => setView(ViewState.SETTINGS)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.SETTINGS ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <Settings size={18} /> Settings
             </button>
          </div>
          
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-4">
               <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold uppercase ring-2 ring-indigo-500/20">{organizationName.substring(0, 2)}</div>
               <div className="text-sm font-medium truncate text-slate-200">{organizationName}</div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors"><LogOut size={14} /> Sign Out</button>
          </div>
        </aside>
      )}
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {view !== ViewState.LANDING && view !== ViewState.REGISTER && (
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40">
             <div className="flex items-center gap-4">
                <button className="md:hidden text-slate-500" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Layers size={20}/></button>
                <div className="relative group">
                  <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${activeProjectId ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                     <FolderKanban size={16} />
                     <span className="text-xs font-bold truncate max-w-[150px]">
                        {activeProjectId ? projects.find(p => p.id === activeProjectId)?.name : 'Portfolio View'}
                     </span>
                     <ChevronDown size={14} />
                  </button>
                </div>
             </div>
             <div className="flex items-center gap-4 relative">
                <div className="relative">
                  <button 
                    onClick={() => setIsAdminActionsOpen(!isAdminActionsOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md group"
                  >
                     <Edit3 size={14} className="group-hover:rotate-12 transition-transform" />
                     Design Mode
                     <ChevronDown size={12} className={`transition-transform ${isAdminActionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isAdminActionsOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-[60] animate-fade-in">
                       <div className="px-4 py-2 border-b border-slate-100 mb-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Design</p>
                       </div>
                       <button onClick={() => openAdminBuilder('forms')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 flex items-center gap-3 transition-colors">
                          <FilePlus size={16} className="text-indigo-600" /> Create New Form
                       </button>
                       <button onClick={() => openAdminBuilder('database')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 flex items-center gap-3 transition-colors">
                          <TableIcon size={16} className="text-indigo-600" /> Add Database Column
                       </button>
                       <button onClick={() => openAdminBuilder('pages')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 flex items-center gap-3 transition-colors">
                          <Layout size={16} className="text-indigo-600" /> Customize Page Layout
                       </button>
                       <div className="mt-1 pt-1 border-t border-slate-100 px-4 py-2">
                          <button onClick={() => setView(ViewState.ADMIN_PANEL)} className="text-indigo-600 text-[10px] font-black uppercase hover:underline">Full Admin Center</button>
                       </div>
                    </div>
                  )}
                </div>

                <div className="h-6 w-px bg-slate-200"></div>
                <button onClick={() => notify("New organizational update available")} className="p-2 text-slate-400 hover:text-indigo-600 relative">
                   <Bell size={20} />
                   <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="h-6 w-px bg-slate-200"></div>
                <span className="hidden md:block text-[10px] font-black uppercase text-slate-400 tracking-widest">{userName}</span>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-600 border border-indigo-200">{userName.charAt(0)}</div>
             </div>
          </header>
        )}

        {notification && (
          <div className="fixed top-20 right-6 z-[100] animate-bounce-in">
             <div className={`px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${notification.type === 'error' ? 'bg-red-600 text-white border-red-500' : 'bg-slate-900 text-white border-white/10'}`}>
                <CheckCircle2 size={18} className={notification.type === 'error' ? 'text-white' : 'text-green-400'} />
                <span className="text-sm font-bold">{notification.message}</span>
             </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {view === ViewState.LANDING && <LandingPage onLogin={() => setView(ViewState.DASHBOARD_HOME)} onRegister={() => setView(ViewState.REGISTER)} />}
           {view === ViewState.REGISTER && <RegisterView onRegisterSuccess={handleRegisterSuccess} onBack={() => setView(ViewState.LANDING)} />}
           {view === ViewState.DASHBOARD_HOME && (
             <ProjectDashboard 
               organizationName={organizationName} 
               projects={projects} 
               onViewProject={(id) => {setActiveProjectId(id); setView(ViewState.PROJECTS)}} 
               onInitializeProject={() => {
                 setShouldTriggerProjectCreate(true);
                 setView(ViewState.PROJECTS);
               }}
               onNotify={notify} 
             />
           )}
           {view === ViewState.PROJECTS && (
             <ProjectsView 
                initialProjects={projects} 
                setGlobalProjects={setProjects} 
                onNotify={notify} 
                deepLinkProjectId={activeProjectId} 
                onProjectSelect={(id) => setActiveProjectId(id)}
                clearDeepLink={() => setActiveProjectId(null)} 
                triggerCreate={shouldTriggerProjectCreate}
                onTriggerCreateHandled={() => setShouldTriggerProjectCreate(false)}
              />
           )}
           {view === ViewState.SURVEYS && <SurveyBuilder initialSurveys={surveys} setGlobalSurveys={setSurveys} onNotify={notify} activeProjectId={activeProjectId} projects={projects} />}
           {view === ViewState.ADMIN_PANEL && (
             <AdminPanel 
               projects={projects}
               customPages={customPages} 
               setCustomPages={setCustomPages} 
               virtualTables={virtualTables} 
               setVirtualTables={setVirtualTables}
               workflows={workflows}
               setWorkflows={setWorkflows}
               dynamicForms={dynamicForms}
               setDynamicForms={setDynamicForms}
               onNotify={notify} 
             />
           )}
           {view === ViewState.BENEFICIARIES && (
             <BeneficiaryView 
                activeProjectId={activeProjectId} 
                projects={projects}
                initialBeneficiaries={beneficiaries} 
                setGlobalBeneficiaries={setBeneficiaries} 
                onNotify={notify} 
                config={getPageConfig('BENEFICIARIES')} 
                onSaveConfig={() => {}} 
             />
           )}
           {view === ViewState.DOCUMENTS && <DocumentsView onNotify={notify} />}
           {view === ViewState.REPORTS && <ReportsView activeProjectId={activeProjectId} projects={projects} onNotify={notify} config={getPageConfig('REPORTS')} onSaveConfig={() => {}} />}
           {view === ViewState.TEAM && <TeamView onNotify={notify} />}
           {view === ViewState.SETTINGS && <SettingsView customPages={customPages} onSavePage={(p) => setCustomPages([...customPages, p])} onDeletePage={(id) => setCustomPages(customPages.filter(cp => cp.id !== id))} />}
           {view === ViewState.CUSTOM_PAGE && activeCustomPage && <CustomPageView page={activeCustomPage} />}
        </div>
      </main>
    </div>
  );
};

export default App;
