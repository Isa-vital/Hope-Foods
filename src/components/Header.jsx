
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, UtensilsCrossed, ShoppingCart, User, LogOut, ClipboardList, LayoutDashboard, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { user, isStaff, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Rooms', path: '/booking' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-amber-950/95 backdrop-blur-md shadow-lg py-2' : 'bg-amber-950/80 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between text-white">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <UtensilsCrossed size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold font-serif text-orange-50">Hope Foods</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide hover:text-orange-300 transition-colors relative ${
                  location.pathname === link.path ? 'text-orange-400' : 'text-orange-50'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-400"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/cart">
              <Button variant="ghost" className="text-orange-100 hover:text-white hover:bg-white/10 relative">
                <ShoppingCart size={20} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-orange-50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-sm font-bold">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.full_name?.split(' ')[0]}</span>
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 text-stone-800"
                    >
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="font-semibold text-sm truncate">{user.full_name}</p>
                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      </div>
                      {isStaff && (
                        <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-orange-50">
                          <LayoutDashboard size={16} />Admin Dashboard
                        </Link>
                      )}
                      <Link to="/orders" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-orange-50">
                        <ClipboardList size={16} />My Orders
                      </Link>
                      <Link to="/my-bookings" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-orange-50">
                        <BedDouble size={16} />My Bookings
                      </Link>
                      <button onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600">
                        <LogOut size={16} />Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="ghost" className="text-orange-100 hover:text-white hover:bg-white/10">
                  <User size={16} className="mr-1" />Login
                </Button>
              </Link>
            )}

            <Link to="/reservation">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 shadow-lg shadow-orange-900/20">
                Reserve Table
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-orange-50 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-amber-950 border-t border-white/10 mt-2 rounded-b-xl"
            >
              <nav className="flex flex-col p-4 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === link.path
                        ? 'bg-orange-600/20 text-orange-400'
                        : 'text-orange-100 hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-orange-500/30 text-orange-100 hover:bg-orange-500/20 relative">
                      <ShoppingCart size={16} />
                      {getCartCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {getCartCount()}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Link to="/menu" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-orange-500/30 text-orange-100 hover:bg-orange-500/20">
                      Order
                    </Button>
                  </Link>
                  <Link to="/reservation" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      Reserve
                    </Button>
                  </Link>
                </div>
                {user ? (
                  <div className="mt-3 border-t border-white/10 pt-3 space-y-1">
                    <p className="px-4 text-sm text-orange-300">Hi, {user.full_name}</p>
                    {isStaff && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-orange-100 hover:bg-white/5 rounded-lg">
                        <LayoutDashboard size={16} />Admin Dashboard
                      </Link>
                    )}
                    <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-orange-100 hover:bg-white/5 rounded-lg">
                      <ClipboardList size={16} />My Orders
                    </Link>
                    <Link to="/my-bookings" onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-orange-100 hover:bg-white/5 rounded-lg">
                      <BedDouble size={16} />My Bookings
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-white/5 rounded-lg">
                      <LogOut size={16} />Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-3 border-t border-white/10 pt-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-orange-500/30 text-orange-100 hover:bg-orange-500/20">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
