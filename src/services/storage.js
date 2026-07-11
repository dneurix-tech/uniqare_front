const API_URL = "http://127.0.0.1:8000";
/* =========================
   Helpers
========================= */

function normalizeProduct(product) {
  if (!product) return null;

  return {
    ...product,

    image: product.image_url || product.image || "",
    image_url: product.image_url || product.image || "",

    short_description:
      product.short_description || product.description || "",

    long_description:
      product.long_description ||
      product.short_description ||
      product.description ||
      product.details ||
      "",

    description:
      product.short_description ||
      product.description ||
      "",

    details:
      product.long_description ||
      product.details ||
      product.short_description ||
      product.description ||
      "",

    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    is_active: product.is_active,
  };
}

function normalizeOrder(order, product = null) {
  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];
  const firstItem = items[0] || null;

  return {
    ...order,

    items,

    customerName: order.customer_name || order.customerName || "",
    createdAt: order.created_at || order.createdAt || "",
    finalPrice: Number(order.total_price || order.finalPrice || 0),

    productName:
      firstItem?.product_name ||
      firstItem?.name ||
      firstItem?.product?.name ||
      product?.name ||
      order.productName ||
      `Order #${order.id}`,

    productImage:
      firstItem?.product_image ||
      firstItem?.image ||
      firstItem?.product?.image_url ||
      firstItem?.product?.image ||
      product?.image_url ||
      product?.image ||
      order.productImage ||
      "",

    shipped: order.status === "shipped",
  };
}

function createReviewFormData(reviewData) {
  const formData = new FormData();

  if (reviewData.customer_name !== undefined) {
    formData.append("customer_name", reviewData.customer_name || "");
  }

  if (reviewData.description !== undefined) {
    formData.append("description", reviewData.description || "");
  }

  if (reviewData.rating !== undefined) {
    formData.append("rating", reviewData.rating || 5);
  }

  if (reviewData.is_active !== undefined) {
    formData.append("is_active", reviewData.is_active ? "true" : "false");
  }

  if (reviewData.image) {
    formData.append("image", reviewData.image);
  }

  return formData;
}

/* =========================
   Products
========================= */

export async function getProducts() {
  const response = await fetch(`${API_URL}/products/`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const products = await response.json();

  return Array.isArray(products)
    ? products.map(normalizeProduct).filter(Boolean)
    : [];
}

export async function getAdminProducts() {
  const response = await fetch(`${API_URL}/products/admin/all`);

  if (!response.ok) {
    throw new Error("Failed to fetch admin products");
  }

  const products = await response.json();

  return Array.isArray(products)
    ? products.map(normalizeProduct).filter(Boolean)
    : [];
}

export async function getProductById(id) {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const product = await response.json();

  return normalizeProduct(product);
}

export async function addProduct(product) {
  const formData = new FormData();

  formData.append("name", product.name);

  formData.append(
    "short_description",
    product.short_description || product.description || ""
  );

  formData.append(
    "long_description",
    product.long_description || product.details || ""
  );

  formData.append("price", product.price);
  formData.append("category", product.category || "");
  formData.append("stock", product.stock);
  formData.append("is_active", "true");

  if (product.image) {
    formData.append("image", product.image);
  }

  const response = await fetch(`${API_URL}/products/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Add product API error:", errorText);
    throw new Error("Failed to add product");
  }

  const newProduct = await response.json();

  return normalizeProduct(newProduct);
}

export async function updateProduct(id, product) {
  const formData = new FormData();

  if (product.name !== undefined) {
    formData.append("name", product.name);
  }

  if (
    product.short_description !== undefined ||
    product.description !== undefined
  ) {
    formData.append(
      "short_description",
      product.short_description || product.description || ""
    );
  }

  if (
    product.long_description !== undefined ||
    product.details !== undefined
  ) {
    formData.append(
      "long_description",
      product.long_description || product.details || ""
    );
  }

  if (product.price !== undefined) {
    formData.append("price", product.price);
  }

  if (product.category !== undefined) {
    formData.append("category", product.category || "");
  }

  if (product.stock !== undefined) {
    formData.append("stock", product.stock);
  }

  if (product.is_active !== undefined) {
    formData.append("is_active", product.is_active ? "true" : "false");
  }

  if (product.image) {
    formData.append("image", product.image);
  }

  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "PATCH",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Update product API error:", errorText);
    throw new Error("Failed to update product");
  }

  const updatedProduct = await response.json();

  return normalizeProduct(updatedProduct);
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Delete product API error:", errorText);
    throw new Error("Failed to delete product");
  }

  return response.json();
}

/* =========================
   Orders
========================= */

export async function getOrders() {
  const response = await fetch(`${API_URL}/orders/`);

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  const orders = await response.json();

  if (!Array.isArray(orders)) {
    return [];
  }

  return orders.map((order) => normalizeOrder(order, null)).filter(Boolean);
}

export async function addOrder(order) {
  const items =
    Array.isArray(order.items) && order.items.length > 0
      ? order.items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
        }))
      : [
          {
            product_id: Number(order.product_id),
            quantity: Number(order.quantity),
          },
        ];

  const payload = {
    customer_name: order.customer_name,
    phone: order.phone,
    email: order.email,
    governorate: order.governorate,
    address: order.address,
    items,
  };

  if (order.note && order.note.trim()) {
    payload.note = order.note.trim();
  }

  if (order.coupon_code && order.coupon_code.trim()) {
    payload.coupon_code = order.coupon_code.trim();
  }

  const response = await fetch(`${API_URL}/orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();

    let errorMessage = "Failed to add order";

    try {
      const parsedError = JSON.parse(errorText);
      errorMessage = parsedError.detail || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    console.error("Add order API error:", errorText);
    console.error("Sent order payload:", payload);

    throw new Error(errorMessage);
  }

  const newOrder = await response.json();

  return normalizeOrder(newOrder, null);
}

export async function updateOrderDetails(orderId, orderData) {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to update order");
  }

  const updatedOrder = await response.json();

  return normalizeOrder(updatedOrder, null);
}

export async function deleteOrder(orderId) {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to delete order");
  }

  return response.json();
}

