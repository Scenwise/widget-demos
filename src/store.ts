import { configureStore } from '@reduxjs/toolkit';
import parkingWidgetSlice from './components/parkingWidget/parkingWidgetSlice';
import accidentsWidgetSlice from './components/riskmap/accidentsWidgetSlice';
import vehicleSlice from './components/publicTransport/VehicleSlice';

export const store = configureStore({
  reducer: {
    parkingWidget: parkingWidgetSlice,
    accidentsWidget: accidentsWidgetSlice,
    publicTransport: vehicleSlice
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
