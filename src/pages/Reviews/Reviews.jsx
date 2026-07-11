import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getPublicReviews } from "../../services/storage";
import styles from "./Reviews.module.css";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicReviews();

        if (Array.isArray(data)) {
          setReviews(data);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.hero}>
          <span className={styles.label}>Customer Reviews</span>
          <h1>What Our Customers Say</h1>
          <p>Real feedback from UNIQARE customers.</p>
        </section>

        {loading && <p className={styles.status}>Loading reviews...</p>}

        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && reviews.length === 0 && (
          <p className={styles.status}>No reviews yet.</p>
        )}

        {!loading && !error && reviews.length > 0 && (
          <section className={styles.grid}>
            {reviews.map((review) => (
              <article key={review.id} className={styles.card}>
                {review.image_url && (
                  <img
                    className={styles.image}
                    src={review.image_url}
                    alt={review.customer_name || "Customer review"}
                  />
                )}

                <div className={styles.content}>
                  <div className={styles.stars}>
                    {"★".repeat(Number(review.rating || 5))}
                  </div>

                  {review.description && <p>{review.description}</p>}

                  {review.customer_name && (
                    <strong>{review.customer_name}</strong>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}