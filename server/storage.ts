import {
  User,
  InsertUser,
  Hackathon,
  InsertHackathon,
  Registration,
  InsertRegistration,
  Team,
  InsertTeam,
  TeamMember,
  InsertTeamMember,
  ProjectIdea,
  InsertProjectIdea,
  Comment,
  InsertComment,
  Endorsement,
  InsertEndorsement,
  Notification,
  InsertNotification
} from "@shared/schema";

// Filter options for hackathons
interface HackathonFilters {
  featured?: boolean;
  limit?: number;
  query?: string;
  category?: string;
  date?: string;
  tags?: string[];
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<void>;

  // Hackathon operations
  getHackathons(filters?: HackathonFilters): Promise<Hackathon[]>;
  getHackathon(id: number): Promise<Hackathon | undefined>;
  createHackathon(hackathon: InsertHackathon): Promise<Hackathon>;

  // Registration operations
  getRegistrationByUserAndHackathon(userId: number, hackathonId: number): Promise<Registration | undefined>;
  getRegistrationsByUser(userId: number): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;

  // Team operations
  getTeams(hackathonId?: number): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamsByUser(userId: number): Promise<Team[]>;
  getRecommendedTeams(userSkills: string[]): Promise<Team[]>;
  getUserTeamForHackathon(userId: number, hackathonId: number): Promise<Team | undefined>;
  isUserInTeam(userId: number, teamId: number): Promise<boolean>;

  // Team member operations
  getTeamMemberByUserAndTeam(userId: number, teamId: number): Promise<TeamMember | undefined>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;

  // Project idea operations
  getProjectIdeas(): Promise<ProjectIdea[]>;
  getProjectIdea(id: number): Promise<ProjectIdea | undefined>;
  createProjectIdea(projectIdea: InsertProjectIdea): Promise<ProjectIdea>;

  // Comment operations
  getComments(projectId: number): Promise<Comment[]>;
  getCommentCount(projectId: number): Promise<number>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Endorsement operations
  getEndorsementCount(projectId: number): Promise<number>;
  getEndorsementByUserAndProject(userId: number, projectId: number): Promise<Endorsement | undefined>;
  hasUserEndorsed(projectId: number, userId: number): Promise<boolean>;
  createEndorsement(endorsement: InsertEndorsement): Promise<Endorsement>;
  removeEndorsement(projectId: number, userId: number): Promise<void>;

  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private hackathons: Map<number, Hackathon> = new Map();
  private registrations: Map<number, Registration> = new Map();
  private teams: Map<number, Team> = new Map();
  private teamMembers: Map<number, TeamMember> = new Map();
  private projectIdeas: Map<number, ProjectIdea> = new Map();
  private comments: Map<number, Comment> = new Map();
  private endorsements: Map<number, Endorsement> = new Map();
  private notifications: Map<number, Notification> = new Map();

  private userId = 1;
  private hackathonId = 1;
  private registrationId = 1;
  private teamId = 1;
  private teamMemberId = 1;
  private projectIdeaId = 1;
  private commentId = 1;
  private endorsementId = 1;
  private notificationId = 1;

  constructor() {
    // Initialize with some data
    this.initializeData();
  }

  // Initialize with sample data for development
  private initializeData() {
    // Create some sample hackathons
    const hackathon1: InsertHackathon = {
      title: "AI Summit Hackathon",
      description: "Build innovative solutions using artificial intelligence and machine learning.",
      theme: "Artificial Intelligence",
      startDate: new Date("2023-05-15"),
      endDate: new Date("2023-05-17"),
      registrationDeadline: new Date("2023-04-30"),
      prizes: "$5,000 in prizes",
      tags: ["AI/ML", "Data Science"],
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      status: "upcoming",
    };

    const hackathon2: InsertHackathon = {
      title: "Web3 Innovation Challenge",
      description: "Create decentralized applications that solve real-world problems.",
      theme: "Blockchain",
      startDate: new Date("2023-06-10"),
      endDate: new Date("2023-06-12"),
      registrationDeadline: new Date("2023-05-25"),
      prizes: "$3,000 in prizes",
      tags: ["Web3", "Blockchain"],
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      status: "upcoming",
    };

    const hackathon3: InsertHackathon = {
      title: "HealthTech Hackathon",
      description: "Develop solutions that address challenges in healthcare delivery and patient care.",
      theme: "Healthcare",
      startDate: new Date("2023-07-05"),
      endDate: new Date("2023-07-07"),
      registrationDeadline: new Date("2023-06-20"),
      prizes: "$2,500 in prizes",
      tags: ["Healthcare", "HealthTech"],
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80",
      status: "upcoming",
    };

    // Add hackathons to storage
    this.createHackathon(hackathon1);
    this.createHackathon(hackathon2);
    this.createHackathon(hackathon3);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...userData, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPassword(id: number, password: string): Promise<void> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    user.password = password;
    this.users.set(id, user);
  }

