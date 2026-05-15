import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { BedDouble, Users, Wifi, Tv, Wind, Search, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { roomsApi, bookingsApi, formatUGX } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const todayStr = () => new Date().toISOString().slice(0, 10);
const tomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const amenityIcon = (label) => {
  const l = label.toLowerCase();
  if (l.includes('wifi')) return <Wifi size={14} />;
  if (l.includes('tv')) return <Tv size={14} />;
  if (l.includes('ac') || l.includes('air')) return <Wind size={14} />;
  return null;
};

const BookingPage = () => {
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState(todayStr());
  const [checkOut, setCheckOut] = useState(tomorrowStr());
  const [searched, setSearched] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({
    guest_name: user?.full_name || '',
    guest_phone: user?.phone || '',
    guest_email: user?.email || '',
    guest_id_number: '',
    num_guests: 1,
    notes: ''
  });
  const [booking, setBooking] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const nights = Math.max(
    1,
    Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
  );

  const search = async () => {
    if (new Date(checkOut) <= new Date(checkIn)) {
      return Swal.fire({ icon: 'warning', title: 'Invalid dates', text: 'Check-out must be after check-in', confirmButtonColor: '#ea580c' });
    }
    setLoading(true);
    try {
      const res = await roomsApi.availability(checkIn, checkOut);
      setRooms(res.data || []);
      setSearched(true);
      setSelectedRoom(null);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Search failed', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setBooking(true);
    try {
      const res = await bookingsApi.create({
        ...form,
        room_id: selectedRoom.id,
        check_in_date: checkIn,
        check_out_date: checkOut
      });
      setConfirmation(res.data);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Booking failed', text: err.message });
    } finally {
      setBooking(false);
    }
  };

  if (confirmation) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-stone-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Booking Confirmed!</h1>
          <p className="text-stone-600 mb-6">Your reservation has been received. Please save your reference number.</p>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
            <p className="text-sm text-stone-600">Booking Reference</p>
            <p className="text-2xl font-bold text-orange-600 tracking-wider">{confirmation.booking_number}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left mb-6">
            <div>
              <p className="text-xs text-stone-500">Check-in</p>
              <p className="font-semibold">{checkIn}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Check-out</p>
              <p className="font-semibold">{checkOut}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Nights</p>
              <p className="font-semibold">{confirmation.num_nights}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Total</p>
              <p className="font-semibold text-orange-600">{formatUGX(confirmation.total)}</p>
            </div>
          </div>
          <p className="text-sm text-stone-500 mb-4">We'll contact you to confirm and arrange payment.</p>
          <Button onClick={() => { setConfirmation(null); setSearched(false); setSelectedRoom(null); }}
            className="bg-orange-600 hover:bg-orange-700 text-white">
            Make Another Booking
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-stone-50">
      <Helmet><title>Book a Room - Hope Foods</title></Helmet>

      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-2">Book Your Stay</h1>
          <p className="text-stone-600">Comfortable rooms with authentic Ugandan hospitality</p>
        </motion.div>

        {/* Search bar */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Check-in</label>
              <input type="date" value={checkIn} min={todayStr()}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Check-out</label>
              <input type="date" value={checkOut} min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
            </div>
            <div className="flex items-end">
              <Button onClick={search} disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5">
                <Search size={18} className="mr-2" />
                {loading ? 'Searching...' : `Search (${nights} night${nights > 1 ? 's' : ''})`}
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {searched && rooms.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <BedDouble size={48} className="mx-auto text-stone-300 mb-3" />
            <p className="text-stone-600">No rooms available for these dates. Try different dates.</p>
          </div>
        )}

        {searched && rooms.length > 0 && !selectedRoom && (
          <div className="space-y-4">
            <p className="text-stone-600 font-semibold">{rooms.length} room{rooms.length > 1 ? 's' : ''} available</p>
            {rooms.map((room) => {
              const amenities = (() => {
                try { return room.amenities ? (typeof room.amenities === 'string' ? JSON.parse(room.amenities) : room.amenities) : []; }
                catch { return []; }
              })();
              const total = parseFloat(room.base_price) * nights;
              return (
                <motion.div key={room.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
                        <BedDouble size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-stone-900">{room.room_type_name}</h3>
                        <p className="text-sm text-stone-500">Room {room.room_number}{room.floor ? ` · Floor ${room.floor}` : ''}</p>
                      </div>
                    </div>
                    <p className="text-stone-600 text-sm mb-3">{room.type_description}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-stone-600">
                      <span className="flex items-center gap-1"><Users size={14} /> Up to {room.capacity}</span>
                      {amenities.map((a, i) => (
                        <span key={i} className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-full text-xs">
                          {amenityIcon(a)}{a}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="md:text-right md:w-48">
                    <p className="text-xs text-stone-500">From</p>
                    <p className="text-2xl font-bold text-orange-600">{formatUGX(room.base_price)}</p>
                    <p className="text-xs text-stone-500 mb-1">per night</p>
                    <p className="text-sm font-semibold text-stone-700 mb-3">Total: {formatUGX(total)}</p>
                    <Button onClick={() => setSelectedRoom(room)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      Book Now
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Booking form */}
        {selectedRoom && (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={submitBooking}
            className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-stone-900">Guest Details</h2>
              <button type="button" onClick={() => setSelectedRoom(null)}
                className="text-sm text-orange-600 hover:underline">Change Room</button>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><p className="text-xs text-stone-500">Room</p><p className="font-semibold">{selectedRoom.room_type_name}</p></div>
              <div><p className="text-xs text-stone-500">Nights</p><p className="font-semibold">{nights}</p></div>
              <div><p className="text-xs text-stone-500">Rate</p><p className="font-semibold">{formatUGX(selectedRoom.base_price)}</p></div>
              <div><p className="text-xs text-stone-500">Total</p><p className="font-bold text-orange-600">{formatUGX(selectedRoom.base_price * nights)}</p></div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Full Name *</label>
                <input required value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Phone *</label>
                <input required value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Email</label>
                <input type="email" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">ID / Passport No.</label>
                <input value={form.guest_id_number} onChange={(e) => setForm({ ...form, guest_id_number: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Number of Guests *</label>
                <input type="number" min={1} max={selectedRoom.capacity}
                  value={form.num_guests} onChange={(e) => setForm({ ...form, num_guests: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                <p className="text-xs text-stone-500 mt-1">Max {selectedRoom.capacity}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-stone-700 mb-1">Special Requests</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
              </div>
            </div>

            <Button type="submit" disabled={booking}
              className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-bold">
              {booking ? 'Booking...' : `Confirm Booking · ${formatUGX(selectedRoom.base_price * nights)}`}
            </Button>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
