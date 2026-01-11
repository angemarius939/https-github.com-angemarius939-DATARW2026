
import React, { useState } from 'react';
import { 
  Users, Search, UserPlus, Shield, Mail, 
  MoreVertical, CheckCircle, Clock, Trash2, 
  Settings, UserCheck, Smartphone, MapPin,
  Plus, X, Loader2
} from 'lucide-react';

interface TeamViewProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

const TeamView: React.FC<TeamViewProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'roles'>('members');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'Field Officer' });

  const team = [
    { id: 1, name: 'Jean Bosco N.', email: 'bosco@saverwanda.org', role: 'Admin', status: 'Online', lastActive: 'Now', avatar: 'JB' },
    { id: 2, name: 'Marie Claire U.', email: 'marie@saverwanda.org', role: 'Project Manager', status: 'Offline', lastActive: '2h ago', avatar: 'MC' },
    { id: 3, name: 'Eric Mutabazi', email: 'eric@saverwanda.org', role: 'Field Officer', status: 'Online', lastActive: '15m ago', avatar: 'EM' },
  ];

  const handleInvite = () => {
    if (!inviteData.email) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsInviteModalOpen(false);
      onNotify(`Invitation sent to ${inviteData.email}`, "success");
      setInviteData({ email: '', role: 'Field Officer' });
    }, 1500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-500">Manage access permissions for your organization.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg"
        >
          <UserPlus size={18} /> Invite Member
        </button>
      </div>

      <div className="flex bg-white rounded-xl border border-slate-200 p-1 w-fit mb-8 shadow-sm">
        <button onClick={() => setActiveTab('members')} className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'members' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Members</button>
        <button onClick={() => setActiveTab('roles')} className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'roles' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Roles</button>
      </div>

      {activeTab === 'members' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {team.map(member => (
             <div key={member.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all group">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 font-bold text-lg border border-slate-200 shadow-sm">{member.avatar}</div>
                   <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{member.name}</h3>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`}></span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{member.email}</p>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">{member.role}</span>
                   </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Clock size={10}/> {member.lastActive}</span>
                  <button className="text-slate-300 hover:text-slate-600"><MoreVertical size={16}/></button>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
           Organization Roles are standardized. Upgrade to Enterprise to create custom permission sets.
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="p-8 pb-4 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-slate-900">Invite Colleague</h3>
                 <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={24}/></button>
              </div>
              <div className="p-8 pt-0 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Work Email</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="colleague@saverwanda.org" value={inviteData.email} onChange={(e) => setInviteData({...inviteData, email: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">System Role</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={inviteData.role} onChange={(e) => setInviteData({...inviteData, role: e.target.value})}>
                       <option value="Admin">Administrator</option>
                       <option value="Project Manager">Project Manager</option>
                       <option value="Field Officer">Field Officer</option>
                    </select>
                 </div>
                 <button onClick={handleInvite} disabled={isSending || !inviteData.email} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                    {isSending ? <Loader2 className="animate-spin" size={20} /> : <Mail size={20} />}
                    Send Invitation
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeamView;
