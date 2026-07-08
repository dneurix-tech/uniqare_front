import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import BackButton from "../../components/BackButton/BackButton";
import { getProductById } from "../../services/storage";
import { addToCart } from "../../services/cart";
import styles from "./ProductDetails.module.css";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  function handleQuantityChange(event) {
  const value = event.target.value;

  // Numbers only, no text and no float
  if (!/^\d*$/.test(value)) return;

  setQuantity(value);

  if (value === "0") {
    setCartMessage("Quantity must be at least 1");
    return;
  }

  setCartMessage("");
}

  
function handleIncreaseQuantity() {
  if (!product) return;

  const stock = Number(product.stock || 0);
  const currentQuantity = Number(quantity) || 1;

  if (currentQuantity >= stock) {
    setQuantity(String(stock));
    setCartMessage(`Only ${stock} pieces available`);
    return;
  }

  setQuantity(String(currentQuantity + 1));
  setCartMessage("");
}

function handleDecreaseQuantity() {
  const currentQuantity = Number(quantity) || 1;

  if (currentQuantity <= 1) {
    setQuantity("1");
    return;
  }

  setQuantity(String(currentQuantity - 1));
  setCartMessage("");
}

  function validateQuantity() {
  const stock = Number(product?.stock || 0);
  const selectedQuantity = Number(quantity);

  if (!quantity.trim()) {
    setCartMessage("Quantity is required");
    return false;
  }

  if (!/^[1-9]\d*$/.test(quantity)) {
    setCartMessage("Quantity must be at least 1");
    return false;
  }

  if (selectedQuantity > stock) {
    setCartMessage(`Only ${stock} pieces available`);
    return false;
  }

  return true;
}

  function handleAddToCart() {
    if (!product) return;

    if (!validateQuantity()) return;

    const result = addToCart(product, Number(quantity));

    if (!result.success) {
      setCartMessage(result.message);
      return;
    }

    setCartMessage("Product added to cart successfully");
  }

function handleBuyNow() {
  if (!product) return;

  if (!validateQuantity()) return;

  const result = addToCart(product, Number(quantity));

  if (!result.success) {
    setCartMessage(result.message);

    if (result.message.includes("Only")) {
      navigate("/checkout");
    }

    return;
  }

  navigate("/checkout");
}

  if (loading) {
    return (
      <>
        <Header />

        <main className={styles.page}>
          <section className={styles.emptyState}>
            <h2>Loading product...</h2>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />

        <main className={styles.page}>
          <section className={styles.emptyState}>
            <h2>Product not found</h2>

            <Link to="/" className={styles.primaryButton}>
              Back to Home
            </Link>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  const stock = Number(product.stock || 0);
  const isSoldOut = stock <= 0 || product.is_active === false;

  return (
    <>
      <Header />

      <main className={styles.page}>
        <div className={styles.backWrapper}>
          <BackButton fallbackPath="/" label="Back to Products" />
        </div>

        <section className={styles.detailsSection}>
          <div className={styles.imageBox}>
            <img src={product.image_url || product.image} alt={product.name} />
          </div>

          <div className={styles.content}>
            <span
              className={`${styles.statusBadge} ${
                isSoldOut ? styles.soldOut : styles.available
              }`}
            >
              {isSoldOut ? "Sold Out" : "Available"}
            </span>

            <h2>{product.name}</h2>

            <p>{product.description}</p>

            <strong className={styles.price}>{product.price} EGP</strong>

            {isSoldOut ? (
              <>
                <div className={styles.soldOutNotice}>Sold Out</div>

                <button className={styles.disabledButton} disabled>
                  Sold Out
                </button>
              </>
            ) : (
              <>
                <div className={styles.stockNotice}>
                  Available now: {stock} {stock === 1 ? "piece" : "pieces"}
                </div>

                <div className={styles.quantityBox}>
  <label>Quantity *</label>

  <div className={styles.quantityControl}>
    <button
      type="button"
      className={styles.quantityButton}
      onClick={handleDecreaseQuantity}
      disabled={Number(quantity) <= 1}
    >
      -
    </button>

    <input
  value={quantity}
  onChange={handleQuantityChange}
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="1"
/>

    <button
      type="button"
      className={styles.quantityButton}
      onClick={handleIncreaseQuantity}
      disabled={Number(quantity) >= stock}
    >
      +
    </button>
  </div>

  {quantity && Number(quantity) > stock && (
    <small>Only {stock} pieces available</small>
  )}
</div>

                {cartMessage && (
                  <div className={styles.cartMessage}>{cartMessage}</div>
                )}

                <div className={styles.actionsRow}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handleAddToCart}
                  >
                    Add To Cart
                  </button>

                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </button>
                </div>

                <Link to="/checkout" className={styles.cartLink}>
                  View Cart
                </Link>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}