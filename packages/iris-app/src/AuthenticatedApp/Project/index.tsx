/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from "react";

import { Provider } from "react-redux";
import { useParams } from "react-router-dom";

import { store, load, useProjectStatus } from "@iris/core";

import Header from "./components/Header";
import Main from "./components/Main";
import ObjectDetection from "./editors/ObjectDetection";
import Layout from "./Layout";

function ProjectsView() {
  return (
    <Layout
      header={<Header />}
      main={
        <Main>
          <ObjectDetection />
        </Main>
      }
    />
  );
}

function ProjectController() {
  const status = useProjectStatus();

  switch (status) {
    case "idle":
    case "pending":
      return <div>LOADING...</div>;
    case "success":
    case "saving":
      return <ProjectsView />;
    default:
      return <div>ERROR</div>;
  }
}

function Project() {
  const { projectID, connectionID, providerID } =
    useParams<{
      providerID: string;
      connectionID: string;
      projectID: string;
    }>();

  useEffect(() => {
    store.dispatch(load({ projectID, connectionID, providerID }));
  }, [connectionID, projectID, providerID]);

  return (
    <Provider store={store}>
      <ProjectController />
    </Provider>
  );
}

export default Project;
