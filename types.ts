
export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  customActions?: string[];
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
  department: string;
  permissions?: string[];
  organization?: string;
}

export enum ViewState {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD_HOME = 'DASHBOARD_HOME',
  SURVEYS = 'SURVEYS',
  PROJECTS = 'PROJECTS',
  BENEFICIARIES = 'BENEFICIARIES',
  DOCUMENTS = 'DOCUMENTS',
  REPORTS = 'REPORTS',
  TEAM = 'TEAM',
  SETTINGS = 'SETTINGS',
  ADMIN_PANEL = 'ADMIN_PANEL',
  CUSTOM_PAGE = 'CUSTOM_PAGE',
  DATA_ANALYSIS = 'DATA_ANALYSIS',
  DATASETS = 'DATASETS',
  FIELD_APP = 'FIELD_APP',
  AI_GENERATOR = 'AI_GENERATOR',
  RESEARCH = 'RESEARCH',
  INFOGRAPHICS = 'INFOGRAPHICS',
  DOCUMENTATION = 'DOCUMENTATION'
}

export enum QuestionType {
  TEXT = 'TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  CALCULATION = 'CALCULATION',
  SIGNATURE = 'SIGNATURE',
  GPS = 'GPS',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  BARCODE = 'BARCODE',
  RATING = 'RATING',
  TIME = 'TIME',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  SECTION_HEADER = 'SECTION_HEADER',
  NOTE = 'NOTE',
  FILE_UPLOAD = 'FILE_UPLOAD'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  formula?: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'Draft' | 'Active' | 'Closed';
  responseCount: number;
  createdAt: string;
  questions?: Question[];
  languages?: string[];
  linkedProjectId?: string;
  customFields?: Record<string, any>;
}

// Financial Structures
export interface BudgetLine {
  id: string;
  code: string;
  description: string;
  category: 'Personnel' | 'Operational' | 'Equipment' | 'Travel' | 'Sub-grants' | 'Other';
  allocated: number;
  spent: number;
  variance: number;
}

// M&E Structures
export interface IndicatorTarget {
  period: string; // e.g., 'Q1 2025'
  target: number;
  actual: number;
}

export interface ProjectIndicator {
  id: string;
  code: string;
  name: string;
  expectedResult?: string;
  level: 'Goal' | 'Impact' | 'Secondary Outcome' | 'Outcome' | 'Output' | 'Activity';
  unit: string;
  frequency: string;
  baseline: number | string;
  overallTarget: number | string;
  achieved: number | string;
  periodicData: IndicatorTarget[];
  dataSource: string;
  dataCollectionMethod?: string;
  responsible: string;
  reporting?: string;
  timeline?: string;
  linkedLogframeId?: string;
}

export interface LogframeElement {
  id: string;
  type: 'Impact' | 'Outcome' | 'Output';
  code: string;
  description: string;
  parentId?: string;
}

// Project Structures
export interface ActivityLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}

export interface ActivityAchievement {
  id: string;
  date: string;
  description: string;
  reportedBy: string;
}

export interface ProjectActivity {
  id: string;
  name: string;
  category: 'Planning' | 'Implementation' | 'Monitoring' | 'Closure';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed' | 'Cancelled';
  startDate: string;
  endDate: string;
  assignedTo: string;
  linkedOutputId: string;
  completionPercentage: number;
  dependencies?: string[];
  achievements?: ActivityAchievement[];
}

export interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  location: string;
  status: 'Active' | 'Inactive' | 'Graduated';
  enrollmentDate: string;
  programs: string[];
  cases: any[];
  phoneNumber?: string;
  idNumber?: string;
  educationLevel?: 'None' | 'Primary' | 'Secondary' | 'TVET' | 'University';
  householdSize?: number;
  vulnerabilityScore?: number;
  needs?: string[];
  customFields?: Record<string, any>;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  completionDate?: string;
}

export interface ProjectRisk {
  id: string;
  description: string;
  category: 'Financial' | 'Operational' | 'Strategic' | 'Compliance' | 'Reputational';
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  mitigationStrategy: string;
  status: 'Open' | 'Mitigated' | 'Closed' | 'Active' | 'Realized';
  owner: string;
}

export interface ProjectPartner {
  id: string;
  name: string;
  role: 'Funder' | 'Implementing Partner' | 'Government' | 'Community Based Organization';
  contributionAmount?: number;
  contactPerson: string;
  email: string;
}

