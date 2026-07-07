import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import BackButton from "../../components/BackButton/BackButton";
import {
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "../../services/cart";
import styles from "./Cart.module.css";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getCartItems());
  }, []);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);
  }, [items]);

  function handleQuantityChange(productId, value) {
    if (!/^\d*$/.test(value)) return;

    const item = items.find((cartItem) => cartItem.id === productId);
    if (!item) return;

    if (value === "") {
      const updatedItems = items.map((cartItem) =>
        cartItem.id === productId ? { ...cartItem, quantity: "" } : cartItem
      );

      setItems(updatedItems);
      return;
    }

    const quantity = Number(value);

    if (quantity < 1) {
      alert("Quantity must be at least 1");
      return;
    }

    if (quantity > Number(item.stock)) {
      alert(`Only ${item.stock} pieces available`);
      return;
    }

    updateCartItemQuantity(productId, quantity);
    setItems(getCartItems());
  }

  function handleRemove(productId) {
    removeCartItem(productId);
    setItems(getCartItems());
  }

  function handleCheckout() {
    const invalidItem = items.find(
      (item) =>
        !item.quantity ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > Number(item.stock)
    );

    if (invalidItem) {
      alert(`Please check quantity for ${invalidItem.name}`);
      return;
    }

    navigate("/cart-checkout");
  }

  return (
    <>
      <Header />

      <main className={styles.page}>
        <BackButton fallbackPath="/" label="Back to Products" />

        <section className={styles.cartCard}>
          <div className={styles.header}>
            <h2>Your Cart</h2>
            <p>{items.length} products selected</p>
          </div>

          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <h3>Your cart is empty</h3>
              <Link to="/" className={styles.primaryButton}>
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.itemsList}>
                {items.map((item) => (
                  <article className={styles.cartItem} key={item.id}>
                    <img src={item.image} alt={item.name} />

                    <div className={styles.itemInfo}>
                      <h3>{item.name}</h3>
                      <p>{item.price} EGP</p>
                      <small>Available: {item.stock}</small>
                    </div>

                    <div className={styles.quantityBox}>
                      <label>Quantity</label>
                      <input
                        value={item.quantity}
                        onChange={(event) =>
                          handleQuantityChange(item.id, event.target.value)
                        }
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>

                    <strong className={styles.itemTotal}>
                      {Number(item.price) * Number(item.quantity || 0)} EGP
                    </strong>

                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </button>
                  </article>
                ))}
              </div>

              <div className={styles.summary}>
                <span>Total</span>
                <strong>{total} EGP</strong>
              </div>

              <button
                type="button"
                className={styles.checkoutButton}
                onClick={handleCheckout}
              >
                Checkout All Products
              </button>
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}