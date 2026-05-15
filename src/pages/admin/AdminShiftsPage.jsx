import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Play, Square, RefreshCw, Calendar, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { shiftsApi, formatUGX } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

const AdminShiftsPage = () => {
  const { user } = useAuth();
  const isManager = ['admin', 'manager'].includes(user?.role);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOpen, setShowOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [cur, hist] = await Promise.all([
        shiftsApi.current(),
        shiftsApi.list({}),
      ]);
      setCurrent(cur.data || null);
      setHistory(hist.data || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const handleOpen = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await shiftsApi.open({ opening_cash: Number(openingCash), notes });
      setShowOpen(false); setOpeningCash(''); setNotes('');
      Swal.fire({ icon: 'success', title: 'Shift opened', toast: true, position: 'top-end', timer: 1800, showConfirmButton: false });
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await shiftsApi.close(current.id, { closing_cash: Number(closingCash), notes });
      setShowClose(false); setClosingCash(''); setNotes('');
      const d = res.data;
      Swal.fire({
        icon: Math.abs(d.cash_difference) < 1 ? 'success' : 'warning',
        title: 'Shift closed',
        html: `
          <div class="text-left text-sm space-y-1">
            <div>Opening: <b>${formatUGX(d.opening_cash)}</b></div>
            <div>Cash sales: <b>${formatUGX(d.cash_sales)}</b></div>
            <div>Expected: <b>${formatUGX(d.expected_cash)}</b></div>
            <div>Counted: <b>${formatUGX(d.closing_cash)}</b></div>
            <div class="${d.cash_difference < 0 ? 'text-red-600' : d.cash_difference > 0 ? 'text-green-600' : ''}">
              Difference: <b>${formatUGX(d.cash_difference)}</b>
            </div>
            <div class="pt-1 border-t">Total sales: <b>${formatUGX(d.total_sales)}</b> (${d.total_orders} orders)</div>
          </div>`,
      });
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Cashier Shifts</h1>
          <p className="text-stone-600 text-sm">Open a shift to start your day, close it to reconcile cash.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw size={16} className="mr-1" />Refresh</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-600 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Current shift */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl shadow-md p-6 mb-6 ${current ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200' : 'bg-white'}`}>
            {current ? (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="text-green-600" size={20} />
                    <h2 className="text-lg font-bold text-stone-900">Shift Open</h2>
                  </div>
                  <div className="text-sm text-stone-600 space-y-0.5">
                    <div>Opened: <b>{new Date(current.opened_at).toLocaleString()}</b></div>
                    <div>Opening cash: <b>{formatUGX(current.opening_cash)}</b></div>
                    {current.notes && <div>Notes: {current.notes}</div>}
                  </div>
                </div>
                <Button onClick={() => setShowClose(true)} className="bg-red-600 hover:bg-red-700 text-white">
                  <Square size={16} className="mr-1" />Close Shift
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Wallet className="text-stone-400" size={32} />
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">No open shift</h2>
                    <p className="text-sm text-stone-600">Open a shift to start processing payments.</p>
                  </div>
                </div>
                <Button onClick={() => setShowOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                  <Play size={16} className="mr-1" />Open Shift
                </Button>
              </div>
            )}
          </motion.div>

          {/* History */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 flex items-center gap-2">
                <Calendar size={18} className="text-orange-600" />Recent Shifts
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-600 uppercase text-xs">
                  <tr>
                    {isManager && <th className="text-left p-3">Cashier</th>}
                    <th className="text-left p-3">Opened</th>
                    <th className="text-left p-3">Closed</th>
                    <th className="text-right p-3">Opening</th>
                    <th className="text-right p-3">Expected</th>
                    <th className="text-right p-3">Counted</th>
                    <th className="text-right p-3">Diff</th>
                    <th className="text-right p-3">Sales</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr><td colSpan={isManager ? 9 : 8} className="p-8 text-center text-stone-500">No shifts recorded yet.</td></tr>
                  ) : history.map((s) => (
                    <tr key={s.id} className="border-t border-stone-100 hover:bg-stone-50">
                      {isManager && <td className="p-3 font-medium">{s.cashier_name}</td>}
                      <td className="p-3 text-stone-600">{new Date(s.opened_at).toLocaleString()}</td>
                      <td className="p-3 text-stone-600">{s.closed_at ? new Date(s.closed_at).toLocaleString() : '—'}</td>
                      <td className="p-3 text-right">{formatUGX(s.opening_cash)}</td>
                      <td className="p-3 text-right">{s.expected_cash != null ? formatUGX(s.expected_cash) : '—'}</td>
                      <td className="p-3 text-right">{s.closing_cash != null ? formatUGX(s.closing_cash) : '—'}</td>
                      <td className={`p-3 text-right font-semibold ${
                        s.cash_difference == null ? '' :
                        Number(s.cash_difference) < 0 ? 'text-red-600' :
                        Number(s.cash_difference) > 0 ? 'text-green-600' : 'text-stone-600'
                      }`}>{s.cash_difference != null ? formatUGX(s.cash_difference) : '—'}</td>
                      <td className="p-3 text-right">{formatUGX(s.total_sales || 0)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          s.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'
                        }`}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Open shift modal */}
      {showOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <Play className="text-green-600" size={20} />Open Shift
              </h2>
              <button onClick={() => setShowOpen(false)} className="text-stone-500 hover:text-stone-700">✕</button>
            </div>
            <form onSubmit={handleOpen} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Opening Cash (UGX)</label>
                <input required type="number" min="0" step="100" autoFocus value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-lg" />
                <p className="text-xs text-stone-500 mt-1">Cash float in the drawer at the start of your shift.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Notes (optional)</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  {submitting ? 'Opening...' : 'Open Shift'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Close shift modal */}
      {showClose && current && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <Square className="text-red-600" size={20} />Close Shift
              </h2>
              <button onClick={() => setShowClose(false)} className="text-stone-500 hover:text-stone-700">✕</button>
            </div>
            <form onSubmit={handleClose} className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  Count all cash in the drawer including the opening float, then enter the total below.
                  The system will compare against expected cash from sales.
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Closing Cash (UGX)</label>
                <input required type="number" min="0" step="100" autoFocus value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Notes (optional)</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowClose(false)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  {submitting ? 'Closing...' : 'Close Shift'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminShiftsPage;
