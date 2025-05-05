import { Request, Response, NextFunction } from "express";

// Auth middleware to check if user is logged in
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized. Please login to continue." });
  }
  next();
};
