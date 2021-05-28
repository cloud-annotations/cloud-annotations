/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "path";

import fs from "fs-extra";
import lockfile from "proper-lockfile";

interface Label {
  id: string;
  name: string;
}

interface Image {
  id: string;
  date: string;
  annotations: string[];
}

interface Annotation {
  id: string;
  label: string;
  tool?: string;
  targets?: {
    id: string;
    x: number;
    y: number;
  }[];
  [key: string]: any; // plugins can specify extra keys.
}

interface IProject {
  id?: string;
  name: string;
  created: Date;
  version: string;
  labels: { [key: string]: Label };
  annotations: { [key: string]: Annotation };
  images: { [key: string]: Image };
}

interface IOptions {
  name: string;
  projectID?: string;
}

const ignoreRegex = /^lost\+found$/;

class FileSystemProvider {
  private _dir(projectID: string | undefined) {
    if (projectID) {
      return path.join(process.cwd(), projectID);
    }
    return process.cwd();
  }

  async getConnections() {
    return Promise.resolve([
      {
        id: "default",
        providerID: "file-system",
        name: "File System",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 32 32" fill="white">
          <rect x="14" y="19" width="4" height="2" />
          <path d="M6,2V28a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V2ZM24,28H8V16H24Zm0-14H8V10H24ZM8,8V4H24V8Z" />
        </svg>`,
      },
    ]);
  }

  async createProject({ name }: any) {
    await fs.ensureDir(this._dir(name));
  }

  async getProjects() {
    const x = await fs.readdir(process.cwd(), { withFileTypes: true });

    return await Promise.all(
      x
        .filter((dir) => dir.isDirectory() && !ignoreRegex.test(dir.name))
        .map(async (dir) => {
          const stats: { created?: Date; modified?: Date; opened?: Date } = {
            created: undefined,
            modified: undefined,
            opened: undefined,
          };

          const files = await fs.readdir(dir.name);

          const images = files.filter(
            (f) =>
              f.toLowerCase().endsWith(".jpg") ||
              f.toLowerCase().endsWith(".jpeg")
          );

          let labels: string[] = [];
          try {
            const a = await fs.readFile(
              path.join(dir.name, "_annotations.json"),
              "utf-8"
            );
            labels = JSON.parse(a).labels;
          } catch {}

          try {
            const s = await fs.stat(path.join(dir.name, "_annotations.json"));
            stats.created = s.birthtime;
            stats.modified = s.mtime;
            stats.opened = s.atime;
          } catch {}

          return {
            id: dir.name,
            name: dir.name,
            created: stats.created,
            modified: stats.modified,
            opened: stats.opened,
            labels: labels,
            images: images.length,
          };
        })
    );
  }

  async getProject(options: Pick<IOptions, "projectID">) {
    const { projectID } = options;

    const project: IProject = {
      id: projectID,
      name: projectID ?? path.basename(process.cwd()),
      created: new Date(),
      version: "v2",
      labels: {},
      annotations: {},
      images: {},
    };

    try {
      const annotationsString = await fs.readFile(
        path.join(this._dir(projectID), "_annotations.json"),
        "utf-8"
      );
      // TODO: check version
      const { labels, annotations, images } = JSON.parse(annotationsString);
      project.labels = labels;
      project.annotations = annotations;
      project.images = images;
    } catch {
      // we don't care if there's no annotations file.
    }

    const files = await fs.readdir(this._dir(projectID));

    for (const f of files) {
      if (
        f.toLowerCase().endsWith(".jpg") ||
        f.toLowerCase().endsWith(".jpeg")
      ) {
        // Only add image if it's not already there.
        // TODO: We should update the date of the image maybe?
        if (project.images[f] === undefined) {
          project.images[f] = { id: f, date: "", annotations: [] };
        }
      }
    }

    return project;
  }

  async persist(annotations: any, options: Pick<IOptions, "projectID">) {
    const { projectID } = options;

    const output = path.join(this._dir(projectID), "_annotations.json");

    // TODO: This probably isn't safe:
    // "It is unsafe to call fsPromises.writeFile() multiple times on the same
    // file without waiting for the Promise to be resolved (or rejected)."
    await fs.writeFile(output, JSON.stringify(annotations), "utf-8");
  }

  async getImage(imageID: string, options: Pick<IOptions, "projectID">) {
    const { projectID } = options;

    const output = path.join(this._dir(projectID), imageID);

    const isLocked = await lockfile.check(output);
    if (!isLocked) {
      return fs.createReadStream(output);
    }

    throw new Error("file is locked");
  }

  async deleteImage(imageID: string, options: Pick<IOptions, "projectID">) {
    const { projectID } = options;
    const output = path.join(this._dir(projectID), imageID);
    await fs.unlink(output);
  }

  async saveImage(file: NodeJS.ReadableStream, options: IOptions) {
    const { projectID, name } = options;
    const output = path.join(this._dir(projectID), name);

    await fs.ensureFile(output);
    const release = await lockfile.lock(output);
    const writeStream = fs.createWriteStream(output);
    file.pipe(writeStream);
    return new Promise<void>((resolve, reject) => {
      writeStream.on("error", async (e) => {
        await release();
        reject(e);
      });
      writeStream.on("finish", async () => {
        await release();
        resolve();
      });
    });
  }
}

export default FileSystemProvider;
