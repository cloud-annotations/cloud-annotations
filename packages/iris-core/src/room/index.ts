import { createAction, createReducer } from "@reduxjs/toolkit";

export interface RoomState {
  headCount: number;
}

const initialState: RoomState = {
  headCount: 0,
};

export const SET_HEADCOUNT = createAction<number>("[room] Set head count");

const reducer = createReducer(initialState, (builder) => {
  builder.addCase(SET_HEADCOUNT, (state, { payload }) => {
    state.headCount = payload;
  });
});

export default reducer;
