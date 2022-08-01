/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import useSWR from "swr";

import { endpoint, fetcher } from "@iris/api";

import NotFound from "./NotFound";
import Project from "./Project";
import Projects from "./Projects";

const ProjectsMode: React.FC = () => {
  const { data: connections, error } = useSWR(
    endpoint("/connections"),
    fetcher
  );

  const { data: types } = useSWR(
    endpoint("/auth/grant-types", { baseUrl: "" }),
    fetcher
  );
  console.log(types);

  const connection = connections?.[0];

  return (
    <Switch>
      <Route path="/projects/:providerID/:connectionID" exact>
        <Projects connections={connections} />
      </Route>
      <Route path="/projects/:providerID/:connectionID/:projectID" exact>
        <Project />
      </Route>
      <Route path="/">
        {connection && !error ? (
          <Redirect
            to={`/projects/${connection.providerID}/${connection.id}`}
          />
        ) : null}
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
};

const SingleDocumentMode: React.FC = () => {
  return (
    <Switch>
      <Project />
    </Switch>
  );
};

const Router: React.FC = () => {
  const { data: mode, error } = useSWR(endpoint("/mode"), fetcher);

  if (mode && mode.singleDocument === false) {
    return <ProjectsMode />;
  }

  if (mode && mode.singleDocument === true) {
    return <SingleDocumentMode />;
  }

  if (error === undefined) {
    return <div>loading...</div>;
  }

  return null;
};

export default Router;
