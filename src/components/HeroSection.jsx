
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden -mt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1689147459899-48a09d4856d4")'
        }}
      />
      
      {/* Warm Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-amber-950/90 via-amber-900/70 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-stone-900/90 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block py-1 px-3 rounded-full bg-orange-600/90 text-white text-sm font-bold tracking-wider mb-6 backdrop-blur-sm"
          >
            EST. 2015
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg"
          >
            Hope <span className="text-orange-500">Foods</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-orange-100 mb-10 font-light max-w-xl leading-relaxed drop-shadow-md"
          >
            Authentic Local & Continental Cuisine prepared with passion and served with warmth.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/menu">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 py-6 text-lg shadow-xl shadow-orange-900/30">
                Order Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/reservation">
              <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white hover:text-amber-900 rounded-full px-8 py-6 text-lg backdrop-blur-sm">
                Reserve Table
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
