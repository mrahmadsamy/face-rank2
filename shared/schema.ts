import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // أستاذ، طالب، موظف، مشهور
  imageUrl: text("image_url").notNull(),
  averageRating: real("average_rating").default(0),
  totalRatings: integer("total_ratings").default(0),
  totalComments: integer("total_comments").default(0),
  totalViews: integer("total_views").default(0),
  faceMashWins: integer("facemash_wins").default(0),
  faceMashLosses: integer("facemash_losses").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  personId: integer("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(), // للمجهولية
  rating: integer("rating").notNull(), // 1-5
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  personId: integer("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(),
  text: text("text").notNull(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  score: integer("score").default(0), // upvotes - downvotes
  isBuried: boolean("is_buried").default(false), // للتعليقات المدفونة
  createdAt: timestamp("created_at").defaultNow(),
});

export const commentVotes = pgTable("comment_votes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(),
  voteType: text("vote_type").notNull(), // 'up' or 'down'
  createdAt: timestamp("created_at").defaultNow(),
});

export const faceMashComparisons = pgTable("facemash_comparisons", {
  id: serial("id").primaryKey(),
  winnerId: integer("winner_id").notNull().references(() => people.id),
  loserId: integer("loser_id").notNull().references(() => people.id),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertPersonSchema = createInsertSchema(people).omit({
  id: true,
  averageRating: true,
  totalRatings: true,
  totalComments: true,
  totalViews: true,
  faceMashWins: true,
  faceMashLosses: true,
  createdAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  upvotes: true,
  downvotes: true,
  score: true,
  isBuried: true,
  createdAt: true,
});

export const insertCommentVoteSchema = createInsertSchema(commentVotes).omit({
  id: true,
  createdAt: true,
});

export const insertFaceMashComparisonSchema = createInsertSchema(faceMashComparisons).omit({
  id: true,
  createdAt: true,
});

// Types
export type Person = typeof people.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type CommentVote = typeof commentVotes.$inferSelect;
export type FaceMashComparison = typeof faceMashComparisons.$inferSelect;

export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertCommentVote = z.infer<typeof insertCommentVoteSchema>;
export type InsertFaceMashComparison = z.infer<typeof insertFaceMashComparisonSchema>;
