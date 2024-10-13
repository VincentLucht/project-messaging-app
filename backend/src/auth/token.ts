import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare module 'express' {
  export interface Request {
    token?: string;
    authData?: jwt.JwtPayload | string;
  }
}

interface TokenOptions {
  secretKey?: string;
  algorithms?: jwt.Algorithm[];
}

class Token {
  private secretKey: string;
  private algorithms: jwt.Algorithm[];

  constructor(options: TokenOptions = {}) {
    this.secretKey = options.secretKey || process.env.SECRET_KEY || '';
    this.algorithms = options.algorithms || ['HS256'];

    if (!this.secretKey) {
      throw new Error('SECRET_KEY is not defined in environment variables or options');
    }

    this.extract = this.extract.bind(this);
    this.verify = this.verify.bind(this);
  }

  // extract token from authorization header
  extract(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (typeof authHeader !== 'string') {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({ error: 'Invalid Authorization header format' });
    }

    const [, token] = parts;
    req.token = token;
    next();
  }

  // verify the token
  verify(req: Request, res: Response, next: NextFunction) {
    const { token } = req;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, this.secretKey, { algorithms: this.algorithms }, (error, decoded) => {
      if (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token has expired' });
        }
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ error: 'Invalid token' });
        }
        return res.status(403).json({ error: 'Failed to authenticate token' });
      }

      req.authData = decoded;
      next();
    });
  }
}

const token = new Token();
export default token;
