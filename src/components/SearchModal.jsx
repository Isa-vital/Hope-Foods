import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const SearchModal = ({ isOpen, onClose, menuData, onItemClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { addToCart } = useCart();

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    addToCart(item);
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Flatten all menu items from all categories
    const allItems = Object.values(menuData).flat();
    
    // Filter items based on search term
    const results = allItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(results);
  }, [searchTerm, menuData]);

  if (!isOpen) return null;

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
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute top-0 left-0 right-0 bg-white rounded-b-3xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="sticky top-0 bg-white border-b border-stone-200 p-4 z-10">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for dishes..."
                  autoFocus
                  className="w-full pl-12 pr-4 py-3 bg-stone-100 rounded-full border-2 border-transparent focus:border-orange-500 focus:outline-none text-stone-900"
                />
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center"
              >
                <X className="text-stone-600" size={24} />
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-4">
            {searchTerm.trim() === '' ? (
              <div className="text-center py-12">
                <SearchIcon className="mx-auto text-stone-300 mb-4" size={64} />
                <p className="text-stone-500">Start typing to search for dishes</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-stone-500 text-lg">No items found</p>
                <p className="text-stone-400 text-sm mt-2">Try different keywords</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-stone-500 mb-4">
                  Found {searchResults.length} {searchResults.length === 1 ? 'item' : 'items'}
                </p>
                {searchResults.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-white border-2 border-stone-100 rounded-2xl p-3 hover:border-orange-300 transition-colors"
                  >
                    <div 
                      className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                      onClick={() => {
                        onItemClick(item);
                        onClose();
                      }}
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🍽️
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-stone-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-stone-600 truncate mt-1">
                          {item.description}
                        </p>
                        <p className="text-orange-600 font-bold mt-2">
                          {item.price}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, item)}
                      className="shrink-0 w-12 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;
