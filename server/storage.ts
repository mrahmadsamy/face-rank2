import { 
  people, ratings, comments, commentVotes, faceMashComparisons,
  type Person, type Rating, type Comment, type CommentVote, type FaceMashComparison,
  type InsertPerson, type InsertRating, type InsertComment, 
  type InsertCommentVote, type InsertFaceMashComparison 
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private people: Map<number, Person> = new Map();
  private ratings: Map<number, Rating> = new Map();
  private comments: Map<number, Comment> = new Map();
  private commentVotes: Map<number, CommentVote> = new Map();
  private faceMashComparisons: Map<number, FaceMashComparison> = new Map();
  
  private currentPersonId = 1;
  private currentRatingId = 1;
  private currentCommentId = 1;
  private currentCommentVoteId = 1;
  private currentComparisonId = 1;

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const person: Person = {
      ...insertPerson,
      id: this.currentPersonId++,
      averageRating: 0,
      totalRatings: 0,
      totalComments: 0,
      totalViews: 0,
      faceMashWins: 0,
      faceMashLosses: 0,
      createdAt: new Date(),
    };
    this.people.set(person.id, person);
    return person;
  }

  async getPerson(id: number): Promise<Person | undefined> {
    return this.people.get(id);
  }

  async getAllPeople(category?: string, sortBy = 'averageRating'): Promise<Person[]> {
    let peopleArray = Array.from(this.people.values());
    
    if (category) {
      peopleArray = peopleArray.filter(p => p.category === category);
    }

    switch (sortBy) {
      case 'averageRating':
        peopleArray.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
        peopleArray.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        break;
      case 'mostComments':
        peopleArray.sort((a, b) => (b.totalComments || 0) - (a.totalComments || 0));
        break;
      case 'faceMash':
        peopleArray.sort((a, b) => (b.faceMashWins || 0) - (a.faceMashWins || 0));
        break;
    }

    return peopleArray;
  }

  async updatePersonStats(id: number, stats: Partial<Person>): Promise<Person | undefined> {
    const person = this.people.get(id);
    if (!person) return undefined;

    const updated = { ...person, ...stats };
    this.people.set(id, updated);
    return updated;
  }

  async incrementPersonViews(id: number): Promise<void> {
    const person = this.people.get(id);
    if (person) {
      person.totalViews = (person.totalViews || 0) + 1;
      this.people.set(id, person);
    }
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const rating: Rating = {
      ...insertRating,
      id: this.currentRatingId++,
      createdAt: new Date(),
    };
    this.ratings.set(rating.id, rating);

    // Update person's average rating
    await this.updatePersonRatingStats(rating.personId);
    
    return rating;
  }

  async getRatingsByPersonId(personId: number): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(r => r.personId === personId);
  }

  async hasUserRated(personId: number, sessionId: string): Promise<boolean> {
    return Array.from(this.ratings.values()).some(
      r => r.personId === personId && r.sessionId === sessionId
    );
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
    const comment: Comment = {
      ...insertComment,
      id: this.currentCommentId++,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      isBuried: false,
      createdAt: new Date(),
    };
    this.comments.set(comment.id, comment);

    // Update person's comment count
    const person = this.people.get(comment.personId);
    if (person) {
      person.totalComments = (person.totalComments || 0) + 1;
      this.people.set(person.id, person);
    }

    return comment;
  }

  async getCommentsByPersonId(personId: number, sortBy = 'score'): Promise<Comment[]> {
    let comments = Array.from(this.comments.values()).filter(c => c.personId === personId);
    
    switch (sortBy) {
      case 'score':
        comments.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      case 'newest':
        comments.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        break;
    }

    return comments;
  }

  async updateComment(id: number, updates: Partial<Comment>): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;

    const updated = { ...comment, ...updates };
    
    // Check if comment should be buried (score < -5)
    if (updated.score !== undefined && updated.score !== null && updated.score < -5) {
      updated.isBuried = true;
    }

    this.comments.set(id, updated);
    return updated;
  }

  async createCommentVote(insertVote: InsertCommentVote): Promise<CommentVote> {
    const vote: CommentVote = {
      ...insertVote,
      id: this.currentCommentVoteId++,
      createdAt: new Date(),
    };
    this.commentVotes.set(vote.id, vote);

    // Update comment vote counts
    await this.updateCommentVoteStats(vote.commentId);

    return vote;
  }

  async hasUserVotedOnComment(commentId: number, sessionId: string): Promise<boolean> {
    return Array.from(this.commentVotes.values()).some(
      v => v.commentId === commentId && v.sessionId === sessionId
    );
  }

  async getCommentVote(commentId: number, sessionId: string): Promise<CommentVote | undefined> {
    return Array.from(this.commentVotes.values()).find(
      v => v.commentId === commentId && v.sessionId === sessionId
    );
  }

  private async updateCommentVoteStats(commentId: number): Promise<void> {
    const votes = Array.from(this.commentVotes.values()).filter(v => v.commentId === commentId);
    const upvotes = votes.filter(v => v.voteType === 'up').length;
    const downvotes = votes.filter(v => v.voteType === 'down').length;
    const score = upvotes - downvotes;

    await this.updateComment(commentId, { upvotes, downvotes, score });
  }

  async createFaceMashComparison(insertComparison: InsertFaceMashComparison): Promise<FaceMashComparison> {
    const comparison: FaceMashComparison = {
      ...insertComparison,
      id: this.currentComparisonId++,
      createdAt: new Date(),
    };
    this.faceMashComparisons.set(comparison.id, comparison);

    // Update winner/loser stats
    const winner = this.people.get(comparison.winnerId);
    const loser = this.people.get(comparison.loserId);
    
    if (winner) {
      winner.faceMashWins = (winner.faceMashWins || 0) + 1;
      this.people.set(winner.id, winner);
    }
    
    if (loser) {
      loser.faceMashLosses = (loser.faceMashLosses || 0) + 1;
      this.people.set(loser.id, loser);
    }

    return comparison;
  }

  async getRandomPeopleForComparison(): Promise<[Person, Person] | null> {
    const peopleArray = Array.from(this.people.values());
    if (peopleArray.length < 2) return null;

    const shuffled = [...peopleArray].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  }

  async getTopRankedPeople(limit = 10): Promise<Person[]> {
    return (await this.getAllPeople()).slice(0, limit);
  }

  async getWorstRankedPeople(limit = 10): Promise<Person[]> {
    const people = await this.getAllPeople();
    return people
      .filter(p => (p.averageRating || 0) < 2)
      .sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0))
      .slice(0, limit);
  }

  async getTotalStats(): Promise<{
    totalPeople: number;
    totalRatings: number;
    totalComments: number;
    onlineUsers: number;
  }> {
    return {
      totalPeople: this.people.size,
      totalRatings: this.ratings.size,
      totalComments: this.comments.size,
      onlineUsers: Math.floor(Math.random() * 200) + 50, // Mock online users
    };
  }
}

export const storage = new MemStorage();
