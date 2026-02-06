import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Search, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSearch } from '@/context/SearchContext';
import { motion } from 'framer-motion';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { openSearch } = useSearch();
  
  const handleSearchClick = () => {
    // If already on menu page, open search modal
    if (location.pathname === '/menu') {
      openSearch();
    } else {
      // Navigate to menu page first
      navigate('/menu');
    }
  };
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: getCartCount() },
    { icon: Search, label: 'Search', action: handleSearchClick },
    { icon: User, label: 'Profile', path: '/about' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-2xl md:hidden"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ icon: Icon, label, path, action, badge }) => {
          const active = path ? isActive(path) : false;
          
          if (action) {
            return (
              <button
                key={label}
                onClick={action}
                className="flex flex-col items-center justify-center flex-1 h-full group"
              >
                <div className="relative">
                  <Icon 
                    size={24} 
                    className="text-stone-600 group-active:scale-90 transition-transform"
                  />
                </div>
                <span className="text-xs mt-1 text-stone-600">
                  {label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={label}
              to={path}
              className="flex flex-col items-center justify-center flex-1 h-full group"
            >
              <div className="relative">
                <Icon 
                  size={24} 
                  className={`${
                    active 
                      ? 'text-orange-600' 
                      : 'text-stone-600'
                  } group-active:scale-90 transition-transform`}
                />
                {badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-600 rounded-full"
                  />
                )}
              </div>
              <span className={`text-xs mt-1 ${
                active ? 'text-orange-600 font-semibold' : 'text-stone-600'
              }`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MobileBottomNav;
