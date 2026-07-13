import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home/Home";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Checkout from "./pages/Checkout/Checkout";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import FloatingWhatsApp from "./components/FloatingWhatsApp/FloatingWhatsApp";
import Reviews from "./pages/Reviews/Reviews";
import ReviewsPage from "./pages/Admin/ReviewsPage";
import AboutUs from "./pages/AboutUs/AboutUs";

export const ADMIN_BASE_PATH = "/uniqare-control-panel-9x7";
export const ADMIN_LOGIN_PATH = `${ADMIN_BASE_PATH}/login`;

function ProtectedAdminRoute({ children }) {
  const isAdmin =
    localStorage.getItem("uniqare_admin_logged_in") === "true";

  if (!isAdmin) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/:id" element={<Checkout />} />

        {/* Admin login */}
        <Route
          path={ADMIN_LOGIN_PATH}
          element={<AdminLogin />}
        />

        {/* Admin dashboard */}
        <Route
          path={ADMIN_BASE_PATH}
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        {/* Admin reviews */}
        <Route
          path={`${ADMIN_BASE_PATH}/reviews`}
          element={
            <ProtectedAdminRoute>
              <ReviewsPage />
            </ProtectedAdminRoute>
          }
        />

        {/* Disable old admin routes */}
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/admin-login" element={<Navigate to="/" replace />} />
        <Route
          path="/admin/reviews"
          element={<Navigate to="/" replace />}
        />

        {/* Unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <FloatingWhatsApp />
    </>
  );
}