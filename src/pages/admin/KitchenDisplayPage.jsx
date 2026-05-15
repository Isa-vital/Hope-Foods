import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChefHat, CheckCircle2, RefreshCw } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

const STATUS_COLORS = {
  pending: 'from-yellow-400 to-amber-500',
  preparing: 'from-orange-500 to-red-500'
};

const elapsedMinutes = (ts) => {
  const diff = (Date.now() - new Date(ts).getTime()) / 60000;
  return Math.max(0, Math.floor(diff));
};

const KdsCard = ({ order, onAdvance }) => {
  const [, force] = useState(0);
  // Re-render every 30s so the clock updates
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const mins = elapsedMinutes(order.created_at);
  const stale = mins >= 20;
  const grad = STATUS_COLORS[order.status] || 'from-stone-400 to-stone-500';
  const nextStatus = order.status === 'pending' ? 'preparing' : 'ready';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${stale ? 'border-red-500 animate-pulse' : 'border-transparent'}`}
    >
      <div className={`bg-gradient-to-r ${grad} text-white p-3 flex items-center justify-between`}>
        <div>
          <p className="font-bold text-lg">{order.order_number}</p>
          <p className="text-xs opacity-90 capitalize">{order.order_type.replace('_', ' ')}{order.table_number ? ` · Table ${order.table_number}` : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold flex items-center gap-1"><Clock size={18} />{mins}m</p>
          <p className="text-xs opacity-90 capitalize">{order.status}</p>
        </div>
      </div>

      <div className="p-3">
        <p className="text-xs text-stone-500 mb-2">{order.customer_name}</p>
        <ul className="space-y-1.5 max-h-64 overflow-y-auto">
          {(order.items || []).map((it) => (
            <li key={it.id} className="flex items-start gap-2 text-sm">
              <span className="bg-stone-200 text-stone-800 font-bold rounded-md px-2 py-0.5 text-xs min-w-[28px] text-center">
                {it.quantity}×
              </span>
              <div className="flex-1">
                <p className="font-medium text-stone-900">{it.menu_item_name || it.name}</p>
                {it.special_instructions && (
                  <p className="text-xs text-orange-600 italic">"{it.special_instructions}"</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {order.notes && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 mt-2 italic">Note: {order.notes}</p>
        )}

        <Button onClick={() => onAdvance(order, nextStatus)}
          className="w-full mt-3 bg-stone-900 hover:bg-stone-800 text-white py-2">
          {nextStatus === 'preparing' ? (
            <><ChefHat size={16} className="mr-2" />Start Preparing</>
          ) : (
            <><CheckCircle2 size={16} className="mr-2" />Mark Ready</>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

const KitchenDisplayPage = () => {
  const [pending, setPending] = useState([]);
  const [preparing, setPreparing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    try {
      const [p, q] = await Promise.all([
        ordersApi.list({ status: 'pending', include: 'items' }),
        ordersApi.list({ status: 'preparing', include: 'items' })
      ]);
      setPending(p.data || []);
      setPreparing(q.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  const advance = async (order, status) => {
    try {
      await ordersApi.updateStatus(order.id, status);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update failed', text: err.message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Kitchen Display</h1>
          <p className="text-stone-600 text-sm">{pending.length} new · {preparing.length} preparing</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg shadow-sm">
            <input type="checkbox" checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto-refresh (15s)
          </label>
          <Button onClick={load} variant="outline" className="bg-white">
            <RefreshCw size={16} className="mr-2" />Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-stone-500">Loading...</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <section>
            <h2 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
              <Clock size={18} />New Orders ({pending.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {pending.map((o) => <KdsCard key={o.id} order={o} onAdvance={advance} />)}
              </AnimatePresence>
              {!pending.length && (
                <p className="text-stone-400 text-sm col-span-full text-center py-8">No new orders</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
              <ChefHat size={18} />In Kitchen ({preparing.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {preparing.map((o) => <KdsCard key={o.id} order={o} onAdvance={advance} />)}
              </AnimatePresence>
              {!preparing.length && (
                <p className="text-stone-400 text-sm col-span-full text-center py-8">Kitchen is clear</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default KitchenDisplayPage;
