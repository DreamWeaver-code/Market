const express = require('express');
const orderQueries = require('../db/queries/orders');
const productQueries = require('../db/queries/products');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

// 🔒 POST /orders - Create a new order by the logged in user
router.post('/', async (req, res) => {
  try {
    const { date } = req.body;

    // Send 400 if request body does not include a date
    if (!date) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'Date is required'
      });
    }

    // Create order with date
    const order = await orderQueries.createOrderWithDate(req.user.id, date);

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create order'
    });
  }
});

// 🔒 GET /orders - Get all orders made by the logged in user
router.get('/', async (req, res) => {
  try {
    const orders = await orderQueries.getOrdersByUserId(req.user.id);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve orders'
    });
  }
});

// 🔒 GET /orders/:id - Get specific order
router.get('/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a number'
      });
    }

    // Send 404 if the order does not exist
    const order = await orderQueries.getOrderById(orderId, req.user.id);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order exists with that ID'
      });
    }

    // Send 403 if the logged-in user is not the user who made the order
    if (order.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this order'
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve order'
    });
  }
});

// 🔒 POST /orders/:id/products - Add the specified quantity of the product to the order
router.post('/:id/products', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { productId, quantity } = req.body;
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a number'
      });
    }

    // Send 400 if the request body does not include a productId and a quantity
    if (!productId || !quantity) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'ProductId and quantity are required'
      });
    }

    // Send 404 if the order does not exist
    const order = await orderQueries.getOrderById(orderId, req.user.id);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order exists with that ID'
      });
    }

    // Send 403 if the logged-in user is not the user who made the order
    if (order.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this order'
      });
    }

    // Send 400 if the productId references a product that does not exist
    const product = await productQueries.getProductById(productId);
    if (!product) {
      return res.status(400).json({
        error: 'Product not found',
        message: 'No product exists with that ID'
      });
    }

    // Add product to order
    const orderProduct = await orderQueries.addProductToOrder(
      orderId,
      productId,
      quantity,
      product.price,
      req.user.id
    );

    // Update order total
    await orderQueries.updateOrderTotal(orderId);

    res.status(201).json(orderProduct);
  } catch (error) {
    console.error('Add product to order error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add product to order'
    });
  }
});

// 🔒 GET /orders/:id/products - Get array of products in the order
router.get('/:id/products', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a number'
      });
    }

    // Send 404 if the order does not exist
    const order = await orderQueries.getOrderById(orderId, req.user.id);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order exists with that ID'
      });
    }

    // Send 403 if the logged-in user is not the user who made the order
    if (order.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this order'
      });
    }

    const products = await orderQueries.getOrderProducts(orderId, req.user.id);
    res.status(200).json(products);
  } catch (error) {
    console.error('Get order products error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve order products'
    });
  }
});

module.exports = router;
