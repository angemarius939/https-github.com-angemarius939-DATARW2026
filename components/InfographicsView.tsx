import React, { useState, useMemo } from 'react';
import { 
  PieChart, BarChart2, LineChart, Map, 
  Sparkles, Send, Loader2, Download, Database, LayoutTemplate
} from 'lucide-react';
import { VirtualTable, Project, Survey, Beneficiary, FormDefinition, FormSubmission } from '../types';
import { GoogleGenAI } from '@google/genai';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
  LineChart as RechartsLineChart, Line,
  AreaChart, Area
} from 'recharts';

interface InfographicsViewProps {
  projects: Project[];
  surveys: Survey[];
  beneficiaries: Beneficiary[];
  virtualTables: VirtualTable[];
  dynamicForms: FormDefinition[];
  formSubmissions: FormSubmission[];
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

type ChartType = 'bar' | 'pie' | 'line' | 'area' | 'map';

interface ChartConfig {
  type: ChartType;
  title: string;
  description: string;
  data: any[];
  xAxisKey?: string;
  series: { key: string; name: string; color: string }[];
}

const COLORS = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6', '#14b8a6', '#f43f5e'];

export default function InfographicsView({ 
  projects, surveys, beneficiaries, virtualTables, dynamicForms, formSubmissions, onNotify 
}: InfographicsViewProps) {
  
  // Combine all datasets
  const datasets = useMemo(() => {
    const formDatasets = Array.from(new Set(formSubmissions.map(s => s.formId))).map(formId => {
      const formName = dynamicForms.find(f => f.id === formId)?.title || formId;
      const submissions = formSubmissions.filter(s => s.formId === formId);
      return {
        id: `form_${formId}`,
        name: `${formName} (Field Data)`,
        description: `Data collected from the field via ${formName} form`,
        records: submissions.length,
      };
    });

    return [
      { id: 'core_projects', name: 'Projects Registry', description: 'Core project data including budgets and status', records: projects.length },
      { id: 'core_surveys', name: 'Surveys Data', description: 'All active and completed surveys', records: surveys.length },
      { id: 'core_beneficiaries', name: 'Beneficiaries', description: 'Registered beneficiaries and demographics', records: beneficiaries.length },
      ...formDatasets,
      ...virtualTables.map(vt => ({
        id: vt.id,
        name: vt.name,
        description: vt.description,
        records: vt.recordsCount,
      }))
    ];
  }, [projects, surveys, beneficiaries, virtualTables, dynamicForms, formSubmissions]);

  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(datasets[0]?.id || '');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);

  const selectedDataset = useMemo(() => datasets.find(d => d.id === selectedDatasetId), [datasets, selectedDatasetId]);

  const getDatasetData = (datasetId: string) => {
    if (datasetId === 'core_projects') {
      return projects.map(p => ({ ID: p.id, Name: p.name, Status: p.status, Budget: p.budget, Spent: p.spent, Beneficiaries: p.beneficiaries, 'Start Date': p.startDate, Manager: p.manager }));
    } else if (datasetId === 'core_surveys') {
      return surveys.map(s => ({ ID: s.id, Title: s.title, Status: s.status, Responses: s.responseCount, 'Created At': s.createdAt }));
    } else if (datasetId === 'core_beneficiaries') {
      return beneficiaries.map(b => ({ ID: b.id, Name: b.name, Gender: b.gender, Age: b.age, Location: b.location, Status: b.status, 'Education Level': b.educationLevel, 'Household Size': b.householdSize, 'Vulnerability Score': b.vulnerabilityScore }));
    } else if (datasetId.startsWith('form_')) {
      const formId = datasetId.replace('form_', '');
      const submissions = formSubmissions.filter(s => s.formId === formId);
      return submissions.map(s => ({ ID: s.id, Date: new Date(s.timestamp).toLocaleString(), Submitter: s.submittedBy, ...s.data }));
    } else {
      // Virtual tables mock data
      return Array.from({ length: 10 }).map((_, i) => ({ id: i + 1, info: 'Mock data for ' + datasetId, value: Math.floor(Math.random() * 100) }));
    }
  };

  const handleGenerate = async () => {
    if (!selectedDataset) {
      onNotify('Please select a dataset first.', 'error');
      return;
    }
    if (!prompt.trim()) {
      onNotify('Please enter a prompt describing what you want to visualize.', 'error');
      return;
    }

    setIsGenerating(true);
    setChartConfig(null);

    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'dummy_key_for_build') throw new Error('Gemini API key is missing. Please configure it in your Vercel environment variables.');
      
      const ai = new GoogleGenAI({ apiKey });

      const fullData = getDatasetData(selectedDatasetId);
      const dataSample = fullData.slice(0, 10);
      const columns = fullData.length > 0 ? Object.keys(fullData[0]) : [];

