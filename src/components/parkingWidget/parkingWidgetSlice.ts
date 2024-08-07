import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { LngLatLike } from 'mapbox-gl';

export interface ParkingWidgetState {
    flyToLocation: LngLatLike | undefined;
}

const initialState: ParkingWidgetState = {
    flyToLocation: undefined,
};

export const parkingWidgetSlice = createSlice({
    name: 'parkingWidget',
    initialState,
    reducers: {
        updateFlyToLocation: (state: ParkingWidgetState, action: PayloadAction<LngLatLike | undefined>) => {
            state.flyToLocation = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { updateFlyToLocation } = parkingWidgetSlice.actions;

export default parkingWidgetSlice.reducer;
