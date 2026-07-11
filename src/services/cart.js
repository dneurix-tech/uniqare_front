const CART_KEY = "uniqare_cart";
export const CART_UPDATED_EVENT = "uniqare_cart_updated";

function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

function normalizeCartItem(product, quantity) {
  return {
    id: product.id,
    product_id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price || 0),
    image: product.image || product.image_url,
    stock: Number(product.stock || 0),
    is_active: product.is_active,
    quantity: Number(quantity || 1),
  };
}

export function getCartItems() {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  notifyCartUpdated();
}

export function addToCart(product, quantity = 1) {
  const stock = Number(product.stock || 0);
  const selectedQuantity = Number(quantity || 1);

  if (stock <= 0 || product.is_active === false) {
    return {
      success: false,
      message: "This product is sold out",
    };
  }

  if (!Number.isInteger(selectedQuantity) || selectedQuantity < 1) {
    return {
      success: false,
      message: "Quantity must be at least 1",
    };
  }

  const cart = getCartItems();
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    const newQuantity = Number(existingItem.quantity || 0) + selectedQuantity;

    if (newQuantity > stock) {
      return {
        success: false,
        message: `Only ${stock} pieces available`,
      };
    }

    const updatedCart = cart.map((item) =>
      item.id === product.id
        ? {
            ...item,
            quantity: newQuantity,
            stock,
            price: Number(product.price || item.price || 0),
            image: product.image || product.image_url || item.image,
            is_active: product.is_active,
          }
        : item
    );

    saveCartItems(updatedCart);

    return {
      success: true,
      message: "Product added to cart successfully",
      cart: updatedCart,
    };
  }

  if (selectedQuantity > stock) {
    return {
      success: false,
      message: `Only ${stock} pieces available`,
    };
  }

  const updatedCart = [...cart, normalizeCartItem(product, selectedQuantity)];

  saveCartItems(updatedCart);

  return {
    success: true,
    message: "Product added to cart successfully",
    cart: updatedCart,
  };
}

export function updateCartItemQuantity(productId, quantity) {
  const selectedQuantity = Number(quantity);
  const cart = getCartItems();

  const updatedCart = cart
    .map((item) => {
      if (item.id !== productId) return item;

      const stock = Number(item.stock || 0);

      if (selectedQuantity > stock) {
        return {
          ...item,
          quantity: stock,
        };
      }

      return {
        ...item,
        quantity: selectedQuantity,
      };
    })
    .filter((item) => Number(item.quantity) > 0);

  saveCartItems(updatedCart);

  return updatedCart;
}

export function removeFromCart(productId) {
  const updatedCart = getCartItems().filter((item) => item.id !== productId);
  saveCartItems(updatedCart);
  return updatedCart;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  notifyCartUpdated();
}