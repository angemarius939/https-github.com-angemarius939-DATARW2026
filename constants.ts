import { DataSourceType } from './types';

export const SOURCE_FIELDS: Record<DataSourceType, { key: string; label: string }[]> = {
  PROJECTS: [
    { key: 'name', label: 'Project Name' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
    { key: 'progress', label: 'Progress (%)' },
    { key: 'budget', label: 'Total Budget' },
    { key: 'spent', label: 'Actual Spent' },
    { key: 'manager', label: 'Project Manager' },
    { key: 'startDate', label: 'Start Date' }
  ],
  BENEFICIARIES: [
    { key: 'name', label: 'Full Name' },
    { key: 'location', label: 'District/Location' },
    { key: 'age', label: 'Age Group' },
    { key: 'gender', label: 'Gender' },
    { key: 'status', label: 'Enrollment Status' }
  ],
  SURVEYS: [
    { key: 'title', label: 'Survey Title' },
    { key: 'status', label: 'Status' },
    { key: 'responseCount', label: 'Total Responses' },
    { key: 'createdAt', label: 'Creation Date' }
  ],
  LOGS: [
    { key: 'action', label: 'Action Taken' },
    { key: 'user', label: 'User' },
    { key: 'timestamp', label: 'Date & Time' },
    { key: 'details', label: 'Details' }
  ],
  VIRTUAL_TABLE: []
};
