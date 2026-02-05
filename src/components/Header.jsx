
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, UtensilsCrossed, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { getCartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
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
          <div className="hidden md:flex items-center gap-4">
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
            <Link to="/menu">
              <Button variant="ghost" className="text-orange-100 hover:text-white hover:bg-white/10">
                Order Online
              </Button>
            </Link>
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
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
