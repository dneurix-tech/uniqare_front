import { useNavigate } from "react-router-dom";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const stock = Number(product.stock || 0);
  const isSoldOut = stock <= 0 || product.is_active === false;

  function openProductDetails() {
    navigate(`/product/${product.id}`);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      openProductDetails();
    }
  }

  return (
    <article
      className={`${styles.card} ${isSoldOut ? styles.cardSoldOut : ""}`}
      onClick={openProductDetails}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={styles.imageWrapper}>
        <img
          className={styles.image}
          src={product.image || product.image_url}
          alt={product.name}
        />

        <span
          className={`${styles.badge} ${
            isSoldOut ? styles.soldOut : styles.available
          }`}
        >
          {isSoldOut ? "Sold Out" : "Available"}
        </span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>

        <div
          className={`${styles.stockBox} ${
            isSoldOut ? styles.stockSoldOut : styles.stockAvailable
          }`}
        >
          {isSoldOut ? (
            <span>Out of stock</span>
          ) : stock === 1 ? (
            <span>Only 1 piece left</span>
          ) : (
            <span>{stock} pieces available</span>
          )}
        </div>

        <div className={styles.footer}>
          <strong className={styles.price}>{product.price} EGP</strong>

          {isSoldOut ? (
            <button
              type="button"
              className={styles.disabledButton}
              disabled
              onClick={(event) => event.stopPropagation()}
            >
              Sold Out
            </button>
          ) : (
            <button
              type="button"
              className={styles.viewButton}
              onClick={(event) => {
                event.stopPropagation();
                openProductDetails();
              }}
            >
              View Product
            </button>
          )}
        </div>
      </div>
    </article>
  );
}