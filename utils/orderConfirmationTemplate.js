export const orderConfirmationTemplate = (order) => {
  const { address, items, amount } = order;

  return `
    <div style="font-family: Arial; color:#222;">
      <h2>Thank you, ${address.firstName}!</h2>
      <p>Your order has been placed successfully.</p>

      <h3>Order Summary</h3>
      <p><strong>Total Amount:</strong> PKR ${amount}</p>

      <h3>Items:</h3>
      <ul>
        ${items
          .map(
            (i) => `
          <li>
            <strong>${i.name}</strong> (${i.size}) — Qty: ${i.quantity} — PKR ${i.price}
          </li>`
          )
          .join("")}
      </ul>

      <h3>Shipping Address</h3>
      <p>
        ${address.firstName} ${address.lastName}<br/>
        ${address.street}<br/>
        ${address.city}, ${address.state}, ${address.zipcode}<br/>
        ${address.country}<br/>
        Phone: ${address.phone}
      </p>

      <p>Regards,<br/>ShopSage</p>
    </div>
  `;
};
