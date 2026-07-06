import { seedProducts } from "../data/seedProducts";

const PRODUCTS_KEY = "uniqare_products";
const ORDERS_KEY = "uniqare_orders";

export function getProducts() {
  const savedProducts = localStorage.getItem(PRODUCTS_KEY);

  if (!savedProducts) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seedProducts));
    return seedProducts;
  }

  return JSON.parse(savedProducts);
}

export function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getProductById(id) {
  return getProducts().find((product) => product.id === id);
}

export function addProduct(product) {
  const products = getProducts();

  const newProduct = {
    ...product,
    id: Date.now().toString(),
    price: Number(product.price),
    stock: Number(product.stock),
  };

  const updatedProducts = [newProduct, ...products];
  saveProducts(updatedProducts);

  return newProduct;
}

export function updateProduct(id, updatedProduct) {
  const products = getProducts();

  const updatedProducts = products.map((product) =>
    product.id === id
      ? {
          ...product,
          ...updatedProduct,
          price: Number(updatedProduct.price),
          stock: Number(updatedProduct.stock),
        }
      : product
  );

  saveProducts(updatedProducts);
}

export function deleteProduct(id) {
  const products = getProducts();
  const updatedProducts = products.filter((product) => product.id !== id);
  saveProducts(updatedProducts);
}

export function getOrders() {
  const savedOrders = localStorage.getItem(ORDERS_KEY);
  return savedOrders ? JSON.parse(savedOrders) : [];
}

export function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function addOrder(order) {
  const orders = getOrders();

  const newOrder = {
    ...order,
    id: Date.now().toString(),
    createdAt: new Date().toLocaleString(),
    shipped: false,
  };

  const updatedOrders = [newOrder, ...orders];
  saveOrders(updatedOrders);

  return newOrder;
}

export function updateOrderShippingStatus(orderId, shipped) {
  const orders = getOrders();

  const updatedOrders = orders.map((order) =>
    order.id === orderId ? { ...order, shipped } : order
  );

  saveOrders(updatedOrders);
}