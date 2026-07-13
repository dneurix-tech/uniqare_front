import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import BackButton from "../../components/BackButton/BackButton";
import styles from "./AboutUs.module.css";

const WHATSAPP_NUMBER = "201095285287";

export default function AboutUs() {
  const whatsappMessage =
    "Hello UNIQARE, I would like to ask about your products.";

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <>
      <Header />

      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.backWrapper}>
            <BackButton fallbackPath="/" label="Back" />
          </div>

          <section className={styles.hero}>
            <span className={styles.eyebrow}>Welcome to UNIQARE</span>

            <h1>About Us</h1>

            <p>
              UNIQARE is a beauty and personal care store created to help
              every customer feel confident, unique, and cared for.
              We carefully select products that support your daily beauty
              and self-care routine.
            </p>
          </section>

          <section className={styles.introduction}>
            <div className={styles.introductionContent}>
              <span className={styles.sectionLabel}>Who We Are</span>

              <h2>Beauty, Care and Confidence</h2>

              <p>
                At UNIQARE, we believe that self-care is not only about
                appearance. It is also about feeling comfortable,
                confident, and happy with yourself.
              </p>

              <p>
                Our goal is to provide high-quality beauty and care
                products with a simple shopping experience, clear product
                information, secure ordering, and helpful customer
                support.
              </p>
            </div>

            <div className={styles.logoCard}>
              <img
                src="/images/logo.jpg"
                alt="UNIQARE beauty and personal care"
              />

              <h3>UNIQARE</h3>
              <p>Your unique care starts here.</p>
            </div>
          </section>

          <section className={styles.valuesSection}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionLabel}>Our Values</span>
              <h2>What You Can Expect From Us</h2>
            </div>

            <div className={styles.cardsGrid}>
              <article className={styles.infoCard}>
                <div className={styles.icon}>✦</div>

                <h3>Carefully Selected Products</h3>

                <p>
                  We aim to offer beauty and personal care products that
                  are practical, useful, and suitable for your daily
                  routine.
                </p>
              </article>

              <article className={styles.infoCard}>
                <div className={styles.icon}>♡</div>

                <h3>Customer Care</h3>

                <p>
                  We are always ready to help you with product questions,
                  order details, delivery information, and after-sales
                  support.
                </p>
              </article>

              <article className={styles.infoCard}>
                <div className={styles.icon}>✓</div>

                <h3>Simple Shopping Experience</h3>

                <p>
                  Our website is designed to make browsing, ordering, and
                  choosing your preferred payment method simple and
                  convenient.
                </p>
              </article>
            </div>
          </section>

          <section className={styles.policySection}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionLabel}>Store Policy</span>
              <h2>Exchange and Return Policy</h2>

              <p>
                Please read the following conditions before requesting an
                exchange or return.
              </p>
            </div>

            <div className={styles.policyContent}>
              <article className={styles.policyCard}>
                <div className={styles.policyNumber}>01</div>

                <div>
                  <h3>Request Period</h3>

                  <p>
                    Exchange or return requests should be submitted within
                    14 days of receiving the order.
                  </p>
                </div>
              </article>

              <article className={styles.policyCard}>
                <div className={styles.policyNumber}>02</div>

                <div>
                  <h3>Product Condition</h3>

                  <p>
                    The product must be unused, unopened, undamaged, and
                    returned in its original packaging with all labels and
                    accessories included.
                  </p>
                </div>
              </article>

              <article className={styles.policyCard}>
                <div className={styles.policyNumber}>03</div>

                <div>
                  <h3>Beauty and Personal Care Products</h3>

                  <p>
                    For hygiene and safety reasons, opened or used beauty,
                    skincare, haircare, and personal care products cannot
                    be returned or exchanged unless they are defective or
                    were delivered incorrectly.
                  </p>
                </div>
              </article>

              <article className={styles.policyCard}>
                <div className={styles.policyNumber}>04</div>

                <div>
                  <h3>Damaged or Incorrect Orders</h3>

                  <p>
                    If you receive a damaged, defective, or incorrect
                    product, please contact us as soon as possible and send
                    clear photos or a video showing the condition of the
                    product and packaging.
                  </p>
                </div>
              </article>

              <article className={styles.policyCard}>
                <div className={styles.policyNumber}>05</div>

                <div>
                  <h3>Shipping Fees</h3>

                  <p>
                    When the return is caused by a defective or incorrect
                    product, UNIQARE will review the case and cover the
                    applicable return or replacement delivery fees.
                  </p>

                  <p>
                    For returns requested for personal reasons, delivery
                    and return shipping fees may be deducted from the
                    refund.
                  </p>
                </div>
              </article>

              <article className={styles.policyCard}>
                <div className={styles.policyNumber}>06</div>

                <div>
                  <h3>Refund Process</h3>

                  <p>
                    Approved refunds will be processed after the returned
                    product has been received and inspected. The processing
                    time may vary depending on the original payment method.
                  </p>
                </div>
              </article>
            </div>

            <div className={styles.policyNotice}>
              <strong>Important:</strong>

              <p>
                UNIQARE reserves the right to reject any return or exchange
                request that does not meet the conditions listed above.
              </p>
            </div>
          </section>

          <section className={styles.exchangeSteps}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionLabel}>How It Works</span>
              <h2>How to Request an Exchange or Return</h2>
            </div>

            <div className={styles.stepsGrid}>
              <article className={styles.stepCard}>
                <span>1</span>
                <h3>Contact Us</h3>

                <p>
                  Send us your name, phone number, and order information
                  through WhatsApp.
                </p>
              </article>

              <article className={styles.stepCard}>
                <span>2</span>
                <h3>Send Product Details</h3>

                <p>
                  Explain the reason for the request and attach clear
                  photos or videos when required.
                </p>
              </article>

              <article className={styles.stepCard}>
                <span>3</span>
                <h3>Wait for Confirmation</h3>

                <p>
                  Our customer service team will review your request and
                  explain the next steps.
                </p>
              </article>

              <article className={styles.stepCard}>
                <span>4</span>
                <h3>Return the Product</h3>

                <p>
                  Prepare the product in its original condition and follow
                  the return instructions provided by our team.
                </p>
              </article>
            </div>
          </section>

          <section className={styles.contactSection}>
            <div className={styles.contactContent}>
              <span className={styles.sectionLabel}>Contact Us</span>

              <h2>We Are Here to Help</h2>

              <p>
                Contact our customer support team for questions about
                products, orders, payments, delivery, exchanges, or
                returns.
              </p>

              <div className={styles.contactDetails}>
                <div>
                  <span>WhatsApp</span>
                  <strong>01095285287</strong>
                </div>

                <div>
                  <span>Support</span>
                  <strong>Order and product assistance</strong>
                </div>

                <div>
                  <span>Response</span>
                  <strong>During official working hours</strong>
                </div>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className={styles.whatsappButton}
              >
                Contact Us on WhatsApp
              </a>
            </div>

            <div className={styles.contactDecoration}>
              <div className={styles.contactCircle}>
                <span>UNIQARE</span>
                <small>Beauty, care and confidence</small>
              </div>
            </div>
          </section>

          <section className={styles.disclaimer}>
            <h2>Product Information Disclaimer</h2>

            <p>
              Product information displayed on our website is provided for
              general guidance. Customers should read the product label,
              ingredients, directions, and warnings before use.
            </p>

            <p>
              If you have allergies, sensitive skin, a medical condition,
              or concerns about using a product, please consult a qualified
              healthcare professional before use.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}