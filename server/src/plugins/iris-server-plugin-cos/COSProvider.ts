/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import COS from "ibm-cos-sdk";

import { ProjectProvider, Options, ProjectDetails } from "../project-provider";

const connections = [
  {
    id: "718b4cc1-1c5d-400b-b056-08244db75225",
    providerID: "cos",
    name: "bee-travels",
    extra: {
      resource_instance_id:
        "crn:v1:bluemix:public:cloud-object-storage:global:a/9b13b857a32341b7167255de717172f5:718b4cc1-1c5d-400b-b056-08244db75225::",
    },
  },
  {
    id: "48b970b2-c8c8-4b4e-bb0c-85b6338cd295",
    providerID: "cos",
    name: "Cloud Object Storage-nick",
    extra: {
      resource_instance_id:
        "crn:v1:bluemix:public:cloud-object-storage:global:a/9b13b857a32341b7167255de717172f5:48b970b2-c8c8-4b4e-bb0c-85b6338cd295::",
    },
  },
];

function createClient({
  connectionID,
  accessToken,
}: {
  connectionID: string;
  accessToken: string;
}) {
  const connection = connections.find((c) => c.id === connectionID);

  return new COS.S3({
    endpoint: "https://s3.us.cloud-object-storage.appdomain.cloud",
    serviceInstanceId: connection?.extra.resource_instance_id,
    // @ts-ignore - undocumented api
    tokenManager: { getToken: () => ({ accessToken }) },
  });
}

class COSProvider implements ProjectProvider {
  async getConnections() {
    return Promise.resolve(connections);
  }

  async createProject(name: string, { connectionID, accessToken }: Options) {}

  async getProjects({ connectionID, accessToken }: Options) {
    const cosClient = createClient({ connectionID, accessToken });

    const list = await cosClient.listBucketsExtended().promise();

    if (list.Buckets === undefined) {
      return [];
    }

    return list.Buckets?.map((b) => ({
      id: b.Name!,
      name: b.Name!,
      created: b.CreationDate,
    }));
  }

  async getProject(projectID: string, { connectionID, accessToken }: Options) {
    const cosClient = createClient({ connectionID, accessToken });

    const project: ProjectDetails = {
      name: projectID,
      created: new Date(),
      version: "v2",
      labels: {},
      annotations: {},
      images: {},
    };

    try {
      // const res = await cosClient
      //   .getObject({ Bucket: projectID, Key: "_annotations.json" })
      //   .promise();
      // const annotationsString = res.Body?.toString() ?? "";
      // TODO: check version
      // const { labels, annotations, images } = JSON.parse(annotationsString);
      // project.labels = labels;
      // project.annotations = annotations;
      // project.images = images;
    } catch {
      // we don't care if there's no annotations file.
    }

    // TODO: paginate
    const objects = await cosClient
      .listObjectsV2({ Bucket: projectID })
      .promise();

    const files = (objects.Contents ?? []).map((o) => o.Key);

    for (const f of files) {
      if (
        f !== undefined &&
        (f.toLowerCase().endsWith(".jpg") || f.toLowerCase().endsWith(".jpeg"))
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

  async persist(
    projectID: string,
    annotations: any,
    { connectionID, accessToken }: Options
  ) {}

  async getImage(
    projectID: string,
    imageID: string,
    { connectionID, accessToken }: Options
  ) {
    const cosClient = createClient({ connectionID, accessToken });

    return await cosClient
      .getObject({
        Bucket: projectID,
        Key: imageID,
      })
      .createReadStream();
  }

  async deleteImage(
    projectID: string,
    imageID: string,
    { connectionID, accessToken }: Options
  ) {}

  async saveImage(
    projectID: string,
    file: { name: string; stream: NodeJS.ReadableStream },
    { connectionID, accessToken }: Options
  ) {}
}

export default COSProvider;
