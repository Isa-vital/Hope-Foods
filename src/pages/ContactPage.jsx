
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    if (!formData.name || !formData.email || !formData.message) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all fields.',
        confirmButtonColor: '#ea580c'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Message Sent!',
      text: 'Thank you for contacting us. We will get back to you shortly.',
      confirmButtonColor: '#ea580c'
    });
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="bg-amber-900 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Contact Us</h1>
        <p className="text-orange-100 max-w-xl mx-auto px-4">
          We'd love to hear from you. Reach out for queries, feedback, or just to say hello.
        </p>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-5xl mx-auto flex flex-col md:flex-row">
          
          {/* Info Side */}
          <div className="md:w-2/5 bg-stone-900 text-white p-10 flex flex-col justify-between relative overflow-hidden">
             {/* Decorative */}
             <div className="absolute top-0 right-0 w-40 h-40 bg-orange-600 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
             
            <div>
              <h3 className="text-2xl font-serif font-bold mb-8">Get In Touch</h3>
              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="text-orange-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">Our Location</h5>
                    <p className="text-stone-400">Kampala Road, Plot 42<br/>Kampala, Uganda</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="text-orange-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">Phone Number</h5>
                    <p className="text-stone-400">+256 788 306 796</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="text-orange-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">Email Address</h5>
                    <p className="text-stone-400">info@hopefoods.ug</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/10">
              <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Clock size={18} className="text-orange-500" /> Opening Hours
              </h5>
              <p className="text-stone-400">Mon - Sun: 10:00 AM - 10:00 PM</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:w-3/5 p-10">
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Send us a Message</h3>
            <p className="text-stone-500 mb-8">Feel free to ask about our menu, catering, or anything else.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-stone-700">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-stone-50 text-stone-900"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-stone-700">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-stone-50 text-stone-900"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-stone-700">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-stone-50 text-stone-900 resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 rounded-lg text-lg font-bold shadow-lg shadow-orange-600/20">
                Send Message <Send size={18} className="ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
