import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  profileId: text("profile_id").notNull().unique(),
  name: text("name").notNull(),
  searchId: text("search_id"),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  documents: jsonb("documents").default([]),
});

// Define the document type
export const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  url: z.string(),
  dateAdded: z.string(),
});

export type Document = z.infer<typeof documentSchema>;

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
});

export const profileSearchSchema = z.object({
  query: z.string().optional(),
});

// User preferences schema for app settings
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.enum(['en', 'es', 'fr', 'de', 'ja']).default('en'),
  cardsPerPage: z.number().min(3).max(12).default(6),
  notificationsEnabled: z.boolean().default(true),
  compactView: z.boolean().default(false),
  accentColor: z.string().default('#0284c7')
});

// Define users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("viewer"),
  createdAt: timestamp("created_at").defaultNow()
});

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

export const authResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    username: z.string(),
    role: z.string()
  }),
  token: z.string().optional()
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Login = z.infer<typeof loginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type ProfileSearch = z.infer<typeof profileSearchSchema>;
