const CART_KEY = "uniqare_cart";

export function getCartItems() {
  const savedCart = localStorage.getItem(CART_KEY);
  return savedCart ? JSON.parse(savedCart) : [];
}

export function saveCartItems(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product, quantity = 1) {
  const cart = getCartItems();

  const stock = Number(product.stock || 0);
  const requestedQuantity = Number(quantity);
  const productId = product.id;

  if (stock <= 0 || product.is_active === false) {
    return {
      success: false,
      message: "This product is Sold Out",
    };
  }

  if (requestedQuantity < 1) {
    return {
      success: false,
      message: "Quantity must be at least 1",
    };
  }

  if (requestedQuantity > stock) {
    return {
      success: false,
      message: `Only ${stock} pieces available`,
    };
  }

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    const nextQuantity = Number(existingItem.quantity) + requestedQuantity;

    if (nextQuantity > stock) {
      return {
        success: false,
        message: `Only ${stock} pieces available`,
      };
    }

    const updatedCart = cart.map((item) =>
      item.id === productId
        ? {
            ...item,
            quantity: nextQuantity,
          }
        : item
    );

    saveCartItems(updatedCart);

    return {
      success: true,
      message: "Product quantity updated in cart",
    };
  }

  const newItem = {
    id: product.id,
    product_id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    image: product.image_url || product.image,
    stock,
    is_active: product.is_active,
    quantity: requestedQuantity,
  };

  saveCartItems([...cart, newItem]);

  return {
    success: true,
    message: "Product added to cart",
  };
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}