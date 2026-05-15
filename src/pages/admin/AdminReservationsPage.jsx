import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Users, Calendar, Phone } from 'lucide-react';
import { reservationsApi, tablesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

const STATUSES = ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'];

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  seated: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-stone-200 text-stone-700'
};

const AdminReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;
      const [resvRes, tblRes] = await Promise.all([
        reservationsApi.list(params),
        tablesApi.list()
      ]);
      setReservations(resvRes.data || []);
      setTables(tblRes.data || []);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Load failed', text: err.message });
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, status) => {
    try {
      await reservationsApi.updateStatus(id, status);
      Swal.fire({ icon: 'success', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false, title: status });
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update failed', text: err.message });
    }
  };

  const handleAssignTable = async (id, table_id) => {
    try {
      await reservationsApi.updateStatus(id, 'confirmed', Number(table_id));
      Swal.fire({ icon: 'success', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false, title: 'Table assigned' });
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Assign failed', text: err.message });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Reservations</h1>
          <p className="text-stone-600 text-sm">{reservations.length} booking(s)</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button onClick={load} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-1" />Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-600 border-t-transparent"></div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-stone-500">No reservations.</div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-stone-900">{r.customer_name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                </div>
                <div className="text-sm text-stone-600 flex items-center gap-3 flex-wrap mt-1">
                  <span className="flex items-center gap-1"><Calendar size={14} />{r.reservation_date} {r.reservation_time}</span>
                  <span className="flex items-center gap-1"><Users size={14} />{r.party_size}</span>
                  <span className="flex items-center gap-1"><Phone size={14} />{r.customer_phone}</span>
                  {r.table_number && <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-medium">Table {r.table_number}</span>}
                </div>
                {r.special_requests && <p className="text-xs text-stone-500 mt-1 italic">"{r.special_requests}"</p>}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={r.table_id || ''}
                  onChange={(e) => handleAssignTable(r.id, e.target.value)}
                  className="px-2 py-1 border border-stone-300 rounded text-sm"
                >
                  <option value="">Assign table...</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>{t.table_number} (cap {t.capacity})</option>
                  ))}
                </select>
                <select
                  value={r.status}
                  onChange={(e) => handleStatusChange(r.id, e.target.value)}
                  className="px-2 py-1 border border-stone-300 rounded text-sm"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReservationsPage;
