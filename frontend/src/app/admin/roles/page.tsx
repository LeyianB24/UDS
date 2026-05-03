"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  Users, 
  Settings,
  Database,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Activity,
  HeartPulse,
  Banknote,
  LayoutDashboard,
  Save
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function AdminRolesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ role_name: '', role_desc: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('admin/roles');
      if (res.status === 'success') {
        setData(res.data);
        if (!selectedRole && res.data.roles.length > 0) {
            setSelectedRole(res.data.roles[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (permId: number, currentStatus: boolean) => {
      if (!selectedRole || selectedRole === 1) return; // Cannot edit superadmin
      
      const newStatus = !currentStatus;
      
      // Optimistic update
      const updatedMap = { ...data.activePermissionsMap };
      if (!updatedMap[selectedRole]) updatedMap[selectedRole] = [];
      
      if (newStatus) {
          updatedMap[selectedRole].push(permId);
      } else {
          updatedMap[selectedRole] = updatedMap[selectedRole].filter((id: number) => id !== permId);
      }
      
      setData({ ...data, activePermissionsMap: updatedMap });

      // API Call
      try {
          const res = await fetchApi('admin/roles', 'POST', {
              action: 'toggle_permission',
              role_id: selectedRole,
              perm_id: permId,
              status: newStatus
          });
          if (res.status !== 'success') {
             // Revert on error
             loadData();
             alert(res.message);
          }
      } catch (e) {
          console.error(e);
          loadData();
      }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await fetchApi('admin/roles', 'POST', { action: 'add_role', ...formData });
          if (res.status === 'success') {
              setShowAddModal(false);
              setFormData({ role_name: '', role_desc: '' });
              loadData();
          } else {
              alert(res.message);
          }
      } catch (e) {
          console.error(e);
      }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await fetchApi('admin/roles', 'POST', { action: 'edit_role', role_id: selectedRole, ...formData });
          if (res.status === 'success') {
              setShowEditModal(false);
              loadData();
          } else {
              alert(res.message);
          }
      } catch (e) {
          console.error(e);
      }
  };

  const handleDelete = async () => {
      if (!selectedRole || selectedRole === 1) return;
      if (!confirm('Are you sure you want to delete this role?')) return;
      try {
          const res = await fetchApi('admin/roles', 'POST', { action: 'delete_role', role_id: selectedRole });
          if (res.status === 'success') {
              setSelectedRole(data.roles[0].id);
              loadData();
          } else {
              alert(res.message);
          }
      } catch (e) {
          console.error(e);
      }
  };

  const openEditModal = () => {
      const role = data?.roles.find((r: any) => r.id === selectedRole);
      if (role) {
          setFormData({ role_name: role.name, role_desc: role.description });
          setShowEditModal(true);
      }
  };

  const getCategoryIcon = (category: string) => {
      const map: any = {
          'Member Management': Users,
          'People & Access': ShieldCheck,
          'Financial Management': Banknote,
          'Loans & Credit': Database,
          'Welfare Module': HeartPulse,
          'System Control Center': LayoutDashboard,
          'Maintenance & Config': Settings
      };
      return map[category] || Activity;
  };

  const activeRoleObj = data?.roles?.find((r: any) => r.id === selectedRole);
  const isSuperadmin = activeRoleObj?.id === 1;

  if (loading && !data) {
      return <div className="p-10 text-center font-bold text-gray-400">Loading roles...</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="bg-[var(--brand-forest)] text-white rounded-[32px] p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl shadow-green-950/20">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest text-lime-400 mb-6">
               <ShieldAlert size={14} /> RBAC Console V24
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none mb-4">
               Access Control.
            </h1>
            <p className="text-white/70 max-w-xl text-sm font-bold leading-relaxed">
               Configure system access levels with <span className="text-lime-400">surgical precision</span>. Changes apply immediately across all active sessions.
            </p>
         </div>

         <div className="relative z-10 flex gap-4">
             <button onClick={() => { setFormData({ role_name: '', role_desc: '' }); setShowAddModal(true); }} className="px-6 py-4 bg-lime-400 text-green-950 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-lime-300 transition-colors flex items-center gap-2 shadow-lg shadow-lime-400/20">
                 <Plus size={16} /> Create Role
             </button>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR: ROLES LIST */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Select Role</h3>
                  <div className="space-y-2">
                      {data?.roles?.map((role: any) => (
                          <button 
                              key={role.id}
                              onClick={() => setSelectedRole(role.id)}
                              className={cn(
                                  "w-full text-left p-4 rounded-2xl transition-all border flex items-center justify-between group",
                                  selectedRole === role.id 
                                      ? "bg-[var(--brand-forest)] text-lime-400 border-[var(--brand-forest)] shadow-md" 
                                      : "bg-gray-50 text-gray-700 border-gray-100 hover:border-gray-300"
                              )}
                          >
                              <div>
                                  <div className={cn("font-black text-sm", selectedRole === role.id ? "text-white" : "")}>{role.name}</div>
                                  <div className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", selectedRole === role.id ? "text-lime-400/70" : "text-gray-400")}>
                                      {data?.activePermissionsMap[role.id]?.length || 0} active perms
                                  </div>
                              </div>
                              {role.id === 1 && <Lock size={14} className={selectedRole === role.id ? "text-lime-400" : "text-gray-400"} />}
                          </button>
                      ))}
                  </div>
              </div>
          </div>

          {/* MAIN CONFIG AREA */}
          {activeRoleObj && (
          <div className="flex-1 space-y-6">
              
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Role Header */}
                  <div className={cn("p-8 border-b", isSuperadmin ? "bg-amber-50/50 border-amber-100" : "bg-gray-50/50 border-gray-100")}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                              <div className="flex items-center gap-3 mb-2">
                                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{activeRoleObj.name}</h2>
                                  {isSuperadmin && (
                                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                                          <Lock size={12} /> System Locked
                                      </span>
                                  )}
                              </div>
                              <p className="text-sm font-bold text-gray-500 max-w-2xl">{activeRoleObj.description}</p>
                          </div>
                          
                          {!isSuperadmin && (
                              <div className="flex gap-2">
                                  <button onClick={openEditModal} className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-[var(--brand-forest)] hover:border-[var(--brand-forest)] transition-colors shadow-sm">
                                      <Edit2 size={16} />
                                  </button>
                                  <button onClick={handleDelete} className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Permissions Grid */}
                  <div className="p-8 space-y-10">
                      {Object.keys(data?.permissionsByCategory || {}).map(category => {
                          const perms = data.permissionsByCategory[category];
                          const activeIds = data.activePermissionsMap[selectedRole] || [];
                          const activeCount = perms.filter((p: any) => activeIds.includes(p.id)).length;
                          const Icon = getCategoryIcon(category);

                          return (
                              <div key={category}>
                                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-lime-50 text-green-800 rounded-xl flex items-center justify-center">
                                              <Icon size={18} />
                                          </div>
                                          <h3 className="text-sm font-black uppercase tracking-widest text-[var(--brand-forest)]">{category}</h3>
                                      </div>
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                          {activeCount} / {perms.length} Active
                                      </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                      {perms.map((perm: any) => {
                                          const isActive = activeIds.includes(perm.id);
                                          return (
                                              <label 
                                                  key={perm.id}
                                                  className={cn(
                                                      "flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group",
                                                      isActive ? "border-lime-400 bg-lime-50/30" : "border-gray-100 bg-gray-50 hover:border-gray-200",
                                                      isSuperadmin ? "opacity-70 cursor-not-allowed bg-gray-50 border-gray-200" : ""
                                                  )}
                                              >
                                                  <div className="mt-0.5 relative z-10">
                                                      <input 
                                                          type="checkbox" 
                                                          className="w-5 h-5 rounded text-[var(--brand-forest)] border-gray-300 focus:ring-[var(--brand-forest)] focus:ring-offset-0 disabled:opacity-50"
                                                          checked={isActive}
                                                          disabled={isSuperadmin}
                                                          onChange={() => handleToggle(perm.id, isActive)}
                                                      />
                                                  </div>
                                                  <div className="relative z-10">
                                                      <div className={cn("text-sm font-black mb-1", isActive ? "text-green-900" : "text-gray-700")}>{perm.name}</div>
                                                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{perm.description || 'System access right'}</div>
                                                  </div>
                                                  
                                                  {isActive && !isSuperadmin && (
                                                      <div className="absolute top-0 right-0 w-16 h-16 bg-lime-400/20 rounded-bl-full -z-0"></div>
                                                  )}
                                              </label>
                                          );
                                      })}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
                  
                  {/* Status Bar */}
                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                          {isSuperadmin ? (
                              <><Lock size={14} className="text-amber-500" /> Superadmin permissions cannot be modified.</>
                          ) : (
                              <><Save size={14} className="text-[var(--brand-forest)]" /> Changes are automatically saved & deployed.</>
                          )}
                      </div>
                  </div>
              </div>
          </div>
          )}
      </div>

      {/* MODALS */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
         <DialogContent className="max-w-md rounded-[32px] p-8 border-none shadow-2xl">
            <div className="mb-8">
               <div className="w-12 h-12 bg-[var(--brand-forest)] text-lime-400 rounded-2xl flex items-center justify-center mb-4"><Plus size={20} /></div>
               <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">Create Role</h3>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Define a new access level.</p>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Role Name</label>
                  <input required type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none" value={formData.role_name} onChange={e => setFormData({...formData, role_name: e.target.value})} placeholder="e.g. Loan Officer" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Description</label>
                  <textarea required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none resize-none h-24" value={formData.role_desc} onChange={e => setFormData({...formData, role_desc: e.target.value})} placeholder="What responsibilities does this role carry?" />
               </div>
               <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-[var(--brand-forest)] text-lime-400 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-green-900 transition-colors shadow-lg shadow-green-900/20">
                     Save Role
                  </button>
               </div>
            </form>
         </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
         <DialogContent className="max-w-md rounded-[32px] p-8 border-none shadow-2xl">
            <div className="mb-8">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Edit2 size={20} /></div>
               <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">Edit Role</h3>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Update role details.</p>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Role Name</label>
                  <input required type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none" value={formData.role_name} onChange={e => setFormData({...formData, role_name: e.target.value})} />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Description</label>
                  <textarea required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none resize-none h-24" value={formData.role_desc} onChange={e => setFormData({...formData, role_desc: e.target.value})} />
               </div>
               <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-[var(--brand-forest)] text-lime-400 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-green-900 transition-colors shadow-lg shadow-green-900/20">
                     Update Role
                  </button>
               </div>
            </form>
         </DialogContent>
      </Dialog>

    </div>
  );
}
