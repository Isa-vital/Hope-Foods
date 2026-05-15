import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, RefreshCw, Upload } from 'lucide-react';
import { menuApi, api, formatUGX, uploadsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

const emptyForm = {
  category_id: '',
  name: '',
  description: '',
  price: '',
  image: '',
  preparation_time: 15,
  is_featured: false,
  is_available: true
};

const AdminMenuPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadsApi.image(file);
      setForm((f) => ({ ...f, image: res.data.url }));
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Upload failed', text: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes] = await Promise.all([
        api.get('/menu/items'),
        menuApi.getCategories()
      ]);
      setItems(itemsRes.data || []);
      setCategories(catsRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, category_id: categories[0]?.id || '' });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      category_id: item.category_id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      image: item.image || '',
      preparation_time: item.preparation_time,
      is_featured: !!item.is_featured,
      is_available: !!item.is_available
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editing) {
        await menuApi.updateItem(editing.id, payload);
        Swal.fire({ icon: 'success', title: 'Item updated', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      } else {
        await menuApi.createItem(payload);
        Swal.fire({ icon: 'success', title: 'Item created', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      }
      setShowForm(false);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Save failed', text: err.message, confirmButtonColor: '#ea580c' });
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async (item) => {
    const result = await Swal.fire({
      title: `Disable ${item.name}?`,
      text: 'Item will be hidden from customers.',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#dc2626', confirmButtonText: 'Disable'
    });
    if (!result.isConfirmed) return;
    try {
      await menuApi.deleteItem(item.id);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: err.message });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Menu Management</h1>
          <p className="text-stone-600 text-sm">{items.length} item(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw size={16} className="mr-1" />Refresh</Button>
          <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus size={16} className="mr-1" />Add Item
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-600 uppercase text-xs">
                <tr>
                  <th className="text-left p-3">Image</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3 hidden md:table-cell">Category</th>
                  <th className="text-right p-3">Price</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-stone-100 hover:bg-stone-50">
                    <td className="p-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center">🍽️</div>
                      )}
                    </td>
                    <td className="p-3 font-medium text-stone-900">{item.name}</td>
                    <td className="p-3 hidden md:table-cell text-stone-600">{item.category_name}</td>
                    <td className="p-3 text-right font-semibold">{formatUGX(item.price)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.is_available ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'
                      }`}>{item.is_available ? 'Active' : 'Hidden'}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDisable(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="text-xl font-bold text-stone-900">{editing ? 'Edit Item' : 'Add Menu Item'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-stone-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Category</label>
                <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Price (UGX)</label>
                  <input required type="number" min="0" step="100" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Prep Time (min)</label>
                  <input type="number" min="1" value={form.preparation_time}
                    onChange={(e) => setForm({ ...form, preparation_time: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Image</label>
                {form.image && (
                  <div className="mb-2 flex items-center gap-2">
                    <img src={form.image} alt="preview" className="w-20 h-20 rounded-lg object-cover border" />
                    <button type="button" onClick={() => setForm({ ...form, image: '' })}
                      className="text-xs text-red-600 hover:underline">Remove</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="Paste URL or upload" className="flex-1 px-3 py-2 border border-stone-300 rounded-lg" />
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="px-3 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50 flex items-center gap-1 text-sm">
                    <Upload size={14} />{uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_available}
                    onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
                  <span className="text-sm">Available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                  <span className="text-sm">Featured</span>
                </label>
              </div>
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

export default AdminMenuPage;
