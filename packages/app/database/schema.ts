import { sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
} from 'drizzle-orm/pg-core';

export const guestBook = pgTable('guestBook', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`NULL`),
  deletedAt: timestamp('deleted_at', { withTimezone: true }).default(sql`NULL`),
});

// Tenants
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  ownerId: uuid('owner_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`NULL`),
  deletedAt: timestamp('deleted_at', { withTimezone: true }).default(sql`NULL`),
});

// Products
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  isAddOn: boolean('is_add_on').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`NULL`),
  deletedAt: timestamp('deleted_at', { withTimezone: true }).default(sql`NULL`),
});

// Plans
export const plans = pgTable('plans', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  prevPlanId: uuid('prev_plan_id'),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  planType: varchar('plan_type', {
    enum: ['TierBased', 'OneTime', 'Volume', 'Usage'],
  }).notNull(),
  currency: varchar('currency', { length: 3 }).default('usd').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`NULL`),
  deletedAt: timestamp('deleted_at', { withTimezone: true }).default(sql`NULL`),
  isRecurring: boolean('is_recurring').default(false).notNull(),
  billingCycle: varchar('billing_cycle', {
    enum: ['monthly', 'annual'],
  }).default('monthly'),
  credits: integer('credits'),
  metadata: jsonb('metadata'),
});

// Coupons
export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  redemptions: integer('redemptions').default(0).notNull(),
  discountType: varchar('discount_type', {
    enum: ['percentage', 'value'],
  }).notNull(),
  discountValue: numeric('discount_value', {
    precision: 12,
    scale: 2,
  }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`NULL`),
  deletedAt: timestamp('deleted_at', { withTimezone: true }).default(sql`NULL`),
});

// Add-ons
export const addOns = pgTable('add_ons', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`NULL`),
  deletedAt: timestamp('deleted_at', { withTimezone: true }).default(sql`NULL`),
});

// Orders
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  planId: uuid('plan_id')
    .notNull()
    .references(() => plans.id),
  couponId: uuid('coupon_id').references(() => coupons.id),
  customer: varchar('customer', { length: 255 }).notNull(),
  tax: numeric('tax', { precision: 12, scale: 2 }).default('0').notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 })
    .default('0')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`NULL`),
  deletedAt: timestamp('deleted_at', { withTimezone: true }).default(sql`NULL`),
});

// Order add-ons
export const orderAddOns = pgTable('order_add_ons', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  addOnId: uuid('add_on_id')
    .notNull()
    .references(() => addOns.id),
  quantity: integer('quantity').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`NULL`),
  deletedAt: timestamp('deleted_at', { withTimezone: true }).default(sql`NULL`),
});

// Purchase
export const purchases = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  planId: uuid('plan_id')
    .notNull()
    .references(() => plans.id),
  status: varchar('status', { length: 50 }).notNull(),
  totalAmountPaid: numeric('total_amount_paid', { precision: 12, scale: 2 })
    .default('0')
    .notNull(),
  taxPaid: numeric('tax_paid', { precision: 12, scale: 2 })
    .default('0')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`NULL`),
  deletedAt: timestamp('deleted_at', { withTimezone: true }).default(sql`NULL`),
});

// Purchase plan history
export const purchasePlanHistory = pgTable('purchase_plan_history', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  purchaseId: uuid('purchase_id')
    .notNull()
    .references(() => purchases.id),
  planId: uuid('plan_id')
    .notNull()
    .references(() => plans.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`NULL`),
  deletedAt: timestamp('deleted_at', { withTimezone: true }).default(sql`NULL`),
  purchasedAt: timestamp('purchased_at', { withTimezone: true }).notNull(),
});
