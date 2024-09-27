/*
 * Copyright (c) 2024.  Botts Innovative Research, Inc.
 * All Rights Reserved
 */

"use client";

import {Grid, Typography } from "@mui/material";
import { SelectedEvent } from "types/new-types";
import VideoGrid from "./VideoGrid";


export default function Media(props: {
  event: SelectedEvent;
  laneName: string
}) {


    return (
      <Grid container direction="row" spacing={2}>
        <Grid item xs>
            <Typography>Chart1</Typography>
        </Grid>
        <Grid item xs>
          <>
              <Typography>Chart1</Typography>
          </>
        </Grid>
        <Grid item xs>
          <VideoGrid laneName={props.laneName}/>
        </Grid>
      </Grid>


  );
}
