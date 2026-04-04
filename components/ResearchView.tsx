import React, { useState, useRef, useEffect } from 'react';
import { 
  Microscope, FileText, Database, Sparkles, 
  Save, Download, Plus, Search, FileEdit,
  BarChart2, Loader2, CheckCircle2, AlignLeft,
  Bold, Italic, List, Heading, MessageSquare, Send, X
} from 'lucide-react';
import { Project, VirtualTable, Beneficiary, Survey } from '../types';
import { GoogleGenAI } from '@google/genai';

interface ResearchReport {
  id: string;
  title: string;
  date: string;
  content: string;
  datasets: string[];
  documents: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ResearchViewProps {
  projects: Project[];
  virtualTables: VirtualTable[];
  documents: any[];
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

const ResearchView: React.FC<ResearchViewProps> = ({ projects, virtualTables, documents, onNotify }) => {
  const [reports, setReports] = useState<ResearchReport[]>([
    {
      id: 'r1',
      title: 'Q1 Impact Evaluation',
      date: '2025-05-10',
      content: '<h1>Q1 Impact Evaluation</h1><p>This report analyzes the recent datasets and documents to evaluate the overall impact...</p>',
      datasets: [],
      documents: []
    }
  ]);
  const [activeReportId, setActiveReportId] = useState<string | null>('r1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'msg1', role: 'assistant', content: 'Hello! I can help you analyze your datasets and improve your report. What would you like to know?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeReport = reports.find(r => r.id === activeReportId) || null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleCreateReport = () => {
    const newReport: ResearchReport = {
      id: `r${Date.now()}`,
      title: 'Untitled Research Report',
      date: new Date().toISOString().split('T')[0],
      content: '<h1>New Research Report</h1><p>Start writing your analysis here, or use the AI generator to create a draft based on your datasets and documents.</p>',
      datasets: [],
      documents: []
    };
    setReports([newReport, ...reports]);
    setActiveReportId(newReport.id);
  };

  const handleUpdateReport = (updates: Partial<ResearchReport>) => {
    if (!activeReportId) return;
    setReports(reports.map(r => r.id === activeReportId ? { ...r, ...updates } : r));
  };

  const handleGenerateReport = async () => {
    if (!activeReport) return;
    setIsGenerating(true);
    
    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'dummy_key_for_build') throw new Error('Gemini API key is missing. Please configure it in your Vercel environment variables.');
      
      const ai = new GoogleGenAI({ apiKey });
      
      const datasetsCount = activeReport.datasets?.length || 0;
      const documentsCount = activeReport.documents?.length || 0;
      
      const prompt = `Generate a comprehensive, long, and detailed evaluation report for a project titled "${activeReport.title}".
      The report should synthesize data from ${datasetsCount} datasets and ${documentsCount} documents.
      
      Please structure the report with the following sections:
      1. Executive Summary
      2. Methodology & Data Sources
      3. Key Findings & Thematic Analysis
      4. Advanced Statistical Analysis
      5. Recommendations & Strategic Next Steps
      
      Format the output in HTML (using h1, h2, h3, p, ul, li, strong, em). Do not include markdown code blocks, just the raw HTML. Make sure the content is very detailed and professional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      let generatedContent = response.text || '<p>Failed to generate report content.</p>';
      generatedContent = generatedContent.replace(/```html/g, '').replace(/```/g, '').trim();
      
      handleUpdateReport({ content: generatedContent });
      onNotify('Detailed comprehensive evaluation report generated successfully.', 'success');
    } catch (error) {
      console.error("Error generating report:", error);
      onNotify('Failed to generate report. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeReport) return;
    
    const userMessage = chatInput;
    const newUserMsg: ChatMessage = { id: `msg_${Date.now()}`, role: 'user', content: userMessage };
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsChatting(true);
    
    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'dummy_key_for_build') throw new Error('Gemini API key is missing. Please configure it in your Vercel environment variables.');
      
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are an expert AI Research Assistant helping a user analyze data and write an evaluation report titled "${activeReport.title}".
      The user is currently analyzing ${activeReport.datasets?.length || 0} datasets and ${activeReport.documents?.length || 0} documents.
      Provide detailed, insightful, and professional responses. If the user asks you to write a section for the report, provide a long, comprehensive text.`;

      // Build conversation history
      const historyParts = chatMessages.map(msg => ({
        text: `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      })).join('\n\n');

      const prompt = `${historyParts}\n\nUser: ${userMessage}\n\nAssistant:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: { systemInstruction }
      });

      const newAssistantMsg: ChatMessage = { 
        id: `msg_${Date.now() + 1}`, 
        role: 'assistant', 
        content: response.text || 'I am sorry, I could not generate a response.'
      };
      setChatMessages(prev => [...prev, newAssistantMsg]);
    } catch (error) {
      console.error("Error in chat:", error);
      const errorMsg: ChatMessage = { 
        id: `msg_${Date.now() + 1}`, 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request.'
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleApplyChatToReport = (content: string) => {
    if (!activeReport) return;
    handleUpdateReport({ content: activeReport.content + `\n<p><strong>AI Suggestion:</strong> ${content}</p>` });
    onNotify('Added suggestion to report', 'success');
  };

  const handleDownloadReport = () => {
    if (!activeReport) return;
    onNotify('Downloading report...', 'success');
    const content = activeReport.content.replace(/<[^>]*>?/gm, ''); // Strip HTML for simple text export
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeReport.title.replace(/\s+/g, '_').toLowerCase()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredReports = reports.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Microscope className="text-indigo-600" size={20} />
              Research Hub
            </h2>
            <button 
              onClick={handleCreateReport}
              className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
              title="New Report"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredReports.map(report => (
            <button
              key={report.id}
              onClick={() => setActiveReportId(report.id)}
              className={`w-full text-left px-3 py-3 rounded-xl transition-all ${activeReportId === report.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'} border`}
            >
              <div className="font-medium text-slate-900 truncate">{report.title}</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <FileText size={12} /> {report.date}
              </div>
            </button>
          ))}
          {filteredReports.length === 0 && (
            <div className="p-4 text-center text-sm text-slate-500">
              No reports found.
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeReport ? (
          <>
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
              <input 
                type="text"
                value={activeReport.title}
                onChange={(e) => handleUpdateReport({ title: e.target.value })}
                className="text-xl font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 w-1/2 outline-none"
                placeholder="Report Title"
              />
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onNotify('Report saved', 'success')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-all shadow-sm"
                >
                  <Save size={16} /> Save
                </button>
                <button 
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-medium transition-all shadow-sm"
                >
                  <Download size={16} /> Export
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex gap-6">
              {/* Editor Area */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
                    <button className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="Heading"><Heading size={16} /></button>
                    <button className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="Bold"><Bold size={16} /></button>
                    <button className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="Italic"><Italic size={16} /></button>
                    <div className="w-px h-6 bg-slate-300 mx-1"></div>
                    <button className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="List"><List size={16} /></button>
                    <button className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="Align Left"><AlignLeft size={16} /></button>
                  </div>
                  {/* Content Area */}
                  <div className="flex-1 p-6 bg-white overflow-y-auto prose max-w-none">
                    <textarea 
                      value={activeReport.content.replace(/<[^>]*>?/gm, '')} // Simple strip tags for textarea
                      onChange={(e) => handleUpdateReport({ content: e.target.value })}
                      className="w-full h-full resize-none outline-none text-slate-700 leading-relaxed"
                      placeholder="Start writing your research report..."
                    />
                  </div>
                </div>
              </div>

              {/* Context & Analysis Panel */}
              <div className="w-96 shrink-0 flex flex-col gap-6">
                {/* Data Sources */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Database size={18} className="text-indigo-600" />
                    Data Sources
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Datasets</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== 'default' && !(activeReport.datasets || []).includes(val)) {
                            handleUpdateReport({ datasets: [...(activeReport.datasets || []), val] });
                          }
                        }}
                        value="default"
                      >
                        <option value="default" disabled>Add dataset...</option>
                        {virtualTables.map(vt => (
                          <option key={vt.id} value={vt.id}>{vt.name}</option>
                        ))}
                      </select>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(activeReport.datasets || []).map(ds => {
                          const table = virtualTables.find(t => t.id === ds);
                          return (
                            <span key={ds} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                              {table?.name || ds}
                              <button onClick={() => handleUpdateReport({ datasets: (activeReport.datasets || []).filter(d => d !== ds) })} className="hover:text-indigo-900"><X size={12} /></button>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Documents</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== 'default' && !(activeReport.documents || []).includes(val)) {
                            handleUpdateReport({ documents: [...(activeReport.documents || []), val] });
                          }
                        }}
                        value="default"
                      >
                        <option value="default" disabled>Add document...</option>
                        {documents.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.name}</option>
                        ))}
                      </select>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(activeReport.documents || []).map(docId => {
                          const doc = documents.find(d => d.id === docId);
                          return (
                            <span key={docId} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
                              {doc?.name || docId}
                              <button onClick={() => handleUpdateReport({ documents: (activeReport.documents || []).filter(d => d !== docId) })} className="hover:text-emerald-900"><X size={12} /></button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Chat Assistant */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-indigo-600" />
                      AI Research Assistant
                    </h3>
                    <button 
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 rounded-lg text-xs font-bold transition-colors"
                      title="Auto-generate full report"
                    >
                      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <BarChart2 size={14} />}
                      Auto-Draft
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-indigo-600'}`}>
                          {msg.role === 'user' ? <MessageSquare size={14} /> : <Sparkles size={14} />}
                        </div>
                        <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                            {msg.content}
                          </div>
                          {msg.role === 'assistant' && msg.id !== 'msg1' && (
                            <button 
                              onClick={() => handleApplyChatToReport(msg.content)}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider px-1"
                            >
                              + Add to Report
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {isChatting && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0">
                          <Loader2 size={14} className="animate-spin" />
                        </div>
                        <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 text-sm rounded-tl-none shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <div className="p-3 bg-white border-t border-slate-200">
                    <div className="relative">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask AI to analyze data..."
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                      <button 
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isChatting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 rounded-lg transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Microscope size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Research & Analysis</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Create detailed evaluation reports, analyze datasets, and synthesize insights from your documents.
              </p>
              <button 
                onClick={handleCreateReport}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold transition-all shadow-sm mx-auto"
              >
                <Plus size={20} /> Create First Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchView;
