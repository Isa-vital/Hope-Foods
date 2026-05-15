import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, X, RefreshCw, UserPlus, Search, Shield, ShieldOff, KeyRound } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

const ROLES = ['admin', 'manager', 'waiter', 'kitchen', 'receptionist', 'cashier', 'customer'];

const roleColor = (r) => ({
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-purple-100 text-purple-800',
  waiter: 'bg-blue-100 text-blue-800',
  kitchen: 'bg-orange-100 text-orange-800',
  receptionist: 'bg-teal-100 text-teal-800',
  cashier: 'bg-green-100 text-green-800',
  customer: 'bg-stone-100 text-stone-700',
}[r] || 'bg-stone-100');

const emptyForm = { full_name: '', email: '', phone: '', password: '', role: 'waiter' };

const AdminUsersPage = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', is_active: '', q: '' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await usersApi.list(params);
      setUsers(res.data || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ full_name: u.full_name, email: u.email, phone: u.phone || '', password: '', role: u.role });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const payload = {
          full_name: form.full_name,
          phone: form.phone,
          role: form.role,
        };
        if (form.password) payload.password = form.password;
        await usersApi.update(editing.id, payload);
        Swal.fire({ icon: 'success', title: 'User updated', toast: true, position: 'top-end', timer: 1800, showConfirmButton: false });
      } else {
        await usersApi.create(form);
        Swal.fire({ icon: 'success', title: 'User created', toast: true, position: 'top-end', timer: 1800, showConfirmButton: false });
      }
      setShowForm(false);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Save failed', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u) => {
    try {
      await usersApi.update(u.id, { is_active: !u.is_active });
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: err.message });
    }
  };

  const resetPassword = async (u) => {
    const { value: password } = await Swal.fire({
      title: `Reset password for ${u.full_name}`,
      input: 'password',
      inputLabel: 'New password (min 6 chars)',
      inputAttributes: { minlength: 6, autocapitalize: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Reset',
      confirmButtonColor: '#ea580c',
      inputValidator: (v) => (!v || v.length < 6) && 'Password must be at least 6 characters',
    });
    if (!password) return;
    try {
      await usersApi.update(u.id, { password });
      Swal.fire({ icon: 'success', title: 'Password reset', toast: true, position: 'top-end', timer: 1800, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: err.message });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">User Management</h1>
          <p className="text-stone-600 text-sm">{users.length} user(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw size={16} className="mr-1" />Refresh</Button>
          {me?.role === 'admin' && (
            <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
              <UserPlus size={16} className="mr-1" />Add User
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-stone-400" />
            <input placeholder="Search name, email, phone..." value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm" />
          </div>
          <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm">
            <option value="">All roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filters.is_active} onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm">
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <Button onClick={load} className="bg-orange-600 hover:bg-orange-700 text-white">Apply</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-600 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-600 uppercase text-xs">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3 hidden md:table-cell">Email</th>
                  <th className="text-left p-3 hidden lg:table-cell">Phone</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-left p-3 hidden lg:table-cell">Last Login</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-stone-500">No users found.</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="border-t border-stone-100 hover:bg-stone-50">
                    <td className="p-3 font-medium text-stone-900">
                      {u.full_name}
                      {u.id === me?.id && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">you</span>}
                    </td>
                    <td className="p-3 hidden md:table-cell text-stone-600">{u.email}</td>
                    <td className="p-3 hidden lg:table-cell text-stone-600">{u.phone || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.is_active ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'
                      }`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="p-3 hidden lg:table-cell text-stone-500 text-xs">
                      {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-3 text-right">
                      {me?.role === 'admin' && (
                        <>
                          <button onClick={() => openEdit(u)} title="Edit"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                          <button onClick={() => resetPassword(u)} title="Reset password"
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><KeyRound size={16} /></button>
                          {u.id !== me.id && (
                            <button onClick={() => toggleActive(u)} title={u.is_active ? 'Deactivate' : 'Activate'}
                              className={`p-2 rounded-lg ${u.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                              {u.is_active ? <ShieldOff size={16} /> : <Shield size={16} />}
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">{editing ? 'Edit User' : 'Create User'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-stone-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Full Name</label>
                <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Email</label>
                <input required type="email" value={form.email} disabled={!!editing}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg disabled:bg-stone-100" />
                {editing && <p className="text-xs text-stone-500 mt-1">Email cannot be changed.</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Role</label>
                <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  disabled={editing && editing.id === me?.id}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg disabled:bg-stone-100">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  {editing ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input type="password" minLength={6} required={!editing} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
