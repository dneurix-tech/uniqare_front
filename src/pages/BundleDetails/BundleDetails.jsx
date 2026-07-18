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

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);

  const [
    isDescriptionExpanded,
    setIsDescriptionExpanded,
  ] = useState(false);

  /* =========================
     Load Bundle
  ========================= */

  useEffect(() => {
    async function loadBundle() {
      try {
        setLoading(true);
        setError("");
        setCartMessage("");
        setQuantity("1");
        setCurrentImageIndex(0);
        setIsDescriptionExpanded(false);

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

  /* =========================
     Quantity
  ========================= */

  function handleQuantityChange(event) {
    const value = event.target.value;

    // أرقام صحيحة فقط
    if (!/^\d*$/.test(value)) {
      return;
    }

    setQuantity(value);

    if (value === "0") {
      setCartMessage(
        "Quantity must be at least 1"
      );
      return;
    }

    setCartMessage("");
  }

  function handleIncreaseQuantity() {
    if (!bundle) {
      return;
    }

    const stock = Number(bundle.stock || 0);
    const currentQuantity =
      Number(quantity) || 1;

    if (currentQuantity >= stock) {
      setQuantity(String(stock));

      setCartMessage(
        `Only ${stock} bundle(s) available`
      );

      return;
    }

    setQuantity(String(currentQuantity + 1));
    setCartMessage("");
  }

  function handleDecreaseQuantity() {
    const currentQuantity =
      Number(quantity) || 1;

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
      setCartMessage(
        "Quantity must be at least 1"
      );

      return false;
    }

    if (selectedQuantity > stock) {
      setCartMessage(
        `Only ${stock} bundle(s) available`
      );

      return false;
    }

    return true;
  }

  /* =========================
     Cart
  ========================= */

  function createBundleCartItem() {
    const mainImage =
      bundle?.images?.[0]?.image_url ||
      bundle?.image_url ||
      "";

    return {
      ...bundle,
      image: mainImage,
      image_url: mainImage,
      is_bundle: true,
    };
  }

  function handleAddToCart() {
    if (!bundle) {
      return;
    }

    if (!validateQuantity()) {
      return;
    }

    const bundleToAdd =
      createBundleCartItem();

    const result = addToCart(
      bundleToAdd,
      Number(quantity)
    );

    if (!result.success) {
      setCartMessage(
        result.message ||
          "Unable to add bundle to cart"
      );

      return;
    }

    setCartMessage(
      "Bundle added to cart successfully"
    );
  }

  function handleBuyNow() {
    if (!bundle) {
      return;
    }

    if (!validateQuantity()) {
      return;
    }

    const bundleToAdd =
      createBundleCartItem();

    const result = addToCart(
      bundleToAdd,
      Number(quantity)
    );

    if (!result.success) {
      setCartMessage(
        result.message ||
          "Unable to add bundle to cart"
      );

      return;
    }

    navigate("/checkout");
  }

  /* =========================
     Images
  ========================= */

  const images =
    Array.isArray(bundle?.images) &&
    bundle.images.length > 0
      ? bundle.images
      : bundle?.image_url
      ? [
          {
            id: `bundle-${bundle.id}`,
            image_url: bundle.image_url,
          },
        ]
      : [];

  const currentImage =
    images[currentImageIndex]?.image_url ||
    bundle?.image_url ||
    "";

  function showPreviousImage() {
    if (images.length <= 1) {
      return;
    }

    setCurrentImageIndex((previousIndex) =>
      previousIndex <= 0
        ? images.length - 1
        : previousIndex - 1
    );
  }

  function showNextImage() {
    if (images.length <= 1) {
      return;
    }

    setCurrentImageIndex((previousIndex) =>
      previousIndex >= images.length - 1
        ? 0
        : previousIndex + 1
    );
  }

  /* =========================
     Loading
  ========================= */

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

  /* =========================
     Error
  ========================= */

  if (error || !bundle) {
    return (
      <>
        <Header />

        <main className={styles.page}>
          <section className={styles.emptyState}>
            <h2>Bundle not found</h2>

            <Link
              to="/bundles"
              className={styles.primaryButton}
            >
              Back to Bundles
            </Link>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  /* =========================
     Bundle Information
  ========================= */

  const stock = Number(bundle.stock || 0);

  const isSoldOut =
    stock <= 0 || bundle.is_active === false;

  const oldPrice = Number(
    bundle.old_price || 0
  );

  const price = Number(bundle.price || 0);

  const hasDiscount =
    oldPrice > price && oldPrice > 0;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((oldPrice - price) / oldPrice) * 100
      )
    : 0;

  const description =
    bundle.long_description ||
    bundle.short_description ||
    bundle.description ||
    "No description available for this bundle.";

  /*
    يظهر زر Show More للنصوص الطويلة.
    الرقم قابل للتعديل لكن 130 مناسب للموبايل.
  */
  const hasLongDescription =
    description.trim().length > 130;

  return (
    <>
      <Header />

      <main className={styles.page}>
        <div className={styles.backWrapper}>
          <BackButton
            fallbackPath="/bundles"
            label="Back to Bundles"
          />
        </div>

        <section className={styles.detailsSection}>
          {/* =========================
              Bundle Images
          ========================= */}

          <div className={styles.imageBox}>
            {discountPercentage > 0 && (
              <span
                className={styles.discountBadge}
              >
                Save {discountPercentage}%
              </span>
            )}

            <span className={styles.bundleBadge}>
              Bundle Offer
            </span>

            {currentImage ? (
              <img
                src={currentImage}
                alt={bundle.name}
              />
            ) : (
              <div
                className={
                  styles.imagePlaceholder
                }
              >
                No image
              </div>
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
                      className={
                        index === currentImageIndex
                          ? styles.activeDot
                          : ""
                      }
                      onClick={() =>
                        setCurrentImageIndex(index)
                      }
                      aria-label={`Show image ${
                        index + 1
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* =========================
              Bundle Details Card
          ========================= */}

          <div className={styles.content}>
            <span
              className={`${styles.statusBadge} ${
                isSoldOut
                  ? styles.soldOut
                  : styles.available
              }`}
            >
              {isSoldOut
                ? "Sold Out"
                : "Available"}
            </span>

            <h2>{bundle.name}</h2>

            {/* =========================
                Fixed Description Area
            ========================= */}

            <div
              className={
                styles.descriptionSection
              }
            >
              <div
                className={
                  styles.descriptionViewport
                }
              >
                <p
                  className={`${
                    styles.descriptionText
                  } ${
                    isDescriptionExpanded
                      ? styles.descriptionExpanded
                      : styles.descriptionCollapsed
                  }`}
                >
                  {description}
                </p>
              </div>

              <div
                className={
                  styles.descriptionButtonArea
                }
              >
                {hasLongDescription && (
                  <button
                    type="button"
                    className={
                      styles.descriptionToggle
                    }
                    onClick={() =>
                      setIsDescriptionExpanded(
                        (previousValue) =>
                          !previousValue
                      )
                    }
                    aria-expanded={
                      isDescriptionExpanded
                    }
                  >
                    {isDescriptionExpanded
                      ? "Show Less"
                      : "Show More"}
                  </button>
                )}
              </div>
            </div>

            {/* =========================
                Bundle Items
            ========================= */}

            {Array.isArray(
              bundle.bundle_items
            ) &&
              bundle.bundle_items.length >
                0 && (
                <div
                  className={styles.bundleItems}
                >
                  <h3>Bundle Includes:</h3>

                  <ul>
                    {bundle.bundle_items.map(
                      (item) => (
                        <li
                          key={
                            item.id ||
                            item.product_id
                          }
                        >
                          {item.product_image && (
                            <img
                              src={
                                item.product_image
                              }
                              alt={
                                item.product_name
                              }
                            />
                          )}

                          <span>
                            <strong>
                              {item.quantity} ×
                            </strong>{" "}
                            {item.product_name}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* =========================
                Price
            ========================= */}

            <div
              className={styles.priceContainer}
            >
              {hasDiscount && (
                <span className={styles.oldPrice}>
                  {oldPrice} EGP
                </span>
              )}

              <strong className={styles.price}>
                {price} EGP
              </strong>
            </div>

            {/* =========================
                Purchase Area
            ========================= */}

            {isSoldOut ? (
              <div
                className={
                  styles.soldOutPurchaseArea
                }
              >
                <div
                  className={
                    styles.soldOutNotice
                  }
                >
                  Sold Out
                </div>

                <button
                  type="button"
                  className={
                    styles.disabledButton
                  }
                  disabled
                >
                  Sold Out
                </button>
              </div>
            ) : (
              <>
                <div
                  className={styles.stockNotice}
                >
                  Available now: {stock}{" "}
                  {stock === 1
                    ? "bundle"
                    : "bundles"}
                </div>

                <div
                  className={styles.quantityBox}
                >
                  <label>Quantity *</label>

                  <div
                    className={
                      styles.quantityControl
                    }
                  >
                    <button
                      type="button"
                      className={
                        styles.quantityButton
                      }
                      onClick={
                        handleDecreaseQuantity
                      }
                      disabled={
                        Number(quantity) <= 1
                      }
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>

                    <input
                      value={quantity}
                      onChange={
                        handleQuantityChange
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="1"
                      aria-label="Bundle quantity"
                    />

                    <button
                      type="button"
                      className={
                        styles.quantityButton
                      }
                      onClick={
                        handleIncreaseQuantity
                      }
                      disabled={
                        Number(quantity) >= stock
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {quantity &&
                    Number(quantity) > stock && (
                      <small>
                        Only {stock} bundles
                        available
                      </small>
                    )}
                </div>

                {/*
                  نحجز مساحة ثابتة للرسالة حتى
                  لا يزيد أو يقل حجم الكارت.
                */}

                <div
                  className={
                    styles.cartMessageArea
                  }
                >
                  {cartMessage && (
                    <div
                      className={
                        styles.cartMessage
                      }
                    >
                      {cartMessage}
                    </div>
                  )}
                </div>

                <div
                  className={styles.actionsRow}
                >
                  <button
                    type="button"
                    className={
                      styles.primaryButton
                    }
                    onClick={handleAddToCart}
                  >
                    Add Bundle to Cart
                  </button>

                  <button
                    type="button"
                    className={
                      styles.secondaryButton
                    }
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </button>
                </div>

                <Link
                  to="/checkout"
                  className={styles.cartLink}
                >
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