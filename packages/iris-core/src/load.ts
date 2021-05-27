import { createAsyncThunk } from "@reduxjs/toolkit";

import { api } from "@iris/api";

export const load = createAsyncThunk("load", async (projectID: string) => {
  return await api.get("/project", {
    query: { projectID },
  });
});
