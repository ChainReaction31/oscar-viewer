"use client";

import {Checkbox, FormControlLabel, Grid, Paper, Stack, Typography} from "@mui/material";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {SelectedEventOcc} from "types/new-types";
import BackButton from "../_components/BackButton";
import DataRow from "./DataRow";
import Media from "./Media";
import MiscTable from "./MiscTable";
import CommentSection from "./CommentSection";
import AddComment from "./AddComment";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/lib/state/Store";
import {selectEventPreview} from "@/lib/state/OSCARClientSlice";
import {useSearchParams} from "next/navigation";
import {LaneDSColl} from "@/lib/data/oscar/LaneCollection";
import {DataSourceContext} from "@/app/contexts/DataSourceContext";
import DataStream from "osh-js/source/core/sweapi/datastream/DataStream.js";
import ObservationFilter from "osh-js/source/core/sweapi/observation/ObservationFilter";

export default function EventDetailsPage() {
    const searchParams = useSearchParams();
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");


    const {laneMapRef} = useContext(DataSourceContext);
    const [dataSourcesByLane, setDataSourcesByLane] = useState<Map<string, LaneDSColl>>(new Map<string, LaneDSColl>());


    const [selectedEvent, setSelectedEvent] = useState<SelectedEventOcc>({startTime: "XX:XX:XX AM", endTime: "XX:XX:XX AM", occupancyId: '', laneId: '', maxGamma: 0, status: '', maxNeutron: 0, neutronBkg: 0.0});
    const alertDetails = useSelector((state: RootState) => selectEventPreview(state));

    const datasourceSetup = useCallback(async () => {
        let laneDSMap = new Map<string, LaneDSColl>();
        // check for occupancy "Driver -Occupancy"
        for (let [laneid, lane] of laneMapRef.current.entries()) {
            laneDSMap.set(laneid, new LaneDSColl());
            for (let ds of lane.datastreams) {

                let idx: number = lane.datastreams.indexOf(ds);
                let batchDS = lane.datasourcesBatch[idx];

                let laneDSColl = laneDSMap.get(laneid);

                batchDS.properties.startTime = ds.properties.validTime[0];
                batchDS.properties.endTime = "now";

                if (ds.properties.name.includes('Driver - Occupancy')) {
                    await fetchObservations(laneid, ds, startTime, endTime );
                    laneDSColl.addDS('occBatch', batchDS);
                }

            }
            setDataSourcesByLane(laneDSMap);
        }
    }, [laneMapRef.current]);


    useEffect(() => {
        datasourceSetup();
    }, [laneMapRef.current]);

    async function fetchObservations(laneName: string, ds: typeof DataStream, timeStart: string, timeEnd: string){
        let allResults: any[] = [];

        let initial = await ds.searchObservations(new ObservationFilter({resultTime: `${timeStart}/${timeEnd}`}), 25000)
        while (initial.hasNext()){
            let obsRes = await initial.nextPage();
            allResults.push(...obsRes);

            obsRes.map((obs: any) => {
                console.log('obs', obs)
                updateSelectedEvent(laneName, obs.result)
            })
        }
    }

    function updateSelectedEvent(laneName: string, resultMsg: any){
        setSelectedEvent({
            occupancyId: resultMsg.occupancyCount,
            laneId: laneName,
            startTime: resultMsg.startTime,
            endTime: resultMsg.endTime,
            maxGamma: resultMsg.maxGamma,
            maxNeutron: resultMsg.maxNeutron,
            status: resultMsg.gammaAlarm && resultMsg.neutronAlarm ? 'Gamma & Neutron' : !resultMsg.gammaAlarm && resultMsg.neutronAlarm ? 'Neutron' : !resultMsg.neutronAlarm && resultMsg.gammaAlarm ? 'Gamma' : 'None',
            neutronBkg: resultMsg.neutronBackground
        })
    }



  return (
    <Stack spacing={2} direction={"column"}>
      <Grid item spacing={2}>
        <BackButton />
      </Grid>
      <Grid item spacing={2}>
        <Typography variant="h5">Event Details</Typography>
      </Grid>
      <Grid item container spacing={2} sx={{ width: "100%" }}>
        <Paper variant='outlined' sx={{ width: "100%" }}>
          <DataRow />
        </Paper>
      </Grid>
      <Grid item container spacing={2} sx={{ width: "100%" }}>
        <Paper variant='outlined' sx={{ width: "100%" }}>
        <Media event={selectedEvent} />
        </Paper>
      </Grid>
      <Grid item container spacing={2} sx={{ width: "100%" }}>
        <Paper variant='outlined' sx={{ width: "100%" }}>
          <MiscTable event={selectedEvent}/>
        </Paper>
      </Grid>
      <Grid item container spacing={2} sx={{ width: "100%" }}>
          <Paper variant='outlined' sx={{ width: "100%" }}>
              <AddComment event={selectedEvent} />
          </Paper>
      </Grid>
    </Stack>
  );
}
