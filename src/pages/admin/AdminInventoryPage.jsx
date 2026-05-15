import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, Package, TrendingUp, TrendingDown, AlertTriangle, Truck } from 'lucide-react';
import { inventoryApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

const emptyItem = { name: '', unit: 'kg', current_stock: 0, minimum_stock: 0, unit_cost: 0, supplier_id: '', category: '' };
const emptySupplier = { name: '', contact_person: '', phone: '', email: '', address: '' };
const emptyTxn = { inventory_item_id: '', transaction_type: 'purchase', quantity: 0, unit_cost: '', notes: '' };

const TXN_BADGES = {
  purchase: 'bg-green-100 text-green-800',
  usage: 'bg-orange-100 text-orange-800',
  waste: 'bg-red-100 text-red-800',
  adjustment: 'bg-blue-100 text-blue-800'
};

const AdminInventoryPage = () => {
  const [tab, setTab] = useState('items');
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLow, setShowLow] = useState(false);

  // Modals
  const [itemModal, setItemModal] = useState(null);   // null | 'new' | row
  const [supplierModal, setSupplierModal] = useState(null);
  const [txnModal, setTxnModal] = useState(null);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [supplierForm, setSupplierForm] = useState(emptySupplier);
  const [txnForm, setTxnForm] = useState(emptyTxn);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [i, s, t] = await Promise.all([
        inventoryApi.listItems(showLow ? { low_stock: 'true' } : {}),
        inventoryApi.listSuppliers(),
        inventoryApi.listTransactions({ limit: 50 })
      ]);
      setItems(i.data || []);
      setSuppliers(s.data || []);
      setTransactions(t.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [showLow]);

  // ---- Items ----
  const openNewItem = () => {
    setItemModal('new');
    setItemForm({ ...emptyItem, supplier_id: suppliers[0]?.id || '' });
  };
  const openEditItem = (it) => {
    setItemModal(it);
    setItemForm({
      name: it.name, unit: it.unit, current_stock: it.current_stock,
      minimum_stock: it.minimum_stock, unit_cost: it.unit_cost,
      supplier_id: it.supplier_id || '', category: it.category || ''
    });
  };
  const saveItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...itemForm,
        supplier_id: itemForm.supplier_id || null,
        current_stock: Number(itemForm.current_stock),
        minimum_stock: Number(itemForm.minimum_stock),
        unit_cost: Number(itemForm.unit_cost),
      };
      if (itemModal === 'new') await inventoryApi.createItem(payload);
      else await inventoryApi.updateItem(itemModal.id, payload);
      setItemModal(null);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Save failed', text: err.message });
    } finally {
      setSaving(false);
    }
  };
  const deleteItem = async (it) => {
    const c = await Swal.fire({
      icon: 'warning', title: `Delete ${it.name}?`,
      showCancelButton: true, confirmButtonColor: '#dc2626'
    });
    if (!c.isConfirmed) return;
    try { await inventoryApi.deleteItem(it.id); load(); }
    catch (err) { Swal.fire({ icon: 'error', title: 'Failed', text: err.message }); }
  };

  // ---- Suppliers ----
  const openNewSupplier = () => { setSupplierModal('new'); setSupplierForm(emptySupplier); };
  const openEditSupplier = (s) => {
    setSupplierModal(s);
    setSupplierForm({
      name: s.name, contact_person: s.contact_person || '',
      phone: s.phone || '', email: s.email || '', address: s.address || ''
    });
  };
  const saveSupplier = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (supplierModal === 'new') await inventoryApi.createSupplier(supplierForm);
      else await inventoryApi.updateSupplier(supplierModal.id, supplierForm);
      setSupplierModal(null);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Save failed', text: err.message });
    } finally { setSaving(false); }
  };
  const deleteSupplier = async (s) => {
    const c = await Swal.fire({
      icon: 'warning', title: `Delete supplier ${s.name}?`,
      showCancelButton: true, confirmButtonColor: '#dc2626'
    });
    if (!c.isConfirmed) return;
    try { await inventoryApi.deleteSupplier(s.id); load(); }
    catch (err) { Swal.fire({ icon: 'error', title: 'Failed', text: err.message }); }
  };

  // ---- Transactions ----
  const openTxn = (item) => {
    setTxnForm({
      ...emptyTxn,
      inventory_item_id: item?.id || items[0]?.id || '',
      unit_cost: item?.unit_cost || ''
    });
    setTxnModal(true);
  };
  const saveTxn = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await inventoryApi.recordTransaction({
        inventory_item_id: Number(txnForm.inventory_item_id),
        transaction_type: txnForm.transaction_type,
        quantity: Number(txnForm.quantity),
        unit_cost: txnForm.unit_cost ? Number(txnForm.unit_cost) : null,
        notes: txnForm.notes || null,
      });
      setTxnModal(null);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message });
    } finally { setSaving(false); }
  };

  const lowStockCount = items.filter((i) => Number(i.current_stock) <= Number(i.minimum_stock)).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-stone-900">Inventory</h1>
        <div className="flex gap-2">
          {['items', 'suppliers', 'transactions'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${tab === t ? 'bg-orange-600 text-white' : 'bg-white text-stone-700'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Items tab */}
      {tab === 'items' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm text-sm">
                <input type="checkbox" checked={showLow} onChange={(e) => setShowLow(e.target.checked)} />
                Low stock only
              </label>
              {lowStockCount > 0 && !showLow && (
                <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1">
                  <AlertTriangle size={14} />{lowStockCount} low
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => openTxn()} disabled={!items.length}
                variant="outline" className="bg-white">
                <Package size={16} className="mr-2" />Record Movement
              </Button>
              <Button onClick={openNewItem} className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus size={16} className="mr-2" />Add Item
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-700">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-right p-3">Stock</th>
                  <th className="text-right p-3">Min</th>
                  <th className="text-right p-3">Unit Cost</th>
                  <th className="text-left p-3">Supplier</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-6 text-center text-stone-500">Loading...</td></tr>
                ) : !items.length ? (
                  <tr><td colSpan={7} className="p-6 text-center text-stone-500">No items</td></tr>
                ) : items.map((it) => {
                  const low = Number(it.current_stock) <= Number(it.minimum_stock);
                  return (
                    <tr key={it.id} className="border-t border-stone-100 hover:bg-stone-50">
                      <td className="p-3 font-semibold">{it.name}</td>
                      <td className="p-3 text-stone-600">{it.category || '—'}</td>
                      <td className={`p-3 text-right font-bold ${low ? 'text-red-600' : 'text-stone-900'}`}>
                        {Number(it.current_stock).toFixed(2)} {it.unit}
                        {low && <AlertTriangle size={12} className="inline ml-1 text-red-500" />}
                      </td>
                      <td className="p-3 text-right text-stone-600">{Number(it.minimum_stock).toFixed(2)}</td>
                      <td className="p-3 text-right">UGX {Number(it.unit_cost).toLocaleString()}</td>
                      <td className="p-3 text-stone-600">{it.supplier_name || '—'}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <button onClick={() => openTxn(it)} className="text-blue-600 hover:underline text-xs mr-2">
                          Stock
                        </button>
                        <button onClick={() => openEditItem(it)} className="text-orange-600 hover:underline text-xs mr-2">
                          <Edit size={12} className="inline" />
                        </button>
                        <button onClick={() => deleteItem(it)} className="text-red-600 hover:underline text-xs">
                          <Trash2 size={12} className="inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Suppliers tab */}
      {tab === 'suppliers' && (
        <>
          <div className="flex justify-end">
            <Button onClick={openNewSupplier} className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus size={16} className="mr-2" />Add Supplier
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-md p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-100 text-orange-600 p-2 rounded-lg"><Truck size={18} /></div>
                    <h3 className="font-bold text-stone-900">{s.name}</h3>
                  </div>
                </div>
                {s.contact_person && <p className="text-sm text-stone-600">Contact: {s.contact_person}</p>}
                {s.phone && <p className="text-sm text-stone-600">📞 {s.phone}</p>}
                {s.email && <p className="text-sm text-stone-600">✉ {s.email}</p>}
                {s.address && <p className="text-xs text-stone-500 mt-1">{s.address}</p>}
                <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100">
                  <button onClick={() => openEditSupplier(s)} className="flex-1 text-xs py-1 bg-stone-100 hover:bg-stone-200 rounded">
                    <Edit size={12} className="inline mr-1" />Edit
                  </button>
                  <button onClick={() => deleteSupplier(s)} className="flex-1 text-xs py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded">
                    <Trash2 size={12} className="inline mr-1" />Delete
                  </button>
                </div>
              </motion.div>
            ))}
            {!suppliers.length && (
              <p className="text-stone-500 col-span-full text-center py-8">No suppliers</p>
            )}
          </div>
        </>
      )}

      {/* Transactions tab */}
      {tab === 'transactions' && (
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-700">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">Type</th>
                <th className="text-right p-3">Quantity</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t border-stone-100">
                  <td className="p-3 text-xs text-stone-500">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="p-3 font-semibold">{t.item_name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${TXN_BADGES[t.transaction_type]}`}>
                      {t.transaction_type}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-bold ${Number(t.quantity) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {Number(t.quantity) >= 0 ? '+' : ''}{Number(t.quantity).toFixed(2)} {t.unit}
                  </td>
                  <td className="p-3 text-stone-600">{t.user_name || '—'}</td>
                  <td className="p-3 text-stone-600 italic">{t.notes || '—'}</td>
                </tr>
              ))}
              {!transactions.length && (
                <tr><td colSpan={6} className="p-6 text-center text-stone-500">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Item modal */}
      {itemModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onSubmit={saveItem} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{itemModal === 'new' ? 'New Item' : 'Edit Item'}</h2>
              <button type="button" onClick={() => setItemModal(null)} className="p-2 hover:bg-stone-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Name *</label>
                <input required value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Unit *</label>
                  <input required value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    placeholder="kg, L, pcs..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Category</label>
                  <input value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {itemModal === 'new' && (
                  <div>
                    <label className="text-sm font-semibold">Stock</label>
                    <input type="number" step="0.01" value={itemForm.current_stock}
                      onChange={(e) => setItemForm({ ...itemForm, current_stock: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold">Min Stock</label>
                  <input type="number" step="0.01" value={itemForm.minimum_stock}
                    onChange={(e) => setItemForm({ ...itemForm, minimum_stock: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Unit Cost</label>
                  <input type="number" step="0.01" value={itemForm.unit_cost}
                    onChange={(e) => setItemForm({ ...itemForm, unit_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Supplier</label>
                <select value={itemForm.supplier_id}
                  onChange={(e) => setItemForm({ ...itemForm, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg">
                  <option value="">— None —</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {itemModal !== 'new' && (
                <p className="text-xs text-stone-500">To change current stock, use "Record Movement" instead.</p>
              )}
            </div>
            <Button type="submit" disabled={saving} className="w-full mt-5 bg-orange-600 hover:bg-orange-700 text-white">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </motion.form>
        </div>
      )}

      {/* Supplier modal */}
      {supplierModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onSubmit={saveSupplier} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{supplierModal === 'new' ? 'New Supplier' : 'Edit Supplier'}</h2>
              <button type="button" onClick={() => setSupplierModal(null)} className="p-2 hover:bg-stone-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input required placeholder="Name *" value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              <input placeholder="Contact person" value={supplierForm.contact_person}
                onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              <input placeholder="Phone" value={supplierForm.phone}
                onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              <input placeholder="Email" type="email" value={supplierForm.email}
                onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              <textarea placeholder="Address" rows={2} value={supplierForm.address}
                onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
            </div>
            <Button type="submit" disabled={saving} className="w-full mt-5 bg-orange-600 hover:bg-orange-700 text-white">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </motion.form>
        </div>
      )}

      {/* Transaction modal */}
      {txnModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onSubmit={saveTxn} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Stock Movement</h2>
              <button type="button" onClick={() => setTxnModal(null)} className="p-2 hover:bg-stone-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Item *</label>
                <select required value={txnForm.inventory_item_id}
                  onChange={(e) => setTxnForm({ ...txnForm, inventory_item_id: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg">
                  {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.current_stock} {i.unit})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Type *</label>
                <div className="grid grid-cols-4 gap-2">
                  {['purchase', 'usage', 'waste', 'adjustment'].map((t) => (
                    <button type="button" key={t}
                      onClick={() => setTxnForm({ ...txnForm, transaction_type: t })}
                      className={`px-2 py-2 rounded-lg text-xs font-semibold capitalize ${
                        txnForm.transaction_type === t ? 'bg-orange-600 text-white' : 'bg-stone-100'
                      }`}>
                      {t === 'purchase' && '+ '}
                      {(t === 'usage' || t === 'waste') && '- '}
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Quantity *</label>
                  <input required type="number" step="0.01" value={txnForm.quantity}
                    onChange={(e) => setTxnForm({ ...txnForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                  {txnForm.transaction_type === 'adjustment' && (
                    <p className="text-xs text-stone-500 mt-1">Use negative for reduction</p>
                  )}
                </div>
                {txnForm.transaction_type === 'purchase' && (
                  <div>
                    <label className="text-sm font-semibold">Unit Cost</label>
                    <input type="number" step="0.01" value={txnForm.unit_cost}
                      onChange={(e) => setTxnForm({ ...txnForm, unit_cost: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold">Notes</label>
                <textarea rows={2} value={txnForm.notes}
                  onChange={(e) => setTxnForm({ ...txnForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
            </div>
            <Button type="submit" disabled={saving} className="w-full mt-5 bg-orange-600 hover:bg-orange-700 text-white">
              {saving ? 'Recording...' : 'Record'}
            </Button>
          </motion.form>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;
