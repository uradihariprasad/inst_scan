import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  accessToken: text("access_token").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
