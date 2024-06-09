import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { LngLatLike } from "mapbox-gl";

export interface AccidentWidgetState {
  flyToLocation: LngLatLike | undefined;
}

const initialState: AccidentWidgetState = {
  flyToLocation: undefined,
};

export const accidentWidgetSlice = createSlice({
  name: "accidentWidget",
  initialState,
  reducers: {
    updateFlyToLocation: (
      state: AccidentWidgetState,
      action: PayloadAction<LngLatLike | undefined>
    ) => {
      state.flyToLocation = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateFlyToLocation } = accidentWidgetSlice.actions;

export default accidentWidgetSlice.reducer;
