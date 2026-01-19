
export enum ViewState {
  LANDING = 'LANDING',
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
  CUSTOM_PAGE = 'CUSTOM_PAGE'
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
  level: 'Impact' | 'Outcome' | 'Output';
  unit: string;
  frequency: 'Monthly' | 'Quarterly' | 'Annually';
  baseline: number;
  overallTarget: number;
  achieved: number;
  periodicData: IndicatorTarget[];
  dataSource: string;
  responsible: string;
  linkedLogframeId?: string;
}

// Project Structures
export interface ActivityLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
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
}

export interface Project {
  id: string;
  name: string;
  location: string;
  status: 'On Track' | 'At Risk' | 'Delayed';
  progress: number;
  budget: number; // Sum of lines
  spent: number; // Sum of lines
  beneficiaries: number;
  startDate: string;
  manager: string;
  budgetLines: BudgetLine[];
  indicators: ProjectIndicator[];
  activities: ProjectActivity[];
  beneficiaryList: Beneficiary[];
  activityLog: ActivityLogEntry[];
}

// No-Code Platform Types
export interface VirtualField {
  id: string;
  name: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'BOOLEAN' | 'FILE';
  validation?: { required: boolean; pattern?: string };
}

export interface VirtualTable {
  id: string;
  name: string;
  description: string;
  fields: VirtualField[];
  recordsCount: number;
}

export interface FormFieldDefinition {
  id: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  mapping?: string;
}

export interface FormDefinition {
  id: string;
  name: string;
  description: string;
  fields: FormFieldDefinition[];
  targetTableId?: string;
  publishStatus: 'DRAFT' | 'PUBLISHED';
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
}
