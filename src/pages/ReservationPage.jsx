
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reservationsApi } from '@/lib/api';
import Swal from 'sweetalert2';

const ReservationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: '2',
    specialRequests: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.date || !formData.time) {
      Swal.fire({
        icon: 'error',
        title: 'Incomplete Details',
        text: 'Please fill in all required fields to secure your table.',
        confirmButtonColor: '#ea580c'
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await reservationsApi.create({
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email || undefined,
        reservation_date: formData.date,
        reservation_time: formData.time,
        party_size: Number(formData.guests),
        special_requests: formData.specialRequests || undefined
      });
      const r = res.data;
      await Swal.fire({
        icon: 'success',
        title: 'Reservation Received!',
        html: `<p>Thank you, <strong>${r.customer_name}</strong>.</p>
               <p class="mt-2">We'll confirm your booking for <strong>${r.reservation_date}</strong> at <strong>${r.reservation_time}</strong> shortly.</p>
               <p class="text-sm text-stone-500 mt-3">Reference: ${r.uuid.slice(0, 8).toUpperCase()}</p>`,
        confirmButtonColor: '#ea580c'
      });
      setFormData({ name: '', phone: '', email: '', date: '', time: '', guests: '2', specialRequests: '' });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Booking failed',
        text: err.message || 'Please try again.',
        confirmButtonColor: '#ea580c'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="bg-amber-900 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Book a Table</h1>
        <p className="text-orange-100 max-w-xl mx-auto px-4">
          Secure your spot for an unforgettable dining experience.
        </p>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto p-8 md:p-12 border border-orange-100"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-stone-800 border-b border-stone-200 pb-2">Contact Details</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-600">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-stone-50 text-stone-900"
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-600">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-stone-50 text-stone-900"
                    placeholder="+256..."
                  />
                </div>
              </div>

              {/* Reservation Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-stone-800 border-b border-stone-200 pb-2">Reservation Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-600">Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-3 text-stone-400" size={18} />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full p-3 pl-10 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-stone-50 text-stone-900"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-600">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 text-stone-400" size={18} />
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full p-3 pl-10 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-stone-50 text-stone-900"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-600">Number of Guests</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 text-stone-400" size={18} />
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full p-3 pl-10 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-stone-50 text-stone-900 appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-sm font-medium text-stone-600">Special Requests (Optional)</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-stone-50 text-stone-900 resize-none"
                placeholder="Allergies, high chair needed, anniversary..."
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 rounded-xl text-lg font-bold shadow-lg shadow-orange-600/30 disabled:opacity-50">
              {submitting ? 'Submitting...' : (<>Confirm Reservation <CheckCircle className="ml-2" /></>)}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ReservationPage;
