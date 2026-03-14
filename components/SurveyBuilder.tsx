
import React, { useState, useRef, useEffect } from 'react';
import { generateSurveyFromDescription, translateSurvey } from '../services/aiService';
import { AIHubResponse, QuestionType, Survey, ViewConfig, Project, VirtualTable } from '../types';
import { Sparkles, Loader2, Plus, Trash2, Save, FileText, Calendar, BarChart2, Search, ArrowLeft, Pencil, X, CheckSquare, AlertCircle, GripVertical, Calculator, Camera, Upload, Sliders, PenTool, Image as ImageIcon, FolderKanban } from 'lucide-react';

interface SurveyBuilderProps {
  initialSurveys: Survey[];
  setGlobalSurveys: (s: Survey[]) => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  activeProjectId: string | null;
  projects: Project[];
  virtualTables?: VirtualTable[];
}

const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ initialSurveys, setGlobalSurveys, onNotify, activeProjectId, projects, virtualTables = [] }) => {
  const [prompt, setPrompt] = useState('');
  const [fileContext, setFileContext] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [generatedSurvey, setGeneratedSurvey] = useState<AIHubResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [surveys, setSurveys] = useState<Survey[]>(initialSurveys);

  const filteredSurveys = surveys.filter(s => {
    if (!activeProjectId) return true;
    return s.linkedProjectId === activeProjectId;
  });

  useEffect(() => {
    setSurveys(initialSurveys);
  }, [initialSurveys]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFileContext(text.substring(0, 10000));
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !fileContext) return;
    setIsLoading(true);
    setError(null);
    setFieldErrors({});
    setEditingSurveyId(null);
    try {
      const result = await generateSurveyFromDescription(prompt, fileContext || undefined);
      setGeneratedSurvey({
        ...result,
        linkedProjectId: activeProjectId || undefined
      });
    } catch (err) {
      setError("Failed to generate survey. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (lang: string) => {
    if (!generatedSurvey) return;
    setIsTranslating(true);
    try {
      const translated = await translateSurvey(generatedSurvey, lang);
      setGeneratedSurvey(translated);
      onNotify(`Survey translated to ${lang}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleEdit = (survey: Survey) => {
    setEditingSurveyId(survey.id);
    setGeneratedSurvey({
      surveyTitle: survey.title,
      surveyDescription: survey.description,
      linkedProjectId: survey.linkedProjectId,
      customFields: survey.customFields || {},
      questions: survey.questions ? survey.questions.map(q => ({
        text: q.text,
        type: q.type,
        options: q.options,
        required: q.required,
        formula: q.formula
      })) : []
    });
  };

  const handleSave = () => {
    if (!generatedSurvey) return;
    
    const finalProjectId = generatedSurvey.linkedProjectId || activeProjectId;

    const newSurvey: Survey = {
      id: editingSurveyId || Date.now().toString(),
      title: generatedSurvey.surveyTitle,
      description: generatedSurvey.surveyDescription,
      status: 'Active',
      responseCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      linkedProjectId: finalProjectId || undefined,
      customFields: generatedSurvey.customFields || {},
      questions: generatedSurvey.questions.map((q, i) => ({
        id: `q-${i}`,
        text: q.text,
        type: q.type as QuestionType,
        options: q.options,
        required: q.required ?? true,
        formula: q.formula
      }))
    };

    let updated;
    if (editingSurveyId) {
      updated = surveys.map(s => s.id === editingSurveyId ? newSurvey : s);
    } else {
      updated = [newSurvey, ...surveys];
    }
    
    setSurveys(updated);
    setGlobalSurveys(updated);
    setGeneratedSurvey(null);
    setEditingSurveyId(null);
    onNotify("Survey saved and deployed");
  };

  if (generatedSurvey) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
           <button onClick={() => setGeneratedSurvey(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm">
            <ArrowLeft size={18} /> Back
           </button>
           <div className="flex gap-2">
              <button onClick={() => handleTranslate('Kinyarwanda')} disabled={isTranslating} className="px-4 py-2 text-xs bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 font-bold">Kinyarwanda</button>
              <button onClick={() => handleTranslate('French')} disabled={isTranslating} className="px-4 py-2 text-xs bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 font-bold">French</button>
           </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 bg-slate-50 border-b border-slate-100">
            <input 
              value={generatedSurvey.surveyTitle}
              onChange={(e) => setGeneratedSurvey({...generatedSurvey, surveyTitle: e.target.value})}
              className="text-2xl font-black text-slate-900 bg-transparent border-none focus:outline-none w-full mb-2"
            />
            <textarea 
              value={generatedSurvey.surveyDescription}
              onChange={(e) => setGeneratedSurvey({...generatedSurvey, surveyDescription: e.target.value})}
              className="text-slate-500 bg-transparent border-none focus:outline-none w-full text-sm resize-none"
            />
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-4">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <FolderKanban size={14} /> Associated Project
               </div>
               <select 
                  className="flex-1 max-w-xs p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  value={generatedSurvey.linkedProjectId || ''}
                  onChange={(e) => setGeneratedSurvey({...generatedSurvey, linkedProjectId: e.target.value || undefined})}
               >
                  <option value="">-- No Project Association --</option>
                  {projects.map(p => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
               </select>
               {activeProjectId && !generatedSurvey.linkedProjectId && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                     Context: {projects.find(p => p.id === activeProjectId)?.name}
                  </span>
               )}
            </div>

            {virtualTables.find(t => t.id === 'surveys')?.fields && virtualTables.find(t => t.id === 'surveys')!.fields.length > 0 && (
               <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                     <Sliders size={14} /> Custom Attributes
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {virtualTables.find(t => t.id === 'surveys')!.fields.map(field => (
                        <div key={field.id} className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{field.label}</label>
                           <input 
                              type={field.type === 'NUMBER' ? 'number' : field.type === 'DATE' ? 'date' : 'text'}
                              placeholder={field.label} 
                              className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
                              value={generatedSurvey.customFields?.[field.name] || ''} 
                              onChange={(e) => setGeneratedSurvey({
                                 ...generatedSurvey, 
                                 customFields: {
                                    ...(generatedSurvey.customFields || {}),
                                    [field.name]: e.target.value
                                 }
                              })}
                           />
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>
          <div className="p-8 space-y-6">
            {generatedSurvey.questions.map((q, idx) => (
              <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                <button onClick={() => {
                  const qcopy = [...generatedSurvey.questions];
                  qcopy.splice(idx, 1);
                  setGeneratedSurvey({...generatedSurvey, questions: qcopy});
                }} className="absolute top-4 right-4 text-slate-300 hover:text-red-500">
                  <Trash2 size={16}/>
                </button>
                <div className="flex gap-4 items-start">
                   <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-indigo-600 shrink-0 shadow-sm">{idx + 1}</div>
                   <div className="flex-1 space-y-4">
                      <input 
                        className="w-full bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none py-1 font-bold text-slate-800"
                        value={q.text}
                        onChange={(e) => {
                          const qcopy = [...generatedSurvey.questions];
                          qcopy[idx].text = e.target.value;
                          setGeneratedSurvey({...generatedSurvey, questions: qcopy});
                        }}
                      />
                      
                      {/* Visual Input Placeholder */}
                      <div className="mt-2">
                         {q.type === 'SIGNATURE' && (
                           <div className="border border-slate-200 bg-white rounded-xl h-24 flex items-center justify-center text-slate-300 relative group/sig">
                              <PenTool size={32} />
                              <span className="text-[10px] font-black uppercase tracking-widest absolute bottom-2">Signature Area Placeholder</span>
                              <button className="absolute top-2 right-2 text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-400 hover:bg-slate-200 transition-colors">Clear</button>
                           </div>
                         )}
                         {q.type === 'IMAGE' && (
                           <div className="border border-slate-200 bg-white rounded-xl h-24 flex items-center justify-center text-slate-300 relative">
                              <ImageIcon size={32} />
                              <span className="text-[10px] font-black uppercase tracking-widest absolute bottom-2">Image Upload Placeholder</span>
                           </div>
                         )}
                         {q.type === 'MULTIPLE_CHOICE' && q.options && (
                           <div className="space-y-2">
                              {q.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                                  <span className="text-sm text-slate-600">{opt}</span>
                                </div>
                              ))}
                           </div>
                         )}
                         {(q.type === 'TEXT' || q.type === 'NUMBER' || q.type === 'DATE') && (
                           <div className="h-10 border border-slate-200 bg-white rounded-lg flex items-center px-4 text-slate-300 text-xs italic">
                              Input field for {q.type.toLowerCase()}...
                           </div>
                         )}
                      </div>

                      <div className="flex items-center gap-4">
                        <select 
                          className="bg-white border border-slate-200 rounded-lg text-xs font-bold p-1.5"
                          value={q.type}
                          onChange={(e) => {
                             const qcopy = [...generatedSurvey.questions];
                             qcopy[idx].type = e.target.value;
                             setGeneratedSurvey({...generatedSurvey, questions: qcopy});
                          }}
                        >
                           <option value="TEXT">TEXT</option>
                           <option value="MULTIPLE_CHOICE">MULTIPLE CHOICE</option>
                           <option value="NUMBER">NUMBER</option>
                           <option value="DATE">DATE</option>
                           <option value="IMAGE">IMAGE / PHOTO</option>
                           <option value="SIGNATURE">SIGNATURE</option>
                           <option value="BOOLEAN">BOOLEAN (Yes/No)</option>
                           <option value="CALCULATION">CALCULATION</option>
                        </select>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                           <input type="checkbox" checked={q.required} onChange={(e) => {
                             const qcopy = [...generatedSurvey.questions];
                             qcopy[idx].required = e.target.checked;
                             setGeneratedSurvey({...generatedSurvey, questions: qcopy});
                           }} /> Required
                        </label>
                      </div>
                   </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => setGeneratedSurvey({...generatedSurvey, questions: [...generatedSurvey.questions, { text: 'New Question', type: 'TEXT', required: true }]})}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              + Add Question Manually
            </button>
          </div>
          <div className="p-6 bg-slate-900 flex justify-end gap-3">
             <button onClick={() => setGeneratedSurvey(null)} className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-white">Discard</button>
             <button onClick={handleSave} className="bg-white text-slate-900 px-8 py-2 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg">Save & Deploy</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-xs tracking-widest">
            <Sparkles size={16} /> AI HUB
          </div>
          {activeProjectId && (
            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
               <FolderKanban size={12} /> Context: {projects.find(p => p.id === activeProjectId)?.name || 'Active Project'}
            </div>
          )}
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Create Data Collection Tool</h2>
        <p className="text-slate-500 mb-8 max-w-2xl">Describe your project requirements and let our AI Builder build a culturally relevant, multi-lingual survey for you.</p>
        
        <div className="space-y-6">
           <textarea
            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] text-slate-800 resize-none font-medium"
            placeholder="Describe what you want to measure (e.g., Household water sanitation habits in Burera District)..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
           <div className="flex flex-col md:flex-row gap-4 items-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-bold transition-all ${fileName ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-slate-500 border-slate-200'}`}
              >
                <Upload size={18} />
                {fileName || "Upload Supporting Doc"}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <div className="flex-1"></div>
              <button
                 onClick={handleGenerate}
                 disabled={isLoading || !prompt.trim()}
                 className="w-full md:w-auto bg-slate-900 text-white px-10 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50"
              >
                 {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                 Generate Survey
              </button>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
           <h3 className="text-xl font-black text-slate-900">Survey Repository</h3>
           <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl">
              <Search size={18} className="text-slate-400" />
              <input placeholder="Search surveys..." className="bg-transparent text-sm font-medium outline-none" />
           </div>
        </div>
        <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                 <th className="px-8 py-4">Title & Context</th>
                 {virtualTables.find(t => t.id === 'surveys')?.fields.map(f => (
                    <th key={f.id} className="px-8 py-4 text-center">{f.label}</th>
                 ))}
                 <th className="px-8 py-4 text-center">Responses</th>
                 <th className="px-8 py-4 text-center">Status</th>
                 <th className="px-8 py-4 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSurveys.map((s) => (
                 <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-900">{s.title}</div>
                          {s.linkedProjectId && (
                             <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-indigo-900 text-white px-2 py-0.5 rounded shadow-sm">
                                <FolderKanban size={10}/> {projects.find(p => p.id === s.linkedProjectId)?.name || 'Linked Project'}
                             </span>
                          )}
                       </div>
                       <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.description}</div>
                    </td>
                    {virtualTables.find(t => t.id === 'surveys')?.fields.map(f => (
                       <td key={f.id} className="px-8 py-6 text-center text-slate-500 font-mono text-xs">
                          {s.customFields?.[f.name] || '-'}
                       </td>
                    ))}
                    <td className="px-8 py-6 text-center text-slate-500 font-mono text-xs">{s.responseCount}</td>
                    <td className="px-8 py-6 text-center">
                       <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-green-100">{s.status}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button onClick={() => handleEdit(s)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Pencil size={18} />
                       </button>
                    </td>
                 </tr>
              ))}
              {surveys.length === 0 && (
                <tr><td colSpan={4 + (virtualTables.find(t => t.id === 'surveys')?.fields.length || 0)} className="p-20 text-center text-slate-300 font-bold">No surveys found in this context.</td></tr>
              )}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default SurveyBuilder;
