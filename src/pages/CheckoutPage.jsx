import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, User, CreditCard, Clock, Check } from 'lucide-react';
import Swal from 'sweetalert2';

const CheckoutPage = () => {
  const { cart, getCartTotal, getCartCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    deliveryTime: 'asap',
    paymentMethod: 'cash',
    notes: ''
  });

  // Pre-fill from logged-in user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.full_name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please enter your full name.',
        confirmButtonColor: '#ea580c'
      });
      return false;
    }

    if (!formData.phone.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please enter your phone number.',
        confirmButtonColor: '#ea580c'
      });
      return false;
    }

    if (!formData.address.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please enter your delivery address.',
        confirmButtonColor: '#ea580c'
      });
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const paymentMap = { cash: 'cash', mobile: 'mobile_money', card: 'card' };

    const payload = {
      customer_name: formData.fullName,
      customer_phone: formData.phone,
      customer_email: formData.email || undefined,
      delivery_address: formData.address,
      order_type: 'delivery',
      payment_method: paymentMap[formData.paymentMethod] || 'cash',
      notes: formData.notes || undefined,
      items: cart.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        notes: item.notes || undefined
      }))
    };

    try {
      const res = await ordersApi.create(payload);
      const order = res.data;
      clearCart();
      await Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        html: `<p>Your order <strong>${order.order_number}</strong> has been received.</p><p class="mt-2 text-sm text-stone-600">We'll call ${formData.phone} shortly.</p>`,
        confirmButtonText: 'View Order',
        confirmButtonColor: '#ea580c',
        allowOutsideClick: false
      });
      navigate(`/order/${order.id}`);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Order failed',
        text: err.message || 'Could not place order. Please try again.',
        confirmButtonColor: '#ea580c'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="bg-amber-900 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Checkout</h1>
        <p className="text-orange-100">Complete your order</p>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmitOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-8 shadow-lg"
                >
                  <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <User className="text-orange-600" />
                    Personal Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+256 788 306 796"
                          className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Delivery Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg"
                >
                  <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <MapPin className="text-orange-600" />
                    Delivery Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Delivery Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your full delivery address including landmarks"
                        rows="3"
                        className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Preferred Delivery Time
                      </label>
                      <select
                        name="deliveryTime"
                        value={formData.deliveryTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="asap">As soon as possible</option>
                        <option value="30min">In 30 minutes</option>
                        <option value="1hour">In 1 hour</option>
                        <option value="2hours">In 2 hours</option>
                        <option value="later">Schedule for later</option>
                      </select>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-8 shadow-lg"
                >
                  <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <CreditCard className="text-orange-600" />
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    {[
                      { value: 'cash', label: 'Cash on Delivery', icon: '💵' },
                      { value: 'mobile', label: 'Mobile Money (MTN/Airtel)', icon: '📱' },
                      { value: 'card', label: 'Credit/Debit Card', icon: '💳' }
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.paymentMethod === method.value
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-stone-200 hover:border-orange-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={formData.paymentMethod === method.value}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-orange-600"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium text-stone-900">{method.label}</span>
                        {formData.paymentMethod === method.value && (
                          <Check className="ml-auto text-orange-600" size={20} />
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions for your order?"
                      rows="2"
                      className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-lg sticky top-24"
                >
                  <h3 className="text-2xl font-bold text-stone-900 mb-6">Order Summary</h3>

                  <div className="space-y-3 mb-6">
                    {cart.map((item) => {
                      const unit = typeof item.priceNumber === 'number'
                        ? item.priceNumber
                        : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
                      return (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-stone-600">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium text-stone-900">
                            UGX {formatPrice(unit * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-stone-200 pt-4 space-y-3 mb-6">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal ({getCartCount()} items)</span>
                      <span>UGX {formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Delivery Fee</span>
                      <span className="text-green-600 font-medium">FREE</span>
                    </div>
                    <div className="border-t border-stone-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-stone-900">Total</span>
                        <span className="text-2xl font-bold text-orange-600">
                          UGX {formatPrice(getCartTotal())}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full py-6 text-lg font-bold shadow-lg shadow-orange-900/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Processing...
                      </span>
                    ) : (
                      'Place Order'
                    )}
                  </Button>

                  <p className="text-xs text-stone-500 text-center mt-4">
                    By placing this order, you agree to our terms and conditions.
                  </p>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
