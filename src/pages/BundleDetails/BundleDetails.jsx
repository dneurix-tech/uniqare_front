import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

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
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageType, setCartMessageType] = useState("success");

  useEffect(() => {
    return () => {
      if (cartMessageTimer.current) {
        clearTimeout(cartMessageTimer.current);
      }
    };
  }, []);
  
  function showCartMessage(message, type = "success") {
    setCartMessage(message);
    setCartMessageType(type);
  
    if (cartMessageTimer.current) {
      clearTimeout(cartMessageTimer.current);
    }
  
    cartMessageTimer.current = setTimeout(() => {
      setCartMessage("");
    }, 2500);
  }
  
  const cartMessageTimer = useRef(null);
  useEffect(() => {
    async function loadBundle() {
      try {
        const data = await getBundleById(id);
        setBundle(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadBundle();
  }, [id]);

  if (loading)
    return (
      <>
        <Header />
        <main className={styles.page}>
          <h2>Loading...</h2>
        </main>
        <Footer />
      </>
    );

  if (!bundle)
    return (
      <>
        <Header />
        <main className={styles.page}>
          <h2>Bundle not found</h2>

          <Link to="/bundles">Back</Link>
        </main>
        <Footer />
      </>
    );

  const images =
    bundle.images?.length > 0
      ? bundle.images
      : [{ image_url: bundle.image_url }];

      function addBundle() {
        const result = addToCart(
          {
            ...bundle,
            image: images[0].image_url,
            image_url: images[0].image_url,
            is_bundle: true,
          },
          quantity
        );
      
        if (result?.success === false) {
          showCartMessage(
            result.message || "Unable to add this bundle.",
            "error"
          );
          return;
        }
      
        showCartMessage(
          `${bundle.name} has been added to your cart.`,
          "success"
        );
      }

  return (
<>
  <Header />

  {cartMessage && (
    <div
      className={`${styles.cartMessage} ${
        cartMessageType === "error"
          ? styles.cartErrorMessage
          : styles.cartSuccessMessage
      }`}
      role="status"
      aria-live="polite"
    >
      <strong>
        {cartMessageType === "error"
          ? "Unable to Add"
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

  <main className={styles.page}>
        <BackButton fallbackPath="/bundles" label="Back to Bundles" />

        <section className={styles.container}>
          <div className={styles.imageSection}>
            <img
              src={images[0].image_url}
              alt={bundle.name}
            />
          </div>

          <div className={styles.infoSection}>
            <h1>{bundle.name}</h1>

            <p className={styles.description}>
    {bundle.long_description}
</p>

            <div className={styles.priceBox}>
              {Number(bundle.old_price) > Number(bundle.price) && (
                <span className={styles.oldPrice}>
                  {bundle.old_price} EGP
                </span>
              )}

              <strong>{bundle.price} EGP</strong>
            </div>

            <p>
              Available:
              <strong> {bundle.stock}</strong>
            </p>

            <div className={styles.products}>
              <h3>Included Products</h3>

              {bundle.bundle_items.map((item) => (
                <div
                  key={item.product_id}
                  className={styles.productItem}
                >
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                  />

                  <span>
                    {item.quantity} × {item.product_name}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.actionBox}>
  <div className={styles.quantity}>
    <button
      onClick={() =>
        setQuantity(Math.max(1, quantity - 1))
      }
    >
      -
    </button>

    <span>{quantity}</span>

    <button
      onClick={() =>
        setQuantity(
          Math.min(bundle.stock, quantity + 1)
        )
      }
    >
      +
    </button>
  </div>

  <button
    className={styles.buyButton}
    onClick={addBundle}
  >
    Add Bundle To Cart
  </button>

  <button
    className={styles.checkoutButton}
    onClick={() => {
      addBundle();
      navigate("/checkout");
    }}
  >
    Buy Now
    </button>
      </div>
    </div>
  </section>
</main>

<Footer />
</>
);
}