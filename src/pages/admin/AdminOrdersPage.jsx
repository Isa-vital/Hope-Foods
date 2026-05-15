import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, RefreshCw, Printer } from 'lucide-react';
import { ordersApi, formatUGX } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';
import Receipt from '@/components/Receipt';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'delivered', 'completed', 'cancelled'];

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-purple-100 text-purple-800',
  served: 'bg-teal-100 text-teal-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const res = await ordersApi.list(params);
      setOrders(res.data || []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      Swal.fire({ icon: 'success', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false, title: `Status: ${newStatus}` });
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update failed', text: err.message, confirmButtonColor: '#ea580c' });
    }
  };

  const toggleExpand = async (order) => {
    if (expandedId === order.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(order.id);
    if (!order.items) {
      try {
        const res = await ordersApi.get(order.id);
        setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, items: res.data.items } : o));
      } catch {
        // ignore
      }
    }
  };

  const handlePrint = async (order) => {
    try {
      const res = await ordersApi.get(order.id);
      setReceipt(res.data);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Could not load order', text: err.message });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Orders</h1>
          <p className="text-stone-600 text-sm">{orders.length} order(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
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
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-stone-500">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-stone-900">{order.order_number}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${STATUS_STYLES[order.status]}`}>{order.status}</span>
                    <span className="text-xs text-stone-500 capitalize">{order.order_type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-stone-600 truncate">
                    {order.customer_name} · {order.customer_phone} · {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-orange-600 text-lg">{formatUGX(order.total)}</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="px-2 py-1 border border-stone-300 rounded text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => handlePrint(order)} title="Print receipt" className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg">
                    <Printer size={16} />
                  </button>
                  <button onClick={() => toggleExpand(order)} className="p-2 hover:bg-stone-100 rounded-lg">
                    <ChevronDown size={18} className={`transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {expandedId === order.id && (
                <div className="bg-stone-50 px-4 py-3 border-t border-stone-200 text-sm">
                  {order.delivery_address && <p className="mb-2"><strong>Delivery:</strong> {order.delivery_address}</p>}
                  {order.notes && <p className="mb-2"><strong>Notes:</strong> {order.notes}</p>}
                  {order.items ? (
                    <div className="space-y-1">
                      {order.items.map((it) => (
                        <div key={it.id} className="flex justify-between">
                          <span>{it.quantity}× {it.item_name}</span>
                          <span className="font-medium">{formatUGX(it.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-500">Loading items...</p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {receipt && <Receipt order={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
};

export default AdminOrdersPage;