      const systemInstruction = `You are an expert data visualization assistant.
      The user wants to create an infographic/chart based on a dataset.
      Dataset Name: ${selectedDataset.name}
      Columns: ${columns.join(', ')}
      Data Sample: ${JSON.stringify(dataSample)}
      
      Based on the user's prompt, determine the best chart type ('bar', 'pie', 'line', 'area', or 'map') and aggregate/format the data appropriately for Recharts.
      Return ONLY a valid JSON object matching this TypeScript interface:
      {
        "type": "bar" | "pie" | "line" | "area" | "map",
        "title": "A descriptive title",
        "description": "A short description of what the chart shows",
        "data": [ { "name": "Category A", "value1": 10, "value2": 20 }, ... ],
        "xAxisKey": "name", // The key in the data objects to use for the X-axis (or name for pie chart/map)
        "series": [
          { "key": "value1", "name": "Metric 1", "color": "#4f46e5" },
          { "key": "value2", "name": "Metric 2", "color": "#ec4899" }
        ]
      }
      Do not include markdown formatting like \`\`\`json, just return the raw JSON object.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: { systemInstruction }
      });

      let jsonStr = response.text || '';
      // Clean up potential markdown formatting
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const config = JSON.parse(jsonStr) as ChartConfig;
      
      // Ensure colors are assigned if missing
      if (config.series && Array.isArray(config.series)) {
        config.series = config.series.map((s, i) => ({
          ...s,
          color: s.color || COLORS[i % COLORS.length]
        }));
      } else {
        config.series = [];
      }
      
      if (!config.data || !Array.isArray(config.data)) {
        config.data = [];
      }

      setChartConfig(config);
      onNotify('Infographic generated successfully!', 'success');
    } catch (error) {
      console.error("Error generating infographic:", error);
      onNotify('Failed to generate infographic. Please try again or rephrase your prompt.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderChart = () => {
    if (!chartConfig) return null;

    const { type, data = [], xAxisKey, series = [] } = chartConfig;

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={xAxisKey || 'name'} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              {series.map((s, i) => (
                <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={xAxisKey || 'name'} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              {series.map((s, i) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={3} activeDot={{ r: 8 }} />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={xAxisKey || 'name'} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              {series.map((s, i) => (
                <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} fill={s.color} stroke={s.color} fillOpacity={0.3} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey={series[0]?.key || 'value'}
                nameKey={xAxisKey || 'name'}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      case 'map':
        return (
          <div className="w-full h-[400px] bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-200">
            <Map size={120} className="text-slate-200 absolute opacity-50" />
            <div className="z-10 w-full h-full p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <div className="font-bold text-slate-800 mb-2">{item[xAxisKey || 'name']}</div>
                    {series.map(s => (
                      <div key={s.key} className="flex justify-between text-sm">
                        <span className="text-slate-500">{s.name}:</span>
                        <span className="font-medium" style={{ color: s.color }}>{item[s.key]}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-8 text-center text-slate-500">Unsupported chart type</div>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
      <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutTemplate className="text-indigo-600" size={28} />
            AI Infographics Generator
          </h1>
          <p className="text-slate-500 font-medium mt-1">Transform your datasets into beautiful, insightful visualizations.</p>
        </div>
        <div className="flex gap-3">
          {chartConfig && (
            <button 
              onClick={() => {
                onNotify("Opening print dialog to save infographic...", "success");
                setTimeout(() => window.print(), 500);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              <Download size={16} /> Export PDF
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar - Controls */}
        <div className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Database size={16} className="text-indigo-600" />
              Select Dataset
            </label>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="" disabled>Choose a dataset...</option>
              {datasets.map(dataset => (
                <option key={dataset.id} value={dataset.id}>{dataset.name}</option>
              ))}
            </select>
            {selectedDataset && (
              <p className="text-xs text-slate-500 mt-2">
                {selectedDataset.records} records
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              What do you want to visualize?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Show me a bar chart of the top 5 locations by beneficiary count..."
              className="w-full flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none custom-scrollbar"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedDataset || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {isGenerating ? 'Generating...' : 'Generate Infographic'}
          </button>
        </div>

        {/* Main Content - Visualization */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 flex flex-col items-center justify-center">
          {isGenerating ? (
            <div className="text-center animate-pulse">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Data & Designing Chart...</h3>
              <p className="text-slate-500">Our AI is finding the best way to visualize your request.</p>
            </div>
          ) : chartConfig ? (
            <div className="w-full max-w-5xl bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-scale-in">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-black text-slate-900 mb-2">{chartConfig.title}</h2>
                <p className="text-slate-500">{chartConfig.description}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {renderChart()}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 max-w-md">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LayoutTemplate size={48} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Infographic Generated Yet</h3>
              <p className="text-sm">Select a dataset and describe what you want to visualize in the sidebar to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
