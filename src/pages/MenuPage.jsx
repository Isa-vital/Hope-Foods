
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/context/SearchContext';
import { menuApi } from '@/lib/api';
import MenuItem from '../components/MenuItem';
import MenuItemDetails from '../components/MenuItemDetails';
import SearchModal from '../components/SearchModal';

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState('Local Foods');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [menuData, setMenuData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isSearchOpen, openSearch, closeSearch } = useSearch();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const grouped = await menuApi.getMenuGrouped();
        if (cancelled) return;
        setMenuData(grouped);
        const names = Object.keys(grouped);
        setCategories(names);
        if (names.length && !grouped[activeCategory]) {
          setActiveCategory(names[0]);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load menu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get related items from the same category
  const getRelatedItems = (item) => {
    let itemCategory = '';
    for (const category in menuData) {
      if (menuData[category].some(menuItem => menuItem.id === item.id)) {
        itemCategory = category;
        break;
      }
    }
    if (!itemCategory) return [];
    const categoryItems = menuData[itemCategory].filter(menuItem => menuItem.id !== item.id);
    const shuffled = [...categoryItems].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Page Header */}
      <div className="bg-amber-900 py-16 text-center relative">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Our Menu</h1>
        <p className="text-orange-100 max-w-xl mx-auto px-4">
          Discover a symphony of flavors from the heart of Uganda and beyond.
        </p>

        <button
          onClick={openSearch}
          className="absolute top-4 right-4 md:top-8 md:right-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 shadow-lg"
          aria-label="Search menu"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      <div className="container mx-auto px-4 mt-8">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mb-4"></div>
            <p className="text-stone-600 font-medium">Loading delicious menu...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 text-center">
            <AlertCircle className="mx-auto mb-3" />
            <h3 className="font-bold mb-2">Couldn't load menu</h3>
            <p className="text-sm mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-orange-600 hover:bg-orange-700 text-white">
              Try Again
            </Button>
          </div>
        )}

        {/* Loaded content */}
        {!loading && !error && categories.length > 0 && (
          <>
            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-12 bg-white p-4 rounded-xl shadow-lg max-w-4xl mx-auto border border-stone-100">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-stone-600 hover:bg-orange-50 hover:text-orange-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {(menuData[activeCategory] || []).map((item) => (
                    <MenuItem key={item.id} item={item} onClick={handleItemClick} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Menu Item Details Modal */}
      {selectedItem && (
        <MenuItemDetails
          item={selectedItem}
          relatedItems={getRelatedItems(selectedItem)}
          isOpen={showDetails}
          onClose={handleCloseDetails}
          onRelatedItemClick={handleItemClick}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={closeSearch}
        menuData={menuData}
        onItemClick={handleItemClick}
      />
    </div>
  );
};

export default MenuPage;
