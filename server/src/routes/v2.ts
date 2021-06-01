/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Busboy from "busboy";
import { Request, Router } from "express";

import { Connection, ProjectProvider } from "../plugins/project-provider";

////////////////////////////////////////////////////////////////////////////////
// Bootstrap plugins - TODO: pull from package.json
////////////////////////////////////////////////////////////////////////////////
let extensions = [
  // "../plugins/iris-server-plugin-file-system",
  "../plugins/iris-server-plugin-cos",
];
let providers: { [key: string]: ProjectProvider } = {};
const iris = {
  providers: {
    register: ({ id, provider }: any) => {
      providers[id] = provider;
    },
  },
};
for (const extension of extensions) {
  try {
    const provider = require(extension);
    provider.activate(iris);
  } catch (e) {
    console.log(e);
  }
}
////////////////////////////////////////////////////////////////////////////////

const router = Router();

function requiredQuery(req: Request, param: string) {
  const x = req.query[param];
  if (x === undefined) {
    throw new Error(`${param} is undefined`);
  }
  if (typeof x === "string") {
    return x;
  }
  throw new Error(`${param} "${x}" of type "${typeof x}" is not allowed`);
}

/**
 * GET /api/mode
 */
router.get("/mode", async (_req, res) => {
  res.json({ singleDocument: !!process.env.SINGLE_DOCUMENT_MODE });
});

/**
 * GET /api/connections
 */
router.get("/connections", async (_req, res, next) => {
  try {
    let connections: Connection[] = [];
    for (const provider of Object.values(providers)) {
      const c = await provider.getConnections();
      connections.push(...c);
    }
    res.json(connections);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/projects
 */
router.get("/projects", async (req, res, next) => {
  try {
    const providerID = requiredQuery(req, "providerID");
    const connectionID = requiredQuery(req, "connectionID");
    const projects = await providers[providerID].getProjects({
      connectionID,
      accessToken: req.cookies.access_token,
    });
    res.json(projects);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/projects
 */
router.post("/projects", async (req, res, next) => {
  try {
    const providerID = requiredQuery(req, "providerID");
    const connectionID = requiredQuery(req, "connectionID");
    const name = requiredQuery(req, "name");

    await providers[providerID].createProject(name, {
      connectionID,
      accessToken: req.cookies.access_token,
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/project
 * @queryParam {string} [projectID]
 */
router.get("/project", async (req, res, next) => {
  try {
    const providerID = requiredQuery(req, "providerID");
    const projectID = requiredQuery(req, "projectID");
    const connectionID = requiredQuery(req, "connectionID");

    const project = await providers[providerID].getProject(projectID, {
      connectionID,
      accessToken: req.cookies.access_token,
    });

    res.json(project);
  } catch (e) {
    next(e);
  }
});

/**
 * PUT /api/project
 * @queryParam {string} [projectID]
 */
router.put("/project", async (req, res, next) => {
  try {
    const providerID = requiredQuery(req, "providerID");
    const projectID = requiredQuery(req, "projectID");
    const connectionID = requiredQuery(req, "connectionID");
    await providers[providerID].persist(projectID, req.body, {
      connectionID,
      accessToken: req.cookies.access_token,
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/images/:imageID
 * @pathParam {string} imageID
 * @queryParam {string} [projectID]
 */
router.get("/images/:imageID", async (req, res, next) => {
  const { imageID } = req.params;

  try {
    const providerID = requiredQuery(req, "providerID");
    const projectID = requiredQuery(req, "projectID");
    const connectionID = requiredQuery(req, "connectionID");
    const image = await providers[providerID].getImage(projectID, imageID, {
      connectionID,
      accessToken: req.cookies.access_token,
    });

    image.on("error", (e) => {
      throw e;
    });

    res.set("Content-Type", "image/jpeg");
    image.pipe(res);
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/images/:imageID
 * @pathParam {string} imageID
 * @queryParam {string} [projectID]
 */
router.delete("/images/:imageID", async (req, res, next) => {
  const { imageID } = req.params;

  try {
    const providerID = requiredQuery(req, "providerID");
    const projectID = requiredQuery(req, "projectID");
    const connectionID = requiredQuery(req, "connectionID");
    await providers[providerID].deleteImage(projectID, imageID, {
      connectionID,
      accessToken: req.cookies.access_token,
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/images
 * @queryParam {string} [projectID]
 */
router.post("/images", async (req, res, next) => {
  try {
    const providerID = requiredQuery(req, "providerID");
    const projectID = requiredQuery(req, "projectID");
    const connectionID = requiredQuery(req, "connectionID");
    const busboy = new Busboy({
      headers: req.headers,
      limits: {
        files: 1,
      },
    });

    busboy.on("file", async (name, stream) => {
      await providers[providerID].saveImage(
        projectID,
        { name, stream },
        {
          connectionID,
          accessToken: req.cookies.access_token,
        }
      );
      res.sendStatus(200);
    });

    req.pipe(busboy);
  } catch (e) {
    next(e);
  }
});

export default router;
