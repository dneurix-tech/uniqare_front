import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import styles from "./Header.module.css";
import AnnouncementBar from "../AnnouncementBar/AnnouncementBar";

import {
  getCartItems,
  CART_UPDATED_EVENT,
} from "../../services/cart";

export default function Header() {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);

  function getNavLinkClass({ isActive }) {
    return isActive
      ? `${styles.navLink} ${styles.active}`
      : styles.navLink;
  }

  useEffect(() => {
    function refreshCartCount() {
      const cartItems = getCartItems();

      const totalCount = cartItems.reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
        0
      );

      setCartCount(totalCount);
    }

    refreshCartCount();

    window.addEventListener(
      CART_UPDATED_EVENT,
      refreshCartCount
    );

    window.addEventListener(
      "storage",
      refreshCartCount
    );

    window.addEventListener(
      "focus",
      refreshCartCount
    );

    return () => {
      window.removeEventListener(
        CART_UPDATED_EVENT,
        refreshCartCount
      );

      window.removeEventListener(
        "storage",
        refreshCartCount
      );

      window.removeEventListener(
        "focus",
        refreshCartCount
      );
    };
  }, []);

  function handleCartClick() {
    navigate("/", {
      state: {
        openCart: true,
        cartRequestId: Date.now(),
      },
    });
  }

  return (
    <>
      <AnnouncementBar />

      <header className={styles.header}>
        <div className={styles.headerBackground}>
          <img
            src="/images/header.jpg"
            alt=""
            className={styles.backgroundImage}
          />

          <div className={styles.overlay} />
        </div>

        <div className={styles.headerContent}>
          <Link
            to="/"
            className={styles.brand}
            aria-label="Go to UNIQARE home page"
          >
            <img
              src="/images/full-logo.png"
              alt="UNIQARE - Give yourself a unique care"
              className={styles.fullLogo}
            />
          </Link>

          <nav className={styles.nav}>
            <NavLink
              to="/"
              end
              className={getNavLinkClass}
            >
              Home
            </NavLink>

            <NavLink
              to="/reviews"
              className={getNavLinkClass}
            >
              Reviews
            </NavLink>

            <NavLink
              to="/about-us"
              className={getNavLinkClass}
            >
              About Us
            </NavLink>

            <button
  type="button"
  className={styles.cartNavButton}
  onClick={handleCartClick}
  aria-label={`Open cart with ${cartCount} items`}
>
  <svg
    className={styles.cartNavIcon}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />

    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>

  <span>Cart</span>

  {cartCount > 0 && (
    <span className={styles.cartNavCount}>
      {cartCount}
    </span>
  )}
</button>
         </nav>
        </div>
      </header>
    </>
  );
}