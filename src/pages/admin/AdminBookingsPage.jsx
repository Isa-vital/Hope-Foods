import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, BedDouble, User, Phone, Mail } from 'lucide-react';
import { bookingsApi, formatUGX } from '@/lib/api';
import Swal from 'sweetalert2';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  checked_in: 'bg-green-100 text-green-800',
  checked_out: 'bg-stone-200 text-stone-700',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-red-100 text-red-800'
};

const STATUSES = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'];

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', date: '' });
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.date) params.date = filter.date;
      const res = await bookingsApi.list(params);
      setBookings(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const changeStatus = async (b, status) => {
    try {
      await bookingsApi.updateStatus(b.id, status);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update failed', text: err.message });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-stone-900">Bookings</h1>

      <div className="bg-white rounded-2xl shadow-md p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Status</label>
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 border border-stone-300 rounded-lg">
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Date (between check-in & out)</label>
          <input type="date" value={filter.date} onChange={(e) => setFilter({ ...filter, date: e.target.value })}
            className="px-3 py-2 border border-stone-300 rounded-lg" />
        </div>
        {(filter.status || filter.date) && (
          <button onClick={() => setFilter({ status: '', date: '' })} className="text-sm text-orange-600 hover:underline">
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-stone-500">Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <CalendarDays size={48} className="mx-auto text-stone-300 mb-2" />
          <p className="text-stone-500">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-stone-50"
                onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-bold text-stone-900">{b.booking_number}</p>
                    <p className="text-sm text-stone-600 flex items-center gap-1 mt-1">
                      <User size={14} />{b.guest_name} · <Phone size={12} />{b.guest_phone}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-stone-500 text-xs">Room</p>
                    <p className="font-semibold">{b.room_number} ({b.room_type_name})</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-stone-500 text-xs">Stay</p>
                    <p className="font-semibold">{b.check_in_date} → {b.check_out_date}</p>
                    <p className="text-xs text-stone-500">{b.num_nights} night{b.num_nights > 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-stone-500 text-xs">Total</p>
                    <p className="font-bold text-orange-600">{formatUGX(b.total)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[b.status] || 'bg-stone-100'}`}>
                    {b.status}
                  </span>
                  <select value={b.status} onClick={(e) => e.stopPropagation()}
                    onChange={(e) => changeStatus(b, e.target.value)}
                    className="px-2 py-1 border border-stone-300 rounded text-xs">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {expanded === b.id && (
                <div className="px-4 pb-4 pt-2 bg-stone-50 border-t border-stone-200 text-sm grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-stone-700 mb-1">Guest Details</p>
                    {b.guest_email && <p className="flex items-center gap-1 text-stone-600"><Mail size={12} />{b.guest_email}</p>}
                    {b.guest_id_number && <p className="text-stone-600">ID: {b.guest_id_number}</p>}
                    <p className="text-stone-600">Guests: {b.num_guests}</p>
                    {b.notes && <p className="text-stone-600 italic mt-2">"{b.notes}"</p>}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-700 mb-1">Pricing</p>
                    <p className="text-stone-600">Rate: {formatUGX(b.rate_per_night)} × {b.num_nights}</p>
                    <p className="text-stone-600">Subtotal: {formatUGX(b.subtotal)}</p>
                    {Number(b.tax) > 0 && <p className="text-stone-600">Tax: {formatUGX(b.tax)}</p>}
                    <p className="font-bold text-orange-600">Total: {formatUGX(b.total)}</p>
                    <p className="text-xs text-stone-500 mt-1">Payment: {b.payment_status}</p>
                  </div>
                  {(b.actual_check_in || b.actual_check_out) && (
                    <div className="md:col-span-2 text-xs text-stone-500">
                      {b.actual_check_in && <p>Checked in: {new Date(b.actual_check_in).toLocaleString()}</p>}
                      {b.actual_check_out && <p>Checked out: {new Date(b.actual_check_out).toLocaleString()}</p>}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
