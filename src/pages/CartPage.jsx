import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount, clearCart } = useCart();
  const navigate = useNavigate();

  const handleRemoveItem = (item) => {
    Swal.fire({
      title: 'Remove Item?',
      text: `Remove ${item.name} from cart?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#78716c',
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(item.id);
      }
    });
  };

  const handleClearCart = () => {
    Swal.fire({
      title: 'Clear Cart?',
      text: 'This will remove all items from your cart.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#78716c',
      confirmButtonText: 'Yes, clear cart',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        clearCart();
        Swal.fire({
          title: 'Cart Cleared!',
          text: 'All items have been removed.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const formatPrice = (price) => {
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 pb-20">
        <div className="bg-amber-900 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Your Cart</h1>
        </div>

        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center bg-white rounded-2xl p-12 shadow-lg"
          >
            <ShoppingCart className="mx-auto mb-6 text-stone-300" size={80} />
            <h2 className="text-2xl font-bold text-stone-900 mb-4">Your cart is empty</h2>
            <p className="text-stone-600 mb-8">Add some delicious items to get started!</p>
            <Link to="/menu">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8">
                Browse Menu
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="bg-amber-900 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Your Cart</h1>
        <p className="text-orange-100">Review your order before checkout</p>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link to="/menu">
              <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const itemPrice = parseInt(item.price.replace(/[^0-9]/g, ''));
                const itemTotal = itemPrice * item.quantity;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex gap-6">
                      {/* Item Image */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🍽️
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-stone-900">{item.name}</h3>
                            <p className="text-stone-600 text-sm">{item.description}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="text-orange-600 font-bold text-lg">
                            UGX {formatPrice(itemPrice.toString())}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-orange-700 flex items-center justify-center transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-600 text-orange-700 hover:text-white flex items-center justify-center transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="text-right mt-2 text-stone-600 text-sm">
                          Subtotal: <span className="font-bold text-stone-900">UGX {formatPrice(itemTotal.toString())}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg sticky top-24"
              >
                <h3 className="text-2xl font-bold text-stone-900 mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-stone-600">
                    <span>Items ({getCartCount()})</span>
                    <span>UGX {formatPrice(getCartTotal().toString())}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Fee</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="border-t border-stone-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-stone-900">Total</span>
                      <span className="text-2xl font-bold text-orange-600">
                        UGX {formatPrice(getCartTotal().toString())}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full py-6 text-lg font-bold shadow-lg shadow-orange-900/20"
                >
                  Proceed to Checkout
                </Button>

                <div className="mt-6 p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-800 text-center">
                    🎉 Free delivery on all orders!
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
