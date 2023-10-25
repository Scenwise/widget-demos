import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { LngLatLike } from 'mapbox-gl';

export interface VehicleState {
  flyToLocation: LngLatLike | undefined;
}

const initialState: VehicleState = {
  flyToLocation: undefined,
};

export const vehicleSlice = createSlice({
  name: 'publicTransport',
  initialState,
  reducers: {
    updateFlyToLocation: (
      state: VehicleState,
      action: PayloadAction<LngLatLike | undefined>,
    ) => {
      state.flyToLocation = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateFlyToLocation } = vehicleSlice.actions;

export default vehicleSlice.reducer;