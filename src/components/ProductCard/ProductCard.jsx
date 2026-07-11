import { useNavigate } from "react-router-dom";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();

  const stock = Number(product.stock || 0);
  const isSoldOut = stock <= 0 || product.is_active === false;

  const price = Number(product.price || 0);
  const oldPrice = Number(product.old_price || product.oldPrice || 0);

  const hasDiscount = oldPrice > price;

  function openProductDetails() {
    navigate(`/product/${product.id}`);
  }

  function handleKeyDown(event) {
    if (event.target.tagName === "BUTTON") return;

    if (event.key === "Enter" || event.key === " ") {
      openProductDetails();
    }
  }

  function handleAddToCart(event) {
    event.stopPropagation();

    if (isSoldOut) return;

    onAddToCart(product);
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

        {hasDiscount && !isSoldOut && (
          <span className={styles.discountBadge}>Sale</span>
        )}
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
          <div className={styles.priceBox}>
            {hasDiscount && (
              <span className={styles.oldPrice}>{oldPrice} EGP</span>
            )}

            <strong className={styles.price}>{price} EGP</strong>
          </div>

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
            <div className={styles.actions}>
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

              <button
                type="button"
                className={styles.cartButton}
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}