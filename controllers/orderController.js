import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { sendGmailOrderEmail } from "../utils/gmailEmailService.js";
import { sendOrderEmail } from "../utils/resendEmailService.js";
import { orderTemplate } from "../utils/resendOrderTemplate.js";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
//Gateway initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//placing order using cod
const placeOrder = async (req, res) => {
  try {
    let { userId, items, amount, address } = req.body;
    const { token } = req.headers;
    // const user = await userModel.findById(userId);

    if (!userId && token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Token invalid or expired, continue as guest
        userId = null;
      }
    }

    if (userId) {
      const user = await userModel.findById(userId);
      if (!user) {
        return res.json({ success: false, message: "User not found!" });
      }
    }

    const orderData = {
      userId: userId || null,
      items,
      amount,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    
    const newOrder = new orderModel(orderData);
    await newOrder.save();
    //Only clear cart if user exists
    if (userId) {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    }
    
    const html = orderTemplate(orderData);
    sendGmailOrderEmail(
      address.email,
      "Your ShopSage Order Confirmation",
      html
    );
    res.json({ success: true, message: "Order Placed and Email sent" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//placing order using stripe(for now)
const placeOrderStripe = async (req, res) => {};

//placing order using stripe(for now)
const placeOrderRazorpay = async (req, res) => {};
//All orders data for admin
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//user order data for frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//update order Status from admin
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
};
