const { query } = require('../client');

// User database queries
const userQueries = {
  // Create a new user
  createUser: async (username, email, passwordHash) => {
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );
    return result.rows[0];
  },

  // Get user by username
  getUserByUsername: async (username) => {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  },

  // Get user by email
  getUserByEmail: async (email) => {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  // Get user by ID
  getUserById: async (id) => {
    const result = await query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Check if username exists
  usernameExists: async (username) => {
    const result = await query(
      'SELECT COUNT(*) FROM users WHERE username = $1',
      [username]
    );
    return parseInt(result.rows[0].count) > 0;
  },

  // Check if email exists
  emailExists: async (email) => {
    const result = await query(
      'SELECT COUNT(*) FROM users WHERE email = $1',
      [email]
    );
    return parseInt(result.rows[0].count) > 0;
  },

  // Update user password
  updateUserPassword: async (userId, passwordHash) => {
    const result = await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [passwordHash, userId]
    );
    return result.rows[0];
  }
};

module.exports = userQueries;
