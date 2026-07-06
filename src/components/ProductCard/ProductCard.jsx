import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const isSoldOut = Number(product.stock) <= 0;

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <img className={styles.image} src={product.image} alt={product.name} />

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

        <div className={styles.footer}>
          <strong className={styles.price}>{product.price} EGP</strong>

          <Link to={`/product/${product.id}`} className={styles.viewButton}>
            View Product
          </Link>
        </div>
      </div>
    </article>
  );
}