
import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500 bg-red-50 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <pre className="whitespace-pre-wrap">{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

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
import LoginView from './components/LoginView';
import DataAnalysisView from './components/DataAnalysisView';
import DatasetsView from './components/DatasetsView';
import FieldAppView from './components/FieldAppView';
import AIGeneratorView from './components/AIGeneratorView';
import { ViewState, CustomPage, Project, Survey, Beneficiary, PageConfigs, ViewConfig, VirtualTable, WorkflowAction, FormDefinition, FormSubmission, AppUser, PageWidget, RoleDefinition, ProjectTemplate } from './types';
import { 
  LayoutDashboard, FileText, FolderKanban, Settings, LogOut, 
  Bell, Users, PieChart, ShieldAlert, UserPlus, 
  Layout, CheckCircle2, ChevronDown, Layers, Wrench,
  FolderOpen, BarChart3, Database, MessageSquare,
  Edit3, Plus, Table as TableIcon, FilePlus, LineChart, Smartphone, BrainCircuit, Bot,
  Moon, Sun
} from 'lucide-react';
import * as Icons from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(() => {
    return (localStorage.getItem('app_view') as ViewState) || ViewState.LANDING;
  });
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeCustomPage, setActiveCustomPage] = useState<CustomPage | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminActionsOpen, setIsAdminActionsOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Multi-tenant & Admin State
  const [organizationName, setOrganizationName] = useState<string>(() => {
    return localStorage.getItem('app_org_name') || 'My Organization';
  });
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('app_user_name') || 'Admin User';
  });

  useEffect(() => {
    localStorage.setItem('app_view', view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('app_org_name', organizationName);
  }, [organizationName]);

  useEffect(() => {
    localStorage.setItem('app_user_name', userName);
  }, [userName]);

  useEffect(() => {
    if (view !== ViewState.LANDING && view !== ViewState.REGISTER && view !== ViewState.LOGIN) {
      const subdomain = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'workspace';
      // Simulate subdomain/workspace branding in the URL path
      window.history.replaceState(null, '', `/${subdomain}`);
    } else {
      window.history.replaceState(null, '', `/`);
    }
  }, [view, organizationName]);

  const [virtualTables, setVirtualTables] = useState<VirtualTable[]>([
    { 
      id: 'beneficiaries', 
      name: 'Beneficiaries', 
      description: 'Core beneficiary registry', 
      fields: [
        { id: 'f1', name: 'firstName', label: 'First Name', type: 'TEXT', validation: { required: true } },
        { id: 'f2', name: 'lastName', label: 'Last Name', type: 'TEXT', validation: { required: true } },
        { id: 'f3', name: 'age', label: 'Age', type: 'NUMBER', validation: { required: true } },
        { id: 'f4', name: 'gender', label: 'Gender', type: 'SELECT', options: ['Male', 'Female', 'Other'], validation: { required: true } },
        { id: 'f5', name: 'location', label: 'Location', type: 'TEXT', validation: { required: true } },
        { id: 'f6', name: 'status', label: 'Status', type: 'SELECT', options: ['Active', 'Inactive', 'Graduated'], validation: { required: true } },
        { id: 'f7', name: 'enrollmentDate', label: 'Enrollment Date', type: 'DATE', validation: { required: true } },
        { id: 'f8', name: 'educationLevel', label: 'Education Level', type: 'SELECT', options: ['None', 'Primary', 'Secondary', 'Tertiary'], validation: { required: false } },
        { id: 'f9', name: 'householdSize', label: 'Household Size', type: 'NUMBER', validation: { required: false } }
      ], 
      recordsCount: 1200 
    },
    { id: 'projects', name: 'Projects', description: 'Project portfolio', fields: [], recordsCount: 12 },
    { id: 'surveys', name: 'Surveys', description: 'Data collection instruments', fields: [], recordsCount: 45 }
  ]);
  const [workflows, setWorkflows] = useState<WorkflowAction[]>([
    {
      id: 'wf-1',
      name: 'New Project Notification',
      trigger: 'ON_CREATE',
      triggerSourceId: 'system-projects',
      action: 'EMAIL',
      config: {
        recipient: 'Project Manager',
        subject: 'New Project Assigned',
        message: 'A new project has been created and assigned to you. Please review the details in the system.',
      }
    }
  ]);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [dashboardWidgets, setDashboardWidgets] = useState<PageWidget[]>([]);
  const [dynamicForms, setDynamicForms] = useState<FormDefinition[]>([]);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([
    { id: 'r1', name: 'Admin', description: 'System Administrator with full access.', permissions: ['Projects', 'Documents', 'Surveys', 'Reports', 'Beneficiaries', 'Data Analysis', 'Datasets', 'Field App', 'Admin Panel', 'AI Generator'] },
    { id: 'r2', name: 'Project Manager', description: 'Manages projects, documents, and surveys.', permissions: ['Projects', 'Documents', 'Surveys', 'Reports', 'Beneficiaries', 'Data Analysis', 'Datasets', 'AI Generator'] },
    { id: 'r3', name: 'Field Officer', description: 'Field data collection and beneficiary management.', permissions: ['Projects', 'Beneficiaries', 'Field App'] },
    { id: 'r4', name: 'Viewer', description: 'Read-only access to reports and documents.', permissions: ['Projects', 'Reports', 'Documents'] },
  ]);
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([]);
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('app_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }
    return [
      { id: 'u1', name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'ACTIVE', lastLogin: '2025-05-12 14:30', department: 'Operations' },
      { id: 'u2', name: 'Project Manager', email: 'pm@example.com', role: 'Project Manager', status: 'ACTIVE', lastLogin: '2025-05-11 09:15', department: 'Programs' },
      { id: 'u3', name: 'Field Officer', email: 'field@example.com', role: 'Field Officer', status: 'ACTIVE', lastLogin: '2025-05-12 08:45', department: 'Field' },
      { id: 'u4', name: 'Viewer User', email: 'viewer@example.com', role: 'Viewer', status: 'INACTIVE', lastLogin: '2025-04-30 11:20', department: 'M&E' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('app_current_user_id') || 'u1';
  });

  useEffect(() => {
    localStorage.setItem('app_current_user_id', currentUserId);
  }, [currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const hasPermission = (permission: string) => {
    if (currentUser.role === 'Admin') return true;
    
    // If user has specific overrides (permissions array exists), use them
    if (currentUser.permissions) {
       return currentUser.permissions.includes(permission);
    }
    
    // Otherwise fallback to role permissions
    const roleDef = roles.find(r => r.name === currentUser.role);
    return roleDef?.permissions.includes(permission) || false;
  };

  const [pageConfigs, setPageConfigs] = useState<PageConfigs>({});
  const [shouldTriggerProjectCreate, setShouldTriggerProjectCreate] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [globalDocuments, setGlobalDocuments] = useState<any[]>(() => {
    const saved = localStorage.getItem('app_documents');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: 'Water_Project_Proposal_Final.pdf', type: 'PDF', category: 'Proposals', size: '2.4 MB', owner: 'Jean B.', date: '2024-03-10', content: 'Proposal for providing clean water to the Northern Province. Focus on borehole drilling and community training.' },
      { id: 2, name: 'MoU_Ministry_of_Health.pdf', type: 'PDF', category: 'Agreements', size: '1.1 MB', owner: 'Admin', date: '2024-01-05', content: 'Memorandum of Understanding with the Ministry of Health for the Maternal Health Clinic project.' },
      { id: 3, name: 'Beneficiary_Survey_Results.csv', type: 'CSV', category: 'Field Data', size: '15.2 MB', owner: 'Eric M.', date: '2024-04-12', content: 'Survey results showing 85% satisfaction with the new agricultural training programs.' },
      { id: 4, name: 'Annual_Impact_Report_2023.docx', type: 'DOCX', category: 'Reports', size: '4.8 MB', owner: 'Marie C.', date: '2024-01-20', content: 'Annual report detailing the impact of 2023 projects. 15,000 beneficiaries reached across 3 provinces.' },
      { id: 5, name: 'Site_Photos_Musanze.zip', type: 'ZIP', category: 'Media', size: '45.0 MB', owner: 'Jean B.', date: '2024-02-15', content: '' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('app_documents', JSON.stringify(globalDocuments));
  }, [globalDocuments]);

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('app_projects');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { 
        id: '1', name: 'Clean Water Initiative', description: 'Providing clean and safe drinking water to rural communities.', location: 'Northern Prov.', status: 'On Track', progress: 75, budget: 45000000, spent: 32000000, beneficiaries: 1200, startDate: '2024-01-10', endDate: '2025-01-10', manager: 'Jean Bosco', beneficiaryList: [], activityLog: [], activities: [], budgetLines: [], 
        narrative: '<h2>Project Overview</h2><p>The Clean Water Initiative is a comprehensive program designed to address the critical lack of safe drinking water in the Northern Province.</p><h3>Key Objectives</h3><ul><li>Drill 5 new boreholes in Musanze district.</li><li>Provide hygiene and sanitation training to 1,200 community members.</li><li>Establish local water management committees to ensure long-term sustainability.</li></ul><blockquote><p>"Access to clean water is not just a health issue; it is a fundamental human right that empowers communities." - Project Manager</p></blockquote><p>Recent progress has been excellent, with 3 boreholes already operational and training sessions scheduled for the upcoming month.</p>',
        indicators: [
          {
            id: 'ind1',
            code: 'G1',
            name: 'Reduction in waterborne diseases',
            expectedResult: 'Improved health outcomes in target communities',
            level: 'Goal',
            unit: '%',
            frequency: 'Annually',
            baseline: '15',
            overallTarget: '5',
            achieved: '10',
            periodicData: [],
            dataSource: 'District Health Records',
            dataCollectionMethod: 'Health Center Reports',
            responsible: 'M&E Officer',
            timeline: '2024-2026'
          },
          {
            id: 'ind2',
            code: 'O1',
            name: 'Number of functional boreholes',
            expectedResult: 'Increased access to clean water sources',
            level: 'Output',
            unit: 'boreholes',
            frequency: 'Quarterly',
            baseline: '0',
            overallTarget: '5',
            achieved: '3',
            periodicData: [],
            dataSource: 'Project Field Reports',
            dataCollectionMethod: 'Site Visits',
            responsible: 'Project Manager',
            timeline: 'Year 1 (2024)'
          }
        ],
        thematicAreas: ['WASH', 'Health'],
        interventions: [
          { id: 'i1', name: 'Borehole Drilling', type: 'Infrastructure', targetDemographic: 'Rural Communities', startDate: '2024-02-01', endDate: '2024-08-01', status: 'Completed', budgetAllocated: 20000000, beneficiariesReached: 800, description: 'Drilling 5 new boreholes in Musanze district.' },
          { id: 'i2', name: 'Hygiene Training', type: 'Training', targetDemographic: 'Women and Children', startDate: '2024-05-01', endDate: '2024-11-01', status: 'Active', budgetAllocated: 5000000, beneficiariesReached: 400, description: 'Community workshops on safe water storage and sanitation.' }
        ],
        risks: [
          { id: 'r1', description: 'Delays in equipment delivery due to supply chain issues', category: 'Operational', probability: 'Medium', impact: 'High', mitigationStrategy: 'Source from multiple local vendors where possible.', status: 'Mitigated', owner: 'Jean Bosco' }
        ],
        partners: [
          { id: 'p1', name: 'WaterAid Rwanda', role: 'Implementing Partner', contributionAmount: 15000000, contactPerson: 'Alice M.', email: 'alice@wateraid.org' }
        ]
      },
      { 
        id: '2', name: 'Rural Education Support', description: 'Improving access to quality education in remote areas.', location: 'Eastern Prov.', status: 'Delayed', progress: 45, budget: 32000000, spent: 12000000, beneficiaries: 850, startDate: '2024-03-15', endDate: '2025-03-15', manager: 'Marie Claire', beneficiaryList: [], activityLog: [], activities: [], budgetLines: [], indicators: [],
        thematicAreas: ['Education', 'Youth Empowerment'],
        interventions: [
          { id: 'i3', name: 'School Supply Distribution', type: 'Distribution', targetDemographic: 'Primary Students', startDate: '2024-04-01', endDate: '2024-05-01', status: 'Completed', budgetAllocated: 8000000, beneficiariesReached: 850, description: 'Distributing notebooks, pens, and uniforms.' },
          { id: 'i4', name: 'Teacher Training', type: 'Training', targetDemographic: 'Primary Teachers', startDate: '2024-06-01', endDate: '2024-12-01', status: 'Suspended', budgetAllocated: 10000000, beneficiariesReached: 50, description: 'Pedagogical training for rural educators.' }
        ],
        risks: [
          { id: 'r2', description: 'Low teacher turnout for training sessions', category: 'Operational', probability: 'High', impact: 'Medium', mitigationStrategy: 'Provide transport stipends and schedule during school holidays.', status: 'Open', owner: 'Marie Claire' }
        ],
        partners: [
          { id: 'p2', name: 'Ministry of Education', role: 'Government', contactPerson: 'John D.', email: 'john.d@mineduc.gov.rw' }
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('app_projects', JSON.stringify(projects));
  }, [projects]);

  const [surveys, setSurveys] = useState<Survey[]>(() => {
    const saved = localStorage.getItem('app_surveys');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 's1', title: 'Agricultural Impact Assessment', description: 'Q1 2025 Survey', status: 'Active', responseCount: 1240, createdAt: '2025-01-15', linkedProjectId: '3' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('app_surveys', JSON.stringify(surveys));
  }, [surveys]);

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => {
    const saved = localStorage.getItem('app_beneficiaries');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'b1', firstName: 'Ange', lastName: 'Mutoni', gender: 'Female', age: 28, location: 'Musanze', status: 'Active', enrollmentDate: '2024-01-12', educationLevel: 'Secondary', householdSize: 4, programs: ['Clean Water Initiative'], cases: [] }
    ];
  });

  useEffect(() => {
    localStorage.setItem('app_beneficiaries', JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRegisterSuccess = (org: string, userName: string, email: string, withDummyData: boolean) => {
    setOrganizationName(org);
    setUserName(userName);
    
    // Create new user
    const newUser: AppUser = {
      id: `u${users.length + 1}`,
      name: userName,
      email: email,
      role: 'Admin',
      status: 'ACTIVE',
      lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' '),
      department: 'Management',
      organization: org
    };
    
    if (!withDummyData) {
      setProjects([]);
      setBeneficiaries([]);
      setSurveys([]);
      setGlobalDocuments([]);
      setUsers([newUser]);
    } else {
      setUsers([...users, newUser]);
    }

    setCurrentUserId(newUser.id);
    
    setView(ViewState.DASHBOARD_HOME);
    notify(`Organization '${org}' established successfully.`);
  };

  const handleLoginSuccess = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(userId);
      setUserName(user.name);
      if (user.organization) {
        setOrganizationName(user.organization);
      }
      setView(ViewState.DASHBOARD_HOME);
      notify(`Welcome back, ${user.name}.`);
    }
  };

  const handleLogout = () => {
    setView(ViewState.LANDING);
    setOrganizationName('My Organization');
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

  useEffect(() => {
    if (view === ViewState.LANDING || view === ViewState.REGISTER || view === ViewState.LOGIN || view === ViewState.DASHBOARD_HOME) return;
    
    const viewToPermissionMap: Record<string, string> = {
      [ViewState.PROJECTS]: 'Projects',
      [ViewState.BENEFICIARIES]: 'Beneficiaries',
      [ViewState.SURVEYS]: 'Surveys',
      [ViewState.FIELD_APP]: 'Field App',
      [ViewState.DATA_ANALYSIS]: 'Data Analysis',
      [ViewState.AI_GENERATOR]: 'AI Generator',
      [ViewState.DATASETS]: 'Datasets',
      [ViewState.DOCUMENTS]: 'Documents',
      [ViewState.REPORTS]: 'Reports',
      [ViewState.ADMIN_PANEL]: 'Admin Panel',
      [ViewState.SETTINGS]: 'Admin Panel' // Assuming settings is admin only
    };

    const requiredPermission = viewToPermissionMap[view];
    if (requiredPermission && !hasPermission(requiredPermission)) {
      notify(`You do not have permission to access ${requiredPermission}.`, 'error');
      setView(ViewState.DASHBOARD_HOME);
    }
  }, [view, currentUserId, users]);

  const openAdminBuilder = (section: 'pages' | 'database' | 'forms' | 'workflows') => {
    setView(ViewState.ADMIN_PANEL);
    setIsAdminActionsOpen(false);
  };

  return (
    <div className={`flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden dark:bg-slate-900 dark:text-slate-50`}>
      {view !== ViewState.LANDING && view !== ViewState.REGISTER && view !== ViewState.LOGIN && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform md:relative md:translate-x-0 flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
             <div className="bg-indigo-600 text-white p-1 rounded-md font-bold mr-2 text-sm">D</div>
             <div className="flex flex-col">
               <span className="font-bold text-lg leading-tight">DataRW</span>
               <span className="text-[10px] text-indigo-300 font-mono leading-tight truncate max-w-[160px]">
                 {organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'workspace'}.datarw.com
               </span>
             </div>
          </div>

          <div className="px-4 py-6 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
             <div className="pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">Main Navigation</div>
             <button onClick={() => setView(ViewState.DASHBOARD_HOME)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.DASHBOARD_HOME ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
               <LayoutDashboard size={18} /> Dashboard
             </button>
             {hasPermission('Projects') && (
               <button onClick={() => { setView(ViewState.PROJECTS); setActiveProjectId(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.PROJECTS ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                 <FolderKanban size={18} /> Projects
               </button>
             )}
             {hasPermission('Beneficiaries') && (
               <button onClick={() => setView(ViewState.BENEFICIARIES)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.BENEFICIARIES ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                 <Users size={18} /> Beneficiaries
               </button>
             )}
             {hasPermission('Surveys') && (
               <button onClick={() => setView(ViewState.SURVEYS)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.SURVEYS ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                 <MessageSquare size={18} /> Surveys (AI)
               </button>
             )}
             {hasPermission('Field App') && (
               <button onClick={() => setView(ViewState.FIELD_APP)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.FIELD_APP ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                 <Smartphone size={18} /> Field App (Mobile)
               </button>
             )}

             {(hasPermission('Data Analysis') || hasPermission('AI Generator') || hasPermission('Datasets')) && (
               <div className="pt-4 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">Intelligence</div>
             )}
             {hasPermission('Data Analysis') && (
               <button onClick={() => setView(ViewState.DATA_ANALYSIS)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.DATA_ANALYSIS ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                 <BrainCircuit size={18} /> Data Analysis
               </button>
             )}
             {hasPermission('AI Generator') && (
               <button onClick={() => setView(ViewState.AI_GENERATOR)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.AI_GENERATOR ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                 <Bot size={18} /> AI Generator
               </button>
             )}
             {hasPermission('Datasets') && (
               <button onClick={() => setView(ViewState.DATASETS)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.DATASETS ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                 <Database size={18} /> Datasets
               </button>
             )}

             {(hasPermission('Documents') || hasPermission('Reports')) && (
               <div className="pt-4 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">Organization Assets</div>
             )}
             {hasPermission('Documents') && (
               <button onClick={() => setView(ViewState.DOCUMENTS)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.DOCUMENTS ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                 <FolderOpen size={18} /> Documents
               </button>
             )}
             {hasPermission('Reports') && (
               <button onClick={() => setView(ViewState.REPORTS)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.REPORTS ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                 <BarChart3 size={18} /> Reports Hub
               </button>
             )}
             
             {customPages.length > 0 && (
               <>
                 <div className="pt-4 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">Custom Modules</div>
                 {customPages.map(page => {
                    const PageIcon = (Icons as any)[page.icon || 'Layout'] || Layout;
                    return (
                     <button key={page.id} onClick={() => handleCustomPageClick(page)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.CUSTOM_PAGE && activeCustomPage?.id === page.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                       <PageIcon size={18} /> {page.name}
                     </button>
                  )})}
               </>
             )}

             {(hasPermission('Admin Panel') || currentUser.role === 'Admin') && (
               <>
                 <div className="pt-6 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">System Admin</div>
                 <button onClick={() => setView(ViewState.ADMIN_PANEL)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${view === ViewState.ADMIN_PANEL ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-white hover:bg-indigo-900/50'}`}>
                   <Wrench size={18} /> Admin Panel
                 </button>
                 <button onClick={() => setView(ViewState.SETTINGS)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.SETTINGS ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                   <Settings size={18} /> Settings
                 </button>
               </>
             )}
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
        {view !== ViewState.LANDING && view !== ViewState.REGISTER && view !== ViewState.LOGIN && (
          <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0 z-40">
             <div className="flex items-center gap-4">
                <button className="md:hidden text-slate-500 dark:text-slate-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Layers size={20}/></button>
                <div className="relative group">
                  <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${activeProjectId ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                     <FolderKanban size={16} />
                     <span className="text-xs font-bold truncate max-w-[150px]">
                        {activeProjectId ? projects.find(p => p.id === activeProjectId)?.name : 'Portfolio View'}
                     </span>
                     <ChevronDown size={14} />
                  </button>
                </div>
             </div>
             <div className="flex items-center gap-4 relative">
                {hasPermission('Admin Panel') && (
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
                )}

                {hasPermission('Admin Panel') && <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>}
                
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 relative transition-colors"
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button onClick={() => notify("New organizational update available")} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 relative">
                   <Bell size={20} />
                   <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                </button>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-end">
                      <span className="hidden md:block text-[10px] font-black uppercase text-slate-900 tracking-widest">{currentUser.name}</span>
                      <span className="hidden md:block text-[9px] font-bold text-slate-500 uppercase">{currentUser.role}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-600 border border-indigo-200">{currentUser.name.charAt(0)}</div>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-[60] hidden group-hover:block">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Switch User (Demo)</p>
                    </div>
                    {users.map(u => (
                      <button 
                        key={u.id}
                        onClick={() => {
                          setCurrentUserId(u.id);
                          setUserName(u.name);
                          notify(`Switched to ${u.name} (${u.role})`);
                        }} 
                        className={`w-full text-left px-4 py-2 text-xs font-medium flex flex-col transition-colors ${currentUserId === u.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        <span className="font-bold">{u.name}</span>
                        <span className="text-[10px] text-slate-500">{u.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
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
           {view === ViewState.LANDING && <LandingPage onLogin={() => setView(ViewState.LOGIN)} onRegister={() => setView(ViewState.REGISTER)} />}
           {view === ViewState.LOGIN && <LoginView users={users} onLoginSuccess={handleLoginSuccess} onBack={() => setView(ViewState.LANDING)} onRegister={() => setView(ViewState.REGISTER)} />}
           {view === ViewState.REGISTER && <RegisterView onRegisterSuccess={handleRegisterSuccess} onBack={() => setView(ViewState.LANDING)} />}
           {view === ViewState.DASHBOARD_HOME && (
             <ProjectDashboard 
               organizationName={organizationName} 
               projects={projects} 
               dashboardWidgets={dashboardWidgets}
               setDashboardWidgets={setDashboardWidgets}
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
                virtualTables={virtualTables}
                onNavigateToAnalysis={(id) => {
                  setActiveProjectId(id);
                  setView(ViewState.DATA_ANALYSIS);
                }}
              />
           )}
           {view === ViewState.SURVEYS && <SurveyBuilder initialSurveys={surveys} setGlobalSurveys={setSurveys} onNotify={notify} activeProjectId={activeProjectId} projects={projects} virtualTables={virtualTables} />}
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
               users={users}
               setUsers={setUsers}
               roles={roles}
               setRoles={setRoles}
               projectTemplates={projectTemplates}
               setProjectTemplates={setProjectTemplates}
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
                onSaveConfig={(config) => setPageConfigs(prev => ({ ...prev, [activeProjectId || 'global']: { ...prev[activeProjectId || 'global'], BENEFICIARIES: { ...prev[activeProjectId || 'global']?.BENEFICIARIES, ...config } as ViewConfig } }))} 
                virtualTables={virtualTables}
             />
           )}
           {view === ViewState.DOCUMENTS && <DocumentsView onNotify={notify} docs={globalDocuments} setDocs={setGlobalDocuments} />}
           {view === ViewState.REPORTS && <ReportsView activeProjectId={activeProjectId} projects={projects} onNotify={notify} config={getPageConfig('REPORTS')} onSaveConfig={(config) => setPageConfigs(prev => ({ ...prev, [activeProjectId || 'global']: { ...prev[activeProjectId || 'global'], REPORTS: { ...prev[activeProjectId || 'global']?.REPORTS, ...config } as ViewConfig } }))} />}
           {view === ViewState.TEAM && <TeamView onNotify={notify} />}
           {view === ViewState.SETTINGS && <SettingsView customPages={customPages} onSavePage={(p) => setCustomPages(customPages.some(cp => cp.id === p.id) ? customPages.map(cp => cp.id === p.id ? p : cp) : [...customPages, p])} onDeletePage={(id) => setCustomPages(customPages.filter(cp => cp.id !== id))} />}
           {view === ViewState.CUSTOM_PAGE && activeCustomPage && <CustomPageView page={activeCustomPage} />}
           {view === ViewState.DATA_ANALYSIS && (
             <DataAnalysisView 
               projects={projects}
               beneficiaries={beneficiaries}
               surveys={surveys}
               virtualTables={virtualTables}
               activeProjectId={activeProjectId}
               onClearProjectFilter={() => setActiveProjectId(null)}
             />
           )}
           {view === ViewState.DATASETS && (
             <DatasetsView 
               virtualTables={virtualTables}
               projects={projects}
               surveys={surveys}
               beneficiaries={beneficiaries}
               formSubmissions={formSubmissions}
               onNotify={notify}
             />
           )}
           {view === ViewState.FIELD_APP && (
             <FieldAppView 
               forms={dynamicForms}
               projects={projects}
               onNotify={notify}
               onSyncSubmissions={(submissions) => setFormSubmissions(prev => [...prev, ...submissions])}
             />
           )}
           {view === ViewState.AI_GENERATOR && (
             <AIGeneratorView 
               organizationName={organizationName}
               projects={projects}
               surveys={surveys}
               beneficiaries={beneficiaries}
               onNotify={notify}
             />
           )}
        </div>
      </main>
    </div>
  );
};

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
