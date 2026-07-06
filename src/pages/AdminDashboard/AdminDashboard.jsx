import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addProduct,
  deleteProduct,
  getOrders,
  getProducts,
  updateOrderShippingStatus,
  updateProduct,
} from "../../services/storage";
import styles from "./AdminDashboard.module.css";

const emptyProductForm = {
  name: "",
  price: "",
  image: "",
  description: "",
  details: "",
  stock: "",
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState(getProducts());
  const [orders, setOrders] = useState(getOrders());
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);

  function logout() {
    localStorage.removeItem("uniqare_admin_logged_in");
    navigate("/admin-login");
  }

  function handleProductChange(event) {
    const { name, value } = event.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleProductSubmit(event) {
    event.preventDefault();

    if (
      !productForm.name ||
      !productForm.price ||
      !productForm.image ||
      !productForm.description ||
      !productForm.details ||
      productForm.stock === ""
    ) {
      alert("Please fill all product fields");
      return;
    }

    if (editingId) {
      updateProduct(editingId, productForm);
      setEditingId(null);
    } else {
      addProduct(productForm);
    }

    setProducts(getProducts());
    setProductForm(emptyProductForm);
  }

  function startEdit(product) {
    setEditingId(product.id);

    setProductForm({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      details: product.details,
      stock: product.stock,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(productId) {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    deleteProduct(productId);
    setProducts(getProducts());
  }

  function handleShippingChange(orderId, checked) {
    updateOrderShippingStatus(orderId, checked);
    setOrders(getOrders());
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div>
          <h1>uniqare Admin Dashboard</h1>
          <p>Manage products, stock, and orders</p>
        </div>

        <button className={styles.logoutButton} onClick={logout}>
          Logout
        </button>
      </header>

      <div className={styles.tabs}>
        <button
          className={activeTab === "products" ? styles.activeTab : ""}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>

        <button
          className={activeTab === "orders" ? styles.activeTab : ""}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
      </div>

      {activeTab === "products" && (
        <section className={styles.section}>
          <form className={styles.productForm} onSubmit={handleProductSubmit}>
            <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

            <div className={styles.formGrid}>
              <input
                name="name"
                value={productForm.name}
                onChange={handleProductChange}
                placeholder="Product name"
              />

              <input
                name="price"
                type="number"
                value={productForm.price}
                onChange={handleProductChange}
                placeholder="Price"
              />

              <input
                name="stock"
                type="number"
                value={productForm.stock}
                onChange={handleProductChange}
                placeholder="Stock quantity"
              />

              <input
                name="image"
                value={productForm.image}
                onChange={handleProductChange}
                placeholder="Image URL"
              />
            </div>

            <textarea
              name="description"
              value={productForm.description}
              onChange={handleProductChange}
              placeholder="Short description"
            />

            <textarea
              name="details"
              value={productForm.details}
              onChange={handleProductChange}
              placeholder="Full product details"
            />

            <div className={styles.formActions}>
              <button className={styles.primaryButton} type="submit">
                {editingId ? "Update Product" : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setEditingId(null);
                    setProductForm(emptyProductForm);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className={styles.productsList}>
            {products.map((product) => {
              const isSoldOut = Number(product.stock) <= 0;

              return (
                <article className={styles.adminProductCard} key={product.id}>
                  <img src={product.image} alt={product.name} />

                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.price} EGP</p>
                    <p>Stock: {product.stock}</p>

                    <span
                      className={`${styles.statusBadge} ${
                        isSoldOut ? styles.soldOut : styles.available
                      }`}
                    >
                      {isSoldOut ? "Sold Out" : "Available"}
                    </span>
                  </div>

                  <div className={styles.cardActions}>
                    <button onClick={() => startEdit(product)}>Edit</button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "orders" && (
        <section className={styles.section}>
          <h2>Orders</h2>

          {orders.length === 0 ? (
            <p className={styles.emptyText}>No orders yet.</p>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <article className={styles.orderCard} key={order.id}>
                  <div className={styles.orderMain}>
                    <img src={order.productImage} alt={order.productName} />

                    <div>
                      <h3>{order.productName}</h3>
                      <p><strong>Customer:</strong> {order.customerName}</p>
                      <p><strong>Phone:</strong> {order.phone}</p>
                      <p><strong>Email:</strong> {order.email}</p>
                      <p><strong>Governorate:</strong> {order.governorate}</p>
                      <p><strong>Address:</strong> {order.address}</p>
                      <p><strong>Total:</strong> {order.finalPrice} EGP</p>
                      <p><strong>Date:</strong> {order.createdAt}</p>
                    </div>
                  </div>

                  <label className={styles.shippingCheck}>
                    <input
                      type="checkbox"
                      checked={order.shipped}
                      onChange={(event) =>
                        handleShippingChange(order.id, event.target.checked)
                      }
                    />
                    Delivered to shipping company
                  </label>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}