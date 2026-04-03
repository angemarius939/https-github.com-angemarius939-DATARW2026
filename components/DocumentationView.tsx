import React from 'react';
import { BookOpen, Target, Database, Activity, Layout, FileText, PieChart, Smartphone } from 'lucide-react';

const DocumentationView: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <BookOpen className="text-indigo-600" size={32} />
          Platform Documentation
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          A comprehensive guide to the capabilities and features of this Monitoring & Evaluation platform.
        </p>
      </div>

      <div className="space-y-8">
        {/* Overview */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Layout className="text-indigo-500" /> Platform Overview
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            This platform is a comprehensive Monitoring & Evaluation (M&E) and Project Management system designed to help organizations track projects, manage beneficiaries, collect field data, and analyze impact. It provides a unified workspace for project managers, field officers, and administrators to collaborate and make data-driven decisions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Key Benefits</h3>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                <li>Centralized project tracking</li>
                <li>Real-time field data collection</li>
                <li>Automated M&E indicator tracking</li>
                <li>Customizable reporting and dashboards</li>
              </ul>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Target Users</h3>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                <li>Project Managers & Directors</li>
                <li>M&E Officers</li>
                <li>Field Data Collectors</li>
                <li>Stakeholders & Donors</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Project Management */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Target className="text-emerald-500" /> Project & M&E Management
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            The core of the platform revolves around managing projects and tracking their success through structured M&E frameworks.
          </p>
          <div className="space-y-4">
            <div className="border-l-4 border-emerald-500 pl-4 py-1">
              <h3 className="font-bold text-slate-800">Project Tracking</h3>
              <p className="text-sm text-slate-600 mt-1">Track project status, budgets, timelines, and overall progress. Assign managers and monitor financial health.</p>
            </div>
            <div className="border-l-4 border-emerald-500 pl-4 py-1">
              <h3 className="font-bold text-slate-800">M&E Frameworks (Logframes)</h3>
              <p className="text-sm text-slate-600 mt-1">Define indicators at various levels (Goal, Impact, Outcome, Output). Set baselines, targets, and track achieved values over time.</p>
            </div>
            <div className="border-l-4 border-emerald-500 pl-4 py-1">
              <h3 className="font-bold text-slate-800">Periodic Data Recording</h3>
              <p className="text-sm text-slate-600 mt-1">Record actuals against targets on a periodic basis (e.g., Monthly, Quarterly) to automatically calculate total achievements.</p>
            </div>
          </div>
        </section>

        {/* Data Collection & Beneficiaries */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Smartphone className="text-blue-500" /> Data Collection & Beneficiaries
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-slate-800 mb-2">Dynamic Surveys</h3>
              <p className="text-sm text-slate-600 mb-3">Create custom forms and surveys with various question types (text, multiple choice, rating, etc.). Deploy these surveys to field officers for data collection.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-2">Beneficiary Management</h3>
              <p className="text-sm text-slate-600 mb-3">Maintain a centralized database of beneficiaries. Track demographics, locations, and enrollment status across different projects.</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-bold text-slate-800 mb-2">Field App (Mobile)</h3>
              <p className="text-sm text-slate-600">A dedicated mobile-friendly interface for field workers to submit survey responses and register beneficiaries directly from the field, even in low-connectivity environments.</p>
            </div>
          </div>
        </section>

        {/* Data Management & Integrations */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Database className="text-purple-500" /> Datasets & Integrations
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Transform raw data into actionable insights using powerful dataset management tools.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-purple-100 p-1 rounded text-purple-600"><Database size={16} /></div>
              <div>
                <strong className="text-slate-800 block">Virtual Tables</strong>
                <span className="text-sm text-slate-600">Combine multiple source datasets (like surveys or project data) into unified virtual tables for comprehensive analysis.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-purple-100 p-1 rounded text-purple-600"><Activity size={16} /></div>
              <div>
                <strong className="text-slate-800 block">Computed Columns</strong>
                <span className="text-sm text-slate-600">Create custom formulas (e.g., <code className="bg-slate-100 px-1 rounded text-xs">[Budget] - [Spent]</code>) to automatically calculate new metrics within your datasets.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-purple-100 p-1 rounded text-purple-600"><PieChart size={16} /></div>
              <div>
                <strong className="text-slate-800 block">OData & BI Integration</strong>
                <span className="text-sm text-slate-600">Generate OData URLs to seamlessly connect your datasets to external Business Intelligence tools like Power BI or Tableau.</span>
              </div>
            </li>
          </ul>
        </section>

        {/* AI & Analytics */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="text-orange-500" /> AI & Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-100">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <FileText size={18} className="text-orange-500" /> AI Generator
              </h3>
              <p className="text-sm text-slate-600">Leverage artificial intelligence to automatically generate project narratives, summarize field reports, and draft M&E frameworks based on minimal input.</p>
            </div>
            <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-100">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <PieChart size={18} className="text-orange-500" /> Data Analysis
              </h3>
              <p className="text-sm text-slate-600">Visualize project metrics, beneficiary demographics, and survey responses through interactive charts and custom dashboards.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default DocumentationView;
