import { createSlice, SerializedError } from "@reduxjs/toolkit";

import { load } from "../load";

export interface MetaState {
  status: "idle" | "pending" | "success" | "error";
  saving: number;
  id?: string;
  name?: string;
  created?: string;
  error?: SerializedError;
}

const initialState: MetaState = {
  status: "idle",
  saving: 0,
  id: undefined,
  name: undefined,
  created: undefined,
  error: undefined,
};

const slice = createSlice({
  name: "metadata",
  initialState,
  reducers: {
    incrementSaving: (state) => {
      state.saving += 1;
    },
    decrementSaving: (state) => {
      state.saving -= 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(load.pending, (state, _action) => {
      state.status = "pending";
    });
    builder.addCase(load.fulfilled, (state, action) => {
      state.status = "success";
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.created = action.payload.created;
    });
    builder.addCase(load.rejected, (state, action) => {
      state.status = "error";
      state.error = action.error;
    });
  },
});

export default slice.reducer;
export const { incrementSaving, decrementSaving } = slice.actions;
