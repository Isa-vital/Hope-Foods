
import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, ShoppingBag, Clock, Heart } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: Utensils,
      title: "Dine-In Experience",
      description: "Enjoy our comfortable, family-friendly atmosphere designed for relaxation and good times.",
      benefits: ["Comfortable Seating", "Ambient Music", "Free Wi-Fi"]
    },
    {
      icon: ShoppingBag,
      title: "Quick Take-Away",
      description: "In a hurry? Grab your favorites on the go with our efficient take-away service.",
      benefits: ["Secure Packaging", "Quick Service", "Curbside Pickup"]
    }
  ];

  return (
    <section className="py-20 bg-orange-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-orange-600 font-bold tracking-widest text-sm uppercase">Our Services</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mt-2 mb-6">Dining Options</h2>
          <p className="text-lg text-stone-600">
            Whether you want to stay and relax or grab a bite on the go, we have you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-orange-100"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
                <service.icon size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">{service.title}</h3>
              <p className="text-stone-600 mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center text-sm text-stone-500">
                    <Heart size={14} className="text-orange-400 mr-2" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
