import { useNavigate } from "react-router-dom";
import styles from "./BackButton.module.css";

export default function BackButton({ fallbackPath = "/", label = "Back" }) {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  }

  return (
    <button type="button" className={styles.backButton} onClick={handleBack}>
      <span className={styles.arrow}>←</span>
      <span>{label}</span>
    </button>
  );
}