"use client";

import {Grid} from "@mui/material";
import {SelectedEventOcc} from "types/new-types";
import VideoGrid from "../_components/VideoGrid";
import Chart from "./Chart";


export default function Media(props: {
  event: SelectedEventOcc;
}) {

    return (
      <Grid container direction="row" spacing={2}>
        <Grid item xs>
          <Chart currentLane={props.event}/>
        </Grid>
        <Grid item xs>

        </Grid>
        <Grid item xs>
            <VideoGrid laneName={props.event.laneId}/>
        </Grid>
      </Grid>
  );
}