export interface ProjectIntervention {
  id: string;
  name: string;
  type: 'Training' | 'Distribution' | 'Infrastructure' | 'Advocacy' | 'Cash Transfer' | 'Health Service' | 'Other';
  targetDemographic: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed' | 'Suspended';
  budgetAllocated: number;
  beneficiariesReached: number;
  description: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  owner: string;
  date: string;
  content?: string; // Optional text content for AI to read
}

export interface ProjectPhase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  phases: ProjectPhase[];
  reportingStructure: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  narrative?: string;
  location: string;
  status: 'On Track' | 'At Risk' | 'Delayed';
  progress: number;
  budget: number; // Sum of lines
  spent: number; // Sum of lines
  beneficiaries: number;
  startDate: string;
  endDate?: string;
  manager: string;
  budgetLines: BudgetLine[];
  indicators: ProjectIndicator[];
  activities: ProjectActivity[];
  beneficiaryList: Beneficiary[];
  activityLog: ActivityLogEntry[];
  logframe?: LogframeElement[];
  customFields?: Record<string, any>;
  milestones?: ProjectMilestone[];
  risks?: ProjectRisk[];
  partners?: ProjectPartner[];
  interventions?: ProjectIntervention[];
  thematicAreas?: string[];
  documents?: ProjectDocument[];
  templateId?: string;
  phases?: ProjectPhase[];
}

// No-Code Platform Types
export interface VirtualField {
  id: string;
  name: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'BOOLEAN' | 'FILE';
  options?: string[];
  defaultValue?: string | number | boolean;
  validation?: { required: boolean; pattern?: string };
}

export interface VirtualTable {
  id: string;
  name: string;
  description: string;
  fields: VirtualField[];
  recordsCount: number;
  sourceDatasets?: string[];
  computedColumns?: { name: string; formula: string }[];
}

export interface FormFieldCondition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

export interface FormFieldDefinition {
  id: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'file' | 'location';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  mapping?: string;
  condition?: FormFieldCondition;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minDate?: string;
    maxDate?: string;
  };
}

export interface FormDefinition {
  id: string;
  name: string;
  description: string;
  fields: FormFieldDefinition[];
  targetTableId?: string;
  publishStatus: 'DRAFT' | 'PUBLISHED';
}

export interface FormSubmission {
  id: string;
  formId: string;
  formName: string;
  data: any;
  timestamp: string;
  status: 'pending' | 'synced' | 'failed';
}

export interface WorkflowAction {
  id: string;
  name: string;
  trigger: 'ON_SUBMIT' | 'ON_STATUS_CHANGE' | 'ON_CREATE';
  triggerSourceId: string;
  action: 'EMAIL' | 'NOTIFY' | 'UPDATE_RECORD' | 'APPROVAL';
  config: {
    recipient?: string;
    subject?: string;
    message?: string;
    targetField?: string;
    newValue?: string;
  };
}

export interface ViewConfig {
  title: string;
  subtitle: string;
  hiddenElements: string[];
}

export type PageConfigs = Record<string, Record<string, ViewConfig>>;

export interface AIHubResponse {
  surveyTitle: string;
  surveyDescription: string;
  linkedProjectId?: string;
  customFields?: Record<string, any>;
  questions: {
    text: string;
    type: string;
    options?: string[];
    required?: boolean;
    formula?: string;
  }[];
}

export type DataSourceType = 'PROJECTS' | 'SURVEYS' | 'BENEFICIARIES' | 'LOGS' | 'VIRTUAL_TABLE';
export type WidgetType = 'TABLE' | 'CARD_GRID' | 'SUMMARY_STATS' | 'CHART' | 'FORM';
export type ChartType = 'BAR' | 'LINE' | 'PIE';

export interface PageWidget {
  id: string;
  title: string;
  dataSource: DataSourceType;
  widgetType: WidgetType;
  chartType?: ChartType;
  description?: string;
  selectedFields?: string[];
  mappingConfig?: {
    labelField?: string;
    valueField?: string;
  };
}

export interface CustomPage {
  id: string;
  name: string;
  description: string;
  icon: string;
  widgets: PageWidget[];
  createdAt: string;
  createdBy: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'ROLE_BASED';
  linkedProjectId?: string;
}
