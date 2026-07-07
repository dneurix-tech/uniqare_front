import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addProduct,
  deleteProduct,
  getAdminProducts,
  getOrders,
  updateOrderShippingStatus,
  updateProduct,
} from "../../services/storage";
import styles from "./AdminDashboard.module.css";

const emptyProductForm = {
  name: "",
  price: "",
  image: null,
  description: "",
  details: "",
  stock: "",
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [imageInputKey, setImageInputKey] = useState(Date.now());

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      const data = await getAdminProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadOrders() {
    try {
      setLoadingOrders(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }

  function logout() {
    localStorage.removeItem("uniqare_admin_logged_in");
    navigate("/admin-login");
  }

  function handleProductChange(event) {
    const { name, value, files, type } = event.target;

    if (type === "file") {
      setProductForm((prev) => ({ ...prev, [name]: files[0] || null }));
      return;
    }

    setProductForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleProductSubmit(event) {
    event.preventDefault();

    if (
      !productForm.name ||
      !productForm.price ||
      !productForm.description ||
      productForm.stock === ""
    ) {
      alert("Please fill required product fields");
      return;
    }

    if (!editingId && !productForm.image) {
      alert("Please upload product image");
      return;
    }

    try {
      if (editingId) {
        await updateProduct(editingId, productForm);
        setEditingId(null);
      } else {
        await addProduct(productForm);
      }

      await loadProducts();

      setProductForm(emptyProductForm);
      setImageInputKey(Date.now());
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving product");
    }
  }

  function startEdit(product) {
    setEditingId(product.id);

    setProductForm({
      name: product.name || "",
      price: product.price || "",
      image: null,
      description: product.description || "",
      details: product.details || product.description || "",
      stock: product.stock ?? "",
    });

    setImageInputKey(Date.now());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(productId) {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      await deleteProduct(productId);
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  }

  async function handleShippingChange(orderId, checked) {
    try {
      await updateOrderShippingStatus(orderId, checked);
      await loadOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to update order status");
    }
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
                key={imageInputKey}
                name="image"
                type="file"
                accept="image/*"
                onChange={handleProductChange}
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
                    setImageInputKey(Date.now());
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className={styles.productsList}>
            {loadingProducts ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <p className={styles.emptyText}>No products found.</p>
            ) : (
              products.map((product) => {
                const isSoldOut = Number(product.stock) <= 0;

                return (
                  <article className={styles.adminProductCard} key={product.id}>
                    <img
                      src={product.image_url || product.image}
                      alt={product.name}
                    />

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
              })
            )}
          </div>
        </section>
      )}

      {activeTab === "orders" && (
        <section className={styles.section}>
          <h2>Orders</h2>

          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className={styles.emptyText}>No orders yet.</p>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <article className={styles.orderCard} key={order.id}>
                  <div className={styles.orderMain}>
                    {order.productImage && (
                      <img src={order.productImage} alt={order.productName} />
                    )}

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