/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Busboy from "busboy";
import { Request, Router } from "express";
import fs from "fs-extra";

////////////////////////////////////////////////////////////////////////////////
interface IImage {
  id: string;
  date: string;
}

interface IProject {
  id: string;
  name: string;
  created?: Date;
  modified?: Date;
  opened?: Date;
  labels?: string[];
  images?: number;
}

interface IProjectDetails {
  id?: string;
  name: string;
  created: Date;
  annotations: {
    version: string;
    labels: string[];
    annotations: {}; // TODO
    images: IImage[];
  };
}

interface IOptions {
  name: string;
  projectID?: string;
}

interface IConnection {
  id: string;
  name: string;
  icon?: string;
}

interface Provider {
  getConnections: () => Promise<IConnection[]>;
  getProjects: ({
    connectionID,
  }: {
    connectionID: string;
  }) => Promise<IProject[]>;
  createProject: ({
    connectionID,
    name,
  }: {
    connectionID: string;
    name: string;
  }) => any;
  getProject: (
    options: Pick<IOptions, "projectID">
  ) => Promise<IProjectDetails>;
  persist: (annotations: any, options: Pick<IOptions, "projectID">) => any;
  getImage: (
    imageID: string,
    options: Pick<IOptions, "projectID">
  ) => Promise<fs.ReadStream>;
  deleteImage: (imageID: string, options: Pick<IOptions, "projectID">) => any;
  saveImage: (file: NodeJS.ReadableStream, options: IOptions) => any;
}

// TODO: pull from package.json
let extensions = [
  "../../plugins/iris-server-plugin-file-system",
  // "../../plugins/iris-server-plugin-cos",
];
let providers: { [key: string]: Provider } = {};
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

function getProjectID(req: Request) {
  const { projectID } = req.query;
  if (process.env.SINGLE_DOCUMENT_MODE && projectID === undefined) {
    return projectID;
  }
  if (!process.env.SINGLE_DOCUMENT_MODE && typeof projectID === "string") {
    return projectID;
  }
  throw new Error(
    `projectID "${projectID}" of type "${typeof projectID}" is not allowed in ${
      process.env.SINGLE_DOCUMENT_MODE
        ? "single document mode"
        : "projects mode"
    }`
  );
}

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

function ensureProjectMode() {
  if (process.env.SINGLE_DOCUMENT_MODE) {
    throw new Error("Projects not available in single document mode");
  }
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
    ensureProjectMode();
    let connections: IConnection[] = [];
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
    ensureProjectMode();
    const providerID = requiredQuery(req, "providerID");
    const connectionID = requiredQuery(req, "connectionID");
    const projects = await providers[providerID].getProjects({ connectionID });
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
    ensureProjectMode();
    const providerID = requiredQuery(req, "providerID");
    const connectionID = requiredQuery(req, "connectionID");
    const name = requiredQuery(req, "name");
    await providers[providerID].createProject({ connectionID, name });
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
    const projectID = getProjectID(req);
    const project = await providers["file-system"].getProject({ projectID });
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
    const projectID = getProjectID(req);
    await providers["file-system"].persist(req.body, { projectID });
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
    const projectID = getProjectID(req);
    const image = await providers["file-system"].getImage(imageID, {
      projectID,
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
    const projectID = getProjectID(req);
    await providers["file-system"].deleteImage(imageID, { projectID });
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
    const projectID = getProjectID(req);
    const busboy = new Busboy({
      headers: req.headers,
      limits: {
        files: 1,
      },
    });

    busboy.on("file", async (name, file) => {
      await providers["file-system"].saveImage(file, { name, projectID });
      res.sendStatus(200);
    });

    req.pipe(busboy);
  } catch (e) {
    next(e);
  }
});

export default router;
