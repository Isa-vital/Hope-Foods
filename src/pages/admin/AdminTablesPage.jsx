import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, RefreshCw } from 'lucide-react';
import { tablesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

const emptyForm = { table_number: '', capacity: 2, location: '', status: 'available', is_active: true };

const STATUS_STYLES = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  maintenance: 'bg-stone-200 text-stone-700'
};

const AdminTablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await tablesApi.list();
      setTables(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({
      table_number: t.table_number, capacity: t.capacity, location: t.location || '',
      status: t.status, is_active: !!t.is_active
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity) };
      if (editing) await tablesApi.update(editing.id, payload);
      else await tablesApi.create(payload);
      Swal.fire({ icon: 'success', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false, title: 'Saved' });
      setShowForm(false);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Save failed', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async (t) => {
    const r = await Swal.fire({
      title: `Disable table ${t.table_number}?`, icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Disable'
    });
    if (!r.isConfirmed) return;
    await tablesApi.remove(t.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Tables</h1>
          <p className="text-stone-600 text-sm">{tables.length} table(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw size={16} className="mr-1" />Refresh</Button>
          <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus size={16} className="mr-1" />Add Table
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {tables.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-stone-900">{t.table_number}</p>
              <p className="text-sm text-stone-600">Cap {t.capacity}</p>
              {t.location && <p className="text-xs text-stone-500">{t.location}</p>}
              <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[t.status]}`}>{t.status}</span>
              <div className="flex justify-center gap-1 mt-2">
                <button onClick={() => openEdit(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                <button onClick={() => handleDisable(t)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="text-xl font-bold text-stone-900">{editing ? 'Edit Table' : 'Add Table'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-stone-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Table Number</label>
                <input required value={form.table_number} onChange={(e) => setForm({ ...form, table_number: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Capacity</label>
                <input required type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Outdoor, Window, Main"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              {editing && (
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg">
                    <option value="available">available</option>
                    <option value="occupied">occupied</option>
                    <option value="reserved">reserved</option>
                    <option value="maintenance">maintenance</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                  {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminTablesPage;
