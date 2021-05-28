/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useEffect, useState } from "react";

import { useDispatch } from "react-redux";

import { SELECT_TOOL, useActiveTool } from "@iris/core";

import classes from "./styles.module.css";

function useControlToggleTool(toolToUseWhenCtrlIsPressed: string) {
  const dispatch = useDispatch();

  const tool = useActiveTool();
  const [lastTool, setLastTool] = useState<string | undefined>();

  const restoreTool = useCallback(() => {
    if (lastTool !== undefined) {
      dispatch(SELECT_TOOL(lastTool));
      setLastTool(undefined);
    }
  }, [dispatch, lastTool]);

  const selectCtrlTool = useCallback(() => {
    setLastTool(tool);
    dispatch(SELECT_TOOL(toolToUseWhenCtrlIsPressed));
  }, [dispatch, tool, toolToUseWhenCtrlIsPressed]);

  const handleKeyDown = useCallback(
    (e) => {
      if (document.activeElement?.tagName.toLowerCase() === "input") {
        restoreTool();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        selectCtrlTool();
        return;
      }

      restoreTool();
    },
    [restoreTool, selectCtrlTool]
  );

  const handleKeyUp = useCallback(() => {
    restoreTool();
  }, [restoreTool]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    document.addEventListener("msvisibilitychange", handleKeyUp);
    document.addEventListener("webkitvisibilitychange", handleKeyUp);
    document.addEventListener("visibilitychange", handleKeyUp);
    window.addEventListener("blur", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);

      document.removeEventListener("msvisibilitychange", handleKeyUp);
      document.removeEventListener("webkitvisibilitychange", handleKeyUp);
      document.removeEventListener("visibilitychange", handleKeyUp);
      window.removeEventListener("blur", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
}

function ToolsPanel() {
  const dispatch = useDispatch();

  const tool = useActiveTool();

  useControlToggleTool("move");

  return (
    <div className={classes.wrapper}>
      {window.IRIS.tools.list().map((t) => (
        <div
          key={t.id}
          onClick={() => dispatch(SELECT_TOOL(t.id))}
          className={tool === t.id ? classes.toolActive : classes.tool}
        >
          {t.icon}
        </div>
      ))}
    </div>
  );
}

export default ToolsPanel;
