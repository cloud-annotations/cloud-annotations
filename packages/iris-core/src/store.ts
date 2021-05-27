import { configureStore } from "@reduxjs/toolkit";

import data from "./data";
import meta from "./meta";
import { persist } from "./persist";
import room from "./room";

const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persist),
  reducer: { data, meta, room },
  devTools: process.env.NODE_ENV !== "production",
});

export type ProjectState = ReturnType<typeof store.getState>;

export default store;
