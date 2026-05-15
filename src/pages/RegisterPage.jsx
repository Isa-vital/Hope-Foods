import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return Swal.fire({ icon: 'error', title: 'Weak password', text: 'Password must be at least 6 characters', confirmButtonColor: '#ea580c' });
    }
    setSubmitting(true);
    try {
      await register(form);
      Swal.fire({
        icon: 'success',
        title: 'Account created!',
        text: 'Welcome to Hope Foods',
        toast: true,
        position: 'top-end',
        timer: 2500,
        showConfirmButton: false
      });
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.data?.errors?.[0]?.msg || err.message;
      Swal.fire({ icon: 'error', title: 'Registration failed', text: msg, confirmButtonColor: '#ea580c' });
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
            <UserPlus className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Create Account</h1>
          <p className="text-stone-600">Join Hope Foods family</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" required autoComplete="email" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+256 700 000 000"
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" required minLength={6} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={submitting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-base rounded-xl shadow-lg disabled:opacity-50">
            {submitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-stone-600">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-600 font-semibold hover:text-orange-700">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
