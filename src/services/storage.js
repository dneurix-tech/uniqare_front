const API_URL = "https://uniqare-production.up.railway.app";

/* =========================
   Helpers
========================= */

function normalizeProduct(product) {
  return {
    ...product,

    image: product.image_url,
    image_url: product.image_url,

    short_description:
      product.short_description || product.description || "",

    long_description:
      product.long_description ||
      product.short_description ||
      product.description ||
      "",

    // Compatibility عشان أي كود قديم لسه بيستخدم description/details
    description:
      product.short_description || product.description || "",

    details:
      product.long_description ||
      product.short_description ||
      product.description ||
      "",

    stock: Number(product.stock || 0),
    is_active: product.is_active,
  };
}

function normalizeOrder(order, product = null) {
  return {
    ...order,
    customerName: order.customer_name,
    createdAt: order.created_at,
    finalPrice: order.total_price,
    productName: product?.name || `Product #${order.product_id}`,
    productImage: product?.image_url || product?.image || "",
    shipped: order.status === "shipped",
  };
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
  return Array.isArray(products) ? products.map(normalizeProduct) : [];
}

export async function getAdminProducts() {
  const response = await fetch(`${API_URL}/products/admin/all`);

  if (!response.ok) {
    throw new Error("Failed to fetch admin products");
  }

  const products = await response.json();
  return Array.isArray(products) ? products.map(normalizeProduct) : [];
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
  formData.append("is_active", true);

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
    formData.append("is_active", product.is_active);
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
    throw new Error("Failed to delete product");
  }

  return await response.json();
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

  const normalizedOrders = await Promise.all(
    orders.map(async (order) => {
      try {
        const product = await getProductById(order.product_id);
        return normalizeOrder(order, product);
      } catch {
        return normalizeOrder(order, null);
      }
    })
  );

  return normalizedOrders;
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
  return normalizeOrder(newOrder);
}

/* =========================
   Coupons
========================= */

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

  return await response.json();
}
/* =========================
   Old compatibility - no localStorage now
========================= */

export function saveProducts() {
  return null;
}

export function saveOrders() {
  return null;
}
export async function updateOrderPayment(orderId, paymentData) {
  const response = await fetch(`${API_URL}/orders/${orderId}/payment`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment_method: paymentData.paymentMethod,
      payment_status: paymentData.paymentStatus,
      payment_details: paymentData.paymentDetails || "",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update payment details");
  }

  return await response.json();
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

  return await response.json();
}