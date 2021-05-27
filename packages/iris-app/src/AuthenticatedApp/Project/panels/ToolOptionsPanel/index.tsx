import React from "react";

import { useActiveTool } from "@iris/core";

import classes from "./styles.module.css";

function ToolOptionsPanel() {
  const tool = useActiveTool();

  return (
    <div className={classes.wrapper}>
      <div className={classes.divider} />
      {window.IRIS.tools
        .get(tool)
        .options.list()
        .map((option, i) => {
          return (
            <React.Fragment key={i}>
              {option.component}
              <div className={classes.divider} />
            </React.Fragment>
          );
        })}
    </div>
  );
}

export default ToolOptionsPanel;
