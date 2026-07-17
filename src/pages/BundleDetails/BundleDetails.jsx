import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import BackButton from "../../components/BackButton/BackButton";
import { getBundleById } from "../../services/storage";
import { addToCart } from "../../services/cart";
import styles from "./BundleDetails.module.css";

export default function BundleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bundle, setBundle] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function loadBundle() {
      try {
        setLoading(true);
        setError("");

        const data = await getBundleById(id);
        setBundle(data);
      } catch (err) {
        console.error(err);
        setError("Bundle not found");
      } finally {
        setLoading(false);
      }
    }

    loadBundle();
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
    if (!bundle) return;

    const stock = Number(bundle.stock || 0);
    const currentQuantity = Number(quantity) || 1;

    if (currentQuantity >= stock) {
      setQuantity(String(stock));
      setCartMessage(`Only ${stock} bundle(s) available`);
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
    const stock = Number(bundle?.stock || 0);
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
      setCartMessage(`Only ${stock} bundle(s) available`);
      return false;
    }

    return true;
  }

  function handleAddToCart() {
    if (!bundle) return;

    if (!validateQuantity()) return;

    const bundleToAdd = {
      ...bundle,
      image: bundle.images?.[0]?.image_url || bundle.image_url || "",
      image_url: bundle.images?.[0]?.image_url || bundle.image_url || "",
      is_bundle: true,
    };

    const result = addToCart(bundleToAdd, Number(quantity));

    if (!result.success) {
      setCartMessage(result.message);
      return;
    }

    setCartMessage("Bundle added to cart successfully");
  }

  function handleBuyNow() {
    if (!bundle) return;

    if (!validateQuantity()) return;

    const bundleToAdd = {
      ...bundle,
      image: bundle.images?.[0]?.image_url || bundle.image_url || "",
      image_url: bundle.images?.[0]?.image_url || bundle.image_url || "",
      is_bundle: true,
    };

    const result = addToCart(bundleToAdd, Number(quantity));

    if (!result.success) {
      setCartMessage(result.message);
      return;
    }

    navigate("/checkout");
  }

  // Get images array
  const images = Array.isArray(bundle?.images) && bundle.images.length > 0
    ? bundle.images
    : bundle?.image_url
      ? [{ id: `bundle-${bundle.id}`, image_url: bundle.image_url }]
      : [];

  const currentImage = images[currentImageIndex]?.image_url || bundle?.image_url || "";

  function showPreviousImage() {
    setCurrentImageIndex((prev) =>
      prev <= 0 ? images.length - 1 : prev - 1
    );
  }

  function showNextImage() {
    setCurrentImageIndex((prev) =>
      prev >= images.length - 1 ? 0 : prev + 1
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <section className={styles.emptyState}>
            <h2>Loading bundle...</h2>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !bundle) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <section className={styles.emptyState}>
            <h2>Bundle not found</h2>
            <Link to="/bundles" className={styles.primaryButton}>
              Back to Bundles
            </Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const stock = Number(bundle.stock || 0);
  const isSoldOut = stock <= 0 || bundle.is_active === false;
  const oldPrice = Number(bundle.old_price || 0);
  const price = Number(bundle.price || 0);
  const discountPercentage = oldPrice > price && oldPrice > 0
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  return (
    <>
      <Header />

      <main className={styles.page}>
        <div className={styles.backWrapper}>
          <BackButton fallbackPath="/bundles" label="Back to Bundles" />
        </div>

        <section className={styles.detailsSection}>
          <div className={styles.imageBox}>
            {discountPercentage > 0 && (
              <span className={styles.discountBadge}>
                Save {discountPercentage}%
              </span>
            )}

            <span className={styles.bundleBadge}>Bundle Offer</span>

            {currentImage ? (
              <img src={currentImage} alt={bundle.name} />
            ) : (
              <div className={styles.imagePlaceholder}>No image</div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.sliderButton} ${styles.previousButton}`}
                  onClick={showPreviousImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className={`${styles.sliderButton} ${styles.nextButton}`}
                  onClick={showNextImage}
                  aria-label="Next image"
                >
                  ›
                </button>

                <div className={styles.imageDots}>
                  {images.map((image, index) => (
                    <button
                      key={image.id || index}
                      type="button"
                      className={index === currentImageIndex ? styles.activeDot : ""}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Show image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={styles.content}>
            <span
              className={`${styles.statusBadge} ${
                isSoldOut ? styles.soldOut : styles.available
              }`}
            >
              {isSoldOut ? "Sold Out" : "Available"}
            </span>

            <h2>{bundle.name}</h2>

            <p>{bundle.long_description || bundle.short_description || bundle.description || ""}</p>

            {/* Bundle Items */}
            {Array.isArray(bundle.bundle_items) && bundle.bundle_items.length > 0 && (
              <div className={styles.bundleItems}>
                <h3>Bundle Includes:</h3>
                <ul>
                  {bundle.bundle_items.map((item) => (
                    <li key={item.id || item.product_id}>
                      {item.product_image && (
                        <img src={item.product_image} alt={item.product_name} />
                      )}
                      <span>
                        <strong>{item.quantity} ×</strong> {item.product_name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.priceContainer}>
              {oldPrice > price && (
                <span className={styles.oldPrice}>{oldPrice} EGP</span>
              )}
              <strong className={styles.price}>{price} EGP</strong>
            </div>

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
                  Available now: {stock} {stock === 1 ? "bundle" : "bundles"}
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
                    <small>Only {stock} bundles available</small>
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
                    Add Bundle to Cart
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