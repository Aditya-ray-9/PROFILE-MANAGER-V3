import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  profileId: text("profile_id").notNull().unique(),
  name: text("name").notNull(),
  searchId: text("search_id"),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
});

export const profileSearchSchema = z.object({
  query: z.string().optional(),
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type ProfileSearch = z.infer<typeof profileSearchSchema>;
