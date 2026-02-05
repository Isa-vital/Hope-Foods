
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import MenuItem from '../components/MenuItem';

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState('Local Foods');

  const categories = ["Local Foods", "Fast Foods", "Continental", "Beverages"];

  const menuData = {
    "Local Foods": [
      { id: 101, name: 'Luwombo', description: 'Steamed beef or chicken in banana leaves with savory sauce.', price: 'UGX 25,000', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop' },
      { id: 102, name: 'Matooke & G-Nuts', description: 'Traditional green bananas with rich groundnut sauce.', price: 'UGX 15,000', image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=2070&auto=format&fit=crop' },
      { id: 103, name: 'Katogo', description: 'Breakfast classic: matooke cooked with beef or offals.', price: 'UGX 18,000', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop' },
      { id: 104, name: 'Kalo (Millet Bread)', description: 'Traditional millet bread served with fish stew.', price: 'UGX 22,000', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop' },
      { id: 105, name: 'Posho & Beans', description: 'Maize meal with savory red beans in rich sauce.', price: 'UGX 12,000', image: 'https://images.unsplash.com/photo-1598511726623-d2e9996892f0?q=80&w=2074&auto=format&fit=crop' },
      { id: 106, name: 'Roasted Goat', description: 'Succulent roasted goat meat with herbed potatoes.', price: 'UGX 28,000', image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=2070&auto=format&fit=crop' },
      { id: 107, name: 'Sweet Potato & Beans', description: 'Steamed sweet potato with kidney beans.', price: 'UGX 10,000', image: 'https://images.unsplash.com/photo-1557844352-761f2565b576?q=80&w=2070&auto=format&fit=crop' },
      { id: 108, name: 'Smoked Fish & Posho', description: 'Lake Victoria smoked fish with maize meal.', price: 'UGX 20,000', image: 'https://images.unsplash.com/photo-1580959375944-bd850a4eef05?q=80&w=2070&auto=format&fit=crop' },
    ],
    "Fast Foods": [
      { id: 201, name: 'Hope Burger', description: 'Juicy beef patty with cheese, lettuce, tomato, and secret sauce.', price: 'UGX 18,000', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop' },
      { id: 202, name: 'Rolex Special', description: 'Chapati rolled with 2 eggs, cabbage, tomato, and onion.', price: 'UGX 6,000', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=2070&auto=format&fit=crop' },
      { id: 203, name: 'Chicken & Chips', description: '2 pieces of fried chicken with golden french fries.', price: 'UGX 20,000', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=2070&auto=format&fit=crop' },
      { id: 204, name: 'Club Sandwich', description: 'Triple decker sandwich with chicken, bacon, lettuce, and mayo.', price: 'UGX 18,000', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=2073&auto=format&fit=crop' },
      { id: 205, name: 'Kikomando', description: 'Chapati with seasoned red beans in a spiced sauce.', price: 'UGX 5,000', image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?q=80&w=2070&auto=format&fit=crop' },
      { id: 206, name: 'Beef Samosas', description: '4 crispy triangular pastries stuffed with spiced beef.', price: 'UGX 8,000', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop' },
      { id: 207, name: 'Chicken Wings', description: '6 spicy chicken wings with ranch dipping sauce.', price: 'UGX 15,000', image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=2070&auto=format&fit=crop' },
      { id: 208, name: 'Hope Hot Dog', description: 'Grilled sausage in a bun with caramelized onions and sauce.', price: 'UGX 10,000', image: 'https://images.unsplash.com/photo-1552913903-c951a0ac81fc?q=80&w=2070&auto=format&fit=crop' },
      { id: 209, name: 'Loaded Fries', description: 'Crispy fries topped with cheese, bacon, and sour cream.', price: 'UGX 12,000', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=2070&auto=format&fit=crop' },
      { id: 210, name: 'Margherita Pizza', description: 'Classic pizza with fresh tomato sauce, mozzarella, and basil.', price: 'UGX 22,000', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2069&auto=format&fit=crop' },
      { id: 211, name: 'Pepperoni Pizza', description: 'Loaded with pepperoni slices, cheese, and tomato sauce.', price: 'UGX 25,000', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=2080&auto=format&fit=crop' },
      { id: 212, name: 'BBQ Chicken Pizza', description: 'BBQ sauce, grilled chicken, onions, and melted cheese.', price: 'UGX 26,000', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2081&auto=format&fit=crop' },
    ],
    "Continental": [
      { id: 301, name: 'Pepper Steak', description: 'Tender beef fillet with black pepper sauce and mashed potatoes.', price: 'UGX 35,000', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2070&auto=format&fit=crop' },
      { id: 302, name: 'Pasta Carbonara', description: 'Spaghetti with creamy sauce, bacon, and parmesan.', price: 'UGX 24,000', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=2071&auto=format&fit=crop' },
      { id: 303, name: 'Grilled Tilapia', description: 'Whole fresh lake fish with lemon butter sauce.', price: 'UGX 30,000', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop' },
      { id: 304, name: 'Caesar Salad', description: 'Crisp lettuce, croutons, parmesan, and grilled chicken breast.', price: 'UGX 20,000', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=2074&auto=format&fit=crop' },
      { id: 305, name: 'Beef Lasagna', description: 'Layers of pasta, beef ragù, and creamy béchamel sauce.', price: 'UGX 28,000', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=2070&auto=format&fit=crop' },
      { id: 306, name: 'Chicken Alfredo', description: 'Fettuccine with grilled chicken in rich garlic cream sauce.', price: 'UGX 26,000', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=2070&auto=format&fit=crop' },
      { id: 307, name: 'BBQ Pork Ribs', description: 'Slow-cooked ribs with tangy BBQ glaze and coleslaw.', price: 'UGX 38,000', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop' },
      { id: 308, name: 'Prawn Linguine', description: 'Fresh prawns in garlic butter sauce with linguine pasta.', price: 'UGX 32,000', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=2070&auto=format&fit=crop' },
      { id: 309, name: 'Beef Tacos', description: '3 soft tacos with seasoned beef, salsa, and guacamole.', price: 'UGX 22,000', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=2080&auto=format&fit=crop' },
    ],
    "Beverages": [
      { id: 401, name: 'Passion Fruit Juice', description: 'Freshly squeezed sweet passion fruit juice.', price: 'UGX 5,000', image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?q=80&w=2070&auto=format&fit=crop' },
      { id: 402, name: 'African Tea', description: 'Hot spiced tea with ginger and milk.', price: 'UGX 4,000', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=2070&auto=format&fit=crop' },
      { id: 403, name: 'Mango Smoothie', description: 'Rich and creamy fresh mango blend.', price: 'UGX 8,000', image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=2069&auto=format&fit=crop' },
      { id: 404, name: 'House Coffee', description: 'Brewed coffee from local beans.', price: 'UGX 5,000', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2074&auto=format&fit=crop' },
      { id: 405, name: 'Fresh Pineapple Juice', description: 'Chilled pineapple juice, naturally sweet.', price: 'UGX 6,000', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=2074&auto=format&fit=crop' },
      { id: 406, name: 'Iced Latte', description: 'Cold espresso with milk over ice.', price: 'UGX 8,000', image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=2035&auto=format&fit=crop' },
      { id: 407, name: 'Fresh Watermelon Juice', description: 'Refreshing cold-pressed watermelon juice.', price: 'UGX 5,000', image: 'https://images.unsplash.com/photo-1629825899810-abfa6c3f6487?q=80&w=2070&auto=format&fit=crop' },
    ]
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Page Header */}
      <div className="bg-amber-900 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Our Menu</h1>
        <p className="text-orange-100 max-w-xl mx-auto px-4">
          Discover a symphony of flavors from the heart of Uganda and beyond.
        </p>
      </div>

      <div className="container mx-auto px-4 -mt-8">
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
              {menuData[activeCategory].map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
