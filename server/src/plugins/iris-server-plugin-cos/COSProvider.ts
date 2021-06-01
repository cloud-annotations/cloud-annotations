/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import COS from "ibm-cos-sdk";

interface Options {
  projectID: string;
  connectionID: string;
  accessToken: string;
}

interface SaveImageOptions {
  name: string;
}

const connections = [
  {
    id: "718b4cc1-1c5d-400b-b056-08244db75225",
    providerID: "cos",
    name: "bee-travels",
    credentials: {
      resource_instance_id:
        "crn:v1:bluemix:public:cloud-object-storage:global:a/9b13b857a32341b7167255de717172f5:718b4cc1-1c5d-400b-b056-08244db75225::",
    },
  },
  {
    id: "48b970b2-c8c8-4b4e-bb0c-85b6338cd295",
    providerID: "cos",
    name: "Cloud Object Storage-nick",
    credentials: {
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
    serviceInstanceId: connection?.credentials.resource_instance_id,
    // @ts-ignore - undocumented api
    tokenManager: { getToken: () => ({ accessToken }) },
  });
}

class COSProvider {
  async getConnections() {
    return Promise.resolve(connections);
  }

  async getProjects({ connectionID, accessToken }: Omit<Options, "projectID">) {
    const cosClient = createClient({ connectionID, accessToken });

    const list = await cosClient.listBucketsExtended().promise();

    return list.Buckets?.map((b) => ({
      name: b.Name,
      modified: b.CreationDate,
      labels: [],
    }));
  }

  async getProject({ projectID, connectionID, accessToken }: Options) {
    const cosClient = createClient({ connectionID, accessToken });

    await cosClient.listBucketsExtended().promise();

    const project = {
      id: projectID,
      name: projectID,
      created: new Date(),
      version: "v2",
      labels: {},
      annotations: {},
      images: {},
    };

    try {
      const annotationsString = await cosClient
        .getObject({ Bucket: projectID, Key: "_annotations.json" })
        .promise();

      console.log(annotationsString);

      // TODO: check version
      // const { labels, annotations, images } = JSON.parse(annotationsString);
      // project.labels = labels;
      // project.annotations = annotations;
      // project.images = images;
    } catch {
      // we don't care if there's no annotations file.
    }

    return project;
  }

  async persist(
    annotations: any,
    { projectID, connectionID, accessToken }: Options
  ) {
    const cosClient = createClient({ connectionID, accessToken });
  }

  async getImage(
    imageID: string,
    { projectID, connectionID, accessToken }: Options
  ) {
    const cosClient = createClient({ connectionID, accessToken });
  }

  async deleteImage(
    imageID: string,
    { projectID, connectionID, accessToken }: Options
  ) {
    const cosClient = createClient({ connectionID, accessToken });
  }

  async saveImage(
    file: NodeJS.ReadableStream,
    { name, projectID, connectionID, accessToken }: Options & SaveImageOptions
  ) {
    const cosClient = createClient({ connectionID, accessToken });
  }
}

export default COSProvider;
