import { mutation } from "./_generated/server";

export const seedSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingProducts = await ctx.db.query("products").take(1);
    if (existingProducts.length > 0) {
      return { message: "Sample data already exists" };
    }

    // Create sample products
    const products = [
      { name: "Coffee", description: "Fresh brewed coffee", price: 2.50, category: "Beverages" },
      { name: "Espresso", description: "Strong espresso shot", price: 3.00, category: "Beverages" },
      { name: "Latte", description: "Coffee with steamed milk", price: 4.50, category: "Beverages" },
      { name: "Croissant", description: "Buttery pastry", price: 3.25, category: "Pastries" },
      { name: "Muffin", description: "Blueberry muffin", price: 2.75, category: "Pastries" },
      { name: "Sandwich", description: "Ham and cheese sandwich", price: 6.50, category: "Food" },
      { name: "Salad", description: "Fresh garden salad", price: 5.75, category: "Food" },
    ];

    for (const product of products) {
      await ctx.db.insert("products", {
        ...product,
        isAvailable: true,
      });
    }

    // Create sample members
    const members = [
      { name: "John Doe", email: "john@example.com", cardNumber: "1001", initialBalance: 50.00 },
      { name: "Jane Smith", email: "jane@example.com", cardNumber: "1002", initialBalance: 75.00 },
      { name: "Bob Johnson", email: "bob@example.com", cardNumber: "1003", initialBalance: 25.00 },
    ];

    for (const memberData of members) {
      const memberId = await ctx.db.insert("members", {
        name: memberData.name,
        email: memberData.email,
        cardNumber: memberData.cardNumber,
        isActive: true,
      });

      await ctx.db.insert("balances", {
        memberId,
        amount: memberData.initialBalance,
        lastUpdated: Date.now(),
      });
    }

    return { message: "Sample data created successfully" };
  },
});
