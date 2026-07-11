import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link to="/" className={styles.brand}>
          <div className={styles.logoCircle}>
            <img
              className={styles.logoImage}
              src="/images/logo.jpg"
              alt="UNIQARE logo"
            />
          </div>

          <h1 className={styles.brandName}>UNIQARE</h1>
        </Link>

        <nav className={styles.nav}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/reviews"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Reviews
          </NavLink>
        </nav>
      </div>
    </header>
  );
}