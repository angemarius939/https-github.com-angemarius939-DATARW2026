
import React from 'react';
import { CustomPage } from '../types';
import * as Icons from 'lucide-react';
import { Database, Layout } from 'lucide-react';
import { WidgetRenderer } from './WidgetRenderer';

interface CustomPageViewProps {
  page: CustomPage;
}

const CustomPageView: React.FC<CustomPageViewProps> = ({ page }) => {
  const PageIcon = (Icons as any)[page.icon || 'Layout'] || Layout;

  return (
    <div className="max-w-7xl mx-auto p-8 animate-fade-in pb-20">
       <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100/50">
                <PageIcon size={32} />
             </div>
             <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{page.name}</h1>
                <p className="text-slate-500 font-medium text-lg mt-1">{page.description}</p>
             </div>
          </div>
       </div>

       <div className="space-y-12">
          {page.widgets.map(widget => (
            <div key={widget.id} className="mb-8 h-[500px]">
              <WidgetRenderer widget={widget} />
            </div>
          ))}
          
          {page.widgets.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                  <Layout className="mx-auto text-slate-100 mb-6" size={80} />
                  <h3 className="text-xl font-black text-slate-300 uppercase tracking-[0.2em]">Canvas is empty</h3>
                  <p className="text-slate-300 font-bold mt-2">Map database columns in Settings to populate this page.</p>
              </div>
          )}
       </div>
    </div>
  );
};

export default CustomPageView;
