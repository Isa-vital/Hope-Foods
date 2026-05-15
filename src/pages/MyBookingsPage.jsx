import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BedDouble, Calendar, Users, Hash, Hotel, ChevronRight, RefreshCw } from 'lucide-react';
import { bookingsApi, formatUGX } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  checked_in: 'bg-green-100 text-green-800 border-green-300',
  checked_out: 'bg-stone-200 text-stone-700 border-stone-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  no_show: 'bg-red-100 text-red-800 border-red-300',
};

const MyBookingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await bookingsApi.me();
      setBookings(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) load();
  }, [authLoading, user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-8 text-center">
          <Hotel className="mx-auto text-orange-500 mb-3" size={40} />
          <h2 className="text-xl font-bold text-stone-900 mb-2">Sign in to view your bookings</h2>
          <p className="text-stone-600 text-sm mb-4">Track stay history, dates, totals and current status.</p>
          <Link to="/login"><Button className="bg-orange-600 hover:bg-orange-700 text-white">Login</Button></Link>
        </div>
      </div>
    );
  }

  const upcoming = bookings.filter((b) =>
    ['pending', 'confirmed', 'checked_in'].includes(b.status) &&
    new Date(b.check_out_date) >= new Date(new Date().toDateString()),
  );
  const past = bookings.filter((b) => !upcoming.includes(b));

  const Card = ({ b }) => (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Hash size={14} className="text-stone-400" />
            <span className="font-mono text-sm text-stone-600">{b.booking_number}</span>
          </div>
          <h3 className="text-lg font-bold text-stone-900">{b.room_type_name}</h3>
          <p className="text-sm text-stone-600">Room {b.room_number}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${statusStyles[b.status] || 'bg-stone-100 text-stone-700 border-stone-300'}`}>
          {b.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm bg-stone-50 rounded-lg p-3 mb-3">
        <div>
          <div className="text-xs text-stone-500 flex items-center gap-1"><Calendar size={11} />Check-in</div>
          <div className="font-semibold">{new Date(b.check_in_date).toLocaleDateString()}</div>
        </div>
        <div>
          <div className="text-xs text-stone-500 flex items-center gap-1"><Calendar size={11} />Check-out</div>
          <div className="font-semibold">{new Date(b.check_out_date).toLocaleDateString()}</div>
        </div>
        <div>
          <div className="text-xs text-stone-500 flex items-center gap-1"><BedDouble size={11} />Nights</div>
          <div className="font-semibold">{b.num_nights}</div>
        </div>
        <div>
          <div className="text-xs text-stone-500 flex items-center gap-1"><Users size={11} />Guests</div>
          <div className="font-semibold">{b.num_guests}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <div>
          <div className="text-xs text-stone-500">Total</div>
          <div className="text-xl font-bold text-orange-600">{formatUGX(b.total)}</div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
          b.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
          b.payment_status === 'partial' ? 'bg-amber-100 text-amber-800' :
          'bg-stone-100 text-stone-700'
        }`}>{b.payment_status}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">My Bookings</h1>
            <p className="text-stone-600">Your reservation history and upcoming stays</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}><RefreshCw size={16} className="mr-1" />Refresh</Button>
            <Link to="/booking">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                Book a Room <ChevronRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-600 border-t-transparent" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Hotel className="mx-auto text-stone-300 mb-3" size={48} />
            <h2 className="text-xl font-bold text-stone-900 mb-2">No bookings yet</h2>
            <p className="text-stone-600 mb-4">Plan your next stay with us.</p>
            <Link to="/booking">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">Browse Rooms</Button>
            </Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold text-stone-900 mb-3">Upcoming &amp; current ({upcoming.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcoming.map((b) => <Card key={b.id} b={b} />)}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-stone-900 mb-3">Past bookings ({past.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {past.map((b) => <Card key={b.id} b={b} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
