import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart, Users, LogOut,
  TrendingUp, Clock, CheckCircle, DollarSign, CalendarDays, Grid3x3, CreditCard,
  BedDouble, Hotel, ChefHat, Package, BarChart3, Wallet, History, UserCog
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ordersApi, formatUGX } from '@/lib/api';
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

const StatCard = ({ icon: Icon, label, value, color = 'orange' }) => (
  <div className="bg-white rounded-2xl p-6 shadow-md flex items-center gap-4">
    <div className={`w-14 h-14 rounded-xl bg-${color}-100 text-${color}-600 flex items-center justify-center`}>
      <Icon size={26} />
    </div>
    <div>
      <p className="text-sm text-stone-500">{label}</p>
      <p className="text-2xl font-bold text-stone-900">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.todayStats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Dashboard</h1>
      <p className="text-stone-600 mb-8">Today's overview · {new Date().toLocaleDateString()}</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-600 border-t-transparent"></div>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShoppingCart} label="Total Orders" value={stats.total_orders} color="blue" />
          <StatCard icon={DollarSign} label="Total Sales" value={formatUGX(stats.total_sales)} color="green" />
          <StatCard icon={Clock} label="Pending" value={stats.pending_orders} color="yellow" />
          <StatCard icon={CheckCircle} label="Preparing" value={stats.preparing_orders} color="indigo" />
        </div>
      ) : (
        <p className="text-stone-500">No data available.</p>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/orders" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition flex items-center gap-4">
          <ShoppingCart className="text-orange-600" size={32} />
          <div>
            <h3 className="font-bold text-stone-900">Manage Orders</h3>
            <p className="text-sm text-stone-600">Update status, view kitchen queue</p>
          </div>
        </Link>
        <Link to="/admin/menu" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition flex items-center gap-4">
          <UtensilsCrossed className="text-orange-600" size={32} />
          <div>
            <h3 className="font-bold text-stone-900">Manage Menu</h3>
            <p className="text-sm text-stone-600">Add, edit, or disable items</p>
          </div>
        </Link>
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
