import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { egyptGovernorates } from "../../data/governorates";
import { addOrder, getProductById } from "../../services/storage";
import styles from "./Checkout.module.css";

export default function Checkout() {
  const { id } = useParams();
  const product = getProductById(id);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    governorate: "",
    coupon: "",
  });

  const [errors, setErrors] = useState({});
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState("");

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

  const finalPrice = product.price - discount;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^01[0125][0-9]{8}$/.test(form.phone)) {
      newErrors.phone = "Phone must be a valid Egyptian number of 11 digits";
    }

    if (!form.governorate) {
      newErrors.governorate = "Governorate is required";
    }

    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function applyCoupon() {
    if (form.coupon.trim().toUpperCase() === "UNIQARE10") {
      setDiscount(product.price * 0.1);
      setMessage("Coupon applied successfully");
    } else {
      setDiscount(0);
      setMessage("Invalid coupon");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    addOrder({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      discount,
      finalPrice,
      customerName: form.name,
      email: form.email,
      phone: form.phone,
      governorate: form.governorate,
      address: form.address,
      coupon: form.coupon,
    });

    setMessage("تم تأكيد الطلب بنجاح");

    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      governorate: "",
      coupon: "",
    });

    setDiscount(0);
    setErrors({});
  }

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.checkoutLayout}>
          <aside className={styles.summaryCard}>
            <img src={product.image} alt={product.name} />

            <h2>{product.name}</h2>
            <p>{product.description}</p>

            <div className={styles.priceRow}>
              <span>Product Price</span>
              <strong>{product.price} EGP</strong>
            </div>

            {discount > 0 && (
              <div className={styles.priceRow}>
                <span>Discount</span>
                <strong>-{discount} EGP</strong>
              </div>
            )}

            <div className={`${styles.priceRow} ${styles.total}`}>
              <span>Total</span>
              <strong>{finalPrice} EGP</strong>
            </div>
          </aside>

          <form className={styles.formCard} onSubmit={handleSubmit}>
            <h2>Order Details</h2>

            <div className={styles.formGroup}>
              <label>Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
              {errors.name && <small>{errors.name}</small>}
            </div>

            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              {errors.email && <small>{errors.email}</small>}
            </div>

            <div className={styles.formGroup}>
              <label>Phone *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
              />
              {errors.phone && <small>{errors.phone}</small>}
            </div>

            <div className={styles.formGroup}>
              <label>Governorate *</label>
              <select
                name="governorate"
                value={form.governorate}
                onChange={handleChange}
              >
                <option value="">Select Governorate</option>
                {egyptGovernorates.map((governorate) => (
                  <option key={governorate} value={governorate}>
                    {governorate}
                  </option>
                ))}
              </select>
              {errors.governorate && <small>{errors.governorate}</small>}
            </div>

            <div className={styles.formGroup}>
              <label>Address *</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your full address"
              />
              {errors.address && <small>{errors.address}</small>}
            </div>

            <div className={styles.couponRow}>
              <input
                name="coupon"
                value={form.coupon}
                onChange={handleChange}
                placeholder="Discount coupon"
              />
              <button type="button" onClick={applyCoupon}>
                Apply
              </button>
            </div>

            <button className={styles.submitButton} type="submit">
              Confirm Order
            </button>

            {message && <div className={styles.message}>{message}</div>}
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}