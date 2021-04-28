import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const { method, path } = req;
  console.log(`${method}   ${path}`);
  next();
  
};
