const { query } = require('../client');

// Product database queries
const productQueries = {
  // Get all products
  getAllProducts: async () => {
    const result = await query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    return result.rows;
  },

  // Get product by ID
  getProductById: async (id) => {
    const result = await query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Get orders that include a specific product
  getOrdersByProductId: async (productId, userId) => {
    const result = await query(`
      SELECT DISTINCT o.*, u.username
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_products op ON o.id = op.order_id
      WHERE op.product_id = $1 AND o.user_id = $2
      ORDER BY o.created_at DESC
    `, [productId, userId]);
    return result.rows;
  },

  // Create a new product
  createProduct: async (name, description, price, stockQuantity, category, imageUrl) => {
    const result = await query(
      'INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, stockQuantity, category, imageUrl]
    );
    return result.rows[0];
  },

  // Update product stock
  updateProductStock: async (productId, quantity) => {
    const result = await query(
      'UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [quantity, productId]
    );
    return result.rows[0];
  },

  // Check if product has enough stock
  checkProductStock: async (productId, requestedQuantity) => {
    const result = await query(
      'SELECT stock_quantity FROM products WHERE id = $1',
      [productId]
    );
    if (result.rows.length === 0) return false;
    return result.rows[0].stock_quantity >= requestedQuantity;
  }
};

module.exports = productQueries;
