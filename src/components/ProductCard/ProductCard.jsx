import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const stock = Number(product.stock || 0);
  const isSoldOut = stock <= 0 || product.is_active === false;

  return (
    <article className={`${styles.card} ${isSoldOut ? styles.cardSoldOut : ""}`}>
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
            <button className={styles.disabledButton} disabled>
              Sold Out
            </button>
          ) : (
            <Link to={`/product/${product.id}`} className={styles.viewButton}>
              View Product
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}