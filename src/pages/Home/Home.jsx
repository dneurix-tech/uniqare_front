import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/ProductCard/ProductCard";
import { getAdminProducts } from "../../services/storage";
import styles from "./Home.module.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const productsPerPage = 12;
  const totalPages = Math.ceil(products.length / productsPerPage);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminProducts();

        if (Array.isArray(data)) {
          const sortedProducts = [...data].sort((a, b) => {
            const aSoldOut = Number(a.stock || 0) <= 0;
            const bSoldOut = Number(b.stock || 0) <= 0;

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
    (product) => Number(product.stock || 0) > 0
  ).length;

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.hero}>
          <span className={styles.label}>Give Yourself A Unique Care</span>
          <p className={styles.subtitle}>
            Discover uniqare products for healthy hair.
          </p>
        </section>

        <section className={styles.productsSection}>
          <div className={styles.productsHeader}>
            <h3>Our Products</h3>
            <p>
              {availableCount} available / {products.length} total products
            </p>
          </div>

          {loading && <p>Loading products...</p>}

          {error && <p>{error}</p>}

          {!loading && !error && (
            <>
              <div className={styles.productsGrid}>
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
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