"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Plus,
  MoreVertical,
  Briefcase,
  FileText,
  Mail,
  Phone,
  Edit2,
  Lock,
  Wallet,
  Calendar
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminEmployeesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('hr');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const [formData, setFormData] = useState({
      full_name: '', national_id: '', phone: '', personal_email: '',
      job_title: '', grade_id: '', salary: '', hire_date: new Date().toISOString().split('T')[0],
      kra_pin: '', nssf_no: '', sha_no: '', bank_name: '', bank_account: '', status: 'active'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`admin/employees?view=${view}&q=${searchQuery}`);
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [view, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGradeChange = (e: any) => {
      const gradeId = e.target.value;
      const grade = data?.grades?.find((g: any) => g.id.toString() === gradeId);
      if (grade) {
          setFormData({ ...formData, grade_id: gradeId, salary: grade.basic_salary });
      }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await fetchApi('admin/employees', 'POST', { action: 'add_employee', ...formData });
          if (res.status === 'success') {
              setShowAddModal(false);
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
          const res = await fetchApi('admin/employees', 'POST', { 
              action: 'update_employee', 
              employee_id: selectedEmployee.employee_id,
              ...formData 
          });
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

  const openEditModal = (emp: any) => {
      setSelectedEmployee(emp);
      setFormData({
          ...formData,
          full_name: emp.full_name,
          national_id: emp.national_id || '',
          phone: emp.phone || '',
          job_title: emp.job_title || '',
          salary: emp.salary || '',
          kra_pin: emp.kra_pin || '',
          nssf_no: emp.nssf_no || '',
          sha_no: emp.sha_no || '',
          status: emp.status || 'active'
      });
      setShowEditModal(true);
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="bg-[var(--brand-forest)] text-white rounded-[32px] p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest text-lime-400 mb-6">
               <Users size={14} /> Staff Command Center
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none mb-4">
               HR & Identity.
            </h1>
            <p className="text-white/70 max-w-xl text-sm font-bold leading-relaxed">
               Manage your talent ecosystem. Hire, compensate, and secure your workforce with <span className="text-lime-400">vibrant efficiency</span>.
            </p>
            <div className="mt-8 flex gap-4">
               <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-lime-400 text-green-950 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-lime-300 transition-colors flex items-center gap-2">
                  <Plus size={16} /> Hire Employee
               </button>
            </div>
         </div>

         {/* Hero Stat */}
         <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shrink-0 text-center hidden lg:block">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Active Staff</div>
            <div className="text-6xl font-black text-lime-400 tracking-tighter">{data?.stats?.activeStaff || 0}</div>
         </div>
      </div>

      {/* KPI TIERS */}
      {view === 'hr' && (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: data?.stats?.totalStaff, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Monthly Payroll', value: \`KES \${Number(data?.stats?.monthlyPayroll || 0).toLocaleString()}\`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Drivers', value: data?.stats?.activeDrivers, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
             <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
                <stat.icon size={20} />
             </div>
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
             <div className="text-2xl font-black text-gray-900 tracking-tight mt-1">{stat.value}</div>
          </div>
        ))}
      </div>
      )}

      {/* TABS & SEARCH */}
      <div className="bg-white border border-gray-200 rounded-2xl p-2 flex flex-col sm:flex-row gap-4 justify-between items-center">
         <div className="flex p-1 bg-gray-50 rounded-xl w-full sm:w-auto">
            <button onClick={() => setView('hr')} className={cn("flex-1 sm:px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all", view === 'hr' ? "bg-white text-[var(--brand-forest)] shadow-sm" : "text-gray-500 hover:text-gray-700")}>
               Directory
            </button>
            <button onClick={() => setView('leave')} className={cn("flex-1 sm:px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all", view === 'leave' ? "bg-white text-[var(--brand-forest)] shadow-sm" : "text-gray-500 hover:text-gray-700")}>
               Leave Status
            </button>
         </div>
         <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
               type="text" 
               placeholder="Search employees..." 
               className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                     <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Employee</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Role & Grade</th>
                     {view === 'hr' && <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Contact</th>}
                     {view === 'hr' && <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Salary</th>}
                     <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {loading ? (
                     <tr><td colSpan={6} className="p-8 text-center text-sm font-bold text-gray-400">Loading...</td></tr>
                  ) : data?.employees?.length === 0 ? (
                     <tr><td colSpan={6} className="p-12 text-center">
                        <Users size={32} className="mx-auto text-gray-300 mb-3" />
                        <div className="text-sm font-black text-gray-900">No employees found</div>
                     </td></tr>
                  ) : (
                     data?.employees?.map((emp: any) => (
                        <tr key={emp.employee_id} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-green-900 text-lime-400 flex items-center justify-center font-black text-xs shrink-0">
                                    {emp.full_name.substring(0,2).toUpperCase()}
                                 </div>
                                 <div>
                                    <div className="text-sm font-black text-gray-900">{emp.full_name}</div>
                                    <div className="text-[10px] font-bold text-gray-500 font-mono">{emp.employee_no}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gray-100 text-[10px] font-black text-gray-700 tracking-wider">
                                 {emp.job_title}
                              </div>
                              {emp.grade_name && <div className="text-[10px] font-bold text-gray-400 mt-1">{emp.grade_name}</div>}
                           </td>
                           
                           {view === 'hr' && (
                              <td className="px-6 py-4">
                                 <div className="text-xs font-bold text-gray-700">{emp.phone}</div>
                                 <div className="text-[10px] font-bold text-gray-400 mt-0.5">{emp.company_email}</div>
                              </td>
                           )}

                           {view === 'hr' && (
                              <td className="px-6 py-4">
                                 <div className="text-sm font-black text-[var(--brand-forest)]">KES {Number(emp.salary).toLocaleString()}</div>
                              </td>
                           )}

                           <td className="px-6 py-4">
                              <span className={cn(
                                 "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border",
                                 emp.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                 emp.status === 'suspended' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                 emp.status === 'on_leave' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                 "bg-red-50 text-red-700 border-red-200"
                              )}>
                                 {emp.status}
                              </span>
                           </td>
                           
                           <td className="px-6 py-4 text-right">
                              <button onClick={() => openEditModal(emp)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors ml-auto">
                                 <Edit2 size={14} />
                              </button>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* ADD MODAL */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
         <DialogContent className="max-w-3xl rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-[var(--brand-forest)] p-6 md:p-8 text-white relative">
               <h3 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-3"><Plus className="text-lime-400" /> Onboard Talent</h3>
               <p className="text-sm text-white/70 font-bold">Fill in details to generate this employee's system identity.</p>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 md:p-8 bg-gray-50 max-h-[70vh] overflow-y-auto space-y-6">
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-4 border-b pb-2"><User size={14} /> Personal Identity</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Full Name</label>
                        <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">National ID</label>
                        <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.national_id} onChange={e => setFormData({...formData, national_id: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Mobile Phone</label>
                        <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Personal Email</label>
                        <input type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.personal_email} onChange={e => setFormData({...formData, personal_email: e.target.value})} />
                     </div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-4 border-b pb-2"><Briefcase size={14} /> Role & Compensation</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Job Title</label>
                        <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})}>
                           <option value="">Select...</option>
                           {data?.jobTitles?.map((t: any) => <option key={t.title} value={t.title}>{t.title}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Salary Grade</label>
                        <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.grade_id} onChange={handleGradeChange}>
                           <option value="">Select...</option>
                           {data?.grades?.map((g: any) => <option key={g.id} value={g.id}>{g.grade_name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Hire Date</label>
                        <input required type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.hire_date} onChange={e => setFormData({...formData, hire_date: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Salary (KES)</label>
                        <input required type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white text-green-700" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                     </div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-4 border-b pb-2"><FileText size={14} /> Statutory & Banking</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                     <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">KRA PIN</label>
                        <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white uppercase" value={formData.kra_pin} onChange={e => setFormData({...formData, kra_pin: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">NSSF</label>
                        <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.nssf_no} onChange={e => setFormData({...formData, nssf_no: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">SHA</label>
                        <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.sha_no} onChange={e => setFormData({...formData, sha_no: e.target.value})} />
                     </div>
                  </div>
               </div>
               
               <div className="pt-4 pb-8 flex justify-end">
                  <button type="submit" className="px-8 py-4 bg-[var(--brand-forest)] text-lime-400 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-green-900 transition-colors w-full sm:w-auto text-center shadow-xl shadow-green-900/20">
                     Complete Onboarding
                  </button>
               </div>
            </form>
         </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
         <DialogContent className="max-w-2xl rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white">
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center gap-4 bg-gray-50">
               <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                  <Edit2 size={20} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Edit Employee</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Update staff details</p>
               </div>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 md:p-8 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                     <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Full Name</label>
                     <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Phone</label>
                     <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Job Title</label>
                     <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})}>
                        <option value="">Select...</option>
                        {data?.jobTitles?.map((t: any) => <option key={t.title} value={t.title}>{t.title}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Salary (KES)</label>
                     <input required type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white text-green-700" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Status</label>
                     <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="terminated">Terminated</option>
                        <option value="on_leave">On Leave</option>
                     </select>
                  </div>
               </div>
               
               <div className="pt-4 flex justify-end">
                  <button type="submit" className="px-6 py-3 bg-[var(--brand-forest)] text-lime-400 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-900 transition-colors w-full sm:w-auto text-center shadow-xl shadow-green-900/20">
                     Update Details
                  </button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
}
