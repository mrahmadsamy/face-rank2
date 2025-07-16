import { 
  people, ratings, comments, commentVotes, faceMashComparisons,
  type Person, type Rating, type Comment, type CommentVote, type FaceMashComparison,
  type InsertPerson, type InsertRating, type InsertComment, 
  type InsertCommentVote, type InsertFaceMashComparison 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // People
  createPerson(person: InsertPerson): Promise<Person>;
  getPerson(id: number): Promise<Person | undefined>;
  getAllPeople(category?: string, sortBy?: string): Promise<Person[]>;
  updatePersonStats(id: number, stats: Partial<Person>): Promise<Person | undefined>;
  incrementPersonViews(id: number): Promise<void>;

  // Ratings
  createRating(rating: InsertRating): Promise<Rating>;
  getRatingsByPersonId(personId: number): Promise<Rating[]>;
  hasUserRated(personId: number, sessionId: string): Promise<boolean>;

  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPersonId(personId: number, sortBy?: string): Promise<Comment[]>;
  updateComment(id: number, updates: Partial<Comment>): Promise<Comment | undefined>;

  // Comment Votes
  createCommentVote(vote: InsertCommentVote): Promise<CommentVote>;
  hasUserVotedOnComment(commentId: number, sessionId: string): Promise<boolean>;
  getCommentVote(commentId: number, sessionId: string): Promise<CommentVote | undefined>;

  // FaceMash
  createFaceMashComparison(comparison: InsertFaceMashComparison): Promise<FaceMashComparison>;
  getRandomPeopleForComparison(): Promise<[Person, Person] | null>;
  getTopRankedPeople(limit?: number): Promise<Person[]>;
  getWorstRankedPeople(limit?: number): Promise<Person[]>;

  // Stats
  getTotalStats(): Promise<{
    totalPeople: number;
    totalRatings: number;
    totalComments: number;
    onlineUsers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  
  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const [person] = await db
      .insert(people)
      .values(insertPerson)
      .returning();
    return person;
  }

  async getPerson(id: number): Promise<Person | undefined> {
    const [person] = await db.select().from(people).where(eq(people.id, id));
    return person || undefined;
  }

  async getAllPeople(category?: string, sortBy = 'averageRating'): Promise<Person[]> {
    let baseQuery = db.select().from(people);
    
    if (category) {
      baseQuery = baseQuery.where(eq(people.category, category));
    }

    switch (sortBy) {
      case 'averageRating':
        return await baseQuery.orderBy(desc(people.averageRating));
      case 'newest':
        return await baseQuery.orderBy(desc(people.createdAt));
      case 'mostComments':
        return await baseQuery.orderBy(desc(people.totalComments));
      case 'faceMash':
        return await baseQuery.orderBy(desc(people.faceMashWins));
      default:
        return await baseQuery.orderBy(desc(people.averageRating));
    }
  }

  async updatePersonStats(id: number, stats: Partial<Person>): Promise<Person | undefined> {
    const [updated] = await db
      .update(people)
      .set(stats)
      .where(eq(people.id, id))
      .returning();
    return updated || undefined;
  }

  async incrementPersonViews(id: number): Promise<void> {
    await db
      .update(people)
      .set({ 
        totalViews: sql`${people.totalViews} + 1`
      })
      .where(eq(people.id, id));
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const [rating] = await db
      .insert(ratings)
      .values(insertRating)
      .returning();

    // Update person's average rating
    await this.updatePersonRatingStats(rating.personId);
    
    return rating;
  }

  async getRatingsByPersonId(personId: number): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.personId, personId));
  }

  async hasUserRated(personId: number, sessionId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(ratings)
      .where(
        sql`${ratings.personId} = ${personId} AND ${ratings.sessionId} = ${sessionId}`
      )
      .limit(1);
    return result.length > 0;
  }

  private async updatePersonRatingStats(personId: number): Promise<void> {
    const personRatings = await this.getRatingsByPersonId(personId);
    const totalRatings = personRatings.length;
    const averageRating = totalRatings > 0 
      ? personRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;

    await this.updatePersonStats(personId, { averageRating, totalRatings });
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();

    // Update person's comment count
    await db
      .update(people)
      .set({ 
        totalComments: sql`${people.totalComments} + 1`
      })
      .where(eq(people.id, comment.personId));

    return comment;
  }

  async getCommentsByPersonId(personId: number, sortBy = 'score'): Promise<Comment[]> {
    const baseQuery = db.select().from(comments).where(eq(comments.personId, personId));

    switch (sortBy) {
      case 'score':
        return await baseQuery.orderBy(desc(comments.score));
      case 'newest':
        return await baseQuery.orderBy(desc(comments.createdAt));
      default:
        return await baseQuery.orderBy(desc(comments.score));
    }
  }

  async updateComment(id: number, updates: Partial<Comment>): Promise<Comment | undefined> {
    // Check if comment should be buried (score < -5)
    if (updates.score !== undefined && updates.score !== null && updates.score < -5) {
      updates.isBuried = true;
    }

    const [updated] = await db
      .update(comments)
      .set(updates)
      .where(eq(comments.id, id))
      .returning();
    return updated || undefined;
  }

  async createCommentVote(insertVote: InsertCommentVote): Promise<CommentVote> {
    const [vote] = await db
      .insert(commentVotes)
      .values(insertVote)
      .returning();

    // Update comment vote counts
    await this.updateCommentVoteStats(vote.commentId);

    return vote;
  }

  async hasUserVotedOnComment(commentId: number, sessionId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(commentVotes)
      .where(
        sql`${commentVotes.commentId} = ${commentId} AND ${commentVotes.sessionId} = ${sessionId}`
      )
      .limit(1);
    return result.length > 0;
  }

  async getCommentVote(commentId: number, sessionId: string): Promise<CommentVote | undefined> {
    const [vote] = await db
      .select()
      .from(commentVotes)
      .where(
        sql`${commentVotes.commentId} = ${commentId} AND ${commentVotes.sessionId} = ${sessionId}`
      )
      .limit(1);
    return vote || undefined;
  }

  private async updateCommentVoteStats(commentId: number): Promise<void> {
    const votes = await db.select().from(commentVotes).where(eq(commentVotes.commentId, commentId));
    const upvotes = votes.filter(v => v.voteType === 'up').length;
    const downvotes = votes.filter(v => v.voteType === 'down').length;
    const score = upvotes - downvotes;

    await this.updateComment(commentId, { upvotes, downvotes, score });
  }

  async createFaceMashComparison(insertComparison: InsertFaceMashComparison): Promise<FaceMashComparison> {
    const [comparison] = await db
      .insert(faceMashComparisons)
      .values(insertComparison)
      .returning();

    // Update winner/loser stats
    await db
      .update(people)
      .set({ 
        faceMashWins: sql`${people.faceMashWins} + 1`
      })
      .where(eq(people.id, comparison.winnerId));
    
    await db
      .update(people)
      .set({ 
        faceMashLosses: sql`${people.faceMashLosses} + 1`
      })
      .where(eq(people.id, comparison.loserId));

    return comparison;
  }

  async getRandomPeopleForComparison(): Promise<[Person, Person] | null> {
    const peopleArray = await db.select().from(people);
    if (peopleArray.length < 2) return null;

    const shuffled = [...peopleArray].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  }

  async getTopRankedPeople(limit = 10): Promise<Person[]> {
    return await db
      .select()
      .from(people)
      .orderBy(desc(people.averageRating))
      .limit(limit);
  }

  async getWorstRankedPeople(limit = 10): Promise<Person[]> {
    return await db
      .select()
      .from(people)
      .where(sql`${people.averageRating} < 2`)
      .orderBy(asc(people.averageRating))
      .limit(limit);
  }

  async getTotalStats(): Promise<{
    totalPeople: number;
    totalRatings: number;
    totalComments: number;
    onlineUsers: number;
  }> {
    const [peopleCount] = await db.select({ count: sql<number>`count(*)` }).from(people);
    const [ratingsCount] = await db.select({ count: sql<number>`count(*)` }).from(ratings);
    const [commentsCount] = await db.select({ count: sql<number>`count(*)` }).from(comments);

    return {
      totalPeople: peopleCount.count,
      totalRatings: ratingsCount.count,
      totalComments: commentsCount.count,
      onlineUsers: Math.floor(Math.random() * 200) + 50, // Mock online users
    };
  }
}

export const storage = new DatabaseStorage();
