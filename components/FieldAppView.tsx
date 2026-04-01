import React, { useState, useEffect } from 'react';
import { Smartphone, Wifi, WifiOff, RefreshCw, CheckCircle2, FileText, ArrowLeft, Save, Clock, AlertCircle, Download, Apple, MonitorSmartphone, Loader2 } from 'lucide-react';
import { FormDefinition, Project, FormSubmission } from '../types';
import { LocationSelector } from './LocationSelector';
import { mockLocations } from '../data/locations';

interface FieldAppViewProps {
  forms: FormDefinition[];
  projects: Project[];
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  onSyncSubmissions: (submissions: FormSubmission[]) => void;
}

const FieldAppView: React.FC<FieldAppViewProps> = ({ forms, projects, onNotify, onSyncSubmissions }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [activeForm, setActiveForm] = useState<FormDefinition | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [syncQueue, setSyncQueue] = useState<FormSubmission[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [view, setView] = useState<'home' | 'form' | 'queue' | 'apps'>('home');
  const [iosStatus, setIosStatus] = useState<'available' | 'installing' | 'active'>('available');
  const [androidStatus, setAndroidStatus] = useState<'available' | 'installing' | 'active'>('available');

  const publishedForms = forms.filter(f => f.publishStatus === 'PUBLISHED');

  // Load queue from local storage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('fieldAppQueue');
    if (savedQueue) {
      try {
        setSyncQueue(JSON.parse(savedQueue));
      } catch (e) {
        console.error("Failed to parse saved queue");
      }
    }
  }, []);

  // Save queue to local storage when it changes
  useEffect(() => {
    localStorage.setItem('fieldAppQueue', JSON.stringify(syncQueue));
  }, [syncQueue]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeForm) return;

    // Filter out data for fields that are currently hidden by conditional logic
    const visibleData: any = {};
    activeForm.fields.forEach(field => {
      if (evaluateCondition(field.condition, formData)) {
        visibleData[field.id] = formData[field.id];
      }
    });

    const newSubmission: FormSubmission = {
      id: 'sub-' + Date.now(),
      formId: activeForm.id,
      formName: activeForm.name,
      data: visibleData,
      timestamp: new Date().toISOString(),
      status: isOffline ? 'pending' : 'synced'
    };

    setSyncQueue(prev => [newSubmission, ...prev]);
    setFormData({});
    setActiveForm(null);
    setView('home');

    if (isOffline) {
      onNotify("Saved offline. Will sync when connected.", "success");
    } else {
      onSyncSubmissions([newSubmission]);
      onNotify("Form submitted successfully.", "success");
    }
  };

  const handleSync = () => {
    if (isOffline) {
      onNotify("Cannot sync while offline.", "error");
      return;
    }

    const pendingItems = syncQueue.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) {
      onNotify("No pending items to sync.", "success");
      return;
    }

    setIsSyncing(true);
    
    // Simulate network delay for syncing
    setTimeout(() => {
      setSyncQueue(prev => prev.map(item => 
        item.status === 'pending' ? { ...item, status: 'synced' } : item
      ));
      onSyncSubmissions(pendingItems.map(item => ({ ...item, status: 'synced' })));
      setIsSyncing(false);
      onNotify(`Successfully synced ${pendingItems.length} items.`, "success");
    }, 1500);
  };

  const clearSynced = () => {
    setSyncQueue(prev => prev.filter(item => item.status !== 'synced'));
    onNotify("Cleared synced items from history.", "success");
  };

  const evaluateCondition = (condition: any, data: any) => {
    if (!condition || !condition.fieldId) return true;
    
    const { fieldId, operator, value } = condition;
    const fieldValue = data[fieldId];
    
    const strFieldValue = String(fieldValue || '').toLowerCase();
    const strValue = String(value || '').toLowerCase();

    switch (operator) {
      case 'equals': return strFieldValue === strValue;
      case 'not_equals': return strFieldValue !== strValue;
      case 'contains': return strFieldValue.includes(strValue);
      case 'greater_than': return Number(fieldValue || 0) > Number(value || 0);
      case 'less_than': return Number(fieldValue || 0) < Number(value || 0);
      default: return true;
    }
  };

  const handleActivateIOS = () => {
    setIosStatus('installing');
    onNotify("Activating iOS App and enabling Mobile Data sync...", "success");
    setTimeout(() => {
      setIosStatus('active');
      onNotify("iOS App Activated Successfully!", "success");
    }, 2000);
  };

  const handleActivateAndroid = () => {
    setAndroidStatus('installing');
    onNotify("Downloading Android APK...", "success");
    setTimeout(() => {
      setAndroidStatus('active');
      onNotify("Android App Installed Successfully!", "success");
    }, 2000);
  };

  const pendingCount = syncQueue.filter(item => item.status === 'pending').length;

  return (
    <div className="p-6 max-w-md mx-auto animate-fade-in h-full flex flex-col bg-slate-50 border-x border-slate-200 shadow-2xl relative overflow-hidden rounded-3xl my-4 min-h-[800px]">
      {/* Mobile App Header */}
      <div className="bg-indigo-600 text-white p-4 -mx-6 -mt-6 rounded-t-3xl shadow-md z-10 relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 font-black tracking-tight">
            <Smartphone size={20} /> FieldApp
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsOffline(!isOffline)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${isOffline ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}
            >
              {isOffline ? <WifiOff size={12} /> : <Wifi size={12} />}
              {isOffline ? 'Offline' : 'Online'}
            </button>
          </div>
        </div>
        
        {view !== 'home' && (
          <button 
            onClick={() => { setView('home'); setActiveForm(null); }}
            className="flex items-center gap-1 text-indigo-100 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        {view === 'home' && (
          <h2 className="text-xl font-bold">Project Monitoring</h2>
        )}
        {view === 'apps' && (
          <h2 className="text-xl font-bold">Mobile Apps</h2>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar -mx-6 px-6 py-6 pb-24">
        
        {/* Home View */}
        {view === 'home' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-indigo-200 transition-colors" onClick={() => setView('queue')}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pendingCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {pendingCount > 0 ? <Clock size={20} /> : <CheckCircle2 size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Sync Status</h3>
                  <p className="text-xs text-slate-500">{pendingCount} pending items</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleSync(); }}
                disabled={isOffline || pendingCount === 0 || isSyncing}
                className={`p-2 rounded-full transition-all ${isOffline || pendingCount === 0 ? 'text-slate-300' : 'text-indigo-600 hover:bg-indigo-50'}`}
              >
                <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
              </button>
            </div>

            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Available Forms</h3>
              <div className="space-y-3">
                {publishedForms.length > 0 ? publishedForms.map(form => (
                  <div 
                    key={form.id} 
                    onClick={() => { setActiveForm(form); setView('form'); }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{form.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{form.description}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center p-8 bg-white rounded-2xl border border-slate-100 border-dashed">
                    <AlertCircle className="mx-auto text-slate-300 mb-2" size={24} />
                    <p className="text-sm text-slate-500">No published forms available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form View */}
        {view === 'form' && activeForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-black text-lg text-slate-800 mb-1">{activeForm.name}</h3>
            <p className="text-xs text-slate-500 mb-6">{activeForm.description}</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {activeForm.fields.filter(field => evaluateCondition(field.condition, formData)).map(field => (
                <div key={field.id} className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'text' && (
                    <input 
                      type="text" 
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                  )}

                  {field.type === 'number' && (
                    <input 
                      type="number" 
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                  )}

                  {field.type === 'date' && (
                    <input 
                      type="date" 
                      required={field.required}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                  )}

                  {field.type === 'dropdown' && (
                    <select 
                      required={field.required}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                    >
                      <option value="">Select an option...</option>
                      {field.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'checkbox' && (
                    <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                      <input 
                        type="checkbox" 
                        required={field.required}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={formData[field.id] || false}
                        onChange={(e) => handleInputChange(field.id, e.target.checked)}
                      />
                      <span className="text-sm text-slate-700">{field.label}</span>
                    </label>
                  )}

                  {field.type === 'location' && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <LocationSelector 
                        locations={mockLocations}
                        onLocationChange={(loc) => {
                          const specificLoc = loc.village || loc.cell || loc.sector || loc.district || loc.province || '';
                          handleInputChange(field.id, specificLoc);
                        }}
                      />
                      {formData[field.id] && (
                        <p className="text-xs text-indigo-600 font-medium mt-2">Selected: {formData[field.id]}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Save size={18} /> {isOffline ? 'Save Offline' : 'Submit Form'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Queue View */}
        {view === 'queue' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sync History</h3>
              {syncQueue.some(i => i.status === 'synced') && (
                <button onClick={clearSynced} className="text-xs text-indigo-600 font-bold hover:underline">Clear Synced</button>
              )}
            </div>
            
            <div className="space-y-3">
              {syncQueue.length > 0 ? syncQueue.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.formName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                    item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    item.status === 'synced' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status === 'pending' && <Clock size={10} />}
                    {item.status === 'synced' && <CheckCircle2 size={10} />}
                    {item.status}
                  </div>
                </div>
              )) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-100 border-dashed">
                  <CheckCircle2 className="mx-auto text-slate-300 mb-2" size={24} />
                  <p className="text-sm text-slate-500">No items in history.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Apps View */}
        {view === 'apps' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-indigo-900">
              <h3 className="font-black text-lg mb-2 flex items-center gap-2">
                <MonitorSmartphone size={20} className="text-indigo-600" />
                Offline Data Collection
              </h3>
              <p className="text-sm text-indigo-700/80 leading-relaxed">
                Download our native mobile apps to collect data for Beneficiaries and Surveys completely offline. The apps will automatically sync when connected to WiFi or Mobile Data.
              </p>
            </div>

            <div className="space-y-4">
              {/* Android App Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg">Android App</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Version 1.0.0 • 25 MB • Android 5.0+</p>
                    </div>
                  </div>
                </div>
                <ul className="text-sm text-slate-600 space-y-2 mb-5">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Offline Collection</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Auto-Sync</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Secure Access</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> GPS Tracking</li>
                </ul>
                <button 
                  onClick={handleActivateAndroid}
                  disabled={androidStatus !== 'available'}
                  className={`w-full py-3 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md ${
                    androidStatus === 'active' ? 'bg-emerald-500' : 
                    androidStatus === 'installing' ? 'bg-emerald-400 cursor-not-allowed' : 
                    'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {androidStatus === 'available' && <><Download size={18} /> Download APK</>}
                  {androidStatus === 'installing' && <><Loader2 size={18} className="animate-spin" /> Installing...</>}
                  {androidStatus === 'active' && <><CheckCircle2 size={18} /> App Active</>}
                </button>
              </div>

              {/* iOS App Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      <Apple size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg">iOS App</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Version 1.0.0 • 32 MB • iOS 12.0+</p>
                    </div>
                  </div>
                </div>
                <ul className="text-sm text-slate-600 space-y-2 mb-5">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Offline Collection</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Auto-Sync</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Secure Access</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> GPS Tracking</li>
                </ul>
                <button 
                  onClick={handleActivateIOS}
                  disabled={iosStatus !== 'available'}
                  className={`w-full py-3 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md ${
                    iosStatus === 'active' ? 'bg-emerald-500' : 
                    iosStatus === 'installing' ? 'bg-blue-400 cursor-not-allowed' : 
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {iosStatus === 'available' && <><Download size={18} /> Activate iOS App</>}
                  {iosStatus === 'installing' && <><Loader2 size={18} className="animate-spin" /> Activating...</>}
                  {iosStatus === 'active' && <><CheckCircle2 size={18} /> App Active</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile App Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-around items-center z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' || view === 'form' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <FileText size={20} />
          <span className="text-[10px] font-bold">Forms</span>
        </button>
        <button onClick={() => setView('queue')} className={`flex flex-col items-center gap-1 relative ${view === 'queue' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <RefreshCw size={20} />
          <span className="text-[10px] font-bold">Sync</span>
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {pendingCount}
            </span>
          )}
        </button>
        <button onClick={() => setView('apps')} className={`flex flex-col items-center gap-1 ${view === 'apps' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Download size={20} />
          <span className="text-[10px] font-bold">Get App</span>
        </button>
      </div>
    </div>
  );
};

export default FieldAppView;
