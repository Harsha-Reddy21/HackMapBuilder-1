import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { z } from "zod";
import {
  loginSchema,
  registerSchema,
  insertHackathonSchema,
  insertRegistrationSchema,
  insertTeamSchema,
  insertTeamMemberSchema,
  insertProjectIdeaSchema,
  insertCommentSchema,
  insertEndorsementSchema,
  insertNotificationSchema,
} from "@shared/schema";
import { authMiddleware } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "hackmap-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    })
  );

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create user
      const user = await storage.createUser({
        username: data.username,
        password: data.password, // In a real app, this would be hashed
        email: data.email,
        skills: [],
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Set user in session
      req.session.userId = user.id;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Check password
      if (user.password !== password) { // In a real app, this would use bcrypt.compare
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set user in session
      req.session.userId = user.id;
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/auth/change-password", authMiddleware, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.userId;
      
      const user = await storage.getUser(userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check current password
      if (user.password !== currentPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Update password
      await storage.updateUserPassword(userId!, newPassword);
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // User routes
  app.patch("/api/users/:id", authMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user is updating their own profile
      if (userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, req.body);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Hackathon routes
  app.get("/api/hackathons", async (req, res) => {
    try {
      // Parse query parameters
      const featured = req.query.featured === "true";
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const query = req.query.query as string | undefined;
      const category = req.query.category as string | undefined;
      const date = req.query.date as string | undefined;
      const tags = req.query.tags
        ? Array.isArray(req.query.tags)
          ? (req.query.tags as string[])
          : [req.query.tags as string]
        : undefined;
      
      // Get hackathons with filters
      const hackathons = await storage.getHackathons({
        featured,
        limit,
        query,
        category,
        date,
        tags,
      });
      
      res.status(200).json(hackathons);
    } catch (error) {
      res.status(500).json({ message: "Failed to get hackathons" });
    }
  });

  app.get("/api/hackathons/:id", async (req, res) => {
    try {
      const hackathonId = parseInt(req.params.id);
      const hackathon = await storage.getHackathon(hackathonId);
      
      if (!hackathon) {
        return res.status(404).json({ message: "Hackathon not found" });
      }
      
      res.status(200).json(hackathon);
    } catch (error) {
      res.status(500).json({ message: "Failed to get hackathon" });
    }
  });

  app.post("/api/hackathons", authMiddleware, async (req, res) => {
    try {
      const data = insertHackathonSchema.parse(req.body);
      const hackathon = await storage.createHackathon(data);
      
      res.status(201).json(hackathon);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create hackathon" });
    }
  });

  // Registration routes
  app.post("/api/registrations", authMiddleware, async (req, res) => {
    try {
      const data = insertRegistrationSchema.parse(req.body);
      
      // Check if user is registering themselves
      if (data.userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only register yourself" });
      }
      
      // Check if already registered
      const existingRegistration = await storage.getRegistrationByUserAndHackathon(
        data.userId,
        data.hackathonId
      );
      
      if (existingRegistration) {
        return res.status(400).json({ message: "Already registered for this hackathon" });
      }
      
      // Register user
      const registration = await storage.createRegistration(data);
      
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to register for hackathon" });
    }
  });

  app.get("/api/registrations/status", authMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const hackathonId = parseInt(req.query.hackathonId as string);
      
      // Check if user is checking their own registration
      if (userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only check your own registration" });
      }
      
      const registration = await storage.getRegistrationByUserAndHackathon(userId, hackathonId);
      
      if (!registration) {
        return res.status(200).json(null);
      }
      
      res.status(200).json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to get registration status" });
    }
  });

  app.get("/api/registrations/user", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const registrations = await storage.getRegistrationsByUser(userId!);
      
      // Get hackathon details for each registration
      const registrationsWithHackathons = await Promise.all(
        registrations.map(async (registration) => {
          const hackathon = await storage.getHackathon(registration.hackathonId);
          return {
            ...registration,
            hackathon,
          };
        })
      );
      
      res.status(200).json(registrationsWithHackathons);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user registrations" });
    }
  });

  // Team routes
  app.get("/api/teams", async (req, res) => {
    try {
      const hackathonId = req.query.hackathonId
        ? parseInt(req.query.hackathonId as string)
        : undefined;
      
      const teams = await storage.getTeams(hackathonId);
      
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to get teams" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.status(200).json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to get team" });
    }
  });

  app.post("/api/teams", authMiddleware, async (req, res) => {
    try {
      const data = insertTeamSchema.parse(req.body);
      
      // Check if user is creating as themselves
      if (data.creatorId !== req.session.userId) {
        return res.status(403).json({ message: "You can only create teams as yourself" });
      }
      
      // Check if user is registered for the hackathon
      const registration = await storage.getRegistrationByUserAndHackathon(
        data.creatorId,
        data.hackathonId
      );
      
      if (!registration) {
        return res.status(400).json({ message: "You must register for the hackathon first" });
      }
      
      // Create team with a random invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const team = await storage.createTeam({
        ...data,
        inviteCode,
      });
      
      // Add creator as a team member
      await storage.createTeamMember({
        teamId: team.id,
        userId: data.creatorId,
        status: "accepted",
      });
      
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.get("/api/teams/my-teams", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const teams = await storage.getTeamsByUser(userId!);
      
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user teams" });
    }
  });

  app.get("/api/teams/recommended", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId!);
      
      if (!user || !user.skills || user.skills.length === 0) {
        return res.status(200).json([]);
      }
      
      const recommendedTeams = await storage.getRecommendedTeams(user.skills);
      
      res.status(200).json(recommendedTeams);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recommended teams" });
    }
  });

  app.get("/api/teams/user-team", authMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const hackathonId = parseInt(req.query.hackathonId as string);
      
      // Check if user is checking their own team
      if (userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only check your own team" });
      }
      
      const team = await storage.getUserTeamForHackathon(userId, hackathonId);
      
      res.status(200).json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user team" });
    }
  });

  app.post("/api/teams/join", authMiddleware, async (req, res) => {
    try {
      const { teamId, inviteCode } = req.body;
      const userId = req.session.userId;
      
      // Verify invite code
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      if (team.inviteCode !== inviteCode) {
        return res.status(400).json({ message: "Invalid invite code" });
      }
      
      // Check if user is already in the team
      const existingMember = await storage.getTeamMemberByUserAndTeam(userId!, teamId);
      if (existingMember) {
        return res.status(400).json({ message: "Already a member of this team" });
      }
      
      // Check if user is registered for the hackathon
      const registration = await storage.getRegistrationByUserAndHackathon(
        userId!,
        team.hackathonId
      );
      
      if (!registration) {
        return res.status(400).json({ message: "You must register for the hackathon first" });
      }
      
      // Add user to team
      const teamMember = await storage.createTeamMember({
        teamId,
        userId: userId!,
        status: "accepted",
      });
      
      // Create notification for team creator
      await storage.createNotification({
        userId: team.creatorId,
        type: "team_join_request",
        content: `A new member has joined your team: ${team.name}`,
        relatedId: team.id,
        read: false,
      });
      
      res.status(201).json(teamMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to join team" });
    }
  });

  // Project idea routes
  app.get("/api/ideas", async (req, res) => {
    try {
      const ideas = await storage.getProjectIdeas();
      
      // Get team details and counts for each idea
      const ideasWithDetails = await Promise.all(
        ideas.map(async (idea) => {
          const team = await storage.getTeam(idea.teamId);
          const endorsementCount = await storage.getEndorsementCount(idea.id);
          const commentCount = await storage.getCommentCount(idea.id);
          
          // Check if current user has endorsed this idea
          let isEndorsed = false;
          if (req.session.userId) {
            isEndorsed = await storage.hasUserEndorsed(idea.id, req.session.userId);
          }
          
          return {
            ...idea,
            team,
            endorsementCount,
            commentCount,
            isEndorsed,
          };
        })
      );
      
      res.status(200).json(ideasWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to get project ideas" });
    }
  });

  app.post("/api/ideas", authMiddleware, async (req, res) => {
    try {
      const data = insertProjectIdeaSchema.parse(req.body);
      
      // Check if user is in the team
      const isMember = await storage.isUserInTeam(req.session.userId!, data.teamId);
      if (!isMember) {
        return res.status(403).json({ message: "You must be a team member to share ideas" });
      }
      
      const idea = await storage.createProjectIdea(data);
      
      res.status(201).json(idea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create project idea" });
    }
  });

  app.post("/api/ideas/comments", authMiddleware, async (req, res) => {
    try {
      const data = insertCommentSchema.parse(req.body);
      
      // Check if user is commenting as themselves
      if (data.userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only comment as yourself" });
      }
      
      const comment = await storage.createComment(data);
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.post("/api/ideas/endorsements", authMiddleware, async (req, res) => {
    try {
      const data = insertEndorsementSchema.parse(req.body);
      
      // Check if user is endorsing as themselves
      if (data.userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only endorse as yourself" });
      }
      
      // Check if already endorsed
      const existingEndorsement = await storage.getEndorsementByUserAndProject(
        data.userId,
        data.projectId
      );
      
      if (existingEndorsement) {
        return res.status(400).json({ message: "Already endorsed this idea" });
      }
      
      const endorsement = await storage.createEndorsement(data);
      
      res.status(201).json(endorsement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to endorse idea" });
    }
  });

  app.delete("/api/ideas/endorsements", authMiddleware, async (req, res) => {
    try {
      const projectId = parseInt(req.query.projectId as string);
      const userId = parseInt(req.query.userId as string);
      
      // Check if user is removing their own endorsement
      if (userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only remove your own endorsements" });
      }
      
      await storage.removeEndorsement(projectId, userId);
      
      res.status(200).json({ message: "Endorsement removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove endorsement" });
    }
  });

  // Notification routes
  app.get("/api/notifications", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const notifications = await storage.getNotificationsByUser(userId!);
      
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", authMiddleware, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotification(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Check if notification belongs to user
      if (notification.userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only mark your own notifications as read" });
      }
      
      await storage.markNotificationAsRead(notificationId);
      
      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
