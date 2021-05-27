import { Request, Response } from "express";

function notFoundHandler(_req: Request, res: Response) {
  res.sendStatus(404);
}

export default notFoundHandler;
