import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  adminLogout,
  addAnnouncement,
  addBundle,
  addCoupon,
  addProduct,
  deleteAnnouncement,
  deleteBundle,
  deleteBundleImage,
  deleteCoupon,
  deleteOrder,
  deleteProduct,
  getAdminAnnouncements,
  getAdminBundles,
  getAdminCoupons,
  getAdminProducts,
  getOrders,
  updateAnnouncement,
  updateBundle,
  updateCoupon,
  updateOrderDetails,
  updateProduct,
} from "../../services/storage";
import ReviewsPage from "../Admin/ReviewsPage";
import styles from "./AdminDashboard.module.css";

const CART_DISCOUNT_THRESHOLD = 1000;
const CART_DISCOUNT_PERCENT = 0.1;

const emptyProductForm = {
  name: "",
  old_price: "",
  price: "",
  image: null,
  description: "",
  details: "",
  stock: "",
};

const emptyOrderForm = {
  customer_name: "",
  phone: "",
  email: "",
  governorate: "",
  address: "",
  note: "",
  status: "pending",
  payment_method: "",
  payment_status: "",
  payment_details: "",
  coupon_code: "",
  coupon_discount_type: "",
  coupon_discount_value: 0,
  items: [],
};

const emptyCouponForm = {
  code: "",
  discount_type: "percent",
  discount_value: "",
  min_order_amount: "0",
  usage_limit: "",
  expires_at: "",
  is_active: true,
};

const emptyBundleForm = {
  name: "",
  short_description: "",
  long_description: "",
  price: "",
  old_price: "",
  stock: "",
  category: "Bundle Offers",
  is_active: true,
  images: [],
  existing_images: [],
  items: [
    {
      product_id: "",
      quantity: 1,
    },
    {
      product_id: "",
      quantity: 1,
    },
  ],
};

