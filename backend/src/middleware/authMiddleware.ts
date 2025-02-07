// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  userId?: string; // Extend the Request interface to include userId
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'No token, authorization denied' });
    return; // Ensure the request-response cycle ends
  }

  try {
    // Verify token
    console.log("token",token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    console.log("decoded",decoded);
    
    // Attach userId to request object
    req.userId = decoded.userId;
    
    next(); // Pass control to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export default authMiddleware;
