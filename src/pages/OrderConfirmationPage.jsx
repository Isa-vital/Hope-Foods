import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, Phone, Receipt, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ordersApi, formatUGX } from '@/lib/api';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ordersApi.get(id);
        setOrder(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Order not found</h2>
          <p className="text-stone-600 mb-4">{error || 'We couldn\'t find this order.'}</p>
          <Link to="/menu"><Button className="bg-orange-600 hover:bg-orange-700 text-white">Browse Menu</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Success header */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <CheckCircle className="text-green-600" size={48} />
            </motion.div>
            <h1 className="text-3xl font-serif font-bold mb-2">Order Confirmed!</h1>
            <p className="text-green-50">Thank you for choosing Hope Foods</p>
          </div>

          {/* Order details */}
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <p className="text-sm text-stone-500">Order Number</p>
                <p className="text-xl font-bold text-stone-900">{order.order_number}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-stone-100 text-stone-800'
              }`}>{order.status}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="text-orange-600 mt-0.5" size={18} />
                <div>
                  <p className="text-stone-500">Phone</p>
                  <p className="font-medium text-stone-900">{order.customer_phone}</p>
                </div>
              </div>
              {order.delivery_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="text-orange-600 mt-0.5" size={18} />
                  <div>
                    <p className="text-stone-500">Delivery Address</p>
                    <p className="font-medium text-stone-900">{order.delivery_address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Clock className="text-orange-600 mt-0.5" size={18} />
                <div>
                  <p className="text-stone-500">Order Type</p>
                  <p className="font-medium text-stone-900 capitalize">{order.order_type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Receipt className="text-orange-600 mt-0.5" size={18} />
                <div>
                  <p className="text-stone-500">Payment</p>
                  <p className="font-medium text-stone-900 capitalize">{order.payment_method}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-bold text-stone-900 mb-3">Items</h3>
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-stone-100">
                    <div>
                      <p className="font-medium text-stone-900">{item.item_name}</p>
                      <p className="text-sm text-stone-500">{formatUGX(item.unit_price)} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-stone-900">{formatUGX(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-stone-200 space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span><span>{formatUGX(order.subtotal)}</span>
              </div>
              {Number(order.delivery_fee) > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Delivery</span><span>{formatUGX(order.delivery_fee)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-stone-900 pt-2 border-t">
                <span>Total</span><span className="text-orange-600">{formatUGX(order.total)}</span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-900">
              📞 We'll call you on <strong>{order.customer_phone}</strong> shortly to confirm your order.
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/menu" className="flex-1">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  <ShoppingBag className="mr-2" size={18} />Order Again
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">Back to Home</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
