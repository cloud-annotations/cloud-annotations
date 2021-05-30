/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "dotenv/config";

import http from "http";

import cookieParser from "cookie-parser";
import express from "express";

import errorHandler from "./handlers/error";
import notFoundHandler from "./handlers/not-found";
import gzip from "./middleware/gzip";
import logger from "./middleware/logger";
import security from "./middleware/security";
import multiuser from "./multiuser";
import { authenticate } from "./plugins/iris-server-plugin-ibm-auth";
import authRouter from "./routes/auth";
import spaRouter from "./routes/spa";
import v2Router from "./routes/v2";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 9000;

app.enable("trust proxy");
app.disable("x-powered-by");

multiuser(server);

app.use(gzip());
app.use(security());
app.use(logger());
app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/api/v2", authenticate);
app.use("/api/v2", v2Router);
app.use("/", spaRouter);

app.use(notFoundHandler);
app.use(errorHandler);

server.listen(port, () => {
  console.log("listening on port " + port);
});
