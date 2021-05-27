/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

interface IRegisterToolOptions {
  id: string;
  icon: any;
  displayName: string;
  displayNamePlural?: string;
  priority?: number;
  options?: IRegisterOptionOptions[];
  canvasPlugin?: any;
}

interface ITool {
  id: string;
  icon: any;
  priority: number;
  displayName: string;
  displayNamePlural?: string;
  options: IOptions;
  canvasPlugin: any;
}

interface ITools {
  register: (options: IRegisterToolOptions) => ITool;
  list: () => ITool[];
  get: (id: string) => ITool;
}

interface IRegisterOptionOptions {
  component: any;
  priority?: number;
}

interface IOption {
  component: any;
  priority: number;
}

interface IOptions {
  register: (options: IRegisterOptionOptions) => void;
  list: () => IOption[];
}

declare global {
  interface Window {
    FPS: number;
    MAX_IMAGE_WIDTH: number;
    MAX_IMAGE_HEIGHT: number;
    IMAGE_SCALE_MODE: "aspectFit" | "scaleFill";
    IRIS: {
      tools: ITools;
      store: any;
    };
  }
}

function init() {
  const _iris_internals: {
    tools: {
      [key: string]: IRegisterToolOptions;
    };
  } = {
    tools: {},
  };

  function registerTool(tool: IRegisterToolOptions) {
    _iris_internals.tools[tool.id] = tool;
    return getTool(tool.id);
  }

  function listTools() {
    const toolIDs = Object.keys(_iris_internals.tools);
    toolIDs.sort(
      (a, b) =>
        (_iris_internals.tools[b].priority ?? 0) -
        (_iris_internals.tools[a].priority ?? 0)
    );
    return toolIDs.map((id) => getTool(id));
  }

  function getTool(id: string) {
    const tool = _iris_internals.tools[id];

    function registerOption(option: IRegisterOptionOptions) {
      if (tool.options === undefined) {
        tool.options = [];
      }
      tool.options.push(option);
    }

    function listOptions() {
      const options = (tool.options ?? []).map((o) => {
        return {
          component: o.component,
          priority: o.priority ?? 0,
        };
      });
      options.sort((a, b) => b.priority - a.priority);
      return options;
    }

    return {
      ...tool,
      priority: tool.priority ?? 0,
      canvasPlugin: tool.canvasPlugin,
      options: {
        register: registerOption,
        list: listOptions,
      },
    };
  }

  window.MAX_IMAGE_WIDTH = 1500;
  window.MAX_IMAGE_HEIGHT = 1500;
  window.IMAGE_SCALE_MODE = "aspectFit";
  window.IRIS = {
    tools: {
      register: registerTool,
      list: listTools,
      get: getTool,
    },
    store: {},
  };
}

export default init;
