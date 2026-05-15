import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Receipt, ShoppingBag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ordersApi, formatUGX } from '@/lib/api';

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

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.list()
      .then((res) => setOrders(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="bg-amber-900 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">My Orders</h1>
        <p className="text-orange-100">Your order history</p>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white rounded-2xl p-12 shadow-lg">
            <Receipt className="mx-auto mb-6 text-stone-300" size={80} />
            <h2 className="text-2xl font-bold text-stone-900 mb-4">No orders yet</h2>
            <p className="text-stone-600 mb-8">Time to try something delicious!</p>
            <Link to="/menu">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8">
                <ShoppingBag className="mr-2" size={18} />Browse Menu
              </Button>
            </Link>
          </motion.div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to={`/order/${order.id}`}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="font-bold text-stone-900">{order.order_number}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${STATUS_STYLES[order.status] || 'bg-stone-100 text-stone-700'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500">
                      {new Date(order.created_at).toLocaleString()} · {order.item_count} item{order.item_count !== 1 ? 's' : ''} · <span className="capitalize">{order.order_type.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">{formatUGX(order.total)}</p>
                  </div>
                  <ChevronRight className="text-stone-400" />
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
