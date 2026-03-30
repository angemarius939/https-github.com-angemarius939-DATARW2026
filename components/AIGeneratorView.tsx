import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, FileText, Download, Loader2, Send, Bot, FileOutput, Upload, X, AlignLeft, List, ListOrdered, TableProperties, ChevronDown, FileSpreadsheet, History, Clock } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { Project, Survey, Beneficiary } from '../types';

interface AIGeneratorViewProps {
  organizationName: string;
  projects: Project[];
  surveys: Survey[];
  beneficiaries: Beneficiary[];
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

interface UploadedFile {
  id: string;
  name: string;
  mimeType: string;
  data: string; // base64
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

interface HistoryItem {
  id: string;
  timestamp: Date;
  prompt: string;
  response: string;
  reportType: string;
  projectId: string;
}

const AIGeneratorView: React.FC<AIGeneratorViewProps> = ({ organizationName, projects, surveys, beneficiaries, onNotify }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [responseFormat, setResponseFormat] = useState<'standard' | 'bullets' | 'numbers' | 'table'>('standard');
  const [reportType, setReportType] = useState<'custom' | 'project_summary' | 'budget_variance' | 'beneficiary_reach'>('custom');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [kpis, setKpis] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update prompt when report type changes
  useEffect(() => {
    if (reportType === 'project_summary') {
      setPrompt('Generate a comprehensive Project Summary report. Include overall progress, key milestones, and current status.');
    } else if (reportType === 'budget_variance') {
      setPrompt('Generate a Budget Variance report. Analyze the allocated budget versus actual spending, and highlight any significant discrepancies or areas of concern.');
    } else if (reportType === 'beneficiary_reach') {
      setPrompt('Generate a Beneficiary Reach report. Detail the demographics, total reach, and impact on the target populations.');
    } else if (reportType === 'custom' && prompt.startsWith('Generate a ')) {
      setPrompt('');
    }
  }, [reportType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const fileId = Math.random().toString(36).substring(7);
      
      setUploadedFiles(prev => [...prev, {
        id: fileId,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        data: '',
        progress: 0,
        status: 'uploading'
      }]);

      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, progress } : f
          ));
        }
      };

      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const base64Data = result.split(',')[1];
          // Simulate a slight delay for visual feedback if it's too fast
          setTimeout(() => {
            setUploadedFiles(prev => prev.map(f => 
              f.id === fileId ? { ...f, data: base64Data, progress: 100, status: 'complete' } : f
            ));
          }, 300);
        }
      };
      
      reader.onerror = () => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'error' } : f
        ));
        onNotify(`Failed to read file: ${file.name}`, 'error');
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onNotify('Please enter a prompt', 'error');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      // Initialize Gemini API
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is missing');
      }
      const ai = new GoogleGenAI({ apiKey });

      // Prepare context from system data
      let contextData: any = {
        totalSurveys: surveys.length,
        totalBeneficiaries: beneficiaries.length,
      };

      if (selectedProjectId === 'all') {
        contextData.projectsSummary = projects.map(p => ({ 
          name: p.name, 
          status: p.status, 
          progress: p.progress, 
          budget: p.budget,
          spent: p.spent,
          beneficiaries: p.beneficiaries
        }));
      } else {
        const selectedProject = projects.find(p => p.id === selectedProjectId);
        if (selectedProject) {
          contextData.selectedProjectDetails = selectedProject;
        }
      }

      let formatInstruction = "";
      if (responseFormat === 'bullets') {
        formatInstruction = "\n\nCRITICAL FORMATTING INSTRUCTION: Please format the main points of your response as a bulleted list to improve readability.";
      } else if (responseFormat === 'numbers') {
        formatInstruction = "\n\nCRITICAL FORMATTING INSTRUCTION: Please format the main points of your response as a numbered list to improve readability.";
      } else if (responseFormat === 'table') {
        formatInstruction = "\n\nCRITICAL FORMATTING INSTRUCTION: Please format the core data and comparisons in your response as a Markdown table to improve readability.";
      }

      let parameterInstructions = "";
      if (startDate || endDate) {
        parameterInstructions += `\n- DATE RANGE: Focus the analysis on the period from ${startDate || 'beginning'} to ${endDate || 'present'}.`;
      }
      if (kpis) {
        parameterInstructions += `\n- KEY PERFORMANCE INDICATORS (KPIs): Specifically address and synthesize data regarding these KPIs: ${kpis}.`;
      }

      const systemInstruction = `You are an expert AI assistant for the organization "${organizationName}". 
      You help generate detailed reports, notes, success stories, best practices, and dashboards strictly based on this organization's data and any uploaded documents.
      
      IMPORTANT RULES:
      1. You must ONLY use the provided data for "${organizationName}" and the uploaded documents to answer the user's prompt. Do not hallucinate or include data from other organizations.
      2. You MUST explicitly cite your sources for the information you provide.
      3. If you use information from the uploaded documents, reference them by their document name (e.g., [Source: DocumentName.pdf]).
      4. If you use the organization data provided in the system instructions, reference it as [Source: Organization Data].
      5. If the user requests a specific report type (Project Summary, Budget Variance, Beneficiary Reach), ensure the output is highly structured, concise, and focuses on the relevant data points.
      ${parameterInstructions ? `6. Follow these specific report parameters if provided: ${parameterInstructions}` : ''}
      
      Here is a summary of the current system data for "${organizationName}" to train you for this session:
      ${JSON.stringify(contextData, null, 2)}
      
      Please format your response using Markdown. Be professional, insightful, and use the provided data context where relevant.${formatInstruction}`;

      const parts: any[] = [];
      
      const completeFiles = uploadedFiles.filter(f => f.status === 'complete');
      completeFiles.forEach(file => {
        parts.push({ text: `--- START OF UPLOADED DOCUMENT: ${file.name} ---` });
        parts.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.data
          }
        });
        parts.push({ text: `--- END OF UPLOADED DOCUMENT: ${file.name} ---` });
      });
      
      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: { parts },
        config: {
          systemInstruction,
        }
      });

      const responseText = response.text || 'No content generated.';
      setGeneratedContent(responseText);
      
      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date(),
        prompt: prompt,
        response: responseText,
        reportType: reportType,
        projectId: selectedProjectId
      };
      setHistory(prev => [newHistoryItem, ...prev]);
      
      onNotify('Content generated successfully', 'success');
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        onNotify('AI generation is currently unavailable due to API quota limits.', 'error');
      } else {
        onNotify('Failed to generate content. Please try again.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    // In a real app, we would use a library like html2pdf.js or jspdf
    // For this prototype, we'll simulate the download or just print the page
    window.print();
    onNotify('Preparing PDF download...', 'success');
  };

  const handleDownloadCSV = () => {
    if (!generatedContent) return;

    // Try to extract a markdown table
    const lines = generatedContent.split('\n');
    const tableLines = lines.filter(line => line.trim().startsWith('|') && line.trim().endsWith('|'));
    
    const isSeparator = (line: string) => /^\|[\s-:|]+\|$/.test(line.trim());
    const dataLines = tableLines.filter(line => !isSeparator(line));

    let csvContent = '';

    if (dataLines.length > 0) {
      // Parse markdown table to CSV
      const csvLines = dataLines.map(line => {
        const cells = line.split('|').slice(1, -1); // remove first and last empty elements
        return cells.map(cell => {
          const trimmed = cell.trim();
          if (trimmed.includes(',') || trimmed.includes('"')) {
            return `"${trimmed.replace(/"/g, '""')}"`;
          }
          return trimmed;
        }).join(',');
      });
      csvContent = csvLines.join('\n');
    } else {
      // Fallback: export raw text, escaping quotes
      csvContent = lines.map(line => `"${line.replace(/"/g, '""')}"`).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    onNotify('CSV downloaded successfully', 'success');
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setGeneratedContent(item.response);
    setReportType(item.reportType as any);
    setSelectedProjectId(item.projectId);
    setShowHistory(false);
    onNotify('Loaded previous response', 'success');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Bot className="text-indigo-600" size={32} /> AI Intelligence Hub
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Generate detailed reports, success stories, and best practices trained on your organization's live data.
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${showHistory ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
        >
          <History size={18} />
          {showHistory ? 'Hide History' : 'View History'}
        </button>
      </div>

      {showHistory && (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-8 animate-slide-down">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <Clock className="text-indigo-500" size={20} />
            <h2 className="font-bold text-slate-700">Generation History</h2>
          </div>
          <div className="p-0 max-h-[400px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <History size={48} className="mx-auto text-slate-300 mb-3" />
                <p>No generation history yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => loadHistoryItem(item)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">
                        {item.reportType === 'custom' ? 'Custom Prompt' : item.reportType.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {item.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium line-clamp-2 mb-2">"{item.prompt}"</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.response.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="text-indigo-500" size={20} />
            <h2 className="font-bold text-slate-700">What would you like to generate?</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer shadow-sm"
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
            
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="appearance-none bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer shadow-sm"
              >
                <option value="custom">Custom Prompt</option>
                <option value="project_summary">Project Summary</option>
                <option value="budget_variance">Budget Variance</option>
                <option value="beneficiary_reach">Beneficiary Reach</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
        <div className="p-6">
          <textarea
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 placeholder-slate-400"
            placeholder="e.g., Write a success story about our completed projects, highlighting the budget efficiency and overall progress..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          
          {/* Report Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Focus KPIs (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g., Budget, Reach, Timeline..." 
                value={kpis} 
                onChange={e => setKpis(e.target.value)} 
                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" 
              />
            </div>
          </div>
          
          {/* Formatting Options */}
          <div className="flex items-center gap-2 mt-3 p-2 bg-white rounded-lg border border-slate-200 w-fit shadow-sm">
             <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider px-2">Format:</span>
             <button 
               onClick={() => setResponseFormat('standard')} 
               className={`p-1.5 rounded-md flex items-center gap-1.5 transition-colors ${responseFormat === 'standard' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`} 
               title="Standard Text"
             >
               <AlignLeft size={16}/>
               <span className="text-xs font-semibold">Standard</span>
             </button>
             <button 
               onClick={() => setResponseFormat('bullets')} 
               className={`p-1.5 rounded-md flex items-center gap-1.5 transition-colors ${responseFormat === 'bullets' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`} 
               title="Bullet Points"
             >
               <List size={16}/>
               <span className="text-xs font-semibold">Bullets</span>
             </button>
             <button 
               onClick={() => setResponseFormat('numbers')} 
               className={`p-1.5 rounded-md flex items-center gap-1.5 transition-colors ${responseFormat === 'numbers' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`} 
               title="Numbered List"
             >
               <ListOrdered size={16}/>
               <span className="text-xs font-semibold">Numbered</span>
             </button>
             <button 
               onClick={() => setResponseFormat('table')} 
               className={`p-1.5 rounded-md flex items-center gap-1.5 transition-colors ${responseFormat === 'table' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`} 
               title="Table"
             >
               <TableProperties size={16}/>
               <span className="text-xs font-semibold">Table</span>
             </button>
          </div>
          
          {/* File Upload Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FileText size={16} className="text-indigo-500" />
                Additional Context Documents
              </h3>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                Supported: PDF, TXT, CSV, Images
              </span>
            </div>
            
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.txt,.csv,.png,.jpg,.jpeg"
              />
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload size={20} className="text-indigo-500" />
              </div>
              <p className="text-sm font-bold text-slate-700 mb-1">Click to upload documents</p>
              <p className="text-xs text-slate-500">or drag and drop files here to provide more context for the AI</p>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attached Files ({uploadedFiles.length})</h4>
                  <button 
                    onClick={() => setUploadedFiles([])}
                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex flex-col p-3 bg-white border border-slate-200 shadow-sm rounded-lg">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText size={16} className="text-indigo-500 shrink-0" />
                          <span className="truncate text-sm font-medium text-slate-700">{file.name}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }} 
                          className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors shrink-0"
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {file.status === 'uploading' && (
                        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300 ease-out" 
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      )}
                      {file.status === 'error' && (
                        <span className="text-xs text-red-500 mt-1">Upload failed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
            <div className="flex gap-2">
              <button onClick={() => setPrompt("Generate a comprehensive progress report for all active projects.")} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">Progress Report</button>
              <button onClick={() => setPrompt("Write a success story highlighting our most impactful beneficiary programs.")} className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">Success Story</button>
              <button onClick={() => setPrompt("Summarize the key best practices learned from our recent project implementations.")} className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors">Best Practices</button>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {isGenerating ? 'Generating...' : 'Generate Insights'}
            </button>
          </div>
        </div>
      </div>

      {generatedContent && (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="text-indigo-600" size={24} />
              <h2 className="font-black text-xl text-slate-900">Generated Output</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
              >
                <FileSpreadsheet size={16} className="text-green-600" /> Save as CSV
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
              >
                <FileOutput size={16} className="text-red-500" /> Save as PDF
              </button>
            </div>
          </div>
          <div className="p-8 prose prose-slate max-w-none">
             <div className="markdown-body">
                <Markdown>{generatedContent}</Markdown>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIGeneratorView;