export async function updateOrderPayment(orderId, paymentData) {
  const response = await fetch(`${API_URL}/orders/${orderId}/payment`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment_method:
        paymentData.paymentMethod || paymentData.payment_method || "",
      payment_status:
        paymentData.paymentStatus || paymentData.payment_status || "",
      payment_details:
        paymentData.paymentDetails || paymentData.payment_details || "",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Update payment API error:", errorText);
    throw new Error("Failed to update payment details");
  }

  const updatedOrder = await response.json();

  return normalizeOrder(updatedOrder, null);
}

export async function updateOrderShippingStatus(orderId, shipped) {
  const status = shipped ? "shipped" : "pending";

  const response = await fetch(
    `${API_URL}/orders/${orderId}/status?status=${status}`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Update order shipping API error:", errorText);
    throw new Error("Failed to update order status");
  }

  const updatedOrder = await response.json();

  return normalizeOrder(updatedOrder, null);
}

/* =========================
   Coupons
========================= */


export async function getAdminCoupons() {
  const response = await fetch(`${API_URL}/coupons/admin/all`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to load coupons");
  }

  const coupons = await response.json();

  return Array.isArray(coupons) ? coupons : [];
}

export async function addCoupon(couponData) {
  const response = await fetch(`${API_URL}/coupons/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(couponData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to add coupon");
  }

  return response.json();
}

export async function updateCoupon(couponId, couponData) {
  const response = await fetch(`${API_URL}/coupons/${couponId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(couponData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to update coupon");
  }

  return response.json();
}

export async function deleteCoupon(couponId) {
  const response = await fetch(`${API_URL}/coupons/${couponId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to delete coupon");
  }

  return response.json();
}

export async function checkCoupon({ product_id, quantity, coupon_code, items }) {
  const payload = {
    coupon_code,
  };

  if (Array.isArray(items) && items.length > 0) {
    payload.items = items.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
    }));
  } else {
    payload.items = [
      {
        product_id: Number(product_id),
        quantity: Number(quantity),
      },
    ];
  }

  const response = await fetch(`${API_URL}/orders/check-coupon`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Check coupon API error:", errorText);
    throw new Error("Invalid coupon");
  }

  return response.json();
}

/* =========================
   Reviews
========================= */
export async function getPublicReviews() {
  const response = await fetch(`${API_URL}/reviews/`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Get public reviews API error:", errorText);

    throw new Error(
      `Failed to load reviews. Status: ${response.status}`
    );
  }

  const reviews = await response.json();

  return Array.isArray(reviews) ? reviews : [];
}

export async function getAdminReviews() {
  const response = await fetch(`${API_URL}/reviews/admin/all`);

  if (!response.ok) {
    throw new Error("Failed to load admin reviews");
  }

  const reviews = await response.json();

  return Array.isArray(reviews) ? reviews : [];
}

export async function addReview(reviewData) {
  const formData = createReviewFormData(reviewData);

  const response = await fetch(`${API_URL}/reviews/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to add review");
  }

  return response.json();
}

export async function updateReview(reviewId, reviewData) {
  const formData = createReviewFormData(reviewData);

  const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: "PATCH",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to update review");
  }

  return response.json();
}

export async function deleteReview(reviewId) {
  const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to delete review");
  }

  return response.json();
}

/* =========================
   Old compatibility
========================= */

export function saveProducts() {
  return null;
}

export function saveOrders() {
  return null;
}