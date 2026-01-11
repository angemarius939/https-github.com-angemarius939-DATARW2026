
import React, { useState } from 'react';
import { 
  HardDrive, Folder, FileText, Search, Plus, 
  MoreVertical, Download, Clock, Filter, 
  Trash2, Loader2, X, UploadCloud, CheckCircle
} from 'lucide-react';

interface DocumentsViewProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ onNotify }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const docs = [
    { id: 1, name: 'Water_Project_Proposal_Final.pdf', type: 'PDF', category: 'Proposals', size: '2.4 MB', owner: 'Jean B.', date: '2024-03-10' },
    { id: 2, name: 'MoU_Ministry_of_Health.pdf', type: 'PDF', category: 'Agreements', size: '1.1 MB', owner: 'Admin', date: '2024-01-05' },
    { id: 3, name: 'Beneficiary_Survey_Results.csv', type: 'CSV', category: 'Field Data', size: '15.2 MB', owner: 'Eric M.', date: '2024-04-12' },
    { id: 4, name: 'Annual_Impact_Report_2023.docx', type: 'DOCX', category: 'Reports', size: '4.8 MB', owner: 'Marie C.', date: '2024-01-20' },
    { id: 5, name: 'Site_Photos_Musanze.zip', type: 'ZIP', category: 'Media', size: '45.0 MB', owner: 'Jean B.', date: '2024-02-15' },
  ];

  const categories = ['All', 'Proposals', 'Reports', 'Agreements', 'Field Data', 'Media'];

  const filteredDocs = docs.filter(d => {
    const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            onNotify("File uploaded successfully to secure repository");
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
        <button 
          onClick={handleUpload}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg transition-all"
        >
          <Plus size={18} /> Upload Document
        </button>
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
