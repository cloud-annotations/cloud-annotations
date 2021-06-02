/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface Options {
  connectionID: string;
  accessToken: string;
}

export interface Connection {
  id: string;
  providerID: string;
  name: string;
  icon?: string;
  extra?: any;
}

interface Project {
  id: string;
  name: string;
  created?: Date;
  modified?: Date;
  opened?: Date;
  labels?: string[];
  images?: number;
}

export interface ProjectDetails {
  name: string;
  created: Date;
  version: string;
  labels: { [key: string]: Label };
  annotations: { [key: string]: Annotation };
  images: { [key: string]: Image };
}

interface Label {
  id: string;
  name: string;
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

interface Image {
  id: string;
  date: string;
  annotations: string[];
}

export interface ProjectProvider {
  getConnections(): Promise<Connection[]>;

  getProjects(o: Options): Promise<Project[]>;

  createProject(name: string, o: Options): Promise<void>;

  getProject(projectID: string, o: Options): Promise<ProjectDetails>;

  persist(projectID: string, annotations: any, o: Options): Promise<void>;

  getImage(
    projectID: string,
    imageID: string,
    o: Options
  ): Promise<NodeJS.ReadableStream>;

  deleteImage(projectID: string, imageID: string, o: Options): Promise<void>;

  saveImage(
    projectID: string,
    file: { stream: NodeJS.ReadableStream; name: string },
    o: Options
  ): Promise<void>;
}
