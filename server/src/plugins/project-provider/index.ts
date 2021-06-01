/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface Options {
  projectID: string;
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
  id?: string;
  name: string;
  created: Date;
  annotations: {
    version: string;
    labels: string[];
    annotations: {}; // TODO
    images: Image[];
  };
}

interface Image {
  id: string;
  date: string;
}

export interface ProjectProvider {
  getConnections(): Promise<Connection[]>;

  getProjects(o: Omit<Options, "projectID">): Promise<Project[]>;

  getProject(o: Options): Promise<void>;

  persist(annotations: any, o: Options): Promise<void>;

  getImage(imageID: string, o: Options): Promise<void>;

  deleteImage(imageID: string, o: Options): Promise<void>;

  saveImage(
    file: NodeJS.ReadableStream,
    o: { name: string } & Options
  ): Promise<void>;
}
