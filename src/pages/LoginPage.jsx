import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      const user = await login(email, password);
      Swal.fire({
        icon: 'success',
        title: `Welcome back, ${user.full_name.split(' ')[0]}!`,
        toast: true,
        position: 'top-end',
        timer: 2500,
        showConfirmButton: false
      });
      // Staff → admin dashboard, customers → previous page
      const isStaff = ['admin', 'manager', 'waiter', 'kitchen', 'cashier', 'receptionist'].includes(user.role);
      navigate(isStaff ? '/admin' : from, { replace: true });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Login failed', text: err.message, confirmButtonColor: '#ea580c' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <LogIn className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Welcome Back</h1>
          <p className="text-stone-600">Sign in to your Hope Foods account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-base rounded-xl shadow-lg disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-stone-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-orange-600 font-semibold hover:text-orange-700">
            Create one
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-stone-200 text-center">
          <Link to="/" className="text-sm text-stone-500 hover:text-orange-600">
            ← Back to homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
