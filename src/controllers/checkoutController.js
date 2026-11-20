const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
require('dotenv').config();

// DEMO checkout: no payment gateway. The total is calculated from database
// prices, the order is saved as Paid, and a confirmation email is attempted.
const createDemoOrder = async (req, res) => {
  try {
    const { items, email } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart items are required' });
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product with id ${item.productId} not found` });
      }
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      total += product.price * quantity;
      orderItems.push({ productId: product._id, quantity });
    }

    const recipientEmail = email || (req.user ? req.user.email : null);

    const order = await Order.create({
      userId: req.user ? req.user._id : null,
      email: recipientEmail,
      items: orderItems,
      totalAmount: total,
      status: 'Paid',
      paymentMethod: 'demo',
    });

    // Confirmation email (never blocks or fails the order).
    if (recipientEmail) {
      try {
        await sendOrderConfirmationEmail({ email: recipientEmail }, order);
      } catch (emailError) {
        console.error('Order email failed:', emailError.message);
      }
    }

    res.status(200).json({ success: true, orderId: order._id });
  } catch (error) {
    console.error('Error creating demo order:', error);
    res.status(500).json({ error: 'Internal server error placing order.' });
  }
};

module.exports = {
  createDemoOrder,
};
