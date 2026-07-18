import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/ProductCard/ProductCard";

import { getAdminProducts } from "../../services/storage";

import {
  addToCart,
  getCartItems,
  removeFromCart,
  saveCartItems,
  CART_UPDATED_EVENT,
} from "../../services/cart";

import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [cartMessage, setCartMessage] =
    useState("");

  const [
    cartMessageType,
    setCartMessageType,
  ] = useState("success");

  const cartMessageTimer = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const productsPerPage = 12;

  const totalPages = Math.ceil(
    products.length / productsPerPage
  );

  /* =========================
     Open Cart From Header
  ========================= */

  useEffect(() => {
    if (!location.state?.openCart) {
      return;
    }

    setCart(getCartItems());
    setCartOpen(true);

    navigate("/", {
      replace: true,
      state: null,
    });
  }, [
    location.state?.openCart,
    location.state?.cartRequestId,
    navigate,
  ]);

  /* =========================
     Cart Events
  ========================= */

  useEffect(() => {
    function refreshCart() {
      setCart(getCartItems());
    }

    refreshCart();

    window.addEventListener(
      CART_UPDATED_EVENT,
      refreshCart
    );

    window.addEventListener(
      "storage",
      refreshCart
    );

    window.addEventListener(
      "focus",
      refreshCart
    );

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

  /* =========================
     Load Products
  ========================= */

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminProducts();

        if (Array.isArray(data)) {
          const sortedProducts = [...data].sort(
            (a, b) => {
              const aSoldOut =
                Number(a.stock || 0) <= 0 ||
                a.is_active === false;

              const bSoldOut =
                Number(b.stock || 0) <= 0 ||
                b.is_active === false;

              return (
                Number(aSoldOut) -
                Number(bSoldOut)
              );
            }
          );

          setProducts(sortedProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  /* =========================
     Current Products
  ========================= */

  const currentProducts = useMemo(() => {
    const start =
      (currentPage - 1) * productsPerPage;

    const end = start + productsPerPage;

    return products.slice(start, end);
  }, [products, currentPage]);

  const availableCount = products.filter(
    (product) =>
      Number(product.stock || 0) > 0 &&
      product.is_active !== false
  ).length;

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  /* =========================
     Messages
  ========================= */

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

  /* =========================
     Add To Cart
  ========================= */

  function handleAddToCart(product) {
    const result = addToCart(product, 1);

    if (!result.success) {
      showCartMessage(
        result.message ||
          "Unable to add this product to your cart.",
        "error"
      );

      return;
    }

    const latestCart = getCartItems();

    setCart(latestCart);

    showCartMessage(
      `${product.name} has been added to your cart successfully.`,
      "success"
    );
  }

  /* =========================
     Increase Quantity
  ========================= */

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
        `Only ${stock} pieces are available.`,
        "error"
      );

      return;
    }

    const updatedCart = cart.map(
      (cartItem) =>
        Number(cartItem.id) ===
        Number(productId)
          ? {
              ...cartItem,
              quantity: currentQuantity + 1,
            }
          : cartItem
    );

    saveCartItems(updatedCart);
    setCart(updatedCart);
  }

  /* =========================
     Decrease Quantity
  ========================= */

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

  /* =========================
     Remove Product
  ========================= */

  function removeCartItem(productId) {
    const removedProduct = cart.find(
      (item) =>
        Number(item.id) === Number(productId)
    );

    const updatedCart =
      removeFromCart(productId);

    setCart(updatedCart);

    showCartMessage(
      removedProduct
        ? `${removedProduct.name} has been removed from your cart.`
        : "Product has been removed from your cart.",
      "removed"
    );
  }

  /* =========================
     Checkout
  ========================= */

  function goToCheckout() {
    const latestCart = getCartItems();

    if (latestCart.length === 0) {
      showCartMessage(
        "Your cart is empty.",
        "error"
      );

      return;
    }

    setCart(latestCart);
    navigate("/checkout");
  }

  /* =========================
     Render
  ========================= */

  return (
    <>
      <Header />

      <main className={styles.page}>
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
            <span
              className={styles.cartMessageIcon}
            >
              {cartMessageType === "error"
                ? "!"
                : cartMessageType === "removed"
                ? "−"
                : "✓"}
            </span>

            <div
              className={
                styles.cartMessageContent
              }
            >
              <strong>
                {cartMessageType === "error"
                  ? "Unable to Add Product"
                  : cartMessageType ===
                    "removed"
                  ? "Removed from Your Cart"
                  : "Added to Cart"}
              </strong>

              <p>{cartMessage}</p>
            </div>

            <button
              type="button"
              className={
                styles.closeCartMessage
              }
              onClick={() =>
                setCartMessage("")
              }
              aria-label="Close message"
            >
              ×
            </button>
          </div>
        )}

        {cartOpen && (
          <div className={styles.cartOverlay}>
            <div
              className={styles.cartBackdrop}
              onClick={() =>
                setCartOpen(false)
              }
            />

            <aside className={styles.cartDrawer}>
              <div className={styles.cartHeader}>
                <h3>Your Cart</h3>

                <button
                  type="button"
                  onClick={() =>
                    setCartOpen(false)
                  }
                  aria-label="Close cart"
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
                  <div
                    className={styles.cartItems}
                  >
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className={
                          styles.cartItem
                        }
                      >
                        <img
                          src={
                            item.image ||
                            item.image_url
                          }
                          alt={item.name}
                        />

                        <div
                          className={
                            styles.cartItemInfo
                          }
                        >
                          <h4>{item.name}</h4>

                          <p>
                            {item.price} EGP
                          </p>

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
                              -
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
                              removeCartItem(
                                item.id
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className={styles.cartFooter}
                  >
                    <div
                      className={
                        styles.cartTotal
                      }
                    >
                      <span>Total</span>

                      <strong>
                        {cartTotal.toFixed(2)} EGP
                      </strong>
                    </div>

                    <button
                      type="button"
                      className={
                        styles.checkoutButton
                      }
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
          <span className={styles.label}>
            Give Yourself A Unique Care
          </span>

          <p className={styles.subtitle}>
            Discover UNIQARE products for
            healthy hair.
          </p>
        </section>

        <section
          className={styles.productsSection}
        >
          <div className={styles.productsHeader}>
            <div>
              <h3>Our Products</h3>

              <p>
                {availableCount} available /{" "}
                {products.length} total products
              </p>
            </div>

            <div className={styles.headerActions}>
            <button
  type="button"
  className={styles.bundlesHeaderButton}
  onClick={() => navigate("/bundles")}
>
  <svg
    className={styles.headerActionIcon}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      x="3"
      y="8"
      width="18"
      height="13"
      rx="2"
    />

    <path d="M12 8v13" />
    <path d="M3 12h18" />

    <path d="M12 8H7.5a2.5 2.5 0 1 1 0-5c2 0 4.5 5 4.5 5z" />

    <path d="M12 8h4.5a2.5 2.5 0 1 0 0-5c-2 0-4.5 5-4.5 5z" />
  </svg>

  <span>Bundles</span>
</button>
              <button
                type="button"
                className={
                  styles.cartHeaderButton
                }
                onClick={() => {
                  setCurrentPage(1);

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                🛍️ Products
              </button>
            </div>
          </div>

          {loading && (
            <p>Loading products...</p>
          )}

          {error && <p>{error}</p>}

          {!loading && !error && (
            <>
              <div
                className={styles.productsGrid}
              >
                {currentProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={
                        handleAddToCart
                      }
                    />
                  )
                )}
              </div>

              {totalPages > 1 && (
                <div
                  className={styles.pagination}
                >
                  {Array.from(
                    { length: totalPages },
                    (_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={
                          currentPage ===
                          index + 1
                            ? styles.activePage
                            : ""
                        }
                        onClick={() => {
                          setCurrentPage(
                            index + 1
                          );

                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                      >
                        {index + 1}
                      </button>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}