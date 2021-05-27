/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createAsyncThunk } from "@reduxjs/toolkit";

import { api } from "@iris/api";

export const load = createAsyncThunk("load", async (projectID: string) => {
  return await api.get("/project", {
    query: { projectID },
  });
});
