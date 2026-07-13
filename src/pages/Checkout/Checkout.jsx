import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { egyptGovernorates } from "../../data/governorates";
import {
  addOrder,
  checkCoupon,
  getProductById,
  updateOrderPayment,
} from "../../services/storage";
import {
  clearCart,
  getCartItems,
  saveCartItems,
} from "../../services/cart";
import styles from "./Checkout.module.css";
import BackButton from "../../components/BackButton/BackButton";

const BRAND_WHATSAPP = "201095285287";
const INSTAPAY_USERNAME = "ghanoum99ahly";
const INSTAPAY_LINK = "https://ipn.eg/S/ghanoum99ahly/instapay/7bOUri";
const VODAFONE_CASH_NUMBER = "01095285287";

const CART_DISCOUNT_THRESHOLD = 1000;
const CART_DISCOUNT_PERCENT = 0.10;

export default function Checkout() {
  const { id } = useParams();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    governorate: "",
    note: "",
    coupon: "",
  });

  const [errors, setErrors] = useState({});
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const subtotalPrice = cartItems.reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.quantity || 0);
  }, 0);

  const isCartEmpty = cartItems.length === 0;

  const hasInvalidQuantity = cartItems.some((item) => {
    const quantityValue = Number(item.quantity);
    const stockValue = Number(item.stock || 0);

    return (
      !item.quantity ||
      !/^[1-9]\d*$/.test(String(item.quantity)) ||
      quantityValue < 1 ||
      quantityValue > stockValue
    );
  });

  const isCartAvailable =
    cartItems.length > 0 &&
    cartItems.every(
      (item) =>
        Number(item.stock || 0) > 0 &&
        item.is_active !== false
    );

    // خصم تلقائي 10% عندما يكون إجمالي المنتجات 1000 جنيه أو أكثر
const cartDiscount =
  subtotalPrice >= CART_DISCOUNT_THRESHOLD && !hasInvalidQuantity
    ? Number((subtotalPrice * CART_DISCOUNT_PERCENT).toFixed(2))
    : 0;

// نختار الخصم الأكبر فقط، ولا نجمع الخصمين
const totalDiscount = Math.min(
  subtotalPrice,
  Number(Math.max(couponDiscount, cartDiscount).toFixed(2))
);

// تحديد نوع الخصم الذي تم اختياره
const isCouponDiscountApplied =
  couponDiscount > cartDiscount && couponDiscount > 0;

const isCartDiscountApplied =
  cartDiscount > 0 && cartDiscount >= couponDiscount;

