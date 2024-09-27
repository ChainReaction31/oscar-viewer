"use client";

import {LaneStatusType, SelectedEventOcc} from "types/new-types";
import {Box, speedDialActionClasses, Table, TableBody, TableCell, TableContainer, TableRow} from "@mui/material";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {DataSourceContext} from "@/app/contexts/DataSourceContext";
import {LaneDSColl} from "@/lib/data/oscar/LaneCollection";
import {useSearchParams} from "next/navigation";

export default function MiscTable(props: {
  event: SelectedEventOcc;
}) {


  const {laneMapRef} = useContext(DataSourceContext);
  const [dataSourcesByLane, setDataSourcesByLane] = useState<Map<string, LaneDSColl>>(new Map<string, LaneDSColl>());

  const [speed, setSpeed] = useState(0);
  const [dailyOccupancy, setDailyOccupancy] = useState(0);
  // const [maxGammaCps, setMaxGammaCps] = useState(0);
  // const [maxNeutronCps, setMaxNeutronCps] = useState(0);
  // const [countRate, setCountRate] = useState(0);
  // const [neutronBkg, setNeutronBkg] = useState(0);


  const datasourceSetup = useCallback(async () => {
    // @ts-ignore
    let laneDSMap = new Map<string, LaneDSColl>();

    for (let [laneid, lane] of laneMapRef.current.entries()) {
      laneDSMap.set(laneid, new LaneDSColl());
      for (let ds of lane.datastreams) {

        let idx: number = lane.datastreams.indexOf(ds);
        let rtDS = lane.datasourcesRealtime[idx];
        let laneDSColl = laneDSMap.get(laneid);

        if (ds.properties.name.includes('Driver - Occupancy')) {
          laneDSColl.addDS('occupancyRT', rtDS);
        }

        if (ds.properties.name.includes('Driver - Neutron Count')) {
          laneDSColl.addDS('neutronRT', rtDS);
        }

        if (ds.properties.name.includes('Driver - Speed')) {
          laneDSColl.addDS('speedRT', rtDS);
        }
      }
      setDataSourcesByLane(laneDSMap);
    }

  }, [laneMapRef.current]);

  useEffect(() => {
    datasourceSetup();
  }, [laneMapRef.current]);



  const addSubscriptionCallbacks = useCallback(() => {
    for (let [laneName, laneDSColl] of dataSourcesByLane.entries()) {

      laneDSColl.addSubscribeHandlerToALLDSMatchingName('speedRT', (message: any) => {
        let speedKph = message.values[0].data.speedKPH;
        console.log('speed',speedKph)
        if(props.event.laneId === laneName){
          setSpeed(speedKph);
        }

      });

      laneDSColl.connectAllDS();
    }
  }, [dataSourcesByLane]);

  useEffect(() => {
    addSubscriptionCallbacks();
  }, [dataSourcesByLane]);



  return (
    <Box>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableBody>
            <TableRow>
              <TableCell>Count Rate</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Neutron Background Count Rate</TableCell>
              <TableCell>{props.event.neutronBkg}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Max Neutron Count Rate (cps)</TableCell>
              <TableCell>{props.event.maxNeutron}</TableCell>
              <TableCell>Speed (kph)</TableCell>
              <TableCell>{speed}</TableCell>
            </TableRow>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell>Max Gamma Count Rate (cps)</TableCell>
              <TableCell>{props.event.maxGamma}</TableCell>
              <TableCell>Daily Occupancy</TableCell>
              <TableCell>{dailyOccupancy}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}