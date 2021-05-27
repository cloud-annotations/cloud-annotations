import { Router } from "express";

const router = Router();

router.get("/status", (_req, res) => {
  res.sendStatus(200);
});

export default router;
