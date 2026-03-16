
import React, { useState, useRef } from 'react';
import { 
  HardDrive, Folder, FileText, Search, Plus, 
  MoreVertical, Download, Clock, Filter, 
  Trash2, Loader2, X, UploadCloud, CheckCircle,
  FileJson, FileSpreadsheet
} from 'lucide-react';

interface DocumentsViewProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  docs: any[];
  setDocs: React.Dispatch<React.SetStateAction<any[]>>;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ onNotify, docs, setDocs }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', 'Proposals', 'Reports', 'Agreements', 'Field Data', 'Media'];

  const filteredDocs = docs.filter(d => {
    const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (filteredDocs.length === 0) {
      onNotify("No documents to export", "error");
      return;
    }

    const dataToExport = filteredDocs.map(doc => ({
      ID: doc.id,
      Name: doc.name,
      Type: doc.type,
      Category: doc.category,
      Size: doc.size,
      Owner: doc.owner,
      Date: doc.date
    }));

    let content = '';
    let mimeType = '';
    let extension = '';

    if (format === 'csv') {
      const headers = Object.keys(dataToExport[0]).join(',');
      const rows = dataToExport.map(row => Object.values(row).map(val => `"${val}"`).join(','));
      content = [headers, ...rows].join('\n');
      mimeType = 'text/csv;charset=utf-8;';
      extension = 'csv';
    } else if (format === 'json') {
      content = JSON.stringify(dataToExport, null, 2);
      mimeType = 'application/json;charset=utf-8;';
      extension = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `documents_export_${new Date().toISOString().split('T')[0]}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify(`Exported ${filteredDocs.length} documents as ${format.toUpperCase()}`, 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            
            // Add the new file to the list
            const newDoc = {
              id: Date.now(),
              name: file.name,
              type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
              category: activeCategory !== 'All' ? activeCategory : 'Proposals', // Default to current category
              size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
              owner: 'Current User',
              date: new Date().toISOString().split('T')[0]
            };
            
            setDocs(currentDocs => [newDoc, ...currentDocs]);
            onNotify("File uploaded successfully to secure repository", "success");
            
            // Reset input
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Repository</h1>
          <p className="text-slate-500">Secure storage for your organizational knowledge and records.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button 
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg text-xs font-bold transition-all"
              title="Export as CSV"
            >
              <FileSpreadsheet size={16} /> CSV
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button 
              onClick={() => handleExport('json')}
              className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg text-xs font-bold transition-all"
              title="Export as JSON"
            >
              <FileJson size={16} /> JSON
            </button>
          </div>
          <button 
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg transition-all"
          >
            <Plus size={18} /> Upload Document
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-3 mb-4">Categories</h3>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-3 ${activeCategory === cat ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Folder size={16} className={activeCategory === cat ? 'text-indigo-600' : 'text-slate-300'} />
                {cat}
              </button>
            ))}
          </div>
          <div className="mt-6 bg-slate-900 rounded-2xl p-5 text-white shadow-xl overflow-hidden relative">
            <h4 className="font-bold text-sm mb-1 relative z-10">Cloud Storage</h4>
            <div className="text-2xl font-black relative z-10">12.4 <span className="text-slate-500 text-sm">GB</span></div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-4 relative z-10"><div className="bg-indigo-500 h-full" style={{width: '25%'}}></div></div>
            <HardDrive className="absolute -bottom-6 -right-6 text-white/5" size={140} />
          </div>
        </aside>

        <div className="flex-1 space-y-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search files by name..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">File Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Last Modified</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg bg-indigo-50 text-indigo-600`}><FileText size={18} /></div><div className="font-bold text-slate-900">{doc.name}</div></div></td>
                    <td className="px-6 py-4 text-slate-600">{doc.category}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{doc.date}</td>
                    <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => onNotify(`Downloading ${doc.name}`)} className="p-2 text-slate-400 hover:text-indigo-600"><Download size={18}/></button><button onClick={() => onNotify("File deletion restricted", "error")} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-in">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                 <UploadCloud size={40} className={uploadProgress < 100 ? 'animate-bounce' : ''} />
                 {uploadProgress === 100 && <div className="absolute inset-0 flex items-center justify-center bg-indigo-600 rounded-full"><CheckCircle size={40} className="text-white animate-scale-in" /></div>}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{uploadProgress < 100 ? 'Uploading Securely' : 'Upload Complete'}</h3>
              <p className="text-slate-500 text-sm mb-6">Encrypting and syncing with organization servers...</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                 <div className="bg-indigo-600 h-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
              </div>
              <div className="mt-2 text-xs font-bold text-indigo-600 uppercase tracking-widest">{uploadProgress}%</div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsView;
