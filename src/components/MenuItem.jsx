
import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const MenuItem = ({ item }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(item);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-stone-100 flex flex-col h-full group"
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
        <p className="text-stone-600 text-sm leading-relaxed mb-6 flex-grow">
          {item.description}
        </p>
        
        <Button 
          onClick={handleAddToCart}
          className="w-full bg-stone-900 hover:bg-orange-600 text-white rounded-xl transition-colors group/btn"
        >
          Add to Cart <Plus className="ml-2 h-4 w-4 group-hover/btn:rotate-90 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
};

export default MenuItem;
