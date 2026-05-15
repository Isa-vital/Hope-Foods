import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, DollarSign, ShoppingBag, CreditCard, Hotel, BarChart3 } from 'lucide-react';
import { reportsApi, formatUGX } from '@/lib/api';

const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgoStr = (d) => {
  const x = new Date();
  x.setDate(x.getDate() - d);
  return x.toISOString().slice(0, 10);
};

const StatCard = ({ icon: Icon, label, value, sub, color = 'orange' }) => (
  <div className="bg-white rounded-2xl p-5 shadow-md flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl bg-${color}-100 text-${color}-600 flex items-center justify-center`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-xs text-stone-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-stone-900">{value}</p>
      {sub && <p className="text-xs text-stone-500 mt-1">{sub}</p>}
    </div>
  </div>
);

const AdminReportsPage = () => {
  const [from, setFrom] = useState(daysAgoStr(30));
  const [to, setTo] = useState(todayStr());
  const [dashboard, setDashboard] = useState(null);
  const [sales, setSales] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [occupancy, setOccupancy] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [d, s, t, p, o] = await Promise.all([
        reportsApi.dashboard(),
        reportsApi.sales(from, to),
        reportsApi.topItems(from, to, 10),
        reportsApi.paymentMethods(from, to),
        reportsApi.occupancy(from, to),
      ]);
      setDashboard(d.data);
      setSales(s.data);
      setTopItems(t.data || []);
      setPayments(p.data || []);
      setOccupancy(o.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [from, to]);

  const maxRevenue = Math.max(1, ...(sales?.breakdown || []).map((b) => Number(b.revenue)));

  const setRange = (days) => {
    setFrom(daysAgoStr(days));
    setTo(todayStr());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-2">
          <BarChart3 size={28} />Reports & Analytics
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: '7d', d: 7 }, { label: '30d', d: 30 }, { label: '90d', d: 90 }
          ].map((r) => (
            <button key={r.label} onClick={() => setRange(r.d)}
              className="px-3 py-1.5 text-xs font-semibold bg-white rounded-lg shadow-sm hover:bg-stone-100">
              {r.label}
            </button>
          ))}
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="px-2 py-1.5 border border-stone-300 rounded-lg text-sm" />
          <span className="text-stone-400">→</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="px-2 py-1.5 border border-stone-300 rounded-lg text-sm" />
        </div>
      </div>

      {/* Overview cards */}
      {dashboard && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Today" value={formatUGX(dashboard.today.revenue)}
            sub={`${dashboard.today.orders} orders`} color="green" />
          <StatCard icon={TrendingUp} label="Last 7 days" value={formatUGX(dashboard.week.revenue)}
            sub={`${dashboard.week.orders} orders`} color="blue" />
          <StatCard icon={ShoppingBag} label="Last 30 days" value={formatUGX(dashboard.month.revenue)}
            sub={`${dashboard.month.orders} orders`} color="indigo" />
          <StatCard icon={Hotel} label="Active Bookings" value={dashboard.active_bookings}
            sub={`${dashboard.low_stock_count} low-stock items`} color="orange" />
        </div>
      )}

      {loading ? (
        <p className="text-stone-500">Loading reports...</p>
      ) : (
        <>
          {/* Sales totals + chart */}
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-stone-900">Daily Sales</h2>
              {sales?.totals && (
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-stone-500">Orders: </span>
                    <span className="font-bold">{sales.totals.orders}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Revenue: </span>
                    <span className="font-bold text-orange-600">{formatUGX(sales.totals.revenue)}</span>
                  </div>
                </div>
              )}
            </div>

            {!sales?.breakdown?.length ? (
              <p className="text-stone-500 text-center py-8">No sales data for this period</p>
            ) : (
              <div className="space-y-1.5">
                {sales.breakdown.map((b) => {
                  const pct = (Number(b.revenue) / maxRevenue) * 100;
                  return (
                    <div key={b.date} className="flex items-center gap-3 text-sm">
                      <span className="w-24 text-stone-600 text-xs">{b.date}</span>
                      <div className="flex-1 bg-stone-100 rounded-full h-7 relative overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center px-2" />
                        <span className="absolute inset-0 flex items-center px-3 text-xs font-semibold text-stone-800">
                          {formatUGX(b.revenue)} · {b.orders} orders
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top items + Payment methods */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} />Top Selling Items
              </h2>
              {!topItems.length ? (
                <p className="text-stone-500 text-center py-8">No data</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-stone-600 text-xs uppercase tracking-wide border-b">
                      <th className="pb-2">#</th>
                      <th className="pb-2">Item</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topItems.map((it, i) => (
                      <tr key={it.id} className="border-b border-stone-100">
                        <td className="py-2 font-bold text-orange-600">#{i + 1}</td>
                        <td className="py-2">
                          <p className="font-semibold">{it.name}</p>
                          <p className="text-xs text-stone-500">{it.category}</p>
                        </td>
                        <td className="py-2 text-right font-bold">{it.qty_sold}</td>
                        <td className="py-2 text-right text-orange-600">{formatUGX(it.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-md p-5">
              <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} />Payment Methods
              </h2>
              {!payments.length ? (
                <p className="text-stone-500 text-center py-8">No payments</p>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const total = payments.reduce((s, p) => s + Number(p.total), 0);
                    return payments.map((p) => {
                      const pct = total ? (Number(p.total) / total) * 100 : 0;
                      return (
                        <div key={p.payment_method}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold capitalize">{p.payment_method.replace('_', ' ')}</span>
                            <span>{formatUGX(p.total)} <span className="text-stone-400">({p.count})</span></span>
                          </div>
                          <div className="bg-stone-100 rounded-full h-2 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              className="h-full bg-gradient-to-r from-orange-400 to-orange-600" />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Hotel occupancy */}
          {occupancy && (
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Hotel size={20} />Hotel Occupancy
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-stone-500 uppercase">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-orange-600">{occupancy.occupancy_rate}%</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase">Booked Nights</p>
                  <p className="text-2xl font-bold">{occupancy.booked_nights}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase">Total Room-Nights</p>
                  <p className="text-2xl font-bold">{occupancy.total_room_nights}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase">Bookings</p>
                  <p className="text-2xl font-bold">{occupancy.booking_count}</p>
                </div>
              </div>
              <div className="mt-4 bg-stone-100 rounded-full h-4 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${occupancy.occupancy_rate}%` }}
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-500" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReportsPage;
