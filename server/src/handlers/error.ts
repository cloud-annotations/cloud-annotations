import { NextFunction, Request, Response } from "express";

function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }
  // Don't leak internal errors in production.
  if (process.env.NODE_ENV === "production") {
    return res.sendStatus(500);
  }

  return res.status(500).json({ error: err.message });
}

export default errorHandler;
