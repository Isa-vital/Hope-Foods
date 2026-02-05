
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MenuItem from './MenuItem';

const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'local', name: 'Local Ugandan' },
    { id: 'fast', name: 'Fast Foods' },
    { id: 'continental', name: 'Continental' },
    { id: 'beverages', name: 'Beverages' }
  ];

  const menuItems = [
    // Local Ugandan Foods
    {
      id: 1,
      category: 'local',
      name: 'Luwombo',
      description: 'Traditional steamed beef, chicken or fish wrapped in banana leaves with rich groundnut sauce',
      price: 'UGX 25,000',
      emoji: '🍖'
    },
    {
      id: 2,
      category: 'local',
      name: 'Matooke & Groundnut Sauce',
      description: 'Steamed green bananas served with creamy peanut sauce and vegetables',
      price: 'UGX 15,000',
      emoji: '🍌'
    },
    {
      id: 3,
      category: 'local',
      name: 'Posho & Beans',
      description: 'Cornmeal flour with seasoned beans in tomato sauce',
      price: 'UGX 12,000',
      emoji: '🫘'
    },
    {
      id: 4,
      category: 'local',
      name: 'Katogo',
      description: 'Traditional breakfast of matooke cooked with beef, offals and vegetables',
      price: 'UGX 18,000',
      emoji: '🥘'
    },

    // Fast Foods
    {
      id: 5,
      category: 'fast',
      name: 'Rolex',
      description: 'Rolled chapati with eggs, vegetables and optional beef or chicken',
      price: 'UGX 8,000',
      emoji: '🌯'
    },
    {
      id: 6,
      category: 'fast',
      name: 'Chicken & Chips',
      description: 'Crispy fried chicken pieces with golden french fries',
      price: 'UGX 20,000',
      emoji: '🍗'
    },
    {
      id: 7,
      category: 'fast',
      name: 'Beef Samosas',
      description: 'Crispy pastry filled with spiced minced beef (6 pieces)',
      price: 'UGX 10,000',
      emoji: '🥟'
    },
    {
      id: 8,
      category: 'fast',
      name: 'Loaded Fries',
      description: 'French fries topped with cheese, bacon bits and special sauce',
      price: 'UGX 15,000',
      emoji: '🍟'
    },

    // Continental Foods
    {
      id: 9,
      category: 'continental',
      name: 'Grilled Tilapia',
      description: 'Fresh tilapia grilled to perfection with herbs, served with rice and vegetables',
      price: 'UGX 30,000',
      emoji: '🐟'
    },
    {
      id: 10,
      category: 'continental',
      name: 'Beef Steak',
      description: 'Tender beef steak with mashed potatoes, grilled vegetables and mushroom sauce',
      price: 'UGX 35,000',
      emoji: '🥩'
    },
    {
      id: 11,
      category: 'continental',
      name: 'Pasta Carbonara',
      description: 'Creamy pasta with bacon, parmesan cheese and black pepper',
      price: 'UGX 22,000',
      emoji: '🍝'
    },
    {
      id: 12,
      category: 'continental',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with grilled chicken, croutons and caesar dressing',
      price: 'UGX 18,000',
      emoji: '🥗'
    },

    // Beverages
    {
      id: 13,
      category: 'beverages',
      name: 'Fresh Passion Juice',
      description: 'Freshly squeezed passion fruit juice',
      price: 'UGX 5,000',
      emoji: '🥤'
    },
    {
      id: 14,
      category: 'beverages',
      name: 'Mango Smoothie',
      description: 'Blended mango with yogurt and honey',
      price: 'UGX 8,000',
      emoji: '🥭'
    },
    {
      id: 15,
      category: 'beverages',
      name: 'Traditional Tea',
      description: 'Hot milk tea with local spices',
      price: 'UGX 3,000',
      emoji: '☕'
    },
    {
      id: 16,
      category: 'beverages',
      name: 'Coca-Cola',
      description: 'Chilled soft drinks (300ml)',
      price: 'UGX 3,500',
      emoji: '🥤'
    }
  ];

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="py-16 bg-gradient-to-b from-cream-50 to-orange-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Menu</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our delicious selection of local Ugandan and continental dishes
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-orange-100'
              }`}
            >
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Menu Items Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <MenuItem item={item} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MenuSection;
