import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart, Users, LogOut,
  TrendingUp, TrendingDown, Clock, CheckCircle, DollarSign, CalendarDays, Grid3x3, CreditCard,
  BedDouble, Hotel, ChefHat, Package, BarChart3, Wallet, History, UserCog, AlertTriangle, Activity
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ordersApi, reportsApi, formatUGX } from '@/lib/api';
import AdminMenuPage from './AdminMenuPage';
import AdminOrdersPage from './AdminOrdersPage';
import AdminReservationsPage from './AdminReservationsPage';
import AdminTablesPage from './AdminTablesPage';
import POSPage from './POSPage';
import AdminRoomsPage from './AdminRoomsPage';
import AdminBookingsPage from './AdminBookingsPage';
import KitchenDisplayPage from './KitchenDisplayPage';
import AdminInventoryPage from './AdminInventoryPage';
import AdminReportsPage from './AdminReportsPage';
import AdminShiftsPage from './AdminShiftsPage';
import AdminActivityLogPage from './AdminActivityLogPage';
import AdminUsersPage from './AdminUsersPage';

const COLOR_MAP = {
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-emerald-100 text-emerald-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
  teal: 'bg-teal-100 text-teal-600'
};

const StatCard = ({ icon: Icon, label, value, sub, trend, color = 'orange' }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition flex items-start gap-4"
  >
    <div className={`w-12 h-12 rounded-xl ${COLOR_MAP[color]} flex items-center justify-center shrink-0`}>
      <Icon size={24} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-stone-500 uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-2xl font-bold text-stone-900 leading-tight mt-0.5 truncate">{value}</p>
      {sub && <p className="text-xs text-stone-500 mt-0.5">{sub}</p>}
      {trend !== undefined && trend !== null && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend).toFixed(1)}% vs yesterday
        </div>
      )}
    </div>
  </motion.div>
);

// Inline bar chart (no external chart lib)
const SalesBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-stone-400 py-12 text-sm">No sales data for the last 7 days.</p>;
  }
  const max = Math.max(...data.map((d) => Number(d.revenue) || 0), 1);
  return (
    <div className="flex items-end gap-2 h-48 px-2">
      {data.map((d, i) => {
        const rev = Number(d.revenue) || 0;
        const heightPct = (rev / max) * 100;
        const dateLabel = new Date(d.date).toLocaleDateString('en-UG', { weekday: 'short' });
        return (
          <div key={d.date || i} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-[10px] font-semibold text-stone-700 opacity-0 group-hover:opacity-100 transition">
              {formatUGX(rev)}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(heightPct, 2)}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-md hover:from-orange-700 hover:to-orange-500 cursor-pointer"
              title={`${dateLabel}: ${formatUGX(rev)} · ${d.orders} orders`}
            />
            <span className="text-[11px] text-stone-600 font-medium">{dateLabel}</span>
          </div>
        );
      })}
    </div>
  );
};

