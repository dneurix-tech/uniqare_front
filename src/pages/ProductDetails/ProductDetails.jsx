import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getProductById } from "../../services/storage";
import styles from "./ProductDetails.module.css";
import BackButton from "../../components/BackButton/BackButton";

export default function ProductDetails() {
  const { id } = useParams();
  const product = getProductById(id);

  if (!product) {
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

  const isSoldOut = Number(product.stock) <= 0;

  return (
    <>
      <Header />

      <main className={styles.page}>

        <div className={styles.backWrapper}>
  <BackButton fallbackPath="/" label="Back to Products" />
</div>

        <section className={styles.detailsSection}>
          <div className={styles.imageBox}>
            <img src={product.image} alt={product.name} />
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
            <p>{product.details}</p>

            <strong className={styles.price}>{product.price} EGP</strong>

            {isSoldOut ? (
              <button className={styles.disabledButton} disabled>
                Sold Out
              </button>
            ) : (
              <Link to={`/checkout/${product.id}`} className={styles.primaryButton}>
                Buy Now
              </Link>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}