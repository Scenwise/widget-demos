import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AccidentWidgetState {
    selectedAccidentID: string;
}

const initialState: AccidentWidgetState = {
    selectedAccidentID: '',
};

export const accidentWidgetSlice = createSlice({
    name: 'accidentWidget',
    initialState,
    reducers: {
        updateSelectedAccidentID: (state: AccidentWidgetState, action: PayloadAction<string>) => {
            state.selectedAccidentID = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { updateSelectedAccidentID } = accidentWidgetSlice.actions;

export default accidentWidgetSlice.reducer;
