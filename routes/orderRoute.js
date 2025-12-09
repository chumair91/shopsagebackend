import express from 'express';
const orderRoute=express.Router()
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import {placeOrder,placeOrderStripe,placeOrderRazorpay,allOrders,userOrders,updateStatus} from '../controllers/orderController.js'

orderRoute.post('/list',adminAuth,allOrders)
orderRoute.post('/status',adminAuth,updateStatus)
//payment through cod
orderRoute.post('/place',placeOrder);
orderRoute.post('/stripe',authUser,placeOrderStripe)
orderRoute.post('/razorpay',authUser,placeOrderRazorpay)
//user feature
orderRoute.post('/userorders',authUser,userOrders);

export default orderRoute;


