import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, Search, ShoppingCart, CreditCard, X } from 'lucide-react';
import { menuApi, tablesApi, ordersApi, paymentsApi, formatUGX } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';
import Receipt from '@/components/Receipt';
import { useAuth } from '@/context/AuthContext';

const POSPage = () => {
  const { user } = useAuth();
  const [menu, setMenu] = useState({});
  const [tables, setTables] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine_in');
  const [tableId, setTableId] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);

  useEffect(() => {
    (async () => {
      const [m, t] = await Promise.all([menuApi.getMenuGrouped(), tablesApi.list()]);
      setMenu(m);
      setTables(t.data || []);
      setActiveCategory(Object.keys(m)[0] || null);
    })();
  }, []);

  const categories = Object.keys(menu);
  const visibleItems = useMemo(() => {
    const items = activeCategory ? (menu[activeCategory] || []) : [];
    const q = search.trim().toLowerCase();
    return q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items;
  }, [menu, activeCategory, search]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, priceNumber: item.priceNumber, quantity: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.flatMap((i) => {
      if (i.id !== id) return [i];
      const q = i.quantity + delta;
      return q <= 0 ? [] : [{ ...i, quantity: q }];
    }));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const total = cart.reduce((sum, i) => sum + i.priceNumber * i.quantity, 0);

  const handleSubmit = async () => {
    if (!cart.length) return;
    if (orderType === 'dine_in' && !tableId) {
      return Swal.fire({ icon: 'warning', title: 'Select a table', confirmButtonColor: '#ea580c' });
    }
    setSubmitting(true);
    try {
      const res = await ordersApi.create({
        customer_name: customerName || 'Walk-in',
        customer_phone: customerPhone || '0000000000',
        order_type: orderType,
        table_id: orderType === 'dine_in' ? Number(tableId) : undefined,
        items: cart.map((i) => ({ menu_item_id: i.id, quantity: i.quantity }))
      });
      const order = res.data;
      setPaymentModal({ order, amount: order.total });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Order failed', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (method) => {
    try {
      await paymentsApi.record({
        order_id: paymentModal.order.id,
        amount: paymentModal.amount,
        payment_method: method
      });
      await ordersApi.updateStatus(paymentModal.order.id, 'completed');

      // Build receipt snapshot from local state (no extra API call needed)
      const tbl = tables.find((t) => String(t.id) === String(tableId));
      const receiptOrder = {
        order_number: paymentModal.order.order_number,
        created_at: new Date().toISOString(),
        order_type: orderType,
        table_number: tbl ? tbl.table_number : null,
        customer_name: customerName,
        customer_phone: customerPhone,
        cashier_name: user?.full_name || user?.email || 'Cashier',
        payment_method: method,
        items: cart.map((i) => ({
          item_name: i.name,
          quantity: i.quantity,
          unit_price: i.priceNumber,
          subtotal: i.priceNumber * i.quantity
        })),
        subtotal: paymentModal.amount,
        tax: 0,
        total: paymentModal.amount
      };

      const res = await Swal.fire({
        icon: 'success',
        title: 'Sale complete!',
        html: `<p><strong>${paymentModal.order.order_number}</strong></p><p>${formatUGX(paymentModal.amount)} via ${method}</p>`,
        confirmButtonColor: '#ea580c',
        confirmButtonText: 'Print Receipt',
        showCancelButton: true,
        cancelButtonText: 'Skip'
      });

      setCart([]);
      setTableId('');
      setCustomerName('Walk-in');
      setCustomerPhone('');
      setPaymentModal(null);

      if (res.isConfirmed) {
        setReceipt(receiptOrder);
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Payment failed', text: err.message });
    }
  };

  return (
    <div className="h-[calc(100vh-1rem)] flex flex-col lg:flex-row gap-4">
      {/* Menu side */}
      <div className="flex-1 bg-white rounded-2xl shadow-md p-4 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-serif font-bold text-stone-900">POS</h1>
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-2.5 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 border-b border-stone-200">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                activeCategory === c ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto flex-1">
          {visibleItems.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => addToCart(item)}
              className="bg-stone-50 hover:bg-orange-50 hover:border-orange-300 border-2 border-transparent rounded-xl p-3 text-left transition"
            >
              {item.image && (
                <img src={item.image} alt={item.name} className="w-full h-20 object-cover rounded-lg mb-2" />
              )}
              <p className="font-semibold text-stone-900 text-sm leading-tight">{item.name}</p>
              <p className="text-orange-600 font-bold text-sm mt-1">{item.price}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart side */}
      <div className="lg:w-96 bg-white rounded-2xl shadow-md p-4 flex flex-col">
        <h2 className="text-xl font-bold text-stone-900 mb-3 flex items-center gap-2">
          <ShoppingCart size={20} />Current Order
        </h2>

        <div className="space-y-2 mb-3">
          <select value={orderType} onChange={(e) => setOrderType(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm">
            <option value="dine_in">Dine In</option>
            <option value="takeaway">Takeaway</option>
          </select>
          {orderType === 'dine_in' && (
            <select value={tableId} onChange={(e) => setTableId(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm">
              <option value="">Select table...</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>Table {t.table_number} (cap {t.capacity})</option>
              ))}
            </select>
          )}
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer name" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone (optional)" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
        </div>

        <div className="flex-1 overflow-y-auto border-t border-stone-200 pt-2 space-y-2">
          {cart.length === 0 ? (
            <p className="text-center text-stone-400 text-sm py-8">Tap items to add</p>
          ) : cart.map((i) => (
            <div key={i.id} className="flex items-center gap-2 bg-stone-50 rounded-lg p-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{i.name}</p>
                <p className="text-xs text-orange-600">{formatUGX(i.priceNumber)}</p>
              </div>
              <button onClick={() => updateQty(i.id, -1)} className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center">
                <Minus size={14} />
              </button>
              <span className="font-bold w-6 text-center">{i.quantity}</span>
              <button onClick={() => updateQty(i.id, 1)} className="w-7 h-7 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 flex items-center justify-center">
                <Plus size={14} />
              </button>
              <button onClick={() => removeItem(i.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-200 pt-3 mt-2">
          <div className="flex justify-between text-lg mb-3">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-orange-600">{formatUGX(total)}</span>
          </div>
          <Button onClick={handleSubmit} disabled={!cart.length || submitting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-bold disabled:opacity-50">
            {submitting ? 'Processing...' : (<><CreditCard size={20} className="mr-2" />Charge {formatUGX(total)}</>)}
          </Button>
        </div>
      </div>

      {/* Payment modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Payment · {paymentModal.order.order_number}</h2>
              <button onClick={() => setPaymentModal(null)} className="p-2 hover:bg-stone-100 rounded-lg"><X size={20} /></button>
            </div>
            <p className="text-center text-3xl font-bold text-orange-600 mb-6">{formatUGX(paymentModal.amount)}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'cash', label: '💵 Cash' },
                { key: 'mobile_money', label: '📱 Mobile Money' },
                { key: 'card', label: '💳 Card' },
                { key: 'bank_transfer', label: '🏦 Bank' }
              ].map((m) => (
                <button key={m.key} onClick={() => handlePayment(m.key)}
                  className="bg-stone-100 hover:bg-orange-100 border-2 border-transparent hover:border-orange-300 rounded-xl py-6 font-semibold transition">
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-stone-500 mt-4">Order is created. Choose payment method to complete the sale.</p>
          </motion.div>
        </div>
      )}

      {receipt && (
        <Receipt order={receipt} onClose={() => setReceipt(null)} autoPrint />
      )}
    </div>
  );
};

export default POSPage;
