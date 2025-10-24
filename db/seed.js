const { query } = require("./client");
const bcrypt = require("bcryptjs");

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // Clear existing data
    await query("DELETE FROM order_products");
    await query("DELETE FROM orders");
    await query("DELETE FROM products");
    await query("DELETE FROM users");

    // Create users
    const hashedPassword = await bcrypt.hash("password123", 12);
    const userResult = await query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      ["testuser", "test@example.com", hashedPassword]
    );
    const user = userResult.rows[0];
    console.log("✅ Created user:", user.username);

    // Create products (at least 10 different products)
    const products = [
      {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 199.99,
        stock: 50,
        category: "Electronics",
      },
      {
        name: "Smartphone",
        description: "Latest model smartphone with advanced features",
        price: 899.99,
        stock: 25,
        category: "Electronics",
      },
      {
        name: "Laptop",
        description: "High-performance laptop for work and gaming",
        price: 1299.99,
        stock: 15,
        category: "Electronics",
      },
      {
        name: "Coffee Maker",
        description: "Automatic coffee maker with programmable features",
        price: 149.99,
        stock: 30,
        category: "Appliances",
      },
      {
        name: "Running Shoes",
        description: "Comfortable running shoes for all terrains",
        price: 129.99,
        stock: 40,
        category: "Sports",
      },
      {
        name: "Yoga Mat",
        description: "Premium yoga mat with excellent grip",
        price: 49.99,
        stock: 60,
        category: "Sports",
      },
      {
        name: "Backpack",
        description: "Durable backpack for travel and daily use",
        price: 79.99,
        stock: 35,
        category: "Accessories",
      },
      {
        name: "Water Bottle",
        description: "Insulated water bottle to keep drinks cold",
        price: 24.99,
        stock: 80,
        category: "Accessories",
      },
      {
        name: "Book: Programming Guide",
        description: "Comprehensive guide to modern programming",
        price: 39.99,
        stock: 20,
        category: "Books",
      },
      {
        name: "Desk Lamp",
        description: "LED desk lamp with adjustable brightness",
        price: 59.99,
        stock: 45,
        category: "Furniture",
      },
      {
        name: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker with great sound",
        price: 89.99,
        stock: 25,
        category: "Electronics",
      },
      {
        name: "Gaming Mouse",
        description: "Precision gaming mouse with RGB lighting",
        price: 69.99,
        stock: 30,
        category: "Electronics",
      },
    ];

    const createdProducts = [];
    for (const product of products) {
      const result = await query(
        "INSERT INTO products (name, description, price, stock_quantity, category) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          product.name,
          product.description,
          product.price,
          product.stock,
          product.category,
        ]
      );
      createdProducts.push(result.rows[0]);
    }
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create an order for the user
    const orderResult = await query(
      "INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING *",
      [user.id, 0, "pending"]
    );
    const order = orderResult.rows[0];
    console.log("✅ Created order:", order.id);

    // Add at least 5 distinct products to the order
    const productsToAdd = createdProducts.slice(0, 5); // Take first 5 products
    let orderTotal = 0;

    for (const product of productsToAdd) {
      const quantity = Math.floor(Math.random() * 3) + 1; // Random quantity 1-3
      const unitPrice = product.price;
      const subtotal = quantity * unitPrice;
      orderTotal += subtotal;

      await query(
        "INSERT INTO order_products (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
        [order.id, product.id, quantity, unitPrice]
      );
      console.log(`✅ Added ${quantity}x ${product.name} to order`);
    }

    // Update order total
    await query("UPDATE orders SET total_amount = $1 WHERE id = $2", [
      orderTotal,
      order.id,
    ]);

    console.log(`✅ Order total: $${orderTotal.toFixed(2)}`);
    console.log("🌱 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log("✅ Seed completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}

module.exports = seed;
