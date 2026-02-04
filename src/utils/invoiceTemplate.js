// utils/invoiceTemplate.js
module.exports = ({ orderId, paymentId, amount, address }) => `
  <h2>Payment Successful 🎉</h2>
  <p><b>Order ID:</b> ${orderId}</p>
  <p><b>Payment ID:</b> ${paymentId}</p>
  <p><b>Amount Paid:</b> ₹${amount / 100}</p>
  <p><b>Delivery Address:</b> ${address}</p>
  <br/>
  <p>Thank you for shopping with us.</p>
`;
