import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const productsPerPage = 12;
  const totalPages = Math.ceil(products.length / productsPerPage);

  useEffect(() => {
    function refreshCart() {
      setCart(getCartItems());
    }

    refreshCart();

    window.addEventListener(CART_UPDATED_EVENT, refreshCart);
    window.addEventListener("storage", refreshCart);
    window.addEventListener("focus", refreshCart);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refreshCart);
      window.removeEventListener("storage", refreshCart);
      window.removeEventListener("focus", refreshCart);
    };
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminProducts();

        if (Array.isArray(data)) {
          const sortedProducts = [...data].sort((a, b) => {
            const aSoldOut =
              Number(a.stock || 0) <= 0 || a.is_active === false;
            const bSoldOut =
              Number(b.stock || 0) <= 0 || b.is_active === false;

            return Number(aSoldOut) - Number(bSoldOut);
          });

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

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;

    return products.slice(start, end);
  }, [products, currentPage]);

  const availableCount = products.filter(
    (product) =>
      Number(product.stock || 0) > 0 && product.is_active !== false
  ).length;

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

function handleAddToCart(product) {
  const result = addToCart(product, 1);

  if (!result.success) {
    alert(result.message);
    return;
  }

  const latestCart = getCartItems();

  setCart(latestCart);
}

  function increaseQuantity(productId) {
    const item = cart.find((cartItem) => cartItem.id === productId);

    if (!item) return;

    const currentQuantity = Number(item.quantity || 0);
    const stock = Number(item.stock || 0);

    if (currentQuantity >= stock) {
      alert(`Only ${stock} pieces available`);
      return;
    }

    const updatedCart = cart.map((cartItem) =>
      cartItem.id === productId
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
        item.id === productId
          ? {
              ...item,
              quantity: Number(item.quantity || 0) - 1,
            }
          : item
      )
      .filter((item) => Number(item.quantity) > 0);

    saveCartItems(updatedCart);
    setCart(updatedCart);
  }

  function removeCartItem(productId) {
    const updatedCart = removeFromCart(productId);

    setCart(updatedCart);
  }

  function goToCheckout() {
    const latestCart = getCartItems();

    if (latestCart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setCart(latestCart);
    navigate("/checkout");
  }

  return (
    <>
      <Header />

      <main className={styles.page}>
        <button
          type="button"
          className={styles.cartFloatingButton}
          onClick={() => {
            setCart(getCartItems());
            setCartOpen(true);
          }}
        >
          🛒
          {cartCount > 0 && <span>{cartCount}</span>}
        </button>

        {cartOpen && (
          <div className={styles.cartOverlay}>
            <div
              className={styles.cartBackdrop}
              onClick={() => setCartOpen(false)}
            />

            <aside className={styles.cartDrawer}>
              <div className={styles.cartHeader}>
                <h3>Your Cart</h3>

                <button type="button" onClick={() => setCartOpen(false)}>
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <p className={styles.emptyCart}>Your cart is empty</p>
              ) : (
                <>
                  <div className={styles.cartItems}>
                    {cart.map((item) => (
                      <div key={item.id} className={styles.cartItem}>
                        <img src={item.image} alt={item.name} />

                        <div className={styles.cartItemInfo}>
                          <h4>{item.name}</h4>
                          <p>{item.price} EGP</p>

                          <div className={styles.quantityControls}>
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item.id)}
                            >
                              -
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              type="button"
                              onClick={() => increaseQuantity(item.id)}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className={styles.removeButton}
                            onClick={() => removeCartItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.cartFooter}>
                    <div className={styles.cartTotal}>
                      <span>Total</span>
                      <strong>{cartTotal} EGP</strong>
                    </div>

                    <button
                      type="button"
                      className={styles.checkoutButton}
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
          <span className={styles.label}>Give Yourself A Unique Care</span>

          <p className={styles.subtitle}>
            Discover uniqare products for healthy hair.
          </p>
        </section>

        <section className={styles.productsSection}>
          <div className={styles.productsHeader}>
            <div>
              <h3>Our Products</h3>

              <p>
                {availableCount} available / {products.length} total products
              </p>
            </div>

            <button
              type="button"
              className={styles.cartHeaderButton}
              onClick={() => {
                setCart(getCartItems());
                setCartOpen(true);
              }}
            >
              🛒 Cart {cartCount > 0 && `(${cartCount})`}
            </button>
          </div>

          {loading && <p>Loading products...</p>}

          {error && <p>{error}</p>}

          {!loading && !error && (
            <>
              <div className={styles.productsGrid}>
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={
                        currentPage === index + 1 ? styles.activePage : ""
                      }
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
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