const payablePrice = Number((subtotalPrice - totalDiscount).toFixed(2));

  useEffect(() => {
    async function loadCheckoutItems() {
      try {
        setLoading(true);

        if (id) {
          const product = await getProductById(id);

          const singleItem = {
            id: product.id,
            product_id: product.id,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            image: product.image_url || product.image,
            stock: Number(product.stock || 0),
            is_active: product.is_active,
            quantity: 1,
          };

          setCartItems([singleItem]);
        } else {
          const cart = getCartItems();
          setCartItems(cart);
        }
      } catch (err) {
        console.error(err);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutItems();
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 11);

      setForm((prev) => ({
        ...prev,
        phone: digitsOnly,
      }));

      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "coupon") {
      setCouponDiscount(0);
      setMessage("");
    }
  }

  function handleCartItemQuantityChange(productId, value) {
    if (!/^\d*$/.test(value)) return;

    const updatedItems = cartItems.map((item) => {
      if (item.id !== productId) return item;

      return {
        ...item,
        quantity: value,
      };
    });

    setCartItems(updatedItems);

    if (!id) {
      saveCartItems(updatedItems);
    }

    setCouponDiscount(0);

    setForm((prev) => ({
      ...prev,
      coupon: "",
    }));

    setMessage("");
    setPaymentError("");
  }

  function removeCartItem(productId) {
    const updatedItems = cartItems.filter((item) => item.id !== productId);

    setCartItems(updatedItems);

    if (!id) {
      saveCartItems(updatedItems);
    }

    setCouponDiscount(0);

    setForm((prev) => ({
      ...prev,
      coupon: "",
    }));

    setSelectedPayment("");
    setPaymentNotice("");
    setPaymentError("");
    setMessage("");
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

    if (isCartEmpty) {
      newErrors.cart = "Cart is empty";
    }

    if (hasInvalidQuantity) {
      newErrors.cart = "Please check product quantities";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

async function applyCoupon() {
  if (isCartEmpty) {
    setMessage("Cart is empty");
    return;
  }

  if (hasInvalidQuantity) {
    setMessage("Please check product quantities first");
    return;
  }

  if (!form.coupon.trim()) {
    setMessage("Please enter coupon code");
    return;
  }

  try {
    const result = await checkCoupon({
      coupon_code: form.coupon.trim(),
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: Number(item.quantity),
      })),
    });

    const couponValue = Number(result.discount_amount || 0);

    setCouponDiscount(couponValue);

    if (couponValue > cartDiscount) {
      setMessage(
        `تم تطبيق الكوبون لأنه يقدم الخصم الأكبر: ${couponValue} EGP`
      );
    } else if (cartDiscount > 0) {
      setMessage(
        `خصم 10% التلقائي أكبر أو يساوي خصم الكوبون، لذلك تم تطبيق خصم ${cartDiscount} EGP`
      );
    } else {
      setMessage(`تم تطبيق الكوبون بنجاح: ${couponValue} EGP`);
    }
  } catch (err) {
    console.error(err);
    setCouponDiscount(0);
    setMessage("Invalid coupon");
  }
}

  function getPaymentLabel(method) {
    if (method === "cash") return "Cash on Delivery";
    if (method === "instapay") return "InstaPay";
    if (method === "vodafone") return "Vodafone Cash";
    return "";
  }

  function getPaymentPayload(method) {
    if (method === "cash") {
      return {
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Customer will pay on delivery",
        paymentDetails: "Cash payment when receiving the order",
      };
    }

    if (method === "instapay") {
      return {
        paymentMethod: "InstaPay",
        paymentStatus: "Waiting for transfer screenshot",
        paymentDetails: `InstaPay username: ${INSTAPAY_USERNAME}`,
      };
    }

    if (method === "vodafone") {
      return {
        paymentMethod: "Vodafone Cash",
        paymentStatus: "Waiting for transfer screenshot",
        paymentDetails: `Vodafone Cash number: ${VODAFONE_CASH_NUMBER}`,
      };
    }

    return {
      paymentMethod: "Not selected",
      paymentStatus: "Waiting",
      paymentDetails: "",
    };
  }

  function openPaymentModal() {
    if (isCartEmpty) {
      setMessage("Cart is empty");
      return;
    }

    if (!isCartAvailable) {
      setMessage("One or more products are Sold Out");
      return;
    }

    if (hasInvalidQuantity) {
      setPaymentError("Please check product quantities");
      return;
    }

    if (!validateForm()) {
      setMessage("Please complete the required fields first");
      return;
    }

    setMessage("");
    setPaymentError("");
    setShowPaymentModal(true);
  }

