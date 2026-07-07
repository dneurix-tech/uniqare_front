import { FaFacebookF, FaInstagram } from "react-icons/fa";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.title}>Follow UNIQARE</p>

      <div className={styles.icons}>
        <a
          href="https://www.facebook.com/profile.php?id=61577384005094"
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook"
          className={styles.iconLink}
        >
          <FaFacebookF />
        </a>

        <a
          href="https://www.instagram.com/uniqare99?igsh=MW80eWdhY3VibmFqdg=="
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className={styles.iconLink}
        >
          <FaInstagram />
        </a>
      </div>

      <span className={styles.copy}>
  Contact Us : 01095285287 .
</span>

<span className={styles.copy}>
  © 2026 uniqare. All rights reserved.
</span>
    </footer>
  );
}