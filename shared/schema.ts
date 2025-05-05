import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  skills: text("skills").array(),
  githubLink: text("github_link"),
  portfolioLink: text("portfolio_link"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hackathons table
export const hackathons = pgTable("hackathons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  theme: text("theme").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  registrationDeadline: timestamp("registration_deadline").notNull(),
  prizes: text("prizes"),
  tags: text("tags").array(),
  imageUrl: text("image_url"),
  status: text("status").notNull(), // 'upcoming', 'active', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Registrations table (Users registered for hackathons)
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  hackathonId: integer("hackathon_id").notNull().references(() => hackathons.id),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  hackathonId: integer("hackathon_id").notNull().references(() => hackathons.id),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  requiredSkills: text("required_skills").array(),
  inviteCode: text("invite_code").unique(),
  maxMembers: integer("max_members").default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team members relationship
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull(), // 'invited', 'accepted', 'declined'
  joinedAt: timestamp("joined_at"),
});

// Project ideas
export const projectIdeas = pgTable("project_ideas", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  techStack: text("tech_stack").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments on project ideas
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectIdeas.id),
  userId: integer("user_id").notNull().references(() => users.id),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Endorsements (likes) on project ideas
export const endorsements = pgTable("endorsements", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectIdeas.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'team_invite', 'team_join_request', 'deadline_reminder'
  content: text("content").notNull(),
  relatedId: integer("related_id"), // could be teamId, hackathonId, etc.
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertHackathonSchema = createInsertSchema(hackathons).omit({
  id: true,
  createdAt: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  registeredAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertProjectIdeaSchema = createInsertSchema(projectIdeas).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertEndorsementSchema = createInsertSchema(endorsements).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Hackathon = typeof hackathons.$inferSelect;
export type InsertHackathon = z.infer<typeof insertHackathonSchema>;

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type ProjectIdea = typeof projectIdeas.$inferSelect;
export type InsertProjectIdea = z.infer<typeof insertProjectIdeaSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Endorsement = typeof endorsements.$inferSelect;
export type InsertEndorsement = z.infer<typeof insertEndorsementSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
