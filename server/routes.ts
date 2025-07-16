import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPersonSchema, insertRatingSchema, insertCommentSchema, 
  insertCommentVoteSchema, insertFaceMashComparisonSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get session ID for anonymous users
  app.get("/api/session", (req, res) => {
    let sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
      sessionId = 'user_' + Math.random().toString(36).substr(2, 9);
    }
    res.json({ sessionId });
  });

  // People endpoints
  app.get("/api/people", async (req, res) => {
    try {
      const { category, sortBy } = req.query;
      const people = await storage.getAllPeople(
        category as string, 
        sortBy as string
      );
      res.json(people);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch people" });
    }
  });

  app.get("/api/people/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const person = await storage.getPerson(id);
      
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }

      // Increment view count
      await storage.incrementPersonViews(id);
      
      res.json(person);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch person" });
    }
  });

  app.post("/api/people", async (req, res) => {
    try {
      const validatedData = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson(validatedData);
      res.status(201).json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create person" });
    }
  });

  // Ratings endpoints
  app.post("/api/ratings", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }

      const validatedData = insertRatingSchema.parse({
        ...req.body,
        sessionId
      });

      // Check if user already rated this person
      const hasRated = await storage.hasUserRated(validatedData.personId, sessionId);
      if (hasRated) {
        return res.status(400).json({ message: "You have already rated this person" });
      }

      const rating = await storage.createRating(validatedData);
      res.status(201).json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create rating" });
    }
  });

  // Comments endpoints
  app.get("/api/people/:id/comments", async (req, res) => {
    try {
      const personId = parseInt(req.params.id);
      const { sortBy } = req.query;
      const comments = await storage.getCommentsByPersonId(personId, sortBy as string);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }

      const validatedData = insertCommentSchema.parse({
        ...req.body,
        sessionId
      });

      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Comment voting endpoints
  app.post("/api/comments/:id/vote", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }

      const commentId = parseInt(req.params.id);
      const { voteType } = req.body;

      if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({ message: "Invalid vote type" });
      }

      // Check if user already voted on this comment
      const existingVote = await storage.getCommentVote(commentId, sessionId);
      if (existingVote) {
        return res.status(400).json({ message: "You have already voted on this comment" });
      }

      const validatedData = insertCommentVoteSchema.parse({
        commentId,
        sessionId,
        voteType
      });

      const vote = await storage.createCommentVote(validatedData);
      res.status(201).json(vote);
    } catch (error) {
      res.status(500).json({ message: "Failed to vote on comment" });
    }
  });

  // FaceMash endpoints
  app.get("/api/facemash/comparison", async (req, res) => {
    try {
      const comparison = await storage.getRandomPeopleForComparison();
      if (!comparison) {
        return res.status(404).json({ message: "Not enough people for comparison" });
      }
      res.json({ person1: comparison[0], person2: comparison[1] });
    } catch (error) {
      res.status(500).json({ message: "Failed to get comparison" });
    }
  });

  app.post("/api/facemash/compare", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }

      const validatedData = insertFaceMashComparisonSchema.parse({
        ...req.body,
        sessionId
      });

      const comparison = await storage.createFaceMashComparison(validatedData);
      res.status(201).json(comparison);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save comparison" });
    }
  });

  // Rankings endpoints
  app.get("/api/rankings/top", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topPeople = await storage.getTopRankedPeople(limit);
      res.json(topPeople);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top rankings" });
    }
  });

  app.get("/api/rankings/worst", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const worstPeople = await storage.getWorstRankedPeople(limit);
      res.json(worstPeople);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch worst rankings" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getTotalStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
