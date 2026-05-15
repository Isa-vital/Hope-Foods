
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const MenuItem = ({ item, onClick }) => {
  const { addToCart, cart, updateQuantity } = useCart();
  const navigate = useNavigate();

  // Find if item is already in cart
  const cartItem = cart.find((cartItem) => cartItem.id === item.id);
  const isInCart = !!cartItem;

  const handleClick = (e) => {
    // If onClick is provided (for opening details), use it
    // Otherwise, add directly to cart
    if (onClick) {
      onClick(item);
    } else {
      e.stopPropagation();
      addToCart(item);
    }
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(item);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    // Add to cart if not already there
    if (!isInCart) {
      addToCart(item);
    }
    // Navigate to checkout
    navigate('/checkout');
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(item.id, cartItem.quantity + 1);
    }
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(item.id, cartItem.quantity - 1);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick ? () => onClick(item) : undefined}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-stone-100 flex flex-col h-full group cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden bg-stone-200">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-100 text-4xl">
            🍽️
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-orange-700 font-bold shadow-sm">
          {item.price}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-serif font-bold text-stone-900 mb-2 group-hover:text-orange-600 transition-colors">
          {item.name}
        </h3>
        <p className="text-stone-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-2">
          {item.description}
        </p>
        
        {!isInCart ? (
          <div className="flex gap-2">
            <Button 
              onClick={handleQuickAdd}
              className="flex-1 bg-stone-900 hover:bg-stone-800 text-white rounded-none transition-colors group/btn"
            >
              Add to Cart <Plus className="ml-2 h-4 w-4 group-hover/btn:rotate-90 transition-transform" />
            </Button>
            <Button 
              onClick={handleBuyNow}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-none transition-colors group/btn"
            >
              Buy Now <ShoppingBag className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-stone-100 rounded-none p-2">
            <Button 
              onClick={handleDecrease}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none hover:bg-stone-200 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg text-stone-900 min-w-[2rem] text-center">
              {cartItem.quantity}
            </span>
            <Button 
              onClick={handleIncrease}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none hover:bg-stone-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MenuItem;
