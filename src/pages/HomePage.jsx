
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ServicesSection from '../components/ServicesSection';
import MenuItem from '../components/MenuItem';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HomePage = () => {
  // Featured Items for Homepage - 2 from each category
  const featuredItems = [
    // Local Foods
    {
      id: 101,
      name: 'Luwombo',
      description: 'Steamed beef or chicken in banana leaves with savory sauce.',
      price: 'UGX 25,000',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 102,
      name: 'Matooke & G-Nuts',
      description: 'Traditional green bananas with rich groundnut sauce.',
      price: 'UGX 15,000',
      image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=2070&auto=format&fit=crop'
    },
    // Fast Foods
    {
      id: 201,
      name: 'Hope Burger',
      description: 'Juicy beef patty with cheese, lettuce, tomato, and secret sauce.',
      price: 'UGX 18,000',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop'
    },
    {
      id: 210,
      name: 'Margherita Pizza',
      description: 'Classic pizza with fresh tomato sauce, mozzarella, and basil.',
      price: 'UGX 22,000',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2069&auto=format&fit=crop'
    },
    // Continental
    {
      id: 301,
      name: 'Pepper Steak',
      description: 'Tender beef fillet with black pepper sauce and mashed potatoes.',
      price: 'UGX 35,000',
      image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 303,
      name: 'Grilled Tilapia',
      description: 'Whole fresh lake fish with lemon butter sauce.',
      price: 'UGX 30,000',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop'
    },
    // Beverages
    {
      id: 401,
      name: 'Passion Fruit Juice',
      description: 'Freshly squeezed sweet passion fruit juice.',
      price: 'UGX 5,000',
      image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 403,
      name: 'Mango Smoothie',
      description: 'Rich and creamy fresh mango blend.',
      price: 'UGX 8,000',
      image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=2069&auto=format&fit=crop'
    }
  ];

  return (
    <div className="bg-stone-50">
      <HeroSection />

      {/* Welcome Message */}
      <section className="py-16 text-center bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-6"
          >
            Welcome to Hope Foods
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-stone-600 leading-relaxed"
          >
            Experience the true taste of Uganda. We bring you a culinary journey that blends traditional recipes with modern comfort. Every meal is a celebration of flavor, culture, and community.
          </motion.p>
        </div>
      </section>

      {/* Featured Menu Preview */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-orange-600 font-bold tracking-widest text-sm uppercase">Taste the Best</span>
              <h2 className="text-4xl font-serif font-bold text-stone-900 mt-2">Featured Dishes</h2>
            </div>
            <Link to="/menu" className="hidden md:block">
              <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                View Full Menu <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>

          <div className="text-center md:hidden">
            <Link to="/menu">
              <Button className="bg-orange-600 text-white rounded-full">
                View Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <AboutSection />
      
      <ServicesSection />

      {/* Call To Action */}
      <section className="py-24 bg-amber-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/90 to-orange-900/80"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Ready to Experience Hope Foods?</h2>
          <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
            Whether you're planning a romantic dinner, a family gathering, or just need a quick bite, we have a table waiting for you.
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/reservation">
              <Button size="lg" className="bg-white text-orange-900 hover:bg-orange-100 rounded-full px-8 text-lg font-bold">
                Book a Table
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-2 border-orange-200 text-orange-100 hover:bg-orange-800 hover:text-white hover:border-transparent rounded-full px-8 text-lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
