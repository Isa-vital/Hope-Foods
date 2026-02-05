
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop'; // Assuming this exists from previous context or I should recreate it
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ReservationPage from './pages/ReservationPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

// Simple ScrollToTop component if not present
const ScrollToTopWrapper = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <CartProvider>
        <ScrollToTopWrapper />
        <div className="flex flex-col min-h-screen bg-stone-50">
          <Header />
          <main className="flex-grow pt-20"> {/* Add padding-top to account for fixed header */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/reservation" element={<ReservationPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