const TopItemsChart = ({ items }) => {
  if (!items || items.length === 0) {
    return <p className="text-center text-stone-400 py-12 text-sm">No item sales yet this week.</p>;
  }
  const max = Math.max(...items.map((i) => Number(i.qty_sold) || 0), 1);
  return (
    <div className="space-y-3">
      {items.map((it, idx) => {
        const qty = Number(it.qty_sold) || 0;
        const widthPct = (qty / max) * 100;
        return (
          <div key={it.id || idx}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-stone-700 truncate pr-2">{idx + 1}. {it.name}</span>
              <span className="text-stone-500 shrink-0">{qty} · {formatUGX(it.revenue)}</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PaymentMethodsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-stone-400 py-8 text-sm">No payments recorded yet.</p>;
  }
  const total = data.reduce((s, d) => s + Number(d.total || 0), 0) || 1;
  const colors = ['bg-orange-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
  return (
    <div className="space-y-3">
      {data.map((d, idx) => {
        const amt = Number(d.total) || 0;
        const pct = (amt / total) * 100;
        return (
          <div key={d.payment_method || idx}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-stone-700 capitalize">
                {(d.payment_method || 'unknown').replace('_', ' ')}
              </span>
              <span className="text-stone-500">{formatUGX(amt)} ({pct.toFixed(0)}%)</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className={`h-full ${colors[idx % colors.length]} rounded-full`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const formatDate = (d) => d.toISOString().slice(0, 10);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [sales, setSales] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [todayStats, setTodayStats] = useState(null);
  const [yesterdayRevenue, setYesterdayRevenue] = useState(0);

  useEffect(() => {
    const today = new Date();
    const sevenAgo = new Date(today); sevenAgo.setDate(today.getDate() - 6);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const from = formatDate(sevenAgo);
    const to = formatDate(today);

    Promise.allSettled([
      reportsApi.dashboard(),
      reportsApi.sales(from, to),
      reportsApi.topItems(from, to, 5),
      reportsApi.paymentMethods(from, to),
      ordersApi.todayStats()
    ]).then(([dashRes, salesRes, topRes, payRes, todayRes]) => {
      if (dashRes.status === 'fulfilled') setOverview(dashRes.value.data);
      if (todayRes.status === 'fulfilled') setTodayStats(todayRes.value.data);

      if (salesRes.status === 'fulfilled') {
        const breakdown = salesRes.value.data?.breakdown || [];
        // Pad missing days so chart always shows 7 bars
        const map = {};
        for (const row of breakdown) {
          const key = formatDate(new Date(row.date));
          map[key] = row;
        }
        const filled = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today); d.setDate(today.getDate() - i);
          const key = formatDate(d);
          filled.push(map[key] || { date: key, orders: 0, revenue: 0 });
        }
        setSales(filled);

        const yKey = formatDate(yesterday);
        const yRow = map[yKey];
        setYesterdayRevenue(yRow ? Number(yRow.revenue) || 0 : 0);
      }

      if (topRes.status === 'fulfilled') setTopItems(topRes.value.data || []);
      if (payRes.status === 'fulfilled') setPayments(payRes.value.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  const today = overview?.today || { orders: 0, revenue: 0 };
  const week = overview?.week || { orders: 0, revenue: 0 };
  const month = overview?.month || { orders: 0, revenue: 0 };
  const todayRevenue = Number(today.revenue) || 0;
  const revenueTrend = yesterdayRevenue > 0
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
    : (todayRevenue > 0 ? 100 : null);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-600 text-sm">
            {new Date().toLocaleDateString('en-UG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {overview?.low_stock_count > 0 && (
          <Link to="/admin/inventory" className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl hover:bg-red-100 transition">
            <AlertTriangle size={18} />
            <span className="text-sm font-semibold">{overview.low_stock_count} item(s) low on stock</span>
          </Link>
        )}
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign} color="green" label="Today's Revenue"
          value={formatUGX(todayRevenue)} sub={`${today.orders} order(s)`} trend={revenueTrend} />
        <StatCard icon={Clock} color="yellow" label="Pending Now"
          value={todayStats?.pending_orders ?? 0} sub={`${todayStats?.preparing_orders ?? 0} preparing`} />
        <StatCard icon={TrendingUp} color="blue" label="Last 7 Days"
          value={formatUGX(week.revenue)} sub={`${week.orders} order(s)`} />
        <StatCard icon={Hotel} color="purple" label="Active Bookings"
          value={overview?.active_bookings ?? 0} sub="Confirmed + checked-in" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-orange-600" />
              Revenue · Last 7 Days
            </h2>
            <Link to="/admin/reports" className="text-xs text-orange-600 hover:underline font-semibold">
              Full reports →
            </Link>
          </div>
          <SalesBarChart data={sales} />
          <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-stone-500">Week Total</p>
              <p className="font-bold text-stone-900">{formatUGX(week.revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Avg / day</p>
              <p className="font-bold text-stone-900">{formatUGX(Number(week.revenue) / 7)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">30-day total</p>
              <p className="font-bold text-stone-900">{formatUGX(month.revenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
            <CreditCard size={20} className="text-emerald-600" />
            Payment Mix (7d)
          </h2>
          <PaymentMethodsChart data={payments} />
        </div>
      </div>

      {/* Top items + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
            <UtensilsCrossed size={20} className="text-orange-600" />
            Top 5 Menu Items (7d)
          </h2>
          <TopItemsChart items={topItems} />
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
            <Activity size={20} className="text-blue-600" />
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Link to="/admin/pos" className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition">
              <CreditCard className="text-orange-600" size={20} />
              <span className="font-semibold text-stone-800">Open POS</span>
            </Link>
            <Link to="/admin/kitchen" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition">
              <ChefHat className="text-indigo-600" size={20} />
              <span className="font-semibold text-stone-800">Kitchen Display</span>
            </Link>
            <Link to="/admin/orders" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition">
              <ShoppingCart className="text-amber-700" size={20} />
              <span className="font-semibold text-stone-800">Manage Orders</span>
            </Link>
            <Link to="/admin/shifts" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition">
              <Wallet className="text-emerald-600" size={20} />
              <span className="font-semibold text-stone-800">Cash Shifts</span>
            </Link>
            <Link to="/admin/inventory" className="flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 transition">
              <Package className="text-red-600" size={20} />
              <span className="font-semibold text-stone-800">Inventory</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/pos', label: 'POS', icon: CreditCard },
    { to: '/admin/shifts', label: 'Shifts', icon: Wallet },
    { to: '/admin/kitchen', label: 'Kitchen', icon: ChefHat },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/reservations', label: 'Reservations', icon: CalendarDays },
    { to: '/admin/tables', label: 'Tables', icon: Grid3x3 },
    { to: '/admin/bookings', label: 'Bookings', icon: Hotel },
    { to: '/admin/rooms', label: 'Rooms', icon: BedDouble },
    { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/admin/inventory', label: 'Inventory', icon: Package },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/users', label: 'Users', icon: UserCog },
    { to: '/admin/activity', label: 'Activity Log', icon: History }
  ];

  return (
    <div className="min-h-screen bg-stone-100 -mt-20 pt-20">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-amber-950 text-orange-50 min-h-screen sticky top-0 p-6">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold font-serif">Hope Foods</span>
          </Link>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive ? 'bg-orange-600 text-white' : 'hover:bg-amber-900 text-orange-100'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-amber-900 pt-4 mt-4">
            <p className="text-sm font-medium text-orange-100">{user?.full_name}</p>
            <p className="text-xs text-orange-300 capitalize mb-3">{user?.role}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-orange-200 hover:text-white"
            >
              <LogOut size={16} />Logout
            </button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="md:hidden fixed top-20 left-0 right-0 bg-amber-950 text-white z-40 px-4 py-3 flex items-center justify-between">
          <span className="font-bold">Admin · {user?.role}</span>
          <button onClick={handleLogout} className="text-orange-200"><LogOut size={18} /></button>
        </div>

        {/* Mobile nav tabs */}
        <div className="md:hidden fixed top-32 left-0 right-0 bg-white border-b border-stone-200 z-30 flex overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 ${
                  isActive ? 'border-orange-600 text-orange-600 font-semibold' : 'border-transparent text-stone-600'
                }`
              }
            >
              <item.icon size={16} />{item.label}
            </NavLink>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 mt-24 md:mt-0">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="shifts" element={<AdminShiftsPage />} />
            <Route path="kitchen" element={<KitchenDisplayPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="reservations" element={<AdminReservationsPage />} />
            <Route path="tables" element={<AdminTablesPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="rooms" element={<AdminRoomsPage />} />
            <Route path="menu" element={<AdminMenuPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="activity" element={<AdminActivityLogPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