function handlePaymentChoice(method) {
  setSelectedPayment(method);
  setPaymentError("");
  setPaymentNotice("");

  if (method === "cash") {
    setPaymentNotice(
      "تم اختيار الدفع عند الاستلام. اضغط Confirm Order لتأكيد الطلب."
    );

    setShowPaymentModal(false);
    return;
  }

  if (method === "instapay") {
    setPaymentNotice(
      "تم اختيار InstaPay. انسخ اسم المستخدم أو اضغط Open InstaPay لفتح التطبيق، وبعد التحويل أرسل صورة التحويل على واتساب."
    );

    // لا نفتح InstaPay تلقائيًا هنا.
    // سيُفتح فقط عندما يضغط العميل على زر Open InstaPay.
    return;
  }

  if (method === "vodafone") {
    setPaymentNotice(
      "تم اختيار Vodafone Cash. انسخ الرقم، وبعد التحويل أرسل صورة التحويل على واتساب."
    );
  }
}

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    if (isCartEmpty) {
      setMessage("Cart is empty");
      return;
    }

    if (!isCartAvailable) {
      setMessage("One or more products are Sold Out");
      return;
    }

    if (hasInvalidQuantity) {
      setMessage("Please check product quantities");
      return;
    }

    if (!selectedPayment) {
      setPaymentError("Please choose payment method first");
      setShowPaymentModal(true);
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const orderPayload = {
        customer_name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        governorate: form.governorate,
        address: form.address.trim(),
        note: form.note.trim(),
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: Number(item.quantity),
        })),
      };

      if (form.coupon.trim()) {
        orderPayload.coupon_code = form.coupon.trim();
      }

      const createdOrder = await addOrder(orderPayload);

      await updateOrderPayment(createdOrder.id, getPaymentPayload(selectedPayment));

      if (!id) {
        clearCart();
      }

      setCartItems([]);

      const savedDiscount = Number(createdOrder.discount_amount || 0);

      if (savedDiscount > 0) {
        setMessage(
          `تم تأكيد الطلب بنجاح - تم تطبيق خصم بقيمة ${savedDiscount} EGP`
        );
      } else {
        setMessage(`تم تأكيد الطلب بنجاح - ${getPaymentLabel(selectedPayment)}`);
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        governorate: "",
        note: "",
        coupon: "",
      });

      setSelectedPayment("");
      setPaymentNotice("");
      setPaymentError("");
      setCouponDiscount(0);
      setErrors({});
    } catch (err) {
      console.error(err);
      setMessage(err.message || "حدث خطأ أثناء تأكيد الطلب");
    } finally {
      setSubmitting(false);
    }
  }

  function copyText(text) {
    navigator.clipboard.writeText(text);
  }

  function openWhatsappForScreenshot() {
    const whatsappMessage =
      "Hello UNIQARE, I confirmed my order and I want to send the payment screenshot.";

    window.open(
      `https://wa.me/${BRAND_WHATSAPP}?text=${encodeURIComponent(
        whatsappMessage
      )}`,
      "_blank"
    );
  }

  if (loading) {
    return (
      <>
        <Header />

        <main className={styles.page}>
          <section className={styles.emptyState}>
            <h2>Loading...</h2>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className={styles.page}>
        <div className={styles.backWrapper}>
          <BackButton fallbackPath="/" label="Back" />
        </div>

        <section className={styles.checkoutLayout}>
          <aside className={styles.summaryCard}>
            <h2>Order Summary</h2>

            {cartItems.length === 0 ? (
              <div className={styles.soldOutNotice}>Cart is empty</div>
            ) : (
              <div className={styles.cartItemsList}>
                {cartItems.map((item) => {
                  const itemStock = Number(item.stock || 0);
                  const itemQuantity = Number(item.quantity || 0);
                  const itemSoldOut = itemStock <= 0 || item.is_active === false;
                  const itemQuantityInvalid =
                    !item.quantity ||
                    !/^[1-9]\d*$/.test(String(item.quantity)) ||
                    itemQuantity > itemStock;

                  return (
                    <div className={styles.cartSummaryItem} key={item.id}>
                      <img src={item.image} alt={item.name} />

                      <div className={styles.cartSummaryContent}>
                        <h3>{item.name}</h3>
                        <p>{item.price} EGP</p>

                        {itemSoldOut ? (
                          <span className={styles.itemError}>Sold Out</span>
                        ) : (
                          <span className={styles.itemStock}>
                            Available: {itemStock}
                          </span>
                        )}

                        <div className={styles.itemQuantityRow}>
                          <label>Qty</label>

                          <input
                            value={item.quantity}
                            onChange={(event) =>
                              handleCartItemQuantityChange(
                                item.id,
                                event.target.value
                              )
                            }
                            inputMode="numeric"
                            pattern="[0-9]*"
                            disabled={itemSoldOut}
                          />
                        </div>

                        {itemQuantityInvalid && !itemSoldOut && (
                          <small className={styles.itemError}>
                            Only {itemStock} pieces available
                          </small>
                        )}

                        <strong>
                          Total:{" "}
                          {Number(item.price) * Number(item.quantity || 0)} EGP
                        </strong>

                        <button
                          type="button"
                          className={styles.removeItemButton}
                          onClick={() => removeCartItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={styles.priceRow}>
              <span>Subtotal</span>

              {totalDiscount > 0 ? (
                <strong className={styles.oldPrice}>{subtotalPrice} EGP</strong>
              ) : (
                <strong>{subtotalPrice} EGP</strong>
              )}
            </div>

{isCartDiscountApplied && (
  <>
    <div className={styles.discountNotice}>
      تم تطبيق خصم تلقائي 10% لأن قيمة المنتجات بلغت 1000 جنيه أو أكثر
    </div>

    <div className={styles.priceRow}>
      <span>Automatic Discount 10%</span>
      <strong>-{cartDiscount} EGP</strong>
    </div>
  </>
)}

{isCouponDiscountApplied && (
  <>
    <div className={styles.discountNotice}>
      تم تطبيق خصم الكوبون لأنه أكبر من الخصم التلقائي
    </div>

    <div className={styles.priceRow}>
      <span>Coupon Discount</span>
      <strong>-{couponDiscount} EGP</strong>
    </div>
  </>
)}

            {couponDiscount > 0 && (
              <div className={styles.priceRow}>
                <span>Coupon Discount</span>
                <strong>-{couponDiscount} EGP</strong>
              </div>
            )}

            <div className={`${styles.priceRow} ${styles.total}`}>
              <span>Total</span>
              <strong>{payablePrice} EGP</strong>
            </div>

            <div className={styles.checkoutSteps}>
              <div className={styles.stepDone}>1. Order details</div>

              <div className={selectedPayment ? styles.stepDone : styles.stepActive}>
                2. Payment method
              </div>

              <div className={selectedPayment ? styles.stepActive : styles.stepMuted}>
                3. Confirm order
              </div>
            </div>
          </aside>

          <form className={styles.formCard} onSubmit={handleSubmit}>
            <h2>Order Details</h2>

            {errors.cart && (
              <div className={styles.paymentError}>{errors.cart}</div>
            )}

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
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
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

            <div className={styles.formGroup}>
              <label>Note</label>

              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Any notes for your order"
              />
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

            <div className={styles.paymentSelector}>
              <div className={styles.paymentSelectorTop}>
                <div>
                  <h3>Choose Payment Method</h3>
                  <p>اختار طريقة الدفع قبل تأكيد الطلب</p>
                </div>

                <button
                  type="button"
                  onClick={openPaymentModal}
                  disabled={isCartEmpty || !isCartAvailable || hasInvalidQuantity}
                >
                  {isCartEmpty
                    ? "Cart Empty"
                    : !isCartAvailable
                    ? "Sold Out"
                    : hasInvalidQuantity
                    ? "Check Quantity"
                    : selectedPayment
                    ? "Change Method"
                    : "Choose Method"}
                </button>
              </div>

              {selectedPayment ? (
                <div className={styles.selectedPaymentBox}>
                  <span>Selected payment method</span>
                  <strong>{getPaymentLabel(selectedPayment)}</strong>

                  {(selectedPayment === "instapay" ||
                    selectedPayment === "vodafone") && (
                    <p>
                      من فضلك بعد التحويل ارسل اسكرين شوت على رقم الواتس اب.
                    </p>
                  )}
                </div>
              ) : (
                <div className={styles.paymentWarning}>
                  No payment method selected yet.
                </div>
              )}

              {paymentError && (
                <div className={styles.paymentError}>{paymentError}</div>
              )}
            </div>

            <button
              className={styles.submitButton}
              type="submit"
              disabled={
                submitting ||
                !selectedPayment ||
                isCartEmpty ||
                !isCartAvailable ||
                hasInvalidQuantity
              }
            >
              {submitting
                ? "Submitting..."
                : isCartEmpty
                ? "Cart Empty"
                : !isCartAvailable
                ? "Sold Out"
                : hasInvalidQuantity
                ? "Check Quantity"
                : "Confirm Order"}
            </button>

            {message && <div className={styles.message}>{message}</div>}
          </form>
        </section>
      </main>

      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.paymentModal}>
            <div className={styles.modalHeader}>
              <div>
                <h3>Choose Payment Method</h3>
                <p>اختار طريقة الدفع المناسبة لك</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.paymentOptions}>
              <button
                type="button"
                className={selectedPayment === "cash" ? styles.optionActive : ""}
                onClick={() => handlePaymentChoice("cash")}
              >
                Cash on Delivery
                <span>الدفع عند الاستلام</span>
              </button>

              <button
                type="button"
                className={
                  selectedPayment === "instapay" ? styles.optionActive : ""
                }
                onClick={() => handlePaymentChoice("instapay")}
              >
                InstaPay
                <span>الدفع عن طريق انستا باي</span>
              </button>

              <button
                type="button"
                className={
                  selectedPayment === "vodafone" ? styles.optionActive : ""
                }
                onClick={() => handlePaymentChoice("vodafone")}
              >
                Vodafone Cash
                <span>الدفع عن طريق فودافون كاش</span>
              </button>
            </div>

{selectedPayment === "instapay" && (
  <div className={styles.paymentDetailsBox}>
    <p>InstaPay Username</p>

    <strong>{INSTAPAY_USERNAME}</strong>

    <div className={styles.paymentActions}>
      <button
        type="button"
        onClick={() => copyText(INSTAPAY_USERNAME)}
      >
        Copy Username
      </button>

      {INSTAPAY_LINK && (
        <button
          type="button"
          onClick={() => window.open(INSTAPAY_LINK, "_blank")}
        >
          Open InstaPay
        </button>
      )}
    </div>
  </div>
)}

            {selectedPayment === "vodafone" && (
              <div className={styles.paymentDetailsBox}>
                <p>Vodafone Cash Number</p>
                <strong>{VODAFONE_CASH_NUMBER}</strong>

                <div className={styles.paymentActions}>
                  <button
                    type="button"
                    onClick={() => copyText(VODAFONE_CASH_NUMBER)}
                  >
                    Copy Number
                  </button>
                </div>
              </div>
            )}

            {paymentNotice && (
              <div className={styles.paymentNotice}>
                <p>{paymentNotice}</p>

                {(selectedPayment === "instapay" ||
                  selectedPayment === "vodafone") && (
                  <button type="button" onClick={openWhatsappForScreenshot}>
                    Send Screenshot on WhatsApp
                  </button>
                )}

                <button
                  type="button"
                  className={styles.continueButton}
                  onClick={() => setShowPaymentModal(false)}
                >
                  Continue to Confirm Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}