const emptyAnnouncementForm = {
  content: "",
  is_active: true,
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [loadingBundles, setLoadingBundles] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [imageInputKey, setImageInputKey] = useState(Date.now());

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [orderForm, setOrderForm] = useState(emptyOrderForm);
  const [newOrderProductId, setNewOrderProductId] = useState("");

  const [editingCouponId, setEditingCouponId] = useState(null);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [savingCoupon, setSavingCoupon] = useState(false);

  const [editingBundleId, setEditingBundleId] = useState(null);
  const [bundleForm, setBundleForm] = useState(emptyBundleForm);
  const [bundleImageInputKey, setBundleImageInputKey] =
    useState(Date.now());
  const [savingBundle, setSavingBundle] = useState(false);

  const [editingAnnouncementId, setEditingAnnouncementId] =
    useState(null);
  const [announcementForm, setAnnouncementForm] = useState(
    emptyAnnouncementForm
  );
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadCoupons();
    loadBundles();
    loadAnnouncements();
  }, []);

  // التأكد من أن البيانات صحيحة عند التحميل
  useEffect(() => {
    if (editingId) {
      const product = products.find(p => p.id === editingId);
      if (product) {
        setProductForm(prev => ({
          ...prev,
          description: product.short_description || product.description || "",
          details: product.long_description || product.details || product.description || "",
        }));
      }
    }
  }, [editingId, products]);

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      const data = await getAdminProducts();
      
      const normalizedData = Array.isArray(data) ? data.map(product => ({
        ...product,
        short_description: product.short_description || product.description || "",
        long_description: product.long_description || product.details || product.description || "",
      })) : [];
      
      setProducts(normalizedData);
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

  async function loadCoupons() {
    try {
      setLoadingCoupons(true);
      const data = await getAdminCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  }

  async function loadBundles() {
    try {
      setLoadingBundles(true);
      const data = await getAdminBundles();
      setBundles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setBundles([]);
    } finally {
      setLoadingBundles(false);
    }
  }

  async function loadAnnouncements() {
    try {
      setLoadingAnnouncements(true);
      const data = await getAdminAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
  }

  function logout() {
    adminLogout();
    navigate("/uniqare-control-panel-9x7/login", {
      replace: true,
    });
  }

  /* =========================
     Products
  ========================= */

  function handleProductChange(event) {
    const { name, value, files, type } = event.target;

    if (type === "file") {
      setProductForm((prev) => ({
        ...prev,
        [name]: files?.[0] || null,
      }));
      return;
    }

    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleProductSubmit(event) {
    event.preventDefault();

    const currentPrice = Number(productForm.price);
    const oldPrice = productForm.old_price === "" ? null : Number(productForm.old_price);

    if (!productForm.name || !productForm.price || !productForm.description || productForm.stock === "") {
      alert("Please fill required product fields");
      return;
    }

    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      alert("Current price must be greater than 0");
      return;
    }

    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice <= currentPrice)) {
      alert("Old price must be greater than current price");
      return;
    }

    if (!editingId && !productForm.image) {
      alert("Please upload product image");
      return;
    }

    try {
      const productData = {
        name: productForm.name,
        old_price: productForm.old_price === "" ? null : Number(productForm.old_price),
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        short_description: productForm.description,
        long_description: productForm.details,
        image: productForm.image,
      };

      if (editingId) {
        await updateProduct(editingId, productData);
      } else {
        await addProduct(productData);
      }

      await loadProducts();

      setEditingId(null);
      setProductForm(emptyProductForm);
      setImageInputKey(Date.now());
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong while saving product");
    }
  }

  function startEdit(product) {
    setEditingId(product.id);

    setProductForm({
      name: product.name || "",
      old_price: product.old_price ?? product.oldPrice ?? "",
      price: product.price || "",
      image: null,
      description: product.short_description || product.description || "",
      details: product.long_description || product.details || product.description || "",
      stock: product.stock ?? "",
    });

    setImageInputKey(Date.now());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditProduct() {
    setEditingId(null);
    setProductForm(emptyProductForm);
    setImageInputKey(Date.now());
  }

  async function handleDelete(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await deleteProduct(productId);
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete product");
    }
  }

  /* =========================
     Orders
  ========================= */

  function getOrderItems(order) {
    return Array.isArray(order.items) ? order.items : [];
  }

  function getOrderProductTitle(order) {
    const items = getOrderItems(order);

    if (items.length === 0) {
      return (
        order.productName ||
        order.product_name ||
        order.product?.name ||
        "No products"
      );
    }

    if (items.length === 1) {
      const firstItem = items[0];

      return (
        firstItem.product_name ||
        firstItem.product?.name ||
        firstItem.name ||
        `Product #${firstItem.product_id}`
      );
    }

    return `${items.length} products`;
  }

  function getOrderImage(order) {
    const firstItem = getOrderItems(order)[0];

    return (
      firstItem?.product_image ||
      firstItem?.image ||
      firstItem?.product?.image_url ||
      firstItem?.product?.image ||
      order.productImage ||
      order.product_image ||
      ""
    );
  }

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  }

  function normalizePhoneForWhatsApp(value) {
    let phone = String(value || "").replace(/\D/g, "");

    if (!phone) return "";

    if (phone.startsWith("00")) {
      phone = phone.slice(2);
    }

    if (phone.startsWith("0")) {
      phone = `20${phone.slice(1)}`;
    } else if (phone.length === 10 && phone.startsWith("1")) {
      phone = `20${phone}`;
    }

    return phone;
  }

  function getOrderWhatsAppUrl(order) {
    const phone = normalizePhoneForWhatsApp(order.phone);

    if (!phone) return "";

    const customerName = getCustomerName(order);

    const message = [
      `Hello ${customerName},`,
      "",
      `This is UNIQARE regarding your order #${order.id}.`,
      "We are contacting you to confirm your order details.",
    ].join("\n");

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function makeSpreadsheetCellSafe(value) {
    if (value === null || value === undefined) return "";

    const text = String(value);

    if (/^[=+\-@]/.test(text)) {
      return `'${text}`;
    }

    return text;
  }

  function getOrderProductsSummary(order) {
    const items = getOrderItems(order);

    if (items.length === 0) {
      return getOrderProductTitle(order);
    }

    return items
      .map((item) => {
        const productName =
          item.product_name ||
          item.product?.name ||
          item.name ||
          `Product #${item.product_id}`;

        const quantity = Number(item.quantity || 0);

        return `${quantity} × ${productName}`;
      })
      .join(" | ");
  }

  function buildOrdersExportRows() {
    return orders.map((order) => ({
      "Order ID": order.id,
      Date: formatDate(order.created_at || order.createdAt),
      "Customer Name": makeSpreadsheetCellSafe(getCustomerName(order)),
      Phone: makeSpreadsheetCellSafe(order.phone || ""),
      Email: makeSpreadsheetCellSafe(order.email || ""),
      Governorate: makeSpreadsheetCellSafe(order.governorate || ""),
      Address: makeSpreadsheetCellSafe(order.address || ""),
      Note: makeSpreadsheetCellSafe(order.note || ""),
      Products: makeSpreadsheetCellSafe(getOrderProductsSummary(order)),
      Status: makeSpreadsheetCellSafe(order.status || "pending"),
      "Payment Method": makeSpreadsheetCellSafe(
        order.payment_method || "Not selected"
      ),
      "Payment Status": makeSpreadsheetCellSafe(order.payment_status || ""),
      "Payment Details": makeSpreadsheetCellSafe(order.payment_details || ""),
      Coupon: makeSpreadsheetCellSafe(order.coupon_code || ""),
      "Subtotal EGP": Number(order.subtotal_price || 0),
      "Discount EGP": Number(order.discount_amount || 0),
      "Total EGP": getOrderTotal(order),
    }));
  }

  function buildOrderItemsExportRows() {
    return orders.flatMap((order) => {
      const items = getOrderItems(order);

      return items.map((item) => {
        const productName =
          item.product_name ||
          item.product?.name ||
          item.name ||
          `Product #${item.product_id}`;

        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unit_price || 0);
        const itemTotal = Number(
          item.total_price || unitPrice * quantity || 0
        );

        return {
          "Order ID": order.id,
          Date: formatDate(order.created_at || order.createdAt),
          Customer: makeSpreadsheetCellSafe(getCustomerName(order)),
          Phone: makeSpreadsheetCellSafe(order.phone || ""),
          "Product ID": item.product_id || "",
          Product: makeSpreadsheetCellSafe(productName),
          Quantity: quantity,
          "Unit Price EGP": unitPrice,
          "Item Total EGP": Number(itemTotal.toFixed(2)),
        };
      });
    });
  }

  function exportOrdersToExcel() {
    const orderRows = buildOrdersExportRows();

    if (orderRows.length === 0) {
      alert("There are no orders to export");
      return;
    }

    const itemRows = buildOrderItemsExportRows();
    const workbook = XLSX.utils.book_new();
    const ordersSheet = XLSX.utils.json_to_sheet(orderRows);
    const itemsSheet = XLSX.utils.json_to_sheet(
      itemRows.length > 0
        ? itemRows
        : [
            {
              "Order ID": "",
              Date: "",
              Customer: "",
              Phone: "",
              "Product ID": "",
              Product: "",
              Quantity: "",
              "Unit Price EGP": "",
              "Item Total EGP": "",
            },
          ]
    );

    ordersSheet["!cols"] = [
      { wch: 10 },
      { wch: 22 },
      { wch: 24 },
      { wch: 18 },
      { wch: 28 },
      { wch: 18 },
      { wch: 38 },
      { wch: 32 },
      { wch: 55 },
      { wch: 15 },
      { wch: 22 },
      { wch: 22 },
      { wch: 35 },
      { wch: 15 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
    ];

    itemsSheet["!cols"] = [
      { wch: 10 },
      { wch: 22 },
      { wch: 24 },
      { wch: 18 },
      { wch: 12 },
      { wch: 40 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");
    XLSX.utils.book_append_sheet(workbook, itemsSheet, "Order Items");

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `uniqare-orders-${today}.xlsx`);
  }

  function convertRowsToGoogleSheetsText(rows) {
    if (!rows.length) return "";

    const headers = Object.keys(rows[0]);

    const cleanValue = (value) =>
      String(value ?? "")
        .replace(/\t/g, " ")
        .replace(/\r?\n/g, " ");

    const headerRow = headers.join("\t");
    const dataRows = rows.map((row) =>
      headers.map((header) => cleanValue(row[header])).join("\t")
    );

    return [headerRow, ...dataRows].join("\n");
  }

  async function openOrdersInGoogleSheets() {
    const orderRows = buildOrdersExportRows();

    if (orderRows.length === 0) {
      alert("There are no orders to export");
      return;
    }

    window.open("https://sheets.new", "_blank", "noopener,noreferrer");

    const sheetsText = convertRowsToGoogleSheetsText(orderRows);

    try {
      await navigator.clipboard.writeText(sheetsText);

      alert(
        "Orders copied successfully. A new Google Sheet has been opened. Press Ctrl + V inside the first cell."
      );
    } catch (error) {
      console.error(error);
      alert(
        "Google Sheets was opened, but the browser could not copy the orders. Use Download Excel instead."
      );
    }
  }

  function getCustomerName(order) {
    return order.customer_name || order.customerName || "-";
  }

  function getOrderTotal(order) {
    return Number(order.total_price || order.finalPrice || order.total || 0);
  }

  const getProductById = useCallback(
    (productId) => {
      return products.find(
        (product) => Number(product.id) === Number(productId)
      );
    },
    [products]
  );

  function startEditOrder(order) {
    const items = getOrderItems(order).map((item) => ({
      id: item.id,
      product_id: Number(item.product_id),
      product_name:
        item.product_name ||
        item.product?.name ||
        item.name ||
        `Product #${item.product_id}`,
      product_image:
        item.product_image ||
        item.product?.image_url ||
        item.image ||
        "",
      quantity: Number(item.quantity || 1),
      unit_price: Number(item.unit_price || 0),
    }));

    setEditingOrderId(order.id);

    setOrderForm({
      customer_name: order.customer_name || order.customerName || "",
      phone: order.phone || "",
      email: order.email || "",
      governorate: order.governorate || "",
      address: order.address || "",
      note: order.note || "",
      status: order.status || "pending",
      payment_method: order.payment_method || "",
      payment_status: order.payment_status || "",
      payment_details: order.payment_details || "",
      coupon_code: order.coupon_code || "",
      coupon_discount_type: order.coupon_discount_type || "",
      coupon_discount_value: Number(order.coupon_discount_value || 0),
      items,
    });

    setNewOrderProductId("");
    setActiveTab("orders");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditOrder() {
    setEditingOrderId(null);
    setOrderForm(emptyOrderForm);
    setNewOrderProductId("");
  }

  function handleOrderFormChange(event) {
    const { name, value } = event.target;

    setOrderForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function changeOrderItemQuantity(index, nextQuantity) {
    const quantity = Math.max(1, Number(nextQuantity) || 1);

    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, quantity }
          : item
      ),
    }));
  }

  function removeOrderItem(index) {
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addProductToOrder() {
    const productId = Number(newOrderProductId);

    if (!productId) {
      alert("Please select a product");
      return;
    }

    const product = getProductById(productId);

    if (!product) {
      alert("Product not found");
      return;
    }

    if (Number(product.stock || 0) <= 0 || product.is_active === false) {
      alert("This product is not currently available");
      return;
    }

    setOrderForm((prev) => {
      const existingIndex = prev.items.findIndex(
        (item) => Number(item.product_id) === productId
      );

      if (existingIndex >= 0) {
        return {
          ...prev,
          items: prev.items.map((item, index) =>
            index === existingIndex
              ? {
                  ...item,
                  quantity: Number(item.quantity || 0) + 1,
                }
              : item
          ),
        };
      }

      return {
        ...prev,
        items: [
          ...prev.items,
          {
            product_id: productId,
            product_name: product.name,
            product_image: product.image_url || product.image || "",
            quantity: 1,
            unit_price: Number(product.price || 0),
          },
        ],
      };
    });

    setNewOrderProductId("");
  }

  const orderPreview = useMemo(() => {
    const subtotal = orderForm.items.reduce((sum, item) => {
      const product = getProductById(item.product_id);
      const unitPrice =
        Number(item.unit_price) ||
        Number(product?.price || 0);

      return sum + unitPrice * Number(item.quantity || 0);
    }, 0);

    let couponDiscount = 0;

    if (
      orderForm.coupon_code &&
      orderForm.coupon_discount_value > 0
    ) {
      if (orderForm.coupon_discount_type === "percent") {
        couponDiscount =
          subtotal * (orderForm.coupon_discount_value / 100);
      } else if (orderForm.coupon_discount_type === "fixed") {
        couponDiscount = orderForm.coupon_discount_value;
      }
    }

    const cartDiscount =
      subtotal >= CART_DISCOUNT_THRESHOLD
        ? subtotal * CART_DISCOUNT_PERCENT
        : 0;

    const discount = Math.min(
      subtotal,
      Math.max(couponDiscount, cartDiscount)
    );

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number((subtotal - discount).toFixed(2)),
    };
  }, [
    orderForm.items,
    orderForm.coupon_code,
    orderForm.coupon_discount_type,
    orderForm.coupon_discount_value,
    getProductById,
  ]);

  async function handleOrderUpdate(event) {
    event.preventDefault();

    if (!editingOrderId) return;

    if (!orderForm.customer_name.trim()) {
      alert("Customer name is required");
      return;
    }

    if (!orderForm.phone.trim()) {
      alert("Phone is required");
      return;
    }

    if (!orderForm.governorate.trim()) {
      alert("Governorate is required");
      return;
    }

    if (!orderForm.address.trim()) {
      alert("Address is required");
      return;
    }

    if (!orderForm.items.length) {
      alert("The order must contain at least one product");
      return;
    }

    const hasInvalidQuantity = orderForm.items.some(
      (item) =>
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0
    );

    if (hasInvalidQuantity) {
      alert("Every product quantity must be a positive whole number");
      return;
    }

    try {
      await updateOrderDetails(editingOrderId, {
        customer_name: orderForm.customer_name.trim(),
        phone: orderForm.phone.trim(),
        email: orderForm.email.trim(),
        governorate: orderForm.governorate.trim(),
        address: orderForm.address.trim(),
        note: orderForm.note.trim(),
        status: orderForm.status,
        payment_method: orderForm.payment_method,
        payment_status: orderForm.payment_status,
        payment_details: orderForm.payment_details,
        items: orderForm.items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
        })),
      });

      await Promise.all([loadOrders(), loadProducts()]);
      cancelEditOrder();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update order");
    }
  }

  async function handleOrderDelete(orderId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order? Stock will be returned."
    );

    if (!confirmed) return;

    try {
      await deleteOrder(orderId);
      await Promise.all([loadOrders(), loadProducts(), loadCoupons()]);

      if (editingOrderId === orderId) {
        cancelEditOrder();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete order");
    }
  }

  async function handleOrderStatusChange(orderId, status) {
    try {
      await updateOrderDetails(orderId, { status });
      await loadOrders();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update order status");
    }
  }

  /* =========================
     Coupons
  ========================= */

  function handleCouponChange(event) {
    const { name, value, type, checked } = event.target;

    setCouponForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function toDateTimeLocal(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const timezoneOffset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - timezoneOffset)
      .toISOString()
      .slice(0, 16);
  }

  function startEditCoupon(coupon) {
    setEditingCouponId(coupon.id);
    setCouponForm({
      code: coupon.code || "",
      discount_type: coupon.discount_type || "percent",
      discount_value: coupon.discount_value ?? "",
      min_order_amount: coupon.min_order_amount ?? "0",
      usage_limit: coupon.usage_limit ?? "",
      expires_at: toDateTimeLocal(coupon.expires_at),
      is_active: Boolean(coupon.is_active),
    });

    setActiveTab("coupons");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditCoupon() {
    setEditingCouponId(null);
    setCouponForm(emptyCouponForm);
  }

  async function handleCouponSubmit(event) {
    event.preventDefault();

    const code = couponForm.code.trim().toUpperCase();
    const discountValue = Number(couponForm.discount_value);
    const minimumOrder = Number(couponForm.min_order_amount || 0);
    const usageLimit =
      couponForm.usage_limit === ""
        ? null
        : Number(couponForm.usage_limit);

    if (!code) {
      alert("Coupon code is required");
      return;
    }

    if (discountValue <= 0) {
      alert("Discount value must be greater than 0");
      return;
    }

    if (
      couponForm.discount_type === "percent" &&
      discountValue > 100
    ) {
      alert("Percentage cannot be more than 100%");
      return;
    }

    if (minimumOrder < 0) {
      alert("Minimum order cannot be negative");
      return;
    }

    if (usageLimit !== null && usageLimit <= 0) {
      alert("Usage limit must be greater than 0");
      return;
    }

    const payload = {
      code,
      discount_type: couponForm.discount_type,
      discount_value: discountValue,
      min_order_amount: minimumOrder,
      usage_limit: usageLimit,
      is_active: couponForm.is_active,
      expires_at: couponForm.expires_at
        ? new Date(couponForm.expires_at).toISOString()
        : null,
    };

    try {
      setSavingCoupon(true);

      if (editingCouponId) {
        await updateCoupon(editingCouponId, payload);
      } else {
        await addCoupon(payload);
      }

      await loadCoupons();
      cancelEditCoupon();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save coupon");
    } finally {
      setSavingCoupon(false);
    }
  }

  async function handleCouponToggle(coupon) {
    try {
      await updateCoupon(coupon.id, {
        is_active: !coupon.is_active,
      });
      await loadCoupons();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update coupon");
    }
  }

  async function handleCouponDelete(couponId) {
    const confirmed = window.confirm(
      "Delete this coupon permanently? Existing orders will keep their saved discount."
    );

    if (!confirmed) return;

    try {
      await deleteCoupon(couponId);
      await loadCoupons();

      if (editingCouponId === couponId) {
        cancelEditCoupon();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete coupon");
    }
  }

  /* =========================
     Bundles
  ========================= */

  function handleBundleFieldChange(event) {
    const { name, value, type, checked, files } = event.target;

    if (type === "file") {
      setBundleForm((prev) => ({
        ...prev,
        images: Array.from(files || []),
      }));
      return;
    }

    setBundleForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleBundleItemChange(index, field, value) {
    setBundleForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]:
                field === "quantity"
                  ? Math.max(1, Number(value) || 1)
                  : value,
            }
          : item
      ),
    }));
  }

  function addBundleProductRow() {
    setBundleForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: "",
          quantity: 1,
        },
      ],
    }));
  }

  function removeBundleProductRow(index) {
    setBundleForm((prev) => {
      if (prev.items.length <= 2) {
        alert("A bundle must contain at least two products");
        return prev;
      }

      return {
        ...prev,
        items: prev.items.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      };
    });
  }

  function startEditBundle(bundle) {
    setEditingBundleId(bundle.id);

    setBundleForm({
      name: bundle.name || "",
      short_description: bundle.short_description || "",
      long_description: bundle.long_description || "",
      price: bundle.price ?? "",
      old_price: bundle.old_price ?? "",
      stock: bundle.configured_stock ?? bundle.stock ?? "",
      category: bundle.category || "Bundle Offers",
      is_active: Boolean(bundle.is_active),
      images: [],
      existing_images: Array.isArray(bundle.images)
        ? bundle.images
        : [],
      items:
        Array.isArray(bundle.bundle_items) &&
        bundle.bundle_items.length >= 2
          ? bundle.bundle_items.map((item) => ({
              product_id: String(item.product_id),
              quantity: Number(item.quantity || 1),
            }))
          : emptyBundleForm.items,
    });

    setBundleImageInputKey(Date.now());
    setActiveTab("bundles");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditBundle() {
    setEditingBundleId(null);
    setBundleForm(emptyBundleForm);
    setBundleImageInputKey(Date.now());
  }

  async function handleBundleSubmit(event) {
    event.preventDefault();

    const name = bundleForm.name.trim();
    const currentPrice = Number(bundleForm.price);
    const oldPrice =
      bundleForm.old_price === ""
        ? null
        : Number(bundleForm.old_price);

    const bundleStock = Number(bundleForm.stock);
    if (!Number.isInteger(bundleStock) || bundleStock <= 0) {
      alert("Available bundle quantity must be a positive whole number");
      return;
    }

    const normalizedItems = bundleForm.items
      .filter((item) => item.product_id !== "")
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      }));

    const uniqueProductIds = new Set(
      normalizedItems.map((item) => item.product_id)
    );

    if (!name) {
      alert("Bundle name is required");
      return;
    }

    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      alert("Bundle price must be greater than 0");
      return;
    }

    if (
      oldPrice !== null &&
      (!Number.isFinite(oldPrice) || oldPrice <= currentPrice)
    ) {
      alert("Old price must be greater than bundle price");
      return;
    }

    if (
      normalizedItems.length < 2 ||
      uniqueProductIds.size < 2
    ) {
      alert("Select at least two different products");
      return;
    }

    if (
      normalizedItems.some(
        (item) =>
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
      )
    ) {
      alert("Every bundle quantity must be a positive whole number");
      return;
    }

    if (!editingBundleId && bundleForm.images.length === 0) {
      alert("Upload at least one bundle image");
      return;
    }

    try {
      setSavingBundle(true);

      const payload = {
        name,
        short_description: bundleForm.short_description.trim(),
        long_description: bundleForm.long_description.trim(),
        price: currentPrice,
        old_price: oldPrice === null ? "" : oldPrice,
        stock: bundleStock,
        category: bundleForm.category.trim() || "Bundle Offers",
        is_active: bundleForm.is_active,
        items: normalizedItems,
        images: bundleForm.images,
      };

      if (editingBundleId) {
        await updateBundle(editingBundleId, payload);
      } else {
        await addBundle(payload);
      }

      await Promise.all([
        loadBundles(),
        loadProducts(),
      ]);

      cancelEditBundle();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save bundle");
    } finally {
      setSavingBundle(false);
    }
  }

  async function handleBundleToggle(bundle) {
    try {
      await updateBundle(bundle.id, {
        is_active: !bundle.is_active,
      });

      await loadBundles();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update bundle");
    }
  }

  async function handleBundleDelete(bundleId) {
    const confirmed = window.confirm(
      "Delete this bundle permanently?"
    );

    if (!confirmed) return;

    try {
      await deleteBundle(bundleId);
      await loadBundles();

      if (editingBundleId === bundleId) {
        cancelEditBundle();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete bundle");
    }
  }

  async function handleBundleImageDelete(bundleId, imageId) {
    const confirmed = window.confirm(
      "Delete this bundle image?"
    );

    if (!confirmed) return;

    try {
      await deleteBundleImage(bundleId, imageId);

      setBundleForm((prev) => ({
        ...prev,
        existing_images: prev.existing_images.filter(
          (image) => image.id !== imageId
        ),
      }));

      await loadBundles();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete bundle image");
    }
  }

  /* =========================
     Announcements
  ========================= */

  function handleAnnouncementChange(event) {
    const { name, value, type, checked } = event.target;

    setAnnouncementForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startEditAnnouncement(announcement) {
    setEditingAnnouncementId(announcement.id);

    setAnnouncementForm({
      content: announcement.content || "",
      is_active: Boolean(announcement.is_active),
    });

    setActiveTab("announcements");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditAnnouncement() {
    setEditingAnnouncementId(null);
    setAnnouncementForm(emptyAnnouncementForm);
  }

  async function handleAnnouncementSubmit(event) {
    event.preventDefault();

    const content = announcementForm.content.trim();

    if (!content) {
      alert("Announcement content is required");
      return;
    }

    try {
      setSavingAnnouncement(true);

      const payload = {
        content,
        is_active: announcementForm.is_active,
      };

      if (editingAnnouncementId) {
        await updateAnnouncement(editingAnnouncementId, payload);
      } else {
        await addAnnouncement(payload);
      }

      await loadAnnouncements();
      cancelEditAnnouncement();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save announcement");
    } finally {
      setSavingAnnouncement(false);
    }
  }

  async function handleAnnouncementToggle(announcement) {
    try {
      await updateAnnouncement(announcement.id, {
        is_active: !announcement.is_active,
      });

      await loadAnnouncements();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update announcement");
    }
  }

  async function handleAnnouncementDelete(announcementId) {
    const confirmed = window.confirm(
      "Delete this announcement permanently?"
    );

    if (!confirmed) return;

    try {
      await deleteAnnouncement(announcementId);
      await loadAnnouncements();

      if (editingAnnouncementId === announcementId) {
        cancelEditAnnouncement();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete announcement");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div>
          <h1>UNIQARE Admin Dashboard</h1>
          <p>Manage products, bundles, orders, coupons, reviews, and stock</p>
        </div>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={logout}
        >
          Logout
        </button>
      </header>

      <div className={styles.tabs}>
        <button
          type="button"
          className={activeTab === "products" ? styles.activeTab : ""}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>

        <button
          type="button"
          className={activeTab === "bundles" ? styles.activeTab : ""}
          onClick={() => setActiveTab("bundles")}
        >
          Bundles
        </button>

        <button
          type="button"
          className={activeTab === "orders" ? styles.activeTab : ""}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>

        <button
          type="button"
          className={activeTab === "coupons" ? styles.activeTab : ""}
          onClick={() => setActiveTab("coupons")}
        >
          Coupons
        </button>

        <button
          type="button"
          className={activeTab === "reviews" ? styles.activeTab : ""}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>

        <button
          type="button"
          className={
            activeTab === "announcements" ? styles.activeTab : ""
          }
          onClick={() => setActiveTab("announcements")}
        >
          Announcements
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
                name="old_price"
                type="number"
                min="0"
                step="0.01"
                value={productForm.old_price}
                onChange={handleProductChange}
                placeholder="Old price (optional)"
              />

              <input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={productForm.price}
                onChange={handleProductChange}
                placeholder="Current price"
              />

              <input
                name="stock"
                type="number"
                min="0"
                step="1"
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

            <div className={styles.inputGroup}>
              <label>Product Highlights</label>

              <textarea
                className={styles.descriptionInput}
                name="description"
                rows={4}
                value={productForm.description}
                onChange={handleProductChange}
                placeholder={`Write a quick summary that appears on the product card.
Example:
• Supports healthy skin
`}
              />

              <small className={styles.counter}>
                {productForm.description.length} / 300
              </small>
            </div>

            <div className={styles.inputGroup}>
              <label>Complete Product Information</label>

              <textarea
                className={styles.longDescription}
                name="details"
                rows={12}
                value={productForm.details}
                onChange={handleProductChange}
                placeholder={`Provide complete information about the product.

Suggested structure:
Overview

Key Benefits
• ...

Ingredients

Directions for Use

Warnings

Storage
`}
              />

              <small className={styles.counter}>
                {productForm.details.length} / 3000
              </small>
            </div>

            <div className={styles.formActions}>
              <button className={styles.primaryButton} type="submit">
                {editingId ? "Update Product" : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={cancelEditProduct}
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
                const isSoldOut =
                  Number(product.stock || 0) <= 0 ||
                  product.is_active === false;

                const shortDescription = 
                  product.short_description || 
                  product.description || 
                  "";

                return (
                  <article className={styles.adminProductCard} key={product.id}>
                    <img
                      src={product.image_url || product.image}
                      alt={product.name}
                    />

                    <div className={styles.productInfo}>
                      <h3>{product.name}</h3>

                      <div className={styles.adminPriceBox}>
                        {Number(product.old_price || 0) >
                          Number(product.price || 0) && (
                          <span className={styles.adminOldPrice}>
                            {product.old_price} EGP
                          </span>
                        )}

                        <strong className={styles.adminCurrentPrice}>
                          {product.price} EGP
                        </strong>
                      </div>

                      {shortDescription && (
                        <p className={styles.productShortDesc}>
                          {shortDescription}
                        </p>
                      )}

                      <p className={styles.productStock}>
                        Stock: <strong>{product.stock}</strong>
                      </p>

                      <span
                        className={`${styles.statusBadge} ${
                          isSoldOut ? styles.soldOut : styles.available
                        }`}
                      >
                        {isSoldOut ? "Sold Out" : "Available"}
                      </span>
                    </div>

                    <div className={styles.cardActions}>
                      <button 
                        type="button" 
                        onClick={() => startEdit(product)}
                        className={styles.editButton}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleDelete(product.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      )}

      {activeTab === "bundles" && (
        <section className={styles.section}>
          <form
            className={styles.productForm}
            onSubmit={handleBundleSubmit}
          >
            <h2>
              {editingBundleId
                ? "Edit Bundle"
                : "Create New Bundle"}
            </h2>

            <div className={styles.formGrid}>
              <input
                name="name"
                value={bundleForm.name}
                onChange={handleBundleFieldChange}
                placeholder="Bundle name"
              />

              <input
                name="old_price"
                type="number"
                min="0"
                step="0.01"
                value={bundleForm.old_price}
                onChange={handleBundleFieldChange}
                placeholder="Old price (optional)"
              />

              <input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={bundleForm.price}
                onChange={handleBundleFieldChange}
                placeholder="Bundle price"
              />

              <input
                name="stock"
                type="number"
                min="1"
                step="1"
                value={bundleForm.stock}
                onChange={handleBundleFieldChange}
                placeholder="Available bundle quantity"
              />

              <input
                name="category"
                value={bundleForm.category}
                onChange={handleBundleFieldChange}
                placeholder="Category"
              />

              <label className={styles.checkboxField}>
                <input
                  name="is_active"
                  type="checkbox"
                  checked={bundleForm.is_active}
                  onChange={handleBundleFieldChange}
                />
                Active
              </label>

              <input
                key={bundleImageInputKey}
                name="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleBundleFieldChange}
              />
            </div>

            <textarea
              className={styles.descriptionInput}
              rows={4}
              placeholder={`Example:
• Rich in Vitamin C
• Supports immunity
• Daily supplement`}
              value={bundleForm.short_description}
              onChange={(e) =>
                setBundleForm({
                  ...bundleForm,
                  short_description: e.target.value,
                })
              }
            />

            <div className={styles.counter}>
              {bundleForm.short_description.length} / 300
            </div>

            <textarea
              className={styles.longDescription}
              rows={12}
              placeholder={`Describe the bundle...

Benefits

• ...
• ...

Ingredients

...

How To Use

...

Warnings

...

Storage

...`}
              value={bundleForm.long_description}
              onChange={(e) =>
                setBundleForm({
                  ...bundleForm,
                  long_description: e.target.value,
                })
              }
            />

            <div className={styles.counter}>
              {bundleForm.long_description.length} / 3000
            </div>

            <div className={styles.orderEditor}>
              <div className={styles.orderEditorHeader}>
                <div>
                  <h3>Bundle Products</h3>
                  <p>
                    Select at least two different products and set
                    the required quantity for each one.
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={addBundleProductRow}
                >
                  Add Product Row
                </button>
              </div>

              <div className={styles.editOrderItems}>
                {bundleForm.items.map((item, index) => (
                  <div
                    className={styles.editOrderItem}
                    key={`bundle-item-${index}`}
                  >
                    <select
                      value={item.product_id}
                      onChange={(event) =>
                        handleBundleItemChange(
                          index,
                          "product_id",
                          event.target.value
                        )
                      }
                    >
                      <option value="">Select product</option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.name} — Stock: {product.stock}
                        </option>
                      ))}
                    </select>

                    <div className={styles.quantityEditor}>
                      <button
                        type="button"
                        onClick={() =>
                          handleBundleItemChange(
                            index,
                            "quantity",
                            Number(item.quantity) - 1
                          )
                        }
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          handleBundleItemChange(
                            index,
                            "quantity",
                            event.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleBundleItemChange(
                            index,
                            "quantity",
                            Number(item.quantity) + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.removeItemButton}
                      onClick={() =>
                        removeBundleProductRow(index)
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {bundleForm.images.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "16px",
                }}
              >
                {bundleForm.images.map((image, index) => (
                  <img
                    key={`${image.name}-${index}`}
                    src={URL.createObjectURL(image)}
                    alt={`New bundle ${index + 1}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                ))}
              </div>
            )}

            {editingBundleId &&
              bundleForm.existing_images.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginTop: "16px",
                  }}
                >
                  {bundleForm.existing_images.map((image) => (
                    <div
                      key={image.id}
                      style={{ position: "relative" }}
                    >
                      <img
                        src={image.image_url}
                        alt="Existing bundle"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() =>
                          handleBundleImageDelete(
                            editingBundleId,
                            image.id
                          )
                        }
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          padding: "4px 8px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

            <div className={styles.formActions}>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={savingBundle}
              >
                {savingBundle
                  ? "Saving..."
                  : editingBundleId
                    ? "Update Bundle"
                    : "Create Bundle"}
              </button>

              {editingBundleId && (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={cancelEditBundle}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {loadingBundles ? (
            <p>Loading bundles...</p>
          ) : bundles.length === 0 ? (
            <p className={styles.emptyText}>
              No bundles created yet.
            </p>
          ) : (
            <div className={styles.productsList}>
              {bundles.map((bundle) => {
                const images = Array.isArray(bundle.images)
                  ? bundle.images
                  : [];

                return (
                  <article
                    className={styles.adminProductCard}
                    key={bundle.id}
                  >
                    <img
                      src={
                        images[0]?.image_url ||
                        bundle.image_url
                      }
                      alt={bundle.name}
                    />

                    <div>
                      <h3>{bundle.name}</h3>

                      <div className={styles.adminPriceBox}>
                        {Number(bundle.old_price || 0) >
                          Number(bundle.price || 0) && (
                          <span className={styles.adminOldPrice}>
                            {bundle.old_price} EGP
                          </span>
                        )}

                        <strong className={styles.adminCurrentPrice}>
                          {bundle.price} EGP
                        </strong>
                      </div>

                      <p>
                        Available now:{" "}
                        <strong>{bundle.stock}</strong>
                      </p>

                      <p>
                        Admin remaining quantity:{" "}
                        <strong>
                          {bundle.configured_stock ??
                            bundle.stock}
                        </strong>
                      </p>

                      <p>
                        {Array.isArray(bundle.bundle_items)
                          ? bundle.bundle_items
                              .map(
                                (item) =>
                                  `${item.quantity} × ${item.product_name}`
                              )
                              .join(" • ")
                          : ""}
                      </p>

                      <span
                        className={`${styles.statusBadge} ${
                          bundle.is_active &&
                          Number(bundle.stock || 0) > 0
                            ? styles.available
                            : styles.soldOut
                        }`}
                      >
                        {bundle.is_active
                          ? Number(bundle.stock || 0) > 0
                            ? "Active"
                            : "Sold Out"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        onClick={() => startEditBundle(bundle)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBundleToggle(bundle)}
                      >
                        {bundle.is_active
                          ? "Disable"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() =>
                          handleBundleDelete(bundle.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === "orders" && (
        <section className={styles.section}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              marginBottom: "22px",
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 5px" }}>Orders</h2>
              <p style={{ margin: 0, color: "#845f69" }}>
                Manage orders and export customer and product data.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <button
                type="button"
                className={styles.primaryButton}
                onClick={exportOrdersToExcel}
                disabled={loadingOrders || orders.length === 0}
                style={{
                  background: "#217346",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="m8 13 4 5m0-5-4 5" />
                </svg>
                Download Excel
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={openOrdersInGoogleSheets}
                disabled={loadingOrders || orders.length === 0}
                style={{
                  background: "#0f9d58",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M8 8h8M8 12h8M8 16h8M12 8v8" />
                </svg>
                Google Sheets
              </button>
            </div>
          </div>

          {editingOrderId && (
            <form className={styles.productForm} onSubmit={handleOrderUpdate}>
              <h2>Edit Order #{editingOrderId}</h2>

              <div className={styles.formGrid}>
                <input
                  name="customer_name"
                  value={orderForm.customer_name}
                  onChange={handleOrderFormChange}
                  placeholder="Customer name"
                />

                <input
                  name="phone"
                  value={orderForm.phone}
                  onChange={handleOrderFormChange}
                  placeholder="Phone"
                />

                <input
                  name="email"
                  value={orderForm.email}
                  onChange={handleOrderFormChange}
                  placeholder="Email"
                />

                <input
                  name="governorate"
                  value={orderForm.governorate}
                  onChange={handleOrderFormChange}
                  placeholder="Governorate"
                />

                <select
                  name="status"
                  value={orderForm.status}
                  onChange={handleOrderFormChange}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  name="payment_method"
                  value={orderForm.payment_method}
                  onChange={handleOrderFormChange}
                >
                  <option value="">Payment Method</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="InstaPay">InstaPay</option>
                  <option value="Vodafone Cash">Vodafone Cash</option>
                  <option value="Not selected yet">Not selected yet</option>
                </select>
              </div>

              <textarea
                name="address"
                value={orderForm.address}
                onChange={handleOrderFormChange}
                placeholder="Address"
              />

              <textarea
                name="note"
                value={orderForm.note}
                onChange={handleOrderFormChange}
                placeholder="Customer note"
              />

              <textarea
                name="payment_status"
                value={orderForm.payment_status}
                onChange={handleOrderFormChange}
                placeholder="Payment status"
              />

              <textarea
                name="payment_details"
                value={orderForm.payment_details}
                onChange={handleOrderFormChange}
                placeholder="Payment details"
              />

              <div className={styles.orderEditor}>
                <div className={styles.orderEditorHeader}>
                  <div>
                    <h3>Order Products</h3>
                    <p>
                      Change quantities, remove products, or add a new product.
                    </p>
                  </div>

                  {orderForm.coupon_code && (
                    <span className={styles.couponBadge}>
                      Coupon: {orderForm.coupon_code}
                    </span>
                  )}
                </div>

                {orderForm.items.length === 0 ? (
                  <p className={styles.emptyText}>
                    Add at least one product before saving.
                  </p>
                ) : (
                  <div className={styles.editOrderItems}>
                    {orderForm.items.map((item, index) => {
                      const product = getProductById(item.product_id);
                      const image =
                        item.product_image ||
                        product?.image_url ||
                        product?.image ||
                        "";

                      return (
                        <div
                          className={styles.editOrderItem}
                          key={`${item.product_id}-${index}`}
                        >
                          {image && (
                            <img
                              src={image}
                              alt={item.product_name || product?.name}
                            />
                          )}

                          <div className={styles.editOrderItemInfo}>
                            <strong>
                              {item.product_name ||
                                product?.name ||
                                `Product #${item.product_id}`}
                            </strong>

                            <span>
                              Unit price:{" "}
                              {Number(
                                item.unit_price || product?.price || 0
                              )}{" "}
                              EGP
                            </span>

                            <span>
                              Current store stock:{" "}
                              {Number(product?.stock || 0)}
                            </span>
                          </div>

                          <div className={styles.quantityEditor}>
                            <button
                              type="button"
                              onClick={() =>
                                changeOrderItemQuantity(
                                  index,
                                  Number(item.quantity) - 1
                                )
                              }
                            >
                              −
                            </button>

                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity}
                              onChange={(event) =>
                                changeOrderItemQuantity(
                                  index,
                                  event.target.value
                                )
                              }
                            />

                            <button
                              type="button"
                              onClick={() =>
                                changeOrderItemQuantity(
                                  index,
                                  Number(item.quantity) + 1
                                )
                              }
                            >
                              +
                            </button>
                          </div>

                          <strong>
                            {Number(
                              (
                                Number(
                                  item.unit_price || product?.price || 0
                                ) * Number(item.quantity || 0)
                              ).toFixed(2)
                            )}{" "}
                            EGP
                          </strong>

                          <button
                            type="button"
                            className={styles.removeItemButton}
                            onClick={() => removeOrderItem(index)}
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className={styles.addOrderProduct}>
                  <select
                    value={newOrderProductId}
                    onChange={(event) =>
                      setNewOrderProductId(event.target.value)
                    }
                  >
                    <option value="">Select product to add</option>

                    {products.map((product) => {
                      const unavailable =
                        Number(product.stock || 0) <= 0 ||
                        product.is_active === false;

                      return (
                        <option
                          key={product.id}
                          value={product.id}
                          disabled={unavailable}
                        >
                          {product.name} — {product.price} EGP — Stock:{" "}
                          {product.stock}
                        </option>
                      );
                    })}
                  </select>

                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={addProductToOrder}
                  >
                    Add Product
                  </button>
                </div>

                <div className={styles.orderPreview}>
                  <span>
                    Subtotal: <strong>{orderPreview.subtotal} EGP</strong>
                  </span>

                  <span>
                    Discount: <strong>{orderPreview.discount} EGP</strong>
                  </span>

                  <span>
                    New total: <strong>{orderPreview.total} EGP</strong>
                  </span>
                </div>
              </div>

              <div className={styles.formActions}>
                <button className={styles.primaryButton} type="submit">
                  Save Order Changes
                </button>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={cancelEditOrder}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className={styles.emptyText}>No orders yet.</p>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => {
                const orderItems = getOrderItems(order);
                const orderImage = getOrderImage(order);

                return (
                  <article className={styles.orderCard} key={order.id}>
                    <div className={styles.orderTop}>
                      <div>
                        <h3>Order #{order.id}</h3>
                        <p>{getOrderProductTitle(order)}</p>
                      </div>

                      <span className={styles.orderStatus}>
                        {order.status || "pending"}
                      </span>
                    </div>

                    <div className={styles.orderMain}>
                      {orderImage && (
                        <img
                          src={orderImage}
                          alt={getOrderProductTitle(order)}
                        />
                      )}

                      <div className={styles.orderDetailsGrid}>
                        <div>
                          <h4>Customer Data</h4>
                          <p><strong>Name:</strong> {getCustomerName(order)}</p>
                          <p>
                            <strong>Phone:</strong>{" "}

                            {order.phone ? (
                              <a
                                href={getOrderWhatsAppUrl(order)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open customer WhatsApp"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "5px 9px",
                                  border: "1px solid rgba(37, 211, 102, 0.35)",
                                  borderRadius: "999px",
                                  background: "rgba(37, 211, 102, 0.1)",
                                  color: "#128c4a",
                                  fontWeight: 900,
                                  textDecoration: "none",
                                }}
                              >
                                <span>{order.phone}</span>

                                <svg
                                  viewBox="0 0 24 24"
                                  width="17"
                                  height="17"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.44L3 20l1.06-5.4A8.5 8.5 0 1 1 21 11.5Z" />
                                  <path d="M8.5 8.5c.5 3 2 4.5 5 5" />
                                  <path d="m8.5 8.5 1.2-.5 1 2-1 .8" />
                                  <path d="m13.5 13.5.8-1 2 1-0.5 1.2" />
                                </svg>

                                <small style={{ fontWeight: 900 }}>
                                  WhatsApp
                                </small>
                              </a>
                            ) : (
                              "-"
                            )}
                          </p>
                          <p><strong>Email:</strong> {order.email || "-"}</p>
                          <p>
                            <strong>Governorate:</strong>{" "}
                            {order.governorate || "-"}
                          </p>
                          <p><strong>Address:</strong> {order.address || "-"}</p>
                          <p><strong>Note:</strong> {order.note || "-"}</p>
                        </div>

                        <div>
                          <h4>Payment Data</h4>
                          <p>
                            <strong>Method:</strong>{" "}
                            {order.payment_method || "Not selected"}
                          </p>
                          <p>
                            <strong>Status:</strong>{" "}
                            {order.payment_status || "-"}
                          </p>
                          <p>
                            <strong>Details:</strong>{" "}
                            {order.payment_details || "-"}
                          </p>
                        </div>

                        <div>
                          <h4>Price Data</h4>
                          <p>
                            <strong>Subtotal:</strong>{" "}
                            {Number(order.subtotal_price || 0)} EGP
                          </p>
                          <p>
                            <strong>Coupon:</strong>{" "}
                            {order.coupon_code || "-"}
                          </p>
                          <p>
                            <strong>Discount:</strong>{" "}
                            {Number(order.discount_amount || 0)} EGP
                          </p>
                          <p>
                            <strong>Total:</strong>{" "}
                            {getOrderTotal(order)} EGP
                          </p>
                          <p>
                            <strong>Date:</strong>{" "}
                            {formatDate(order.created_at || order.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orderItemsBox}>
                      <h4>Products</h4>

                      {orderItems.length === 0 ? (
                        <p>No products found in this order.</p>
                      ) : (
                        orderItems.map((item) => (
                          <div className={styles.orderItemRow} key={item.id}>
                            <span>
                              {item.product_name ||
                                item.product?.name ||
                                item.name ||
                                `Product #${item.product_id}`}
                            </span>
                            <span>Qty: {item.quantity}</span>
                            <span>
                              Unit: {Number(item.unit_price || 0)} EGP
                            </span>
                            <strong>
                              Total: {Number(item.total_price || 0)} EGP
                            </strong>
                          </div>
                        ))
                      )}
                    </div>

                    <div className={styles.orderActions}>
                      <select
                        value={order.status || "pending"}
                        onChange={(event) =>
                          handleOrderStatusChange(order.id, event.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => startEditOrder(order)}
                      >
                        Edit Order & Products
                      </button>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleOrderDelete(order.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === "coupons" && (
        <section className={styles.section}>
          <form className={styles.productForm} onSubmit={handleCouponSubmit}>
            <h2>
              {editingCouponId ? "Edit Coupon" : "Create New Coupon"}
            </h2>

            <div className={styles.formGrid}>
              <input
                name="code"
                value={couponForm.code}
                onChange={handleCouponChange}
                placeholder="Coupon code, e.g. SAVE20"
              />

              <select
                name="discount_type"
                value={couponForm.discount_type}
                onChange={handleCouponChange}
              >
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>

              <input
                name="discount_value"
                type="number"
                min="0.01"
                max={
                  couponForm.discount_type === "percent"
                    ? "100"
                    : undefined
                }
                step="0.01"
                value={couponForm.discount_value}
                onChange={handleCouponChange}
                placeholder={
                  couponForm.discount_type === "percent"
                    ? "Discount percentage"
                    : "Discount amount"
                }
              />

              <input
                name="min_order_amount"
                type="number"
                min="0"
                step="0.01"
                value={couponForm.min_order_amount}
                onChange={handleCouponChange}
                placeholder="Minimum order amount"
              />

              <input
                name="usage_limit"
                type="number"
                min="1"
                step="1"
                value={couponForm.usage_limit}
                onChange={handleCouponChange}
                placeholder="Usage limit (optional)"
              />

              <input
                name="expires_at"
                type="datetime-local"
                value={couponForm.expires_at}
                onChange={handleCouponChange}
              />

              <label className={styles.checkboxField}>
                <input
                  name="is_active"
                  type="checkbox"
                  checked={couponForm.is_active}
                  onChange={handleCouponChange}
                />
                Active
              </label>
            </div>

            <div className={styles.formActions}>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={savingCoupon}
              >
                {savingCoupon
                  ? "Saving..."
                  : editingCouponId
                    ? "Update Coupon"
                    : "Create Coupon"}
              </button>

              {editingCouponId && (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={cancelEditCoupon}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {loadingCoupons ? (
            <p>Loading coupons...</p>
          ) : coupons.length === 0 ? (
            <p className={styles.emptyText}>No coupons created yet.</p>
          ) : (
            <div className={styles.couponsList}>
              {coupons.map((coupon) => {
                const expired =
                  coupon.expires_at &&
                  new Date(coupon.expires_at).getTime() < Date.now();

                return (
                  <article className={styles.couponCard} key={coupon.id}>
                    <div className={styles.couponTop}>
                      <div>
                        <h3>{coupon.code}</h3>
                        <p>
                          {coupon.discount_type === "percent"
                            ? `${coupon.discount_value}% discount`
                            : `${coupon.discount_value} EGP discount`}
                        </p>
                      </div>

                      <span
                        className={`${styles.statusBadge} ${
                          coupon.is_active && !expired
                            ? styles.available
                            : styles.soldOut
                        }`}
                      >
                        {expired
                          ? "Expired"
                          : coupon.is_active
                            ? "Active"
                            : "Inactive"}
                      </span>
                    </div>

                    <div className={styles.couponDetails}>
                      <span>
                        Minimum order:{" "}
                        <strong>{coupon.min_order_amount || 0} EGP</strong>
                      </span>

                      <span>
                        Used:{" "}
                        <strong>
                          {coupon.used_count || 0}
                          {coupon.usage_limit
                            ? ` / ${coupon.usage_limit}`
                            : ""}
                        </strong>
                      </span>

                      <span>
                        Expires:{" "}
                        <strong>
                          {coupon.expires_at
                            ? formatDate(coupon.expires_at)
                            : "No expiry"}
                        </strong>
                      </span>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        onClick={() => startEditCoupon(coupon)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCouponToggle(coupon)}
                      >
                        {coupon.is_active ? "Disable" : "Activate"}
                      </button>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleCouponDelete(coupon.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === "announcements" && (
        <section className={styles.section}>
          <form
            className={styles.productForm}
            onSubmit={handleAnnouncementSubmit}
          >
            <h2>
              {editingAnnouncementId
                ? "Edit Announcement"
                : "Add New Announcement"}
            </h2>

            <textarea
              name="content"
              value={announcementForm.content}
              onChange={handleAnnouncementChange}
              placeholder="Example: Get 10% off orders over 1000 EGP"
              maxLength={300}
              rows={4}
            />

            <p>
              {announcementForm.content.length} / 300 characters
            </p>

            <label className={styles.checkboxField}>
              <input
                name="is_active"
                type="checkbox"
                checked={announcementForm.is_active}
                onChange={handleAnnouncementChange}
              />
              Show this announcement on the website
            </label>

            <div className={styles.formActions}>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={savingAnnouncement}
              >
                {savingAnnouncement
                  ? "Saving..."
                  : editingAnnouncementId
                    ? "Update Announcement"
                    : "Add Announcement"}
              </button>

              {editingAnnouncementId && (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={cancelEditAnnouncement}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {loadingAnnouncements ? (
            <p>Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p className={styles.emptyText}>
              No announcements created yet.
            </p>
          ) : (
            <div className={styles.couponsList}>
              {announcements.map((announcement) => (
                <article
                  className={styles.couponCard}
                  key={announcement.id}
                >
                  <div className={styles.couponTop}>
                    <div>
                      <h3>Announcement #{announcement.id}</h3>
                      <p>{announcement.content}</p>
                    </div>

                    <span
                      className={`${styles.statusBadge} ${
                        announcement.is_active
                          ? styles.available
                          : styles.soldOut
                      }`}
                    >
                      {announcement.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className={styles.couponDetails}>
                    <span>
                      Created:{" "}
                      <strong>
                        {formatDate(announcement.created_at)}
                      </strong>
                    </span>

                    <span>
                      Updated:{" "}
                      <strong>
                        {formatDate(announcement.updated_at)}
                      </strong>
                    </span>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      onClick={() =>
                        startEditAnnouncement(announcement)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAnnouncementToggle(announcement)
                      }
                    >
                      {announcement.is_active
                        ? "Disable"
                        : "Activate"}
                    </button>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() =>
                        handleAnnouncementDelete(announcement.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "reviews" && (
        <section className={styles.section}>
          <ReviewsPage />
        </section>
      )}
    </main>
  );
}