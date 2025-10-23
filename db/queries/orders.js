const { query } = require('../client');

// Order database queries
const orderQueries = {
  // Get all orders for a user
  getOrdersByUserId: async (userId) => {
    const result = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  // Get order by ID
  getOrderById: async (orderId, userId) => {
    const result = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );
    return result.rows[0];
  },

  // Create a new order
  createOrder: async (userId, shippingAddress) => {
    const result = await query(
      'INSERT INTO orders (user_id, shipping_address) VALUES ($1, $2) RETURNING *',
      [userId, shippingAddress]
    );
    return result.rows[0];
  },

  // Create a new order with date
  createOrderWithDate: async (userId, date) => {
    const result = await query(
      'INSERT INTO orders (user_id, created_at) VALUES ($1, $2) RETURNING *',
      [userId, date]
    );
    return result.rows[0];
  },

  // Get products in an order
  getOrderProducts: async (orderId, userId) => {
    const result = await query(`
      SELECT op.*, p.name, p.description, p.image_url
      FROM order_products op
      JOIN products p ON op.product_id = p.id
      JOIN orders o ON op.order_id = o.id
      WHERE op.order_id = $1 AND o.user_id = $2
      ORDER BY op.created_at
    `, [orderId, userId]);
    return result.rows;
  },

  // Add product to order
  addProductToOrder: async (orderId, productId, quantity, unitPrice, userId) => {
    // First verify the order belongs to the user
    const orderCheck = await query(
      'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );
    
    if (orderCheck.rows.length === 0) {
      throw new Error('Order not found or access denied');
    }

    // Check if product already exists in order
    const existingProduct = await query(
      'SELECT id, quantity FROM order_products WHERE order_id = $1 AND product_id = $2',
      [orderId, productId]
    );

    if (existingProduct.rows.length > 0) {
      // Update existing product quantity
      const newQuantity = existingProduct.rows[0].quantity + quantity;
      const result = await query(
        'UPDATE order_products SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2 AND product_id = $3 RETURNING *',
        [newQuantity, orderId, productId]
      );
      return result.rows[0];
    } else {
      // Add new product to order
      const result = await query(
        'INSERT INTO order_products (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4) RETURNING *',
        [orderId, productId, quantity, unitPrice]
      );
      return result.rows[0];
    }
  },

  // Update order total amount
  updateOrderTotal: async (orderId) => {
    const result = await query(`
      UPDATE orders 
      SET total_amount = (
        SELECT COALESCE(SUM(quantity * unit_price), 0)
        FROM order_products 
        WHERE order_id = $1
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [orderId]);
    return result.rows[0];
  },

  // Get order with products and total
  getOrderWithProducts: async (orderId, userId) => {
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );
    
    if (orderResult.rows.length === 0) {
      return null;
    }

    const productsResult = await query(`
      SELECT op.*, p.name, p.description, p.image_url
      FROM order_products op
      JOIN products p ON op.product_id = p.id
      WHERE op.order_id = $1
      ORDER BY op.created_at
    `, [orderId]);

    return {
      ...orderResult.rows[0],
      products: productsResult.rows
    };
  }
};

module.exports = orderQueries;
