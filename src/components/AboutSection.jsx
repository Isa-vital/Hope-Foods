
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, Award, Smile } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop" 
                alt="Hope Foods Ambience" 
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white max-w-xs">
                <p className="font-serif italic text-2xl">"Cooking with love provides food for the soul."</p>
              </div>
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-100 rounded-full -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-amber-50 rounded-full -z-10" />
          </motion.div>

          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <span className="text-orange-600 font-bold tracking-widest text-sm uppercase">Our Story</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mt-2 mb-6">Authentic Flavors, Warm Hospitality</h2>
            <p className="text-lg text-stone-600 mb-6 leading-relaxed">
              Hope Foods is dedicated to serving authentic Ugandan cuisine alongside continental favorites. We source fresh local ingredients and prepare every dish with care and passion.
            </p>
            <p className="text-lg text-stone-600 mb-8 leading-relaxed">
              Our warm, cozy atmosphere welcomes families, friends, and food lovers to share memorable meals together. It's not just about the food; it's about the feeling of home.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {[
                { icon: Leaf, text: "Fresh & Local" },
                { icon: Award, text: "Premium Quality" },
                { icon: Smile, text: "Friendly Service" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4 bg-stone-50 rounded-xl">
                  <item.icon className="text-orange-500 mb-2" size={24} />
                  <span className="font-bold text-stone-800 text-sm">{item.text}</span>
                </div>
              ))}
            </div>

            <Link to="/about">
              <Button variant="outline" className="border-orange-600 text-orange-900 hover:bg-orange-600 hover:text-white px-8 py-2 rounded-full">
                Learn More About Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
