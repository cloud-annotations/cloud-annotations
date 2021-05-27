/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import { useParams } from "react-router-dom";
import useSWR from "swr";

import { endpoint, fetcher } from "@iris/api";

import Connections from "./Connections";
import Header from "./Header";
import Layout from "./Layout";
import Main from "./Main";

interface ProjectProps {
  name: string;
  projects: any[];
  connections: any[];
}

function ProjectsView({ name, projects, connections }: ProjectProps) {
  return (
    <Layout
      header={<Header />}
      left={<Connections connections={connections} />}
      main={<Main projects={projects} name={name} />}
    />
  );
}

function ProjectsController({ connections }: { connections: any[] }) {
  const params = useParams<any>();

  const connection = connections?.find((c) => c.id === params.connectionID);

  const { data: projects } = useSWR(
    connection
      ? endpoint("/projects", {
          query: {
            providerID: connection.providerID,
            connectionID: connection.id,
          },
        })
      : null,
    fetcher
  );

  if (!connections) {
    return <div>LOADING...</div>;
  }

  return (
    <ProjectsView
      name={connection.name}
      projects={projects ?? []}
      connections={connections}
    />
  );
}

export default ProjectsController;
