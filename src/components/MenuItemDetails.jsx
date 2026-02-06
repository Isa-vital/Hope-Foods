import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const MenuItemDetails = ({ item, relatedItems, onClose, onItemClick }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!item) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    onClose();
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
    addToCart(item);
  };
  
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <X className="text-stone-600" size={24} />
          </button>

          {/* Item Image */}
          <div className="relative h-64 bg-stone-100">
            {item.image ? (
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">
                🍽️
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
              {item.price}
            </div>
          </div>

          {/* Item Details */}
          <div className="p-6 pb-32">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-3xl font-serif font-bold text-stone-900 flex-1">
                {item.name}
              </h2>
              <div className="flex items-center gap-1 ml-4">
                <Star className="text-amber-400 fill-amber-400" size={20} />
                <span className="font-bold text-stone-900">4.5</span>
              </div>
            </div>

            <p className="text-stone-600 leading-relaxed mb-6">
              {item.description}
            </p>

            {/* Quantity Selector */}
            <div className="bg-stone-50 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-stone-700 font-semibold">Quantity</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={decrementQuantity}
                    className="w-10 h-10 rounded-full bg-white border-2 border-orange-200 hover:border-orange-600 flex items-center justify-center transition-colors"
                  >
                    <Minus size={20} className="text-orange-600" />
                  </button>
                  <span className="text-2xl font-bold text-stone-900 w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 flex items-center justify-center transition-colors"
                  >
                    <Plus size={20} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Related Items */}
            {relatedItems && relatedItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-stone-900 mb-4">You might also like</h3>
                <div className="grid grid-cols-2 gap-4">
                  {relatedItems.slice(0, 4).map((relatedItem) => (
                    <motion.div
                      key={relatedItem.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onItemClick(relatedItem)}
                      className="bg-white border-2 border-stone-100 rounded-xl overflow-hidden cursor-pointer hover:border-orange-300 transition-colors"
                    >
                      <div className="relative h-24 bg-stone-100">
                        {relatedItem.image ? (
                          <img 
                            src={relatedItem.image} 
                            alt={relatedItem.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🍽️
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-sm text-stone-900 truncate">
                          {relatedItem.name}
                        </h4>
                        <p className="text-orange-600 font-bold text-sm mt-1">
                          {relatedItem.price}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fixed Add to Cart Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 pb-safe md:pb-4">
            <Button
              onClick={handleAddToCart}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full py-6 text-lg font-bold shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingCart size={24} />
              Add {quantity} to Cart - {item.price}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MenuItemDetails;
