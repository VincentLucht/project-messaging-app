import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { checkValidationError } from '../util/checkValidationError';

const prisma = new PrismaClient();

type User = {
  id: string;
  name: string;
  password: string;
};

export interface AuthenticatedRequest extends Request {
  user?: User;
  title?: string;
}

class AuthController {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.SECRET_KEY || '';
    if (!this.secretKey) {
      throw new Error('SECRET_KEY is not defined in environment variables');
    }
    // bind .this to methods
    this.logIn = this.logIn.bind(this);
  }

  async logIn(req: Request, res: Response) {
    if (checkValidationError(req, res)) return;

    try {
      const user = await prisma.user.findUnique({
        where: {
          username: req.body.username,
        },
      });

      if (user && (await bcrypt.compare(req.body.password, user.password))) {
        const payload = { id: user.id, username: user.username };
        const token = jwt.sign(payload, this.secretKey, {
          expiresIn: '14 days',
        });
        return res.json({ token: `Bearer ${token}` });
      } else {
        return res.status(401).json({ message: 'Authentication failed' });
      }
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
}

const authController = new AuthController();
export default authController;