  // Hackathon operations
  async getHackathons(filters?: HackathonFilters): Promise<Hackathon[]> {
    let hackathons = Array.from(this.hackathons.values());

    if (filters) {
      // Apply filters
      if (filters.featured) {
        // Simple logic: assume first 3 hackathons are featured
        hackathons = hackathons.slice(0, 3);
      }

      if (filters.query) {
        const query = filters.query.toLowerCase();
        hackathons = hackathons.filter(
          (h) =>
            h.title.toLowerCase().includes(query) ||
            h.description.toLowerCase().includes(query) ||
            h.theme.toLowerCase().includes(query)
        );
      }

      if (filters.category) {
        const category = filters.category.toLowerCase();
        hackathons = hackathons.filter(
          (h) =>
            h.theme.toLowerCase().includes(category) ||
            (h.tags && h.tags.some((tag) => tag.toLowerCase().includes(category)))
        );
      }

      if (filters.date) {
        const now = new Date();
        switch (filters.date) {
          case "this-month": {
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();
            hackathons = hackathons.filter(
              (h) =>
                new Date(h.startDate).getMonth() === thisMonth &&
                new Date(h.startDate).getFullYear() === thisYear
            );
            break;
          }
          case "next-month": {
            const nextMonth = (now.getMonth() + 1) % 12;
            const nextMonthYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
            hackathons = hackathons.filter(
              (h) =>
                new Date(h.startDate).getMonth() === nextMonth &&
                new Date(h.startDate).getFullYear() === nextMonthYear
            );
            break;
          }
          case "upcoming":
            hackathons = hackathons.filter(
              (h) => new Date(h.startDate) > now
            );
            break;
          case "open-registration":
            hackathons = hackathons.filter(
              (h) => new Date(h.registrationDeadline) > now
            );
            break;
        }
      }

      if (filters.tags && filters.tags.length > 0) {
        hackathons = hackathons.filter(
          (h) =>
            h.tags &&
            filters.tags!.some((filterTag) =>
              h.tags.some((tag) => tag.toLowerCase().includes(filterTag.toLowerCase()))
            )
        );
      }

      if (filters.limit) {
        hackathons = hackathons.slice(0, filters.limit);
      }
    }

    return hackathons;
  }

  async getHackathon(id: number): Promise<Hackathon | undefined> {
    return this.hackathons.get(id);
  }

  async createHackathon(hackathonData: InsertHackathon): Promise<Hackathon> {
    const id = this.hackathonId++;
    const createdAt = new Date();
    const hackathon: Hackathon = { ...hackathonData, id, createdAt };
    this.hackathons.set(id, hackathon);
    return hackathon;
  }

