import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home/Home";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Checkout from "./pages/Checkout/Checkout";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import FloatingWhatsApp from "./components/FloatingWhatsApp/FloatingWhatsApp";
import Reviews from "./pages/Reviews/Reviews";
import ReviewsPage from "./pages/Admin/ReviewsPage";

function ProtectedAdminRoute({ children }) {
  const isAdmin = localStorage.getItem("uniqare_admin_logged_in") === "true";
  return isAdmin ? children : <Navigate to="/admin-login" replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/:id" element={<Checkout />} />

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/reviews"
          element={
            <ProtectedAdminRoute>
              <ReviewsPage />
            </ProtectedAdminRoute>
          }
        />
      </Routes>

      <FloatingWhatsApp />
    </>
  );
}