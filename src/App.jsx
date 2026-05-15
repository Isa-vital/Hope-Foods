import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import HomePage from '@/pages/HomePage';
import MenuPage from '@/pages/MenuPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import ReservationPage from '@/pages/ReservationPage';
import BookingPage from '@/pages/BookingPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MyOrdersPage from '@/pages/MyOrdersPage';
import MyBookingsPage from '@/pages/MyBookingsPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CartProvider } from '@/context/CartContext';
import { SearchProvider } from '@/context/SearchContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <Helmet>
            <title>Hope Foods - Authentic Ugandan Cuisine</title>
            <meta name="description" content="Experience the authentic taste of Uganda at Hope Foods restaurant" />
          </Helmet>

          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-stone-50">
            {!isAdminRoute && <Header />}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/reservation" element={<ReservationPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/order/:id" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <MyOrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="/my-bookings" element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/*" element={
                  <ProtectedRoute roles={['admin', 'manager', 'waiter', 'kitchen', 'cashier', 'reception']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            {!isAdminRoute && <Footer />}
            <Toaster />
          </div>
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
