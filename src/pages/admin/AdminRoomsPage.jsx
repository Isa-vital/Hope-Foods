import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, BedDouble, Settings } from 'lucide-react';
import { roomsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

const STATUS_STYLES = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  cleaning: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-stone-200 text-stone-700'
};

const emptyRoom = { room_number: '', room_type_id: '', floor: 1, status: 'available' };
const emptyType = { name: '', description: '', base_price: 0, capacity: 2, amenities: '' };

const AdminRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [typeForm, setTypeForm] = useState(emptyType);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('rooms');

  const load = async () => {
    setLoading(true);
    try {
      const [r, t] = await Promise.all([roomsApi.list(), roomsApi.listTypes()]);
      setRooms(r.data || []);
      setTypes(t.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // -------- Rooms --------
  const openCreateRoom = () => {
    setEditingRoom(null);
    setRoomForm({ ...emptyRoom, room_type_id: types[0]?.id || '' });
    setShowRoomForm(true);
  };
  const openEditRoom = (r) => {
    setEditingRoom(r);
    setRoomForm({
      room_number: r.room_number,
      room_type_id: r.room_type_id,
      floor: r.floor || 1,
      status: r.status
    });
    setShowRoomForm(true);
  };

  const saveRoom = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...roomForm, room_type_id: Number(roomForm.room_type_id), floor: Number(roomForm.floor) };
      if (editingRoom) await roomsApi.update(editingRoom.id, payload);
      else await roomsApi.create(payload);
      setShowRoomForm(false);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Save failed', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const deleteRoom = async (r) => {
    const c = await Swal.fire({
      icon: 'warning', title: `Delete room ${r.room_number}?`,
      showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete'
    });
    if (!c.isConfirmed) return;
    try { await roomsApi.remove(r.id); load(); }
    catch (err) { Swal.fire({ icon: 'error', title: 'Failed', text: err.message }); }
  };

  // -------- Types --------
  const openCreateType = () => {
    setEditingType(null);
    setTypeForm(emptyType);
    setShowTypeForm(true);
  };
  const openEditType = (t) => {
    setEditingType(t);
    let amenitiesStr = '';
    try {
      const arr = t.amenities ? (typeof t.amenities === 'string' ? JSON.parse(t.amenities) : t.amenities) : [];
      amenitiesStr = Array.isArray(arr) ? arr.join(', ') : '';
    } catch { amenitiesStr = ''; }
    setTypeForm({
      name: t.name,
      description: t.description || '',
      base_price: t.base_price,
      capacity: t.capacity,
      amenities: amenitiesStr
    });
    setShowTypeForm(true);
  };

  const saveType = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const amenities = typeForm.amenities
        ? typeForm.amenities.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const payload = {
        name: typeForm.name,
        description: typeForm.description,
        base_price: Number(typeForm.base_price),
        capacity: Number(typeForm.capacity),
        amenities
      };
      if (editingType) await roomsApi.updateType(editingType.id, payload);
      else await roomsApi.createType(payload);
      setShowTypeForm(false);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Save failed', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const quickStatusChange = async (room, status) => {
    try {
      await roomsApi.update(room.id, { status });
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-stone-900">Hotel Rooms</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('rooms')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'rooms' ? 'bg-orange-600 text-white' : 'bg-white text-stone-700'}`}>
            Rooms ({rooms.length})
          </button>
          <button onClick={() => setTab('types')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'types' ? 'bg-orange-600 text-white' : 'bg-white text-stone-700'}`}>
            Room Types ({types.length})
          </button>
        </div>
      </div>

      {tab === 'rooms' && (
        <>
          <div className="flex justify-end">
            <Button onClick={openCreateRoom} disabled={!types.length}
              className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus size={18} className="mr-2" />Add Room
            </Button>
          </div>

          {loading ? (
            <p className="text-stone-500">Loading...</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rooms.map((r) => (
                <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-md p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-2xl font-bold text-stone-900">{r.room_number}</p>
                      <p className="text-xs text-stone-500">{r.room_type_name}{r.floor ? ` · Floor ${r.floor}` : ''}</p>
                    </div>
                    <BedDouble size={24} className="text-orange-500" />
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[r.status] || 'bg-stone-100'}`}>
                    {r.status}
                  </span>
                  <select value={r.status} onChange={(e) => quickStatusChange(r, e.target.value)}
                    className="w-full mt-3 px-2 py-1 border border-stone-300 rounded text-xs">
                    {['available', 'occupied', 'reserved', 'cleaning', 'maintenance'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEditRoom(r)} className="flex-1 text-xs py-1 bg-stone-100 hover:bg-stone-200 rounded">
                      <Edit size={12} className="inline mr-1" />Edit
                    </button>
                    <button onClick={() => deleteRoom(r)} className="flex-1 text-xs py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded">
                      <Trash2 size={12} className="inline mr-1" />Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'types' && (
        <>
          <div className="flex justify-end">
            <Button onClick={openCreateType} className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus size={18} className="mr-2" />Add Room Type
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-700">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-right p-3">Rate</th>
                  <th className="text-center p-3">Capacity</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t.id} className="border-t border-stone-100">
                    <td className="p-3 font-semibold">{t.name}</td>
                    <td className="p-3 text-stone-600 max-w-md truncate">{t.description}</td>
                    <td className="p-3 text-right font-semibold">UGX {Number(t.base_price).toLocaleString()}</td>
                    <td className="p-3 text-center">{t.capacity}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => openEditType(t)} className="text-orange-600 hover:underline text-xs">
                        <Settings size={14} className="inline" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {!types.length && (
                  <tr><td colSpan={5} className="p-6 text-center text-stone-500">No room types yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Room form modal */}
      {showRoomForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onSubmit={saveRoom}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingRoom ? 'Edit Room' : 'New Room'}</h2>
              <button type="button" onClick={() => setShowRoomForm(false)} className="p-2 hover:bg-stone-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Room Number *</label>
                <input required value={roomForm.room_number}
                  onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-semibold">Room Type *</label>
                <select required value={roomForm.room_type_id}
                  onChange={(e) => setRoomForm({ ...roomForm, room_type_id: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg">
                  <option value="">Select...</option>
                  {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Floor</label>
                  <input type="number" value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Status</label>
                  <select value={roomForm.status}
                    onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg">
                    {['available', 'occupied', 'reserved', 'cleaning', 'maintenance'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <Button type="submit" disabled={saving}
              className="w-full mt-5 bg-orange-600 hover:bg-orange-700 text-white">
              {saving ? 'Saving...' : (editingRoom ? 'Update' : 'Create')}
            </Button>
          </motion.form>
        </div>
      )}

      {/* Type form modal */}
      {showTypeForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onSubmit={saveType}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingType ? 'Edit Type' : 'New Room Type'}</h2>
              <button type="button" onClick={() => setShowTypeForm(false)} className="p-2 hover:bg-stone-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Name *</label>
                <input required value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-semibold">Description</label>
                <textarea rows={2} value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Base Price (UGX) *</label>
                  <input type="number" required value={typeForm.base_price}
                    onChange={(e) => setTypeForm({ ...typeForm, base_price: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Capacity *</label>
                  <input type="number" required value={typeForm.capacity}
                    onChange={(e) => setTypeForm({ ...typeForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Amenities (comma separated)</label>
                <input value={typeForm.amenities}
                  onChange={(e) => setTypeForm({ ...typeForm, amenities: e.target.value })}
                  placeholder="WiFi, TV, AC, Mini Bar"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
            </div>
            <Button type="submit" disabled={saving}
              className="w-full mt-5 bg-orange-600 hover:bg-orange-700 text-white">
              {saving ? 'Saving...' : (editingType ? 'Update' : 'Create')}
            </Button>
          </motion.form>
        </div>
      )}
    </div>
  );
};

export default AdminRoomsPage;
