import { Link } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
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
    </header>
  );
}