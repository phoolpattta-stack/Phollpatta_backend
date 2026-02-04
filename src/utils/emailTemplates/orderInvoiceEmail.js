// utils/emailTemplates/orderInvoiceEmail.js
module.exports = function orderInvoiceEmail({
  customerName,
  orderId,
  amount,
  paymentMethod,
  address,
  date = new Date().toLocaleDateString(),
}) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f6f8fa;padding:20px">
    <div style="max-width:600px;margin:auto;background:#fff;padding:24px;border-radius:8px">

      <h2 style="color:#2f855a;text-align:center;margin:0">Phoolpatta</h2>
      <p style="text-align:center;color:#777;font-size:13px">
        Order Confirmation / Invoice
      </p>

      <p>Hi <strong>${customerName}</strong>,</p>
      <p>Your order has been placed successfully.</p>

      <table width="100%" style="border-collapse:collapse;font-size:14px">
        <tr>
          <td><strong>Order ID</strong></td>
          <td align="right">${orderId}</td>
        </tr>
        <tr>
          <td><strong>Order Date</strong></td>
          <td align="right">${date}</td>
        </tr>
        <tr>
          <td><strong>Payment Method</strong></td>
          <td align="right">${paymentMethod}</td>
        </tr>
      </table>

      <div style="margin:20px 0;padding:16px;background:#f0fff4;border-radius:6px">
        <strong>Total Paid:</strong>
        <span style="float:right;font-size:18px;color:#2f855a">
          ₹${amount}
        </span>
      </div>

      <p><strong>Delivery Address</strong></p>
      <p style="color:#555;font-size:13px">${address}</p>

      <hr style="margin:20px 0;border:none;border-top:1px solid #eee"/>

      <p style="font-size:12px;color:#777">
        Need help? <a href="mailto:phoolpattta@gmail.com">phoolpattta@gmail.com</a>
      </p>

      <p style="font-size:12px;color:#999">
        © ${new Date().getFullYear()} Phoolpatta · phoolpatta.com
      </p>

    </div>
  </div>
  `;
};
