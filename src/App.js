import { useEffect, useState } from "react";
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
import Bundles from "./pages/Bundles/Bundles";
import BundleDetails from "./pages/BundleDetails/BundleDetails";
import {
  ADMIN_AUTH_EVENT,
  isAdminAuthenticated,
} from "./services/storage";

export const ADMIN_BASE_PATH = "/uniqare-control-panel-9x7";
export const ADMIN_LOGIN_PATH = `${ADMIN_BASE_PATH}/login`;

function useAdminAuthentication() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    isAdminAuthenticated
  );

  useEffect(() => {
    function refreshAuthentication() {
      setIsAuthenticated(isAdminAuthenticated());
    }

    window.addEventListener(
      ADMIN_AUTH_EVENT,
      refreshAuthentication
    );

    return () => {
      window.removeEventListener(
        ADMIN_AUTH_EVENT,
        refreshAuthentication
      );
    };
  }, []);

  return isAuthenticated;
}

function ProtectedAdminRoute({ children }) {
  const isAuthenticated = useAdminAuthentication();

  if (!isAuthenticated) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace />;
  }

  return children;
}

function AdminLoginRoute() {
  const isAuthenticated = useAdminAuthentication();

  if (isAuthenticated) {
    return <Navigate to={ADMIN_BASE_PATH} replace />;
  }

  return <AdminLogin />;
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
        <Route path="/bundles" element={<Bundles />} />
        <Route path="/bundles/:id" element={<BundleDetails />} />

        {/* Admin login */}
        <Route
          path={ADMIN_LOGIN_PATH}
          element={<AdminLoginRoute />}
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
