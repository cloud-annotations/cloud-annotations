/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import COS from "ibm-cos-sdk";

interface IOptions {
  name: string;
  projectID?: string;
}

const connections = [
  {
    id: "718b4cc1-1c5d-400b-b056-08244db75225",
    providerID: "cos",
    name: "bee-travels",
    credentials: {
      apikey: "Fczphmlve6ANRIrTKNgiEHVex29FFCdw2lv8g67XWqhO",
      resource_instance_id:
        "crn:v1:bluemix:public:cloud-object-storage:global:a/9b13b857a32341b7167255de717172f5:718b4cc1-1c5d-400b-b056-08244db75225::",
    },
  },
  {
    id: "48b970b2-c8c8-4b4e-bb0c-85b6338cd295",
    providerID: "cos",
    name: "Cloud Object Storage-nick",
    credentials: {
      apikey: "aSz22rBc1hZEnw-EwtsOyFvXz1fmWAl6iAJtr9X4JMF0",
      resource_instance_id:
        "crn:v1:bluemix:public:cloud-object-storage:global:a/9b13b857a32341b7167255de717172f5:48b970b2-c8c8-4b4e-bb0c-85b6338cd295::",
    },
  },
];

class COSProvider {
  async getConnections() {
    return Promise.resolve(connections);
  }

  async getProjects({ connectionID }: { connectionID: string }) {
    const connection = connections.find((c) => c.id === connectionID);
    const config = {
      endpoint: "https://s3.us.cloud-object-storage.appdomain.cloud",
      apiKeyId: connection?.credentials.apikey,
      ibmAuthEndpoint: "https://iam.cloud.ibm.com/identity/token",
      serviceInstanceId: connection?.credentials.resource_instance_id,
    };

    const cosClient = new COS.S3(config);
    const list = await cosClient.listBucketsExtended().promise();
    return list.Buckets?.map((b) => ({
      name: b.Name,
      modified: b.CreationDate, // TODO: this should be created
    }));
  }

  async getProject(options: Pick<IOptions, "projectID">) {}

  async persist(annotations: any, options: Pick<IOptions, "projectID">) {}

  async getImage(imageID: string, options: Pick<IOptions, "projectID">) {}

  async deleteImage(imageID: string, options: Pick<IOptions, "projectID">) {}

  async saveImage(file: NodeJS.ReadableStream, options: IOptions) {}
}

export default COSProvider;
