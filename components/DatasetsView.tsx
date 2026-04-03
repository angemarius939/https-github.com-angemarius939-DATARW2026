import React, { useState } from 'react';
import { Database, Download, ExternalLink, Search, RefreshCw, Key, Copy, CheckCircle2, Table as TableIcon, Eye, ArrowLeft, Plus, X } from 'lucide-react';
import { VirtualTable, Project, Survey, Beneficiary, FormSubmission } from '../types';

interface DatasetsViewProps {
  virtualTables: VirtualTable[];
  setVirtualTables?: React.Dispatch<React.SetStateAction<VirtualTable[]>>;
  projects: Project[];
  surveys: Survey[];
  beneficiaries: Beneficiary[];
  formSubmissions: FormSubmission[];
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  organizationName?: string;
}

const DatasetsView: React.FC<DatasetsViewProps> = ({ virtualTables, setVirtualTables, projects, surveys, beneficiaries, formSubmissions, onNotify, organizationName = 'My Organization' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDatasetForm, setNewDatasetForm] = useState({ 
    name: '', 
    description: '', 
    sourceDatasets: [] as string[],
    computedColumns: [] as { name: string; formula: string }[]
  });

  // Group form submissions by formId
  const formDatasets = Array.from(new Set(formSubmissions.map(s => s.formId))).map(formId => {
    const submissions = formSubmissions.filter(s => s.formId === formId);
    const formName = submissions[0]?.formName || 'Unknown Form';
    return {
      id: `form_${formId}`,
      name: `${formName} (Field Data)`,
      description: `Data collected from the field via ${formName} form`,
      type: 'Field App',
      records: submissions.length,
      lastUpdated: new Date(Math.max(...submissions.map(s => new Date(s.timestamp).getTime()))).toISOString().split('T')[0]
    };
  });

  // Combine built-in datasets and virtual tables
  const datasets = [
    { id: 'core_projects', name: 'Projects Registry', description: 'Core project data including budgets and status', type: 'Core', records: projects.length, lastUpdated: new Date().toISOString().split('T')[0] },
    { id: 'core_surveys', name: 'Surveys Data', description: 'All active and completed surveys', type: 'Core', records: surveys.length, lastUpdated: new Date().toISOString().split('T')[0] },
    { id: 'core_beneficiaries', name: 'Beneficiaries', description: 'Registered beneficiaries and demographics', type: 'Core', records: beneficiaries.length, lastUpdated: new Date().toISOString().split('T')[0] },
    ...formDatasets,
    ...virtualTables.map(vt => ({
      id: vt.id,
      name: vt.name,
      description: vt.description,
      type: 'Custom',
      records: vt.recordsCount,
      lastUpdated: new Date().toISOString().split('T')[0]
    }))
  ];

  const filteredDatasets = datasets.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDatasetData = (datasetId: string): any[] => {
    if (datasetId === 'core_projects') {
      return projects.map(p => ({ ID: p.id, Name: p.name, Status: p.status, Budget: p.budget, Spent: p.spent, Beneficiaries: p.beneficiaries, 'Start Date': p.startDate, Manager: p.manager }));
    } else if (datasetId === 'core_surveys') {
      return surveys.map(s => ({ ID: s.id, Title: s.title, Status: s.status, Responses: s.responseCount, 'Created At': s.createdAt }));
    } else if (datasetId === 'core_beneficiaries') {
      return beneficiaries.map(b => ({ ID: b.id, Name: `${b.firstName} ${b.lastName}`, Gender: b.gender, Age: b.age, Location: b.location, Status: b.status, 'Enrollment Date': b.enrollmentDate }));
    } else if (datasetId.startsWith('form_')) {
      const formId = datasetId.replace('form_', '');
      const submissions = formSubmissions.filter(s => s.formId === formId);
      return submissions.map(s => ({
        'Submission ID': s.id,
        'Timestamp': new Date(s.timestamp).toLocaleString(),
        ...s.data
      }));
    } else {
      // Custom virtual table
      const vt = virtualTables.find(v => v.id === datasetId);
      if (vt && vt.sourceDatasets && vt.sourceDatasets.length > 0) {
        // For simplicity, we take the first source dataset's data and add computed columns
        // A real app would join datasets based on a common key
        const baseData = getDatasetData(vt.sourceDatasets[0]);
        
        if (vt.computedColumns && vt.computedColumns.length > 0) {
          return baseData.map(row => {
            const newRow = { ...row };
            vt.computedColumns!.forEach(col => {
              try {
                // Simple formula evaluation: replace [Column Name] with row['Column Name']
                let formulaStr = col.formula;
                Object.keys(row).forEach(key => {
                  const value = row[key];
                  const numValue = typeof value === 'number' ? value : (isNaN(Number(value)) ? `"${value}"` : Number(value));
                  // Escape special characters in key for regex
                  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  formulaStr = formulaStr.replace(new RegExp(`\\[${escapedKey}\\]`, 'g'), String(numValue));
                });
                
                // Evaluate the formula
                // eslint-disable-next-line no-new-func
                newRow[col.name] = new Function(`return ${formulaStr}`)();
              } catch (e) {
                newRow[col.name] = 'Error';
              }
            });
            return newRow;
          });
        }
        return baseData;
      }
      
      // Mock data for other virtual tables
      return [{ id: 1, info: 'Mock data for ' + datasetId }];
    }
  };

  const handleExport = (datasetId: string, format: 'csv' | 'json') => {
    const dataToExport = getDatasetData(datasetId);
    let filename = `${datasetId}_export_${new Date().toISOString().split('T')[0]}`;

    if (dataToExport.length === 0) {
      onNotify("No data available to export", "error");
      return;
    }

    let content = '';
    let mimeType = '';
    let extension = '';

    if (format === 'csv') {
      const headers = Object.keys(dataToExport[0]).join(',');
      const rows = dataToExport.map(row => Object.values(row).map(val => `"${val}"`).join(','));
      content = [headers, ...rows].join('\n');
      mimeType = 'text/csv;charset=utf-8;';
      extension = 'csv';
    } else {
      content = JSON.stringify(dataToExport, null, 2);
      mimeType = 'application/json;charset=utf-8;';
      extension = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify(`Exported dataset as ${format.toUpperCase()}`, 'success');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    onNotify("Copied to clipboard", "success");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateDataset = () => {
    if (!newDatasetForm.name) {
      onNotify("Dataset name is required", "error");
      return;
    }
    if (newDatasetForm.sourceDatasets.length === 0) {
      onNotify("Please select at least one source dataset", "error");
      return;
    }

    if (setVirtualTables) {
      const newDataset: VirtualTable = {
        id: `custom_${Date.now()}`,
        name: newDatasetForm.name,
        description: newDatasetForm.description || `Combined dataset from ${newDatasetForm.sourceDatasets.length} sources`,
        fields: [], // In a real app, this would merge fields from source datasets
        recordsCount: newDatasetForm.sourceDatasets.length > 0 ? getDatasetData(newDatasetForm.sourceDatasets[0]).length : 0,
        sourceDatasets: newDatasetForm.sourceDatasets,
        computedColumns: newDatasetForm.computedColumns
      };
      setVirtualTables([...virtualTables, newDataset]);
      onNotify(`Created dataset: ${newDataset.name}`, "success");
      setIsCreateModalOpen(false);
      setNewDatasetForm({ name: '', description: '', sourceDatasets: [], computedColumns: [] });
    } else {
      onNotify("Cannot create dataset at this time", "error");
    }
  };

  if (selectedDatasetId) {
    const dataset = datasets.find(d => d.id === selectedDatasetId);
    const data = getDatasetData(selectedDatasetId);
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    return (
      <div className="p-6 max-w-7xl mx-auto animate-fade-in flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedDatasetId(null)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <TableIcon className="text-indigo-600" /> {dataset?.name}
              </h1>
              <p className="text-slate-500 mt-1 text-sm">{dataset?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const url = `https://api.datarw.org/v1/${organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-')}/datasets/${selectedDatasetId}/odata`;
                copyToClipboard(url, 'dataset_odata');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-200 rounded-xl text-sm font-bold transition-all shadow-sm"
              title="Copy OData URL for Power BI"
            >
              <ExternalLink size={16} /> Copy OData URL
            </button>
            <button 
              onClick={() => handleExport(selectedDatasetId, 'csv')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              <Download size={16} /> Export CSV
            </button>
            <button 
              onClick={() => handleExport(selectedDatasetId, 'json')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              <Download size={16} /> Export JSON
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {headers.map((header, idx) => (
                    <th key={idx} className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                    {headers.map((header, colIdx) => (
                      <td key={colIdx} className="p-4 text-sm text-slate-700 whitespace-nowrap">
                        {String(row[header as keyof typeof row])}
                      </td>
                    ))}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={headers.length || 1} className="p-8 text-center text-slate-500">
                      No data available in this dataset.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium flex justify-between items-center">
            <span>Showing {data.length} records</span>
            <span>Last updated: {dataset?.lastUpdated}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="text-indigo-600" /> Datasets & Integrations
          </h1>
          <p className="text-slate-500 mt-1">Manage your data tables, export records, and connect to external BI tools.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm"
          >
            <Plus size={18} /> Create Dataset
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search datasets..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-sm transition-colors" title="Refresh Data">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <TableIcon size={18} className="text-indigo-500" /> Available Datasets
              </h2>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">{filteredDatasets.length} Tables</span>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredDatasets.length > 0 ? filteredDatasets.map(dataset => (
                <div key={dataset.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{dataset.name}</h3>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${dataset.type === 'Core' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {dataset.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{dataset.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                      <span>{dataset.records.toLocaleString()} records</span>
                      <span>•</span>
                      <span>Updated {dataset.lastUpdated}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => setSelectedDatasetId(dataset.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Eye size={14} /> View Data
                    </button>
                    <button 
                      onClick={() => handleExport(dataset.id, 'csv')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      <Download size={14} /> CSV
                    </button>
                    <button 
                      onClick={() => handleExport(dataset.id, 'json')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      <Download size={14} /> JSON
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-500">
                  No datasets found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <ExternalLink size={20} className="text-indigo-400" /> BI Integrations
              </h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                Connect your datasets directly to external Business Intelligence tools like Power BI, Looker Studio, or Tableau using our secure API endpoints.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">OData Feed URL (Power BI)</label>
                  <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/10">
                    <code className="text-xs text-indigo-100 flex-1 truncate px-2">{`https://api.datarw.org/v1/${organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-')}/odata`}</code>
                    <button 
                      onClick={() => copyToClipboard(`https://api.datarw.org/v1/${organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-')}/odata`, 'odata')}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-indigo-300"
                      title="Copy URL"
                    >
                      {copiedKey === 'odata' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">REST API Endpoint</label>
                  <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/10">
                    <code className="text-xs text-indigo-100 flex-1 truncate px-2">{`https://api.datarw.org/v1/${organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-')}/datasets`}</code>
                    <button 
                      onClick={() => copyToClipboard(`https://api.datarw.org/v1/${organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-')}/datasets`, 'rest')}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-indigo-300"
                      title="Copy URL"
                    >
                      {copiedKey === 'rest' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Read-Only API Key</label>
                  <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 flex-1 px-2">
                      <Key size={14} className="text-indigo-400" />
                      <code className="text-xs text-indigo-100 truncate">{`sk_live_read_${organizationName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 4)}...a1b2`}</code>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(`sk_live_read_${organizationName.toLowerCase().replace(/[^a-z0-9]/g, '')}8f92a4b1c3d5e7f8a1b2`, 'key')}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-indigo-300"
                      title="Copy API Key"
                    >
                      {copiedKey === 'key' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10">
                <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                  Generate New API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Dataset Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Dataset</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Dataset Name</label>
                <input 
                  type="text" 
                  value={newDatasetForm.name}
                  onChange={(e) => setNewDatasetForm({...newDatasetForm, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="E.g., Combined Beneficiary Data"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  value={newDatasetForm.description}
                  onChange={(e) => setNewDatasetForm({...newDatasetForm, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[100px]"
                  placeholder="Describe the purpose of this dataset..."
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Source Datasets</label>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {datasets.map(d => (
                    <label key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        checked={newDatasetForm.sourceDatasets.includes(d.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewDatasetForm({...newDatasetForm, sourceDatasets: [...newDatasetForm.sourceDatasets, d.id]});
                          } else {
                            setNewDatasetForm({...newDatasetForm, sourceDatasets: newDatasetForm.sourceDatasets.filter(id => id !== d.id)});
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 text-sm">{d.name}</div>
                        <div className="text-xs text-slate-500">{d.records} records</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Computed Columns</label>
                  <button 
                    onClick={() => setNewDatasetForm({...newDatasetForm, computedColumns: [...newDatasetForm.computedColumns, { name: '', formula: '' }]})}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Column
                  </button>
                </div>
                {newDatasetForm.computedColumns.length === 0 ? (
                  <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    No computed columns added.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newDatasetForm.computedColumns.map((col, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="flex-1 space-y-2">
                          <input 
                            type="text" 
                            placeholder="Column Name (e.g., Total Cost)" 
                            value={col.name}
                            onChange={(e) => {
                              const newCols = [...newDatasetForm.computedColumns];
                              newCols[idx].name = e.target.value;
                              setNewDatasetForm({...newDatasetForm, computedColumns: newCols});
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          />
                          <input 
                            type="text" 
                            placeholder="Formula (e.g., [Budget] - [Spent])" 
                            value={col.formula}
                            onChange={(e) => {
                              const newCols = [...newDatasetForm.computedColumns];
                              newCols[idx].formula = e.target.value;
                              setNewDatasetForm({...newDatasetForm, computedColumns: newCols});
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const newCols = newDatasetForm.computedColumns.filter((_, i) => i !== idx);
                            setNewDatasetForm({...newDatasetForm, computedColumns: newCols});
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50 shrink-0">
              <button 
                onClick={handleCreateDataset} 
                disabled={!newDatasetForm.name || newDatasetForm.sourceDatasets.length === 0}
                className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
              >
                Create Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetsView;
