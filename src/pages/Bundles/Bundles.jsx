import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getPublicBundles } from "../../services/storage";
import {
  addToCart,
  CART_UPDATED_EVENT,
  getCartItems,
  removeFromCart,
  saveCartItems,
} from "../../services/cart";
import styles from "./Bundles.module.css";


function BundleCard({ bundle, onAddToCart }) {
  const images =
    Array.isArray(bundle.images) && bundle.images.length > 0
      ? bundle.images
      : bundle.image_url
        ? [
            {
              id: `bundle-${bundle.id}`,
              image_url: bundle.image_url,
            },
          ]
        : [];

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);

  const currentImage =
    images[currentImageIndex]?.image_url ||
    bundle.image_url ||
    "";

  const oldPrice = Number(bundle.old_price || 0);
  const price = Number(bundle.price || 0);

  const discountPercentage =
    oldPrice > price && oldPrice > 0
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

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

  return (
    <article className={styles.bundleCard}>
      <div className={styles.imageBox}>
        {discountPercentage > 0 && (
          <span className={styles.discountBadge}>
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
            className={styles.bundleImage}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            No image
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.sliderButton} ${styles.previousButton}`}
              onClick={showPreviousImage}
              aria-label="Previous bundle image"
            >
              ‹
            </button>

            <button
              type="button"
              className={`${styles.sliderButton} ${styles.nextButton}`}
              onClick={showNextImage}
              aria-label="Next bundle image"
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
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Show image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.bundleContent}>
        <h2>{bundle.name}</h2>

        {bundle.short_description && (
          <p className={styles.description}>
            {bundle.short_description}
          </p>
        )}

        <div className={styles.includedProducts}>
          <h3>Bundle includes</h3>

          {Array.isArray(bundle.bundle_items) &&
          bundle.bundle_items.length > 0 ? (
            <ul>
              {bundle.bundle_items.map((item) => (
                <li key={item.id || item.product_id}>
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                    />
                  )}

                  <span>
                    <strong>{item.quantity} ×</strong>{" "}
                    {item.product_name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Bundle products are not available.</p>
          )}
        </div>

        <div className={styles.priceBox}>
          {oldPrice > price && (
            <span className={styles.oldPrice}>
              {oldPrice} EGP
            </span>
          )}

          <strong className={styles.currentPrice}>
            {price} EGP
          </strong>
        </div>

<p className={styles.stockText}>
  {Number(bundle.stock || 0) > 0
    ? `Only ${bundle.stock} bundle(s) left`
    : "Sold out"}
</p>

        <button
          type="button"
          className={styles.addButton}
          disabled={
            Number(bundle.stock || 0) <= 0 ||
            bundle.is_active === false
          }
          onClick={() => onAddToCart(bundle)}
        >
          {Number(bundle.stock || 0) > 0
            ? "Add Bundle to Cart"
            : "Sold Out"}
        </button>
      </div>
    </article>
  );
}


export default function Bundles() {
  const navigate = useNavigate();

  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageType, setCartMessageType] =
    useState("success");

  const cartMessageTimer = useRef(null);

  useEffect(() => {
    async function loadBundles() {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicBundles();

        setBundles(
          Array.isArray(data)
            ? data.filter(
                (bundle) =>
                  bundle.is_active !== false &&
                  Number(bundle.stock || 0) > 0
              )
            : []
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load bundle offers");
      } finally {
        setLoading(false);
      }
    }

    loadBundles();
  }, []);

  useEffect(() => {
    function refreshCart() {
      setCart(getCartItems());
    }

    refreshCart();

    window.addEventListener(
      CART_UPDATED_EVENT,
      refreshCart
    );
    window.addEventListener("storage", refreshCart);
    window.addEventListener("focus", refreshCart);

    return () => {
      window.removeEventListener(
        CART_UPDATED_EVENT,
        refreshCart
      );
      window.removeEventListener(
        "storage",
        refreshCart
      );
      window.removeEventListener(
        "focus",
        refreshCart
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      if (cartMessageTimer.current) {
        clearTimeout(cartMessageTimer.current);
      }
    };
  }, []);

  const cartCount = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  function showCartMessage(
    message,
    type = "success"
  ) {
    setCartMessage(message);
    setCartMessageType(type);

    if (cartMessageTimer.current) {
      clearTimeout(cartMessageTimer.current);
    }

    cartMessageTimer.current = setTimeout(() => {
      setCartMessage("");
    }, 2500);
  }

function handleAddToCart(bundle) {
  const latestCart = getCartItems();

  const existingBundle = latestCart.find(
    (item) =>
      Number(item.id) === Number(bundle.id)
  );

  const currentQuantity = Number(
    existingBundle?.quantity || 0
  );

  const availableStock = Number(
    bundle.stock || 0
  );

  if (availableStock <= 0) {
    showCartMessage(
      "This bundle is sold out.",
      "error"
    );
    return;
  }

  if (currentQuantity >= availableStock) {
    showCartMessage(
      `Only ${availableStock} bundle(s) are available.`,
      "error"
    );
    return;
  }

  const cartBundle = {
    ...bundle,
    image:
      bundle.images?.[0]?.image_url ||
      bundle.image_url ||
      "",
    image_url:
      bundle.images?.[0]?.image_url ||
      bundle.image_url ||
      "",
    is_bundle: true,
    stock: availableStock,
  };

  const result = addToCart(
    cartBundle,
    1
  );

  if (!result.success) {
    showCartMessage(
      result.message ||
        "Unable to add this bundle to your cart.",
      "error"
    );
    return;
  }

  setCart(getCartItems());

  showCartMessage(
    `${bundle.name} has been added to your cart.`,
    "success"
  );
}

  function increaseQuantity(productId) {
    const item = cart.find(
      (cartItem) =>
        Number(cartItem.id) === Number(productId)
    );

    if (!item) return;

    const currentQuantity = Number(
      item.quantity || 0
    );
    const stock = Number(item.stock || 0);

    if (currentQuantity >= stock) {
      showCartMessage(
        `Only ${stock} bundle(s) are available.`,
        "error"
      );
      return;
    }

    const updatedCart = cart.map((cartItem) =>
      Number(cartItem.id) === Number(productId)
        ? {
            ...cartItem,
            quantity: currentQuantity + 1,
          }
        : cartItem
    );

    saveCartItems(updatedCart);
    setCart(updatedCart);
  }

  function decreaseQuantity(productId) {
    const updatedCart = cart
      .map((item) =>
        Number(item.id) === Number(productId)
          ? {
              ...item,
              quantity:
                Number(item.quantity || 0) - 1,
            }
          : item
      )
      .filter(
        (item) => Number(item.quantity) > 0
      );

    saveCartItems(updatedCart);
    setCart(updatedCart);
  }

  function removeCartItem(productId) {
    const removedProduct = cart.find(
      (item) =>
        Number(item.id) === Number(productId)
    );

    const updatedCart = removeFromCart(productId);

    setCart(updatedCart);

    showCartMessage(
      removedProduct
        ? `${removedProduct.name} has been removed from your cart.`
        : "Item has been removed from your cart.",
      "removed"
    );
  }

  function goToCheckout() {
    const latestCart = getCartItems();

    if (latestCart.length === 0) {
      showCartMessage(
        "Your cart is empty.",
        "error"
      );
      return;
    }

    navigate("/checkout");
  }

  return (
    <>
      <Header />

      <main className={styles.page}>
        <div className={styles.floatingActions}>
          <button
            type="button"
            className={styles.homeFloatingButton}
            onClick={() => navigate("/")}
          >
            🏠 Return to Products
          </button>

          <button
            type="button"
            className={styles.cartFloatingButton}
            onClick={() => {
              setCart(getCartItems());
              setCartOpen(true);
            }}
          >
            🛒
            {cartCount > 0 && (
              <span>{cartCount}</span>
            )}
          </button>
        </div>

        {cartMessage && (
          <div
            className={`${styles.cartMessage} ${
              cartMessageType === "error"
                ? styles.cartErrorMessage
                : cartMessageType === "removed"
                  ? styles.cartRemovedMessage
                  : styles.cartSuccessMessage
            }`}
            role="status"
            aria-live="polite"
          >
            <strong>
              {cartMessageType === "error"
                ? "Unable to Add"
                : cartMessageType === "removed"
                  ? "Removed"
                  : "Added to Cart"}
            </strong>

            <p>{cartMessage}</p>

            <button
              type="button"
              onClick={() => setCartMessage("")}
            >
              ×
            </button>
          </div>
        )}

        {cartOpen && (
          <div className={styles.cartOverlay}>
            <div
              className={styles.cartBackdrop}
              onClick={() => setCartOpen(false)}
            />

            <aside className={styles.cartDrawer}>
              <div className={styles.cartHeader}>
                <h3>Your Cart</h3>

                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <p className={styles.emptyCart}>
                  Your cart is empty
                </p>
              ) : (
                <>
                  <div className={styles.cartItems}>
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className={styles.cartItem}
                      >
                        <img
                          src={
                            item.image ||
                            item.image_url
                          }
                          alt={item.name}
                        />

                        <div>
                          <h4>{item.name}</h4>
                          <p>{item.price} EGP</p>

                          <div
                            className={
                              styles.quantityControls
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  item.id
                                )
                              }
                            >
                              −
                            </button>

                            <span>
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(
                                  item.id
                                )
                              }
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className={
                              styles.removeButton
                            }
                            onClick={() =>
                              removeCartItem(item.id)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.cartFooter}>
                    <div>
                      <span>Total</span>
                      <strong>
                        {cartTotal.toFixed(2)} EGP
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={goToCheckout}
                    >
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </aside>
          </div>
        )}

        <section className={styles.hero}>
          <span>UNIQARE Special Offers</span>
          <h1>Bundle Offers</h1>
          <p>
            Get your favorite hair-care products
            together at a special price.
          </p>

          <div className={styles.heroActions}>
            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Browse Products
            </button>

            <button
              type="button"
              onClick={() => {
                setCart(getCartItems());
                setCartOpen(true);
              }}
            >
              View Cart {cartCount > 0 && `(${cartCount})`}
            </button>
          </div>
        </section>

        <section className={styles.bundlesSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span>Save more</span>
              <h2>Available Bundles</h2>
            </div>

            <p>
              {bundles.length} bundle offer(s)
              available
            </p>
          </div>

          {loading && (
            <p className={styles.statusText}>
              Loading bundle offers...
            </p>
          )}

          {error && (
            <p className={styles.errorText}>
              {error}
            </p>
          )}

          {!loading &&
            !error &&
            bundles.length === 0 && (
              <div className={styles.emptyState}>
                <h2>No bundles available yet</h2>
                <p>
                  New bundle offers will appear here.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                >
                  Browse Products
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            bundles.length > 0 && (
              <div className={styles.bundlesGrid}>
                {bundles.map((bundle) => (
                  <BundleCard
                    key={bundle.id}
                    bundle={bundle}
                    onAddToCart={
                      handleAddToCart
                    }
                  />
                ))}
              </div>
            )}
        </section>
      </main>

      <Footer />
    </>
  );
}
