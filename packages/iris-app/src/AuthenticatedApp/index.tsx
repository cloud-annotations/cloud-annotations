import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import useSWR from "swr";

import { endpoint, fetcher } from "@iris/api";

import NotFound from "./NotFound";
import Project from "./Project";
import Projects from "./Projects";

function ProjectsMode() {
  const { data: connections, error } = useSWR(
    endpoint("/connections"),
    fetcher
  );

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
}

function SingleDocumentMode() {
  return (
    <Switch>
      <Project />
    </Switch>
  );
}

function Router() {
  const { data: mode, error } = useSWR(endpoint("/mode"), fetcher);

  if (mode && mode.singleDocument === false) {
    return <ProjectsMode />;
  }

  if (mode && mode.singleDocument === true) {
    return <SingleDocumentMode />;
  }

  if (error === undefined) {
    return "loading...";
  }

  return error;
}

export default Router;
