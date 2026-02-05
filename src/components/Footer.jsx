
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-orange-500 mb-6">Hope Foods</h3>
            <p className="mb-6 leading-relaxed text-stone-400">
              Authentic Ugandan hospitality meets culinary excellence. Serving fresh, local, and continental dishes with a warm smile.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'Menu', 'About', 'Contact', 'Reservation'].map((item) => (
                <li key={item}>
                  <Link 
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="hover:text-orange-400 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-orange-500 shrink-0 mt-1" size={18} />
                <span>Kampala Road, Plot 42<br />Kampala, Uganda</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-orange-500 shrink-0" size={18} />
                <span>+256 788 306 796</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-orange-500 shrink-0" size={18} />
                <span>info@hopefoods.ug</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Opening Hours</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Clock className="text-orange-500 shrink-0" size={18} />
                <div>
                  <span className="block text-white">Mon - Sun</span>
                  <span className="text-sm">10:00 AM - 10:00 PM</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 text-center text-sm text-stone-500">
          <p>&copy; {new Date().getFullYear()} Hope Foods. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
