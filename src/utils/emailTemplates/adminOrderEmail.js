module.exports = function adminOrderEmail({
  type, // "PLACED" | "CANCELLED"
  orderId,
  customerName,
  amount,
  paymentMethod,
}) {
  const title =
    type === "PLACED" ? "New Order Placed" : "Order Cancelled";

  const color =
    type === "PLACED" ? "#2f855a" : "#e53e3e";

  return `
    <div style="font-family:Arial,sans-serif;background:#f6f8fa;padding:20px">
      <div style="max-width:600px;margin:auto;background:#fff;padding:24px;border-radius:8px">
        <h2 style="color:${color};margin:0">Phoolpatta Admin</h2>
        <p style="font-size:13px;color:#777">${title}</p>

        <table width="100%" style="font-size:14px;margin-top:16px">
          <tr>
            <td><strong>Order ID</strong></td>
            <td align="right">${orderId}</td>
          </tr>
          <tr>
            <td><strong>Customer</strong></td>
            <td align="right">${customerName}</td>
          </tr>
          <tr>
            <td><strong>Payment</strong></td>
            <td align="right">${paymentMethod}</td>
          </tr>
          ${
            amount
              ? `
          <tr>
            <td><strong>Amount</strong></td>
            <td align="right">₹${amount}</td>
          </tr>`
              : ""
          }
        </table>

        <hr style="margin:20px 0;border:none;border-top:1px solid #eee"/>

        <p style="font-size:12px;color:#999">
          This is an automated notification from phoolpatta.com
        </p>
      </div>
    </div>
  `;
};
