import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.css";
import AnnouncementBar from "../AnnouncementBar/AnnouncementBar";

export default function Header() {
  function getNavLinkClass({ isActive }) {
    return isActive
      ? `${styles.navLink} ${styles.active}`
      : styles.navLink;
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
        <Link to="/" className={styles.brand}>
          <div className={styles.logoCircle}>
            <img
              className={styles.logoImage}
              src="/images/logo.jpg"
              alt="UNIQARE logo"
            />
          </div>

          <div className={styles.brandText}>
            <h1 className={styles.brandName}>UNIQARE</h1>

            <span className={styles.tagline}>
              Beauty, care and confidence
            </span>
          </div>
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
        </nav>
      </div>
    </header>
  </>
);
}