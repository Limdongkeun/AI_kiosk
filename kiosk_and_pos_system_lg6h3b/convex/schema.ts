import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  members: defineTable({
    name: v.string(),
    email: v.string(),
    cardNumber: v.string(),
    isActive: v.boolean(),
  })
    .index("by_card_number", ["cardNumber"])
    .index("by_email", ["email"]),

  balances: defineTable({
    memberId: v.id("members"),
    amount: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_member", ["memberId"]),

  products: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.string(),
    isAvailable: v.boolean(),
    imageUrl: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_availability", ["isAvailable"]),

  orders: defineTable({
    memberId: v.id("members"),
    productIds: v.array(v.id("products")),
    totalAmount: v.number(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
    orderNumber: v.string(),
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      price: v.number(),
      quantity: v.number(),
    })),
  })
    .index("by_member", ["memberId"])
    .index("by_status", ["status"])
    .index("by_order_number", ["orderNumber"]),

  receipts: defineTable({
    orderId: v.id("orders"),
    receiptNumber: v.string(),
    content: v.string(),
    printedAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_receipt_number", ["receiptNumber"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
