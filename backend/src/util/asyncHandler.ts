import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: any) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};
