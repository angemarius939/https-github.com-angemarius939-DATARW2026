import React, { useState } from 'react';
import { Sparkles, FileText, Download, Loader2, Send, Bot, FileOutput } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { Project, Survey, Beneficiary } from '../types';

interface AIGeneratorViewProps {
  projects: Project[];
  surveys: Survey[];
  beneficiaries: Beneficiary[];
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

const AIGeneratorView: React.FC<AIGeneratorViewProps> = ({ projects, surveys, beneficiaries, onNotify }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

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
      const contextData = {
        projectsSummary: projects.map(p => ({ name: p.name, status: p.status, progress: p.progress, budget: p.budget })),
        totalSurveys: surveys.length,
        totalBeneficiaries: beneficiaries.length,
      };

      const systemInstruction = `You are an expert AI assistant for an organization's data platform. 
      You help generate detailed reports, notes, success stories, best practices, and dashboards based on the organization's data.
      Here is a summary of the current system data to train you for this session:
      ${JSON.stringify(contextData, null, 2)}
      
      Please format your response using Markdown. Be professional, insightful, and use the provided data context where relevant.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          systemInstruction,
        }
      });

      setGeneratedContent(response.text || 'No content generated.');
      onNotify('Content generated successfully', 'success');
    } catch (error) {
      console.error('Error generating content:', error);
      onNotify('Failed to generate content. Please try again.', 'error');
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

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Bot className="text-indigo-600" size={32} /> AI Intelligence Hub
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Generate detailed reports, success stories, and best practices trained on your organization's live data.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <Sparkles className="text-indigo-500" size={20} />
          <h2 className="font-bold text-slate-700">What would you like to generate?</h2>
        </div>
        <div className="p-6">
          <textarea
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 placeholder-slate-400"
            placeholder="e.g., Write a success story about our completed projects, highlighting the budget efficiency and overall progress..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex justify-between items-center mt-4">
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
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileOutput size={16} /> Save as PDF
            </button>
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
