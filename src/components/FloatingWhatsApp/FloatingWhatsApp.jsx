import { FaWhatsapp } from "react-icons/fa";
import styles from "./FloatingWhatsApp.module.css";

export default function FloatingWhatsApp() {
  const phoneNumber = "201000000000";
  const message = "Hello uniqare, I want to ask about your products.";

  return (
    <a
      className={styles.whatsapp}
      href={`https://wa.me/${+201095285287}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
    >
      <FaWhatsapp />
    </a>
  );
}