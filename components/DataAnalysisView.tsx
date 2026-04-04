import React, { useState } from 'react';
import { Project, Beneficiary, Survey, VirtualTable } from '../types';
import { 
  BarChart3, PieChart, LineChart, Activity, 
  BrainCircuit, Sparkles, Loader2, Database, 
  ChevronRight, ArrowRight, X, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { GoogleGenAI } from '@google/genai';

interface DataAnalysisViewProps {
  projects: Project[];
  beneficiaries: Beneficiary[];
  surveys: Survey[];
  virtualTables?: VirtualTable[];
  activeProjectId?: string | null;
  onClearProjectFilter?: () => void;
}

type DatasetType = 'projects' | 'beneficiaries' | 'surveys';
type AnalysisType = 'descriptive' | 'inferential' | 'multivariable';

export default function DataAnalysisView({ projects, beneficiaries, surveys, virtualTables, activeProjectId, onClearProjectFilter }: DataAnalysisViewProps) {
  const [dataset, setDataset] = useState<DatasetType>('beneficiaries');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('descriptive');
  const [variableX, setVariableX] = useState<string>('');
  const [variableY, setVariableY] = useState<string>('');
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get available variables based on dataset
  const getVariables = () => {
    let vars: {value: string, label: string}[] = [];
    switch(dataset) {
      case 'beneficiaries':
        vars = [
          { value: 'age', label: 'Age (Numeric)' },
          { value: 'householdSize', label: 'Household Size (Numeric)' },
          { value: 'gender', label: 'Gender (Categorical)' },
          { value: 'location', label: 'Location (Categorical)' },
          { value: 'educationLevel', label: 'Education Level (Categorical)' },
          { value: 'status', label: 'Status (Categorical)' }
        ];
        break;
      case 'projects':
        vars = [
          { value: 'budget', label: 'Budget (Numeric)' },
          { value: 'spent', label: 'Spent (Numeric)' },
          { value: 'progress', label: 'Progress % (Numeric)' },
          { value: 'beneficiaries', label: 'Beneficiaries Count (Numeric)' },
          { value: 'status', label: 'Status (Categorical)' },
          { value: 'location', label: 'Location (Categorical)' }
        ];
        break;
      case 'surveys':
        vars = [
          { value: 'responseCount', label: 'Response Count (Numeric)' },
          { value: 'status', label: 'Status (Categorical)' }
        ];
        break;
      default:
        vars = [];
    }

    if (virtualTables) {
      const table = virtualTables.find(t => t.id === dataset);
      if (table && table.fields) {
        table.fields.forEach(f => {
          vars.push({
            value: `customFields.${f.name}`,
            label: `${f.label} (${f.type === 'NUMBER' ? 'Numeric' : 'Categorical'})`
          });
        });
      }
    }

    return vars;
  };

  const variables = getVariables();

  // Reset variables when dataset changes
  const handleDatasetChange = (newDataset: DatasetType) => {
    setDataset(newDataset);
    setVariableX('');
    setVariableY('');
    setAiInsights(null);
  };

  const getValue = (d: any, key: string) => {
    if (key.startsWith('customFields.')) {
      const fieldName = key.split('.')[1];
      return d.customFields ? d.customFields[fieldName] : undefined;
    }
    return d[key];
  };

  const isNumericField = (key: string) => {
    if (key.startsWith('customFields.')) {
      const fieldName = key.split('.')[1];
      const table = virtualTables?.find(t => t.id === dataset);
      const field = table?.fields?.find(f => f.name === fieldName);
      return field?.type === 'NUMBER';
    }
    return ['age', 'householdSize', 'budget', 'spent', 'progress', 'beneficiaries', 'responseCount'].includes(key);
  };

  const getFilteredData = () => {
    let data: any[] = [];
    if (dataset === 'beneficiaries') {
      data = activeProjectId 
        ? beneficiaries.filter(b => b.programs.includes(projects.find(p => p.id === activeProjectId)?.name || ''))
        : beneficiaries;
    }
    if (dataset === 'projects') {
      data = activeProjectId ? projects.filter(p => p.id === activeProjectId) : projects;
    }
    if (dataset === 'surveys') {
      data = activeProjectId ? surveys.filter(s => s.linkedProjectId === activeProjectId) : surveys;
    }
    return data;
  };

  // Generate Descriptive Stats
  const generateDescriptiveStats = () => {
    if (!variableX) return null;
    
    const data = getFilteredData();

    const isNumeric = isNumericField(variableX);

    if (isNumeric) {
      const values = data.map(d => Number(getValue(d, variableX)) || 0).filter(v => !isNaN(v));
      if (values.length === 0) return { type: 'numeric', stats: { count: 0 } };
      
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;
      const sorted = [...values].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      
      return {
        type: 'numeric',
        stats: {
          count: values.length,
          mean: mean.toFixed(2),
          median: median.toFixed(2),
          min: min.toFixed(2),
          max: max.toFixed(2)
        }
      };
    } else {
      // Categorical
      const counts: Record<string, number> = {};
      data.forEach(d => {
        const val = String(getValue(d, variableX) || 'Unknown');
        counts[val] = (counts[val] || 0) + 1;
      });
      
      const chartData = Object.entries(counts).map(([name, count]) => ({ name, count }));
      
      return {
        type: 'categorical',
        stats: counts,
        chartData
      };
    }
  };

  // Generate Inferential Stats (Correlation/Comparison)
  const generateInferentialStats = () => {
    if (!variableX || !variableY) return null;
    
    const data = getFilteredData();

    const isXNumeric = isNumericField(variableX);
    const isYNumeric = isNumericField(variableY);

    if (isXNumeric && isYNumeric) {
      // Both numeric: Scatter plot & Pearson Correlation
      const points = data.map(d => ({
        x: Number(getValue(d, variableX)) || 0,
        y: Number(getValue(d, variableY)) || 0,
        name: d.name || d.firstName || d.title || 'Item'
      }));

      // Calculate Pearson Correlation
      const n = points.length;
      if (n === 0) return null;

      const sumX = points.reduce((acc, p) => acc + p.x, 0);
      const sumY = points.reduce((acc, p) => acc + p.y, 0);
      const sumXY = points.reduce((acc, p) => acc + (p.x * p.y), 0);
      const sumX2 = points.reduce((acc, p) => acc + (p.x * p.x), 0);
      const sumY2 = points.reduce((acc, p) => acc + (p.y * p.y), 0);

      const numerator = (n * sumXY) - (sumX * sumY);
      const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
      const correlation = denominator === 0 ? 0 : numerator / denominator;

      return {
        type: 'correlation',
        correlation: correlation.toFixed(3),
        chartData: points,
        interpretation: correlation > 0.7 ? 'Strong Positive' : correlation > 0.3 ? 'Moderate Positive' : correlation < -0.7 ? 'Strong Negative' : correlation < -0.3 ? 'Moderate Negative' : 'Weak/No Correlation'
      };
    } else if (!isXNumeric && isYNumeric) {
      // Categorical vs Numeric: Bar chart of averages
      const groups: Record<string, number[]> = {};
      data.forEach(d => {
        const cat = String(getValue(d, variableX) || 'Unknown');
        const val = Number(getValue(d, variableY)) || 0;
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(val);
      });

      const chartData = Object.entries(groups).map(([name, values]) => {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return { name, average: Number(avg.toFixed(2)), count: values.length };
      });

      return {
        type: 'comparison',
        chartData
      };
    }

    return { type: 'unsupported' };
  };

  const generateMultivariableStats = () => {
    if (selectedVariables.length < 2) return null;
    
    const data = getFilteredData();
    const numericVars = selectedVariables.filter(v => isNumericField(v));

    let correlationMatrix: any = null;
    if (numericVars.length >= 2) {
       correlationMatrix = [];
       for (let i = 0; i < numericVars.length; i++) {
         const row: any = { name: numericVars[i] };
         for (let j = 0; j < numericVars.length; j++) {
            if (i === j) {
              row[numericVars[j]] = 1;
            } else {
              const points = data.map(d => ({
                x: Number(getValue(d, numericVars[i])) || 0,
                y: Number(getValue(d, numericVars[j])) || 0
              }));
              const n = points.length;
              if (n === 0) { row[numericVars[j]] = 0; continue; }
              const sumX = points.reduce((acc, p) => acc + p.x, 0);
              const sumY = points.reduce((acc, p) => acc + p.y, 0);
              const sumXY = points.reduce((acc, p) => acc + (p.x * p.y), 0);
              const sumX2 = points.reduce((acc, p) => acc + (p.x * p.x), 0);
              const sumY2 = points.reduce((acc, p) => acc + (p.y * p.y), 0);
              const numerator = (n * sumXY) - (sumX * sumY);
              const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
              const correlation = denominator === 0 ? 0 : numerator / denominator;
              row[numericVars[j]] = Number(correlation.toFixed(3));
            }
         }
         correlationMatrix.push(row);
       }
    }

    const summary = selectedVariables.map(v => {
       const isNum = isNumericField(v);
       if (isNum) {
          const values = data.map(d => Number(getValue(d, v)) || 0).filter(val => !isNaN(val));
          const sum = values.reduce((a, b) => a + b, 0);
          const mean = values.length ? sum / values.length : 0;
          return { variable: v, type: 'Numeric', metric: 'Mean', value: mean.toFixed(2) };
       } else {
          const counts: Record<string, number> = {};
          data.forEach(d => {
            const val = String(getValue(d, v) || 'Unknown');
            counts[val] = (counts[val] || 0) + 1;
          });
          const topCategory = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
          return { variable: v, type: 'Categorical', metric: 'Top Category', value: topCategory ? `${topCategory[0]} (${topCategory[1]})` : 'N/A' };
       }
    });

    return {
      type: 'multivariable',
      correlationMatrix,
      summary,
      numericVars
    };
  };

  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'dummy_key_for_build') throw new Error("Gemini API key is missing. Please configure it in your Vercel environment variables.");

      const ai = new GoogleGenAI({ apiKey });
      
      let promptContext = `Dataset: ${dataset}\nAnalysis Type: ${analysisType}\n`;
      
      if (analysisType === 'descriptive') {
        const stats = generateDescriptiveStats();
        promptContext += `Variable: ${variableX}\nResults: ${JSON.stringify(stats)}\n`;
      } else if (analysisType === 'inferential') {
        const stats = generateInferentialStats();
        promptContext += `Variable X: ${variableX}\nVariable Y: ${variableY}\nResults: ${JSON.stringify(stats)}\n`;
      } else if (analysisType === 'multivariable') {
        const stats = generateMultivariableStats();
        promptContext += `Selected Variables: ${selectedVariables.join(', ')}\nResults: ${JSON.stringify(stats)}\n`;
      }

      const prompt = `
        You are an expert Data Analyst and Program Evaluator for an NGO/Non-Profit.
        I have performed a no-code data analysis on our system data.
        
        Here is the context and statistical results:
        ${promptContext}
        
        Please provide:
        1. A brief, easy-to-understand interpretation of these statistics.
        2. 2-3 actionable recommendations for program implementation based on these findings.
        
        Keep it concise, professional, and directly relevant to NGO program management. Do not use markdown headers, just clear paragraphs or bullet points.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiInsights(response.text || "No insights generated.");
    } catch (err: any) {
      if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        setError("AI insights are currently unavailable due to API quota limits.");
      } else {
        setError(err.message || "Failed to generate insights.");
      }
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const renderDescriptiveResults = () => {
    const results = generateDescriptiveStats();
    if (!results) return null;

    if (results.type === 'numeric') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(results.stats).map(([key, value]) => (
            <div key={key} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{key}</div>
              <div className="text-2xl font-black text-slate-800">{value}</div>
            </div>
          ))}
        </div>
      );
    }

    if (results.type === 'categorical') {
      return (
        <div className="h-[300px] w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
  };

  const renderInferentialResults = () => {
    const results = generateInferentialStats();
    if (!results) return null;

    if (results.type === 'correlation') {
      return (
        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Activity size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pearson Correlation (r)</div>
              <div className="text-2xl font-black text-indigo-900">{results.correlation} <span className="text-sm font-bold text-indigo-500 ml-2">({results.interpretation})</span></div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x" name={variableX} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis type="number" dataKey="y" name={variableY} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <ZAxis type="category" dataKey="name" name="Name" />
                <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Scatter name="Data" data={results.chartData} fill="#4f46e5" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (results.type === 'comparison') {
      return (
        <div className="h-[300px] w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="average" fill="#0ea5e9" radius={[4, 4, 0, 0]} name={`Average ${variableY}`} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 text-amber-800">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Unsupported Combination</h4>
          <p className="text-sm mt-1">This combination of variables is not currently supported for inferential analysis. Try selecting a categorical variable for X and a numeric variable for Y, or numeric variables for both.</p>
        </div>
      </div>
    );
  };

  const renderMultivariableResults = () => {
    const results = generateMultivariableStats();
    if (!results) return (
      <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 text-amber-800">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Select Variables</h4>
          <p className="text-sm mt-1">Please select at least 2 variables for multivariable analysis.</p>
        </div>
      </div>
    );

    return (
      <div className="space-y-8 mb-8">
        <div>
           <h3 className="text-lg font-black text-slate-800 mb-4">Variables Summary</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <tr>
                   <th className="px-4 py-3">Variable</th>
                   <th className="px-4 py-3">Type</th>
                   <th className="px-4 py-3">Key Metric</th>
                   <th className="px-4 py-3">Value</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {results.summary.map((s: any, idx: number) => (
                   <tr key={idx}>
                     <td className="px-4 py-3 font-bold text-slate-700">{s.variable}</td>
                     <td className="px-4 py-3 text-slate-500">{s.type}</td>
                     <td className="px-4 py-3 text-slate-500">{s.metric}</td>
                     <td className="px-4 py-3 font-mono font-bold text-indigo-600">{s.value}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {results.correlationMatrix && results.numericVars.length >= 2 && (
          <div>
            <h3 className="text-lg font-black text-slate-800 mb-4">Correlation Matrix (Numeric)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-4 py-3 text-left">Variable</th>
                    {results.numericVars.map((v: string) => (
                      <th key={v} className="px-4 py-3">{v}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.correlationMatrix.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-bold text-slate-700 text-left">{row.name}</td>
                      {results.numericVars.map((v: string) => {
                         const val = row[v];
                         const absVal = Math.abs(val);
                         const bgColor = absVal === 1 ? 'bg-slate-100' : absVal > 0.7 ? 'bg-indigo-200' : absVal > 0.4 ? 'bg-indigo-100' : 'bg-white';
                         return (
                           <td key={v} className={`px-4 py-3 font-mono font-bold ${bgColor}`}>
                             {val}
                           </td>
                         );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-20 h-full flex flex-col">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] mb-3">
         <div className="w-4 h-0.5 bg-indigo-600"></div>
         Intelligence Hub
      </div>
      <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
        Data Analysis Studio
        {activeProjectId && (
          <span className="ml-4 text-xl font-bold text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full inline-flex items-center gap-2 align-middle">
            <Database size={18} />
            Filtered: {projects.find(p => p.id === activeProjectId)?.name}
            {onClearProjectFilter && (
              <button onClick={onClearProjectFilter} className="ml-2 hover:bg-slate-200 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            )}
          </span>
        )}
      </h1>
      <p className="text-slate-500 font-medium mb-8 max-w-2xl">Perform no-code descriptive and inferential statistics on your system data, and generate AI-powered interpretations for program implementation.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Configuration Panel */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Database size={16} className="text-indigo-500" /> 1. Select Dataset
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {(['beneficiaries', 'projects', 'surveys'] as DatasetType[]).map(type => (
                <button
                  key={type}
                  onClick={() => handleDatasetChange(type)}
                  className={`p-4 rounded-2xl border text-left font-bold transition-all ${dataset === type ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300'}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-500" /> 2. Analysis Type
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => { setAnalysisType('descriptive'); setAiInsights(null); }}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${analysisType === 'descriptive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Descriptive
              </button>
              <button
                onClick={() => { setAnalysisType('inferential'); setAiInsights(null); }}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${analysisType === 'inferential' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Inferential
              </button>
              <button
                onClick={() => { setAnalysisType('multivariable'); setAiInsights(null); }}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${analysisType === 'multivariable' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Multivariable
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" /> 3. Select Variables
            </h3>
            <div className="space-y-4">
              {analysisType === 'multivariable' ? (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2 block">Select Variables</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {variables.map(v => (
                      <label key={v.value} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedVariables.includes(v.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVariables([...selectedVariables, v.value]);
                            } else {
                              setSelectedVariables(selectedVariables.filter(sv => sv !== v.value));
                            }
                            setAiInsights(null);
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-bold text-slate-700">{v.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2 block">Primary Variable (X)</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-slate-700"
                      value={variableX}
                      onChange={(e) => { setVariableX(e.target.value); setAiInsights(null); }}
                    >
                      <option value="">-- Select Variable --</option>
                      {variables.map(v => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  {analysisType === 'inferential' && (
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2 block">Secondary Variable (Y)</label>
                      <select 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-slate-700"
                        value={variableY}
                        onChange={(e) => { setVariableY(e.target.value); setAiInsights(null); }}
                      >
                        <option value="">-- Select Variable --</option>
                        {variables.map(v => (
                          <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6 min-h-0">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex-1 overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-black text-slate-900 mb-6">Analysis Results</h2>
            
            {((analysisType !== 'multivariable' && !variableX) || (analysisType === 'inferential' && !variableY) || (analysisType === 'multivariable' && selectedVariables.length < 2)) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                  <PieChart size={40} />
                </div>
                <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Awaiting Configuration</h3>
                <p className="text-slate-400 mt-2 max-w-sm">Select your dataset and variables in the left panel to generate statistical analysis.</p>
              </div>
            ) : (
              <>
                {analysisType === 'descriptive' ? renderDescriptiveResults() : analysisType === 'inferential' ? renderInferentialResults() : renderMultivariableResults()}

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <BrainCircuit className="text-indigo-600" size={24} /> AI Interpretation
                    </h3>
                    <button 
                      onClick={generateAIInsights}
                      disabled={isGeneratingInsights}
                      className="px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isGeneratingInsights ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                      {aiInsights ? 'Regenerate Insights' : 'Generate Insights'}
                    </button>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-medium mb-4">
                      {error}
                    </div>
                  )}

                  {aiInsights ? (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {aiInsights}
                    </div>
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <p className="text-slate-500 font-medium">Click "Generate Insights" to get AI-powered interpretations and program recommendations based on these statistics.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
