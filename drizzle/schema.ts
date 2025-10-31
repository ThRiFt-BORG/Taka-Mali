import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with collector role for M&E system.
 * Supports both local authentication (email/password) and OAuth.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /** User identifier - can be OAuth openId or local ID */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  /** Hashed password for local authentication (null for OAuth users) */
  password: text("password"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  /** Role: admin (owner), user (public), collector (data submitter) */
  role: mysqlEnum("role", ["user", "admin", "collector"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Collections table for waste data submissions.
 * Stores individual waste collection records with geospatial data.
 */
export const collections = mysqlTable("collections", {
  id: int("id").autoincrement().primaryKey(),
  collectorId: int("collectorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  siteName: varchar("siteName", { length: 255 }).notNull(),
  wasteType: mysqlEnum("wasteType", ["Organic", "Inorganic", "Mixed"]).notNull(),
  collectionDate: date("collectionDate").notNull(),
  totalVolume: decimal("totalVolume", { precision: 10, scale: 2 }).notNull(),
  wasteSeparated: boolean("wasteSeparated").default(false).notNull(),
  organicVolume: decimal("organicVolume", { precision: 10, scale: 2 }),
  inorganicVolume: decimal("inorganicVolume", { precision: 10, scale: 2 }),
  collectionCount: int("collectionCount").default(1).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  comments: text("comments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

/**
 * Relations for type safety
 */
export const collectionsRelations = relations(collections, ({ one }) => ({
  collector: one(users, {
    fields: [collections.collectorId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  collections: many(collections),
}));