  // Registration operations
  async getRegistrationByUserAndHackathon(
    userId: number,
    hackathonId: number
  ): Promise<Registration | undefined> {
    return Array.from(this.registrations.values()).find(
      (reg) => reg.userId === userId && reg.hackathonId === hackathonId
    );
  }

  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (reg) => reg.userId === userId
    );
  }

  async createRegistration(registrationData: InsertRegistration): Promise<Registration> {
    const id = this.registrationId++;
    const registeredAt = new Date();
    const registration: Registration = { ...registrationData, id, registeredAt };
    this.registrations.set(id, registration);
    return registration;
  }

  // Team operations
  async getTeams(hackathonId?: number): Promise<Team[]> {
    let teams = Array.from(this.teams.values());
    if (hackathonId !== undefined) {
      teams = teams.filter((team) => team.hackathonId === hackathonId);
    }
    return teams;
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(teamData: InsertTeam): Promise<Team> {
    const id = this.teamId++;
    const createdAt = new Date();
    const team: Team = { ...teamData, id, createdAt };
    this.teams.set(id, team);
    return team;
  }

  async getTeamsByUser(userId: number): Promise<Team[]> {
    // Get all team members for the user
    const userTeamMembers = Array.from(this.teamMembers.values()).filter(
      (member) => member.userId === userId && member.status === "accepted"
    );

    // Get the teams for these memberships
    const teams = userTeamMembers.map((member) =>
      this.teams.get(member.teamId)
    ).filter((team): team is Team => team !== undefined);

    return teams;
  }

  async getRecommendedTeams(userSkills: string[]): Promise<Team[]> {
    const allTeams = Array.from(this.teams.values());

    // Filter teams where the user's skills match some of the required skills
    const recommendedTeams = allTeams.filter((team) => {
      if (!team.requiredSkills || team.requiredSkills.length === 0) {
        return false;
      }

      // Check if any of the user's skills match the team's required skills
      return userSkills.some((skill) =>
        team.requiredSkills.includes(skill)
      );
    });

    return recommendedTeams;
  }

  async getUserTeamForHackathon(userId: number, hackathonId: number): Promise<Team | undefined> {
    // Get all teams for the hackathon
    const hackathonTeams = await this.getTeams(hackathonId);

    // Get team IDs where the user is a member
    const userTeamIds = (await this.getTeamsByUser(userId)).map((team) => team.id);

    // Find the intersection
    const userTeamForHackathon = hackathonTeams.find((team) =>
      userTeamIds.includes(team.id)
    );

    return userTeamForHackathon;
  }

  async isUserInTeam(userId: number, teamId: number): Promise<boolean> {
    const teamMember = await this.getTeamMemberByUserAndTeam(userId, teamId);
    return teamMember !== undefined && teamMember.status === "accepted";
  }

  // Team member operations
  async getTeamMemberByUserAndTeam(userId: number, teamId: number): Promise<TeamMember | undefined> {
    return Array.from(this.teamMembers.values()).find(
      (member) => member.userId === userId && member.teamId === teamId
    );
  }

  async createTeamMember(teamMemberData: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberId++;
    const joinedAt = teamMemberData.status === "accepted" ? new Date() : undefined;
    const teamMember: TeamMember = { ...teamMemberData, id, joinedAt };
    this.teamMembers.set(id, teamMember);
    return teamMember;
  }

  // Project idea operations
  async getProjectIdeas(): Promise<ProjectIdea[]> {
    return Array.from(this.projectIdeas.values());
  }

  async getProjectIdea(id: number): Promise<ProjectIdea | undefined> {
    return this.projectIdeas.get(id);
  }

  async createProjectIdea(ideaData: InsertProjectIdea): Promise<ProjectIdea> {
    const id = this.projectIdeaId++;
    const createdAt = new Date();
    const projectIdea: ProjectIdea = { ...ideaData, id, createdAt };
    this.projectIdeas.set(id, projectIdea);
    return projectIdea;
  }

  // Comment operations
  async getComments(projectId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.projectId === projectId
    );
  }

  async getCommentCount(projectId: number): Promise<number> {
    return (await this.getComments(projectId)).length;
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const createdAt = new Date();
    const comment: Comment = { ...commentData, id, createdAt };
    this.comments.set(id, comment);
    return comment;
  }

  // Endorsement operations
  async getEndorsementCount(projectId: number): Promise<number> {
    return Array.from(this.endorsements.values()).filter(
      (endorsement) => endorsement.projectId === projectId
    ).length;
  }

  async getEndorsementByUserAndProject(userId: number, projectId: number): Promise<Endorsement | undefined> {
    return Array.from(this.endorsements.values()).find(
      (endorsement) => endorsement.userId === userId && endorsement.projectId === projectId
    );
  }

  async hasUserEndorsed(projectId: number, userId: number): Promise<boolean> {
    const endorsement = await this.getEndorsementByUserAndProject(userId, projectId);
    return endorsement !== undefined;
  }

  async createEndorsement(endorsementData: InsertEndorsement): Promise<Endorsement> {
    const id = this.endorsementId++;
    const createdAt = new Date();
    const endorsement: Endorsement = { ...endorsementData, id, createdAt };
    this.endorsements.set(id, endorsement);
    return endorsement;
  }

  async removeEndorsement(projectId: number, userId: number): Promise<void> {
    const endorsement = await this.getEndorsementByUserAndProject(userId, projectId);
    if (endorsement) {
      this.endorsements.delete(endorsement.id);
    }
  }

  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const createdAt = new Date();
    const notification: Notification = { ...notificationData, id, createdAt };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = await this.getNotification(id);
    if (notification) {
      notification.read = true;
      this.notifications.set(id, notification);
    }
  }
}

export const storage = new MemStorage();
