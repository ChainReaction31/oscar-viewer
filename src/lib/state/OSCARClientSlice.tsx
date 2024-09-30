import {createSelector, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {enableMapSet} from "immer";
import {LaneMapEntry, LaneMeta} from "@/lib/data/oscar/LaneCollection";
import {RootState} from "@/lib/state/Store";
import {selectDatastreams, selectSystems} from "@/lib/state/OSHSlice";
import {EventTableData} from "@/lib/data/oscar/TableHelpers";

enableMapSet();

export interface IOSCARClientState {
    currentUser: string,
    quickActions: [],
    eventPreview: {
        isOpen: boolean,
        eventData: EventTableData | null,
    },
    // This should move to a separate slice
    lanes: LaneMeta[],
    alertTimeoutSeconds: number,
    laneMap: Map<string, LaneMapEntry>,
    shouldForceAlarmTableDeselect: boolean,
}

const initialState: IOSCARClientState = {
    currentUser: 'testuser',
    quickActions: [],
    eventPreview: {
        isOpen: false,
        eventData: null,
    },
    lanes: [],
    alertTimeoutSeconds: 10,
    laneMap: new Map<string, LaneMapEntry>(),
    shouldForceAlarmTableDeselect: false,
}


export const Slice = createSlice({
    name: 'ClientStateSlice',
    initialState,
    reducers: {
        setCurrentUser: (state, action: PayloadAction<string>) => {
            state.currentUser = action.payload;
        },
        setQuickActions: (state, action: PayloadAction<[]>) => {
            state.quickActions = action.payload;
        },
        setEventPreview: (state, action: PayloadAction<{
            isOpen: boolean,
            eventData: EventTableData | null,
        }>) => {
            console.log("Setting alert details: ", action.payload);
            state.eventPreview = action.payload;
        },
        setLanes: (state, action: PayloadAction<LaneMeta[]>) => {
            state.lanes = action.payload;
        },
        toggleEventPreviewOpen: (state) => {
            state.eventPreview.isOpen = !state.eventPreview.isOpen;
        },
        setEventPreviewData: (state, action: PayloadAction<EventTableData>) => {
            state.eventPreview.eventData = action.payload;
        },
        setAlertTimeoutSeconds: (state, action: PayloadAction<number>) => {
            state.alertTimeoutSeconds = action.payload;
        },
        setLaneMap: (state, action: PayloadAction<Map<string, LaneMapEntry>>) => {
            state.laneMap = action.payload;
        },
        setShouldForceAlarmTableDeselect: (state, action: PayloadAction<boolean>) => {
            console.log(`Setting shouldForceAlarmTableDeselect to ${action.payload}`);
            state.shouldForceAlarmTableDeselect = action.payload;
        },
        toggleShouldForceAlarmTableDeselect: (state) => {
            state.shouldForceAlarmTableDeselect = !state.shouldForceAlarmTableDeselect;
        }
    }
})

export const {
    setCurrentUser,
    setQuickActions,
    setEventPreview,
    setLanes,
    toggleEventPreviewOpen,
    setEventPreviewData,
    setAlertTimeoutSeconds,
    setLaneMap,
    setShouldForceAlarmTableDeselect,
    toggleShouldForceAlarmTableDeselect
} = Slice.actions;

export const selectLanes = (state: RootState) => state.oscarClientSlice.lanes;
export const selectEventPreview = (state: RootState) => state.oscarClientSlice.eventPreview;
export const selectLaneMap = (state: RootState) => state.oscarClientSlice.laneMap;


export default Slice.reducer;
