import { useNavigate } from "react-router-dom";
import styles from "./ProductCard.module.css";

export default function ProductCard({
  product,
  onAddToCart,
}) {
  const navigate = useNavigate();

  const stock = Number(product.stock || 0);

  const isSoldOut =
    stock <= 0 || product.is_active === false;

  const price = Number(product.price || 0);

  const oldPrice = Number(
    product.old_price ||
      product.oldPrice ||
      0
  );

  const hasDiscount =
    oldPrice > price && oldPrice > 0;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((oldPrice - price) / oldPrice) * 100
      )
    : 0;

  /*
    عدد المخزون يظهر فقط:
    - عندما المنتج منتهي
    - أو عندما يكون المتبقي من 1 إلى 3
  */
  const shouldShowStock =
    isSoldOut || (stock > 0 && stock <= 3);

  function formatPrice(value) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  function openProductDetails() {
    navigate(`/product/${product.id}`);
  }

  function handleKeyDown(event) {
    if (event.target.tagName === "BUTTON") {
      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      openProductDetails();
    }
  }

  function handleAddToCart(event) {
    event.stopPropagation();

    if (isSoldOut) {
      return;
    }

    onAddToCart(product);
  }

  function getStockText() {
    if (isSoldOut) {
      return "Out of stock";
    }

    if (stock === 1) {
      return "Only 1 piece left";
    }

    return `Only ${stock} pieces left`;
  }

  return (
    <article
      className={`${styles.card} ${
        isSoldOut ? styles.cardSoldOut : ""
      }`}
      onClick={openProductDetails}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={styles.imageWrapper}>
        <img
          className={styles.image}
          src={
            product.image ||
            product.image_url ||
            "/images/placeholder.jpg"
          }
          alt={product.name}
        />

        <span
          className={`${styles.badge} ${
            isSoldOut
              ? styles.soldOut
              : styles.available
          }`}
        >
          {isSoldOut
            ? "Sold Out"
            : "Available"}
        </span>

        {hasDiscount && !isSoldOut && (
          <span
            className={styles.discountBadge}
          >
            -{discountPercentage}%
          </span>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.productInfo}>
          <h3 className={styles.title}>
            {product.name}
          </h3>

          <p className={styles.description}>
            {product.description ||
              "Discover this UNIQARE product."}
          </p>
        </div>

        {/*
          نحجز مساحة ثابتة للمخزون
          حتى تكون جميع الكروت متساوية.
        */}
        <div className={styles.stockArea}>
          {shouldShowStock && (
            <div
              className={`${styles.stockBox} ${
                isSoldOut
                  ? styles.stockSoldOut
                  : styles.stockLow
              }`}
            >
              <span>{getStockText()}</span>
            </div>
          )}
        </div>

        <div className={styles.priceSection}>
          <div className={styles.priceBox}>
            <span
              className={`${styles.oldPrice} ${
                !hasDiscount
                  ? styles.hiddenOldPrice
                  : ""
              }`}
              aria-hidden={!hasDiscount}
            >
              {hasDiscount
                ? `${formatPrice(oldPrice)} EGP`
                : "0 EGP"}
            </span>

            <strong className={styles.price}>
              {formatPrice(price)} EGP
            </strong>
          </div>

          <div className={styles.savingArea}>
            {hasDiscount && (
              <span
                className={styles.savingText}
              >
                Save{" "}
                {formatPrice(oldPrice - price)} EGP
              </span>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          {isSoldOut ? (
            <button
              type="button"
              className={styles.disabledButton}
              disabled
              onClick={(event) =>
                event.stopPropagation()
              }
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