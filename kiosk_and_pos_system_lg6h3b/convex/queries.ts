import { query } from "./_generated/server";
import { v } from "convex/values";

export const getRecentOrdersForPOS = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(50);

    return orders.map(order => ({
      orderId: order._id,
      orderNumber: order.orderNumber,
      time: new Date(order._creationTime).toISOString(),
      items: order.items.map(item => `${item.quantity}x ${item.productName} - $${item.price.toFixed(2)}`),
      totalAmount: order.totalAmount,
      memberId: order.memberId,
    }));
  },
});

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_availability", (q) => q.eq("isAvailable", true))
      .collect();
  },
});

export const listAllProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const getProductsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .collect();
  },
});

export const getMemberByCardNumber = query({
  args: { cardNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
      .withIndex("by_card_number", (q) => q.eq("cardNumber", args.cardNumber))
      .unique();
  },
});

export const getMemberBalance = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("balances")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .unique();
  },
});

export const getOrderHistory = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .order("desc")
      .take(20);
  },
});

export const getOrderByNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber))
      .unique();
  },
});

export const listOrders = query({
  args: {
    filter: v.optional(v.object({
      status: v.optional(v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")))
    }))
  },
  handler: async (ctx, args) => {
    let orders;
    
    if (args.filter?.status) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.filter!.status!))
        .order("desc")
        .collect();
    } else {
      orders = await ctx.db.query("orders").order("desc").collect();
    }
    
    // Get member details for each order
    const ordersWithMembers = await Promise.all(
      orders.map(async (order) => {
        const member = await ctx.db.get(order.memberId);
        return {
          ...order,
          memberName: member?.name || "Unknown",
          memberEmail: member?.email || "",
        };
      })
    );
    
    return ordersWithMembers;
  },
});

export const getOrderDetail = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const member = await ctx.db.get(order.memberId);
    
    return {
      orderTime: new Date(order._creationTime).toISOString(),
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      memberName: member?.name || "Unknown",
      memberEmail: member?.email || "",
      items: order.items.map(item => ({
        productId: item.productId,
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      totalPrice: order.totalAmount,
      paymentAmount: order.totalAmount, // In this system, payment amount equals total price
    };
  },
});

export const reprintReceipt = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const member = await ctx.db.get(order.memberId);
    
    const receiptContent = `
================================
RECEIPT (REPRINT)
================================
Order #: ${order.orderNumber}
Date: ${new Date(order._creationTime).toLocaleString()}
Customer: ${member?.name || "Unknown"}

Items:
${order.items.map(item => 
  `  ${item.quantity}x ${item.productName} @ $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`
).join('\n')}

--------------------------------
Total: $${order.totalAmount.toFixed(2)}
Status: ${order.status.toUpperCase()}
================================
Thank you for your business!
================================
    `.trim();

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      receiptNumber: `RPT-${order.orderNumber}-${Date.now()}`,
      content: receiptContent,
      printedAt: Date.now(),
    };
  },
});
