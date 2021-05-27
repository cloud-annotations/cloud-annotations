/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface DataState {
  labels: {
    data: { [key: string]: Project.Label };
    active: string | undefined;
  };

  images: {
    data: { [key: string]: Project.Image };
    active: string | undefined;
    filter: {
      mode?: "unlabeled" | "labeled" | "byLabel";
      label?: string;
    };
    selection: string[];
  };

  annotations: {
    data: { [key: string]: Project.AnnotationWithID };
  };

  tool: {
    active: string;
  };
}

export namespace Project {
  export interface Label {
    id: string;
    name: string;
  }

  export interface Image {
    id: string;
    status: "idle" | "pending" | "success" | "error";
    date: string;
    annotations: string[];
  }

  export interface ResolvedImage extends Image {
    resolvedAnnotations: AnnotationWithID[];
  }

  export interface Annotation {
    label: string;
    tool: string;
    targets?: Target[];
    [key: string]: any; // plugins can specify extra keys.
  }

  export interface AnnotationWithID extends Annotation {
    id: string;
  }

  export interface Target {
    id: string;
    x: number;
    y: number;
  }
}
