import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const placeOrder = mutation({
  args: {
    memberId: v.id("members"),
    items: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Verify member exists and is active
    const member = await ctx.db.get(args.memberId);
    if (!member || !member.isActive) {
      throw new Error("Invalid or inactive member");
    }

    // Get member's balance
    const balance = await ctx.db
      .query("balances")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .unique();
    
    if (!balance) {
      throw new Error("Member balance not found");
    }

    // Calculate total amount and prepare order items
    let totalAmount = 0;
    const orderItems = [];
    const productIds = [];

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product || !product.isAvailable) {
        throw new Error(`Product ${item.productId} is not available`);
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        productId: item.productId,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
      });

      // Add product ID for each quantity
      for (let i = 0; i < item.quantity; i++) {
        productIds.push(item.productId);
      }
    }

    // Check if member has sufficient balance
    if (balance.amount < totalAmount) {
      throw new Error("Insufficient balance");
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create order
    const orderId = await ctx.db.insert("orders", {
      memberId: args.memberId,
      productIds,
      totalAmount,
      status: "pending",
      orderNumber,
      items: orderItems,
    });

    // Update member balance
    await ctx.db.patch(balance._id, {
      amount: balance.amount - totalAmount,
      lastUpdated: Date.now(),
    });

    return {
      orderId,
      orderNumber,
      totalAmount,
      items: orderItems,
    };
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      ...args,
      isAvailable: true,
    });
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { productId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(productId, cleanUpdates);
    return await ctx.db.get(productId);
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.productId);
    return { success: true };
  },
});

export const createMember = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    cardNumber: v.string(),
    initialBalance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if card number already exists
    const existingMember = await ctx.db
      .query("members")
      .withIndex("by_card_number", (q) => q.eq("cardNumber", args.cardNumber))
      .unique();

    if (existingMember) {
      throw new Error("Card number already exists");
    }

    const memberId = await ctx.db.insert("members", {
      name: args.name,
      email: args.email,
      cardNumber: args.cardNumber,
      isActive: true,
    });

    // Create initial balance
    await ctx.db.insert("balances", {
      memberId,
      amount: args.initialBalance || 0,
      lastUpdated: Date.now(),
    });

    return memberId;
  },
});

export const addBalance = mutation({
  args: {
    memberId: v.id("members"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const balance = await ctx.db
      .query("balances")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .unique();

    if (!balance) {
      throw new Error("Member balance not found");
    }

    await ctx.db.patch(balance._id, {
      amount: balance.amount + args.amount,
      lastUpdated: Date.now(),
    });

    return await ctx.db.get(balance._id);
  },
});

export const completeOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: "completed",
    });
    return await ctx.db.get(args.orderId);
  },
});

export const cancelOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Refund the amount to member's balance
    const balance = await ctx.db
      .query("balances")
      .withIndex("by_member", (q) => q.eq("memberId", order.memberId))
      .unique();

    if (balance) {
      await ctx.db.patch(balance._id, {
        amount: balance.amount + order.totalAmount,
        lastUpdated: Date.now(),
      });
    }

    await ctx.db.patch(args.orderId, {
      status: "cancelled",
    });

    return await ctx.db.get(args.orderId);
  },
});

export const getMemberByCardNumber = mutation({
  args: { cardNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
      .withIndex("by_card_number", (q) => q.eq("cardNumber", args.cardNumber))
      .unique();
  },
});
