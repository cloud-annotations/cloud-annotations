import path from "path";

import express, { Router } from "express";

const root = process.env.SPA_ROOT;

const router = Router();

if (root) {
  router.use(express.static(root, { maxAge: 31536000 }));
  router.get("*", (_req, res) => {
    res.sendFile(path.join(root, "index.html"));
  });
}

export default router;
