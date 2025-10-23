const express = require('express');
const productQueries = require('../db/queries/products');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /products - Get all products
router.get('/', async (req, res) => {
  try {
    const products = await productQueries.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve products'
    });
  }
});

// GET /products/:id - Get specific product
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }

    const product = await productQueries.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product exists with that ID'
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve product'
    });
  }
});

// 🔒 GET /products/:id/orders - Get all orders made by the user that include the product (protected route)
router.get('/:id/orders', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }

    // Send 404 if the product with that id does not exist (even if the user is logged in!)
    const product = await productQueries.getProductById(productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product exists with that ID'
      });
    }

    // Get orders that include this product for the current user
    const orders = await productQueries.getOrdersByProductId(productId, req.user.id);
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get product orders error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve product orders'
    });
  }
});

module.exports = router;
