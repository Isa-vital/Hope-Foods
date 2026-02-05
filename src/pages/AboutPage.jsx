
import React from 'react';
import AboutSection from '../components/AboutSection';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-amber-900 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">About Hope Foods</h1>
        <p className="text-orange-100 max-w-xl mx-auto px-4">
          Serving the community with passion since 2015.
        </p>
      </div>
      
      <AboutSection />

      <section className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-3xl shadow-xl border border-orange-100"
          >
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6 text-center">Our Philosophy</h3>
            <p className="text-lg text-stone-600 leading-relaxed mb-6">
              At Hope Foods, we believe that food is more than just sustenance; it is a language of love. Founded by a family passionate about Ugandan culinary heritage, our mission has always been to bring the authentic taste of home-cooked meals to a restaurant setting.
            </p>
            <p className="text-lg text-stone-600 leading-relaxed">
              We work directly with local farmers to ensure that every vegetable, fruit, and grain that enters our kitchen is fresh, organic, and ethically sourced. When you dine with us, you're not just supporting a restaurant; you're supporting a network of local growers and a tradition of excellence.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
