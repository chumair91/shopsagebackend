export const orderTemplate = (order) => {
  return `
    <h2>Thank you for your order, ${order.address.firstName}!</h2>
    <p>Your order has been placed successfully.</p>

    <h3>Order Details</h3>
    <p><strong>Amount:</strong> PKR ${order.amount}</p>
    <p><strong>Product:</strong> ${order.items[0].name}</p>
    <p><strong>Size:</strong> ${order.items[0].size}</p>
    <p><strong>Quantity:</strong> ${order.items[0].quantity}</p>

    <h3>Delivery address:</h3>
    <p>${order.address.street}, ${order.address.city}</p>

    <p>We will contact you soon for delivery confirmation.</p>
    <br/>
    <strong>ShopSage</strong>
  `;
};
