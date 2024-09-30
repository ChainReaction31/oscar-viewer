"use client";

import {Grid, Paper, Stack, Typography} from "@mui/material";
import {useContext, useEffect, useRef, useState} from "react";
import {SelectedEvent} from "types/new-types";
import BackButton from "../_components/BackButton";
import DataRow from "./DataRow";
import Media from "./Media";
import MiscTable from "./MiscTable";
import Comment from "./Comment";
import AddComment from "./AddComment";
import {useSelector} from "react-redux";
import {RootState} from "@/lib/state/Store";
import {selectEventPreview} from "@/lib/state/OSCARClientSlice";
import {DataSourceContext} from "@/app/contexts/DataSourceContext";
import LaneVideoPlayback from "@/app/_components/event-preview/LaneVideoPlayback";
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource";
import DataSynchronizer from "osh-js/source/core/timesync/DataSynchronizer";

/**
 * Expects the following search params:
 * startTime: string;
 * endTime: string;
 *
 * Need to implement an error page to handle invalid/no search params
 */

const testData = {
    id: '1',
    secondaryInspection: false,
    laneId: '1',
    occupancyId: '1',
    startTime: 'XX:XX:XX AM',
    endTime: 'XX:XX:XX AM',
    maxGamma: 25642,
    status: 'Gamma',
}

export default function EventDetailsPage() {
    const laneMapRef = useContext(DataSourceContext).laneMapRef;
    const eventPreview = useSelector(selectEventPreview);
    const syncRef = useRef<typeof DataSynchronizer>();
    const [currentTime, setCurrentTime] = useState<string>("");

    // Video
    const [videoDatasources, setVideoDatasources] = useState<typeof SweApi[]>([]);
    const [activeVideoIDX, setActiveVideoIDX] = useState<number>(0);
    const [videoReady, setVideoReady] = useState<boolean>(false);

    const [selectedEvent, setSelectedEvent] = useState<SelectedEvent>({
        startTime: "XX:XX:XX AM",
        endTime: "XX:XX:XX AM"
    });  // Reference types/new-types.d.ts to change type
    const alertDetails = useSelector((state: RootState) => selectEventPreview(state));

    useEffect(() => {
        setCurrentTime(eventPreview.eventData.startTime);
        // currentTime.current = eventPreview.eventData.startTime;
        console.log("Current Time: ", currentTime);
    }, [eventPreview]);

    return (
        <Stack spacing={2} direction={"column"}>
            <Grid item spacing={2}>
                <BackButton/>
            </Grid>

            <Grid item spacing={2}>
                <Typography variant="h5">Event Details</Typography>
            </Grid>
            <Grid item container spacing={2} sx={{width: "100%"}}>
                <Paper variant='outlined' sx={{width: "100%"}}>
                    <DataRow/>
                </Paper>
            </Grid>

            <Grid item container spacing={2} sx={{width: "100%"}}>
                <Paper variant='outlined' sx={{width: "100%"}}>
                    {/*<Media event={selectedEvent}/>*/}
                    <LaneVideoPlayback videoDatasources={videoDatasources} setVideoReady={setVideoReady}
                                       dataSynchronizer={syncRef.current}
                                       addDataSource={setActiveVideoIDX}/>
                </Paper>
            </Grid>

            <Grid item container spacing={2} sx={{ width: "100%" }}>
              <Paper variant='outlined' sx={{ width: "100%" }}>
                <MiscTable currentTime={currentTime} />
              </Paper>
            </Grid>

            <Grid item container spacing={2} sx={{width: "100%"}}>
                <Paper variant='outlined' sx={{width: "100%"}}>
                    <Comment event={selectedEvent}/>
                </Paper>
            </Grid>

            <Grid item container spacing={2} sx={{width: "100%"}}>
                <Paper variant='outlined' sx={{width: "100%"}}>
                    <AddComment event={selectedEvent}/>
                </Paper>
            </Grid>

        </Stack>
    );
}
