import { useMemo, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/ProductCard/ProductCard";
import { getProducts } from "../../services/storage";
import styles from "./Home.module.css";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);

  const products = getProducts();
  const productsPerPage = 12;
  const totalPages = Math.ceil(products.length / productsPerPage);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    return products.slice(start, end);
  }, [products, currentPage]);

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.hero}>
          <span className={styles.label}>Premium Hair Care</span>
          <h2 className={styles.title}>Hair care made simple</h2>
          <p className={styles.subtitle}>
            Discover uniqare products for healthy, soft, and beautiful hair.
          </p>
        </section>

        <section className={styles.productsSection}>
          <div className={styles.productsHeader}>
            <h3>Our Products</h3>
            <p>{products.length} products available</p>
          </div>

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
        </section>
      </main>

      <Footer />
    </>
  );
}