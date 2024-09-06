"use client";

import { Stack, Typography } from '@mui/material';
import LaneStatusItem from '../_components/LaneStatusItem';
import React, {useEffect, useRef, useState} from 'react';
import Link from "next/link";
import {findInObject} from "@/app/utils/Utils";
import {Protocols} from "@/lib/data/Constants";
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource";
import {Mode} from "osh-js/source/core/datasource/Mode";
import {LaneStatusData} from "../../../types/new-types";
import {EventType} from "osh-js/source/core/event/EventType";

interface LaneStatusItem{
  id: number;
  laneName: string;
  status: string;
}

interface LaneStatusProps{
  laneStatusData?: LaneStatusData[]
}

function timeout(delay: number) {
  return new Promise( res => setTimeout(res, delay) );
}
export default function LaneStatus(props: LaneStatusProps) {
  const [statusBars, setStatus] = useState<LaneStatusItem[]>([]);
  const idVal = useRef(1);



  let server = `162.238.96.81:8781`;
  let alarmingStates = ['Alarm', 'Fault - Neutron High', 'Fault - Gamma Low', 'Fault - Gamma High', 'Tamper'];

  //generate swe api
  useEffect(() => {
    const datasources: any[] = [];

    if (props.laneStatusData && props.laneStatusData.length > 0) {

      props.laneStatusData.map((data) => {
        const gammaSource = new SweApi(data.laneData.name, {
          tls: false,
          protocol: Protocols.WS,
          mode: Mode.REAL_TIME,
          endpointUrl: `${server}/sensorhub/api`, //update to access ip and port from server
          resource: `/datastreams/${data.gammaDataStream[0].id}/observations`,
          connectorOpts: {
            username: 'admin',
            password: 'admin',
          },
        });
        gammaSource.connect();

        const neutronSource = new SweApi(data.laneData.name, {
          tls: false,
          protocol: Protocols.WS,
          mode: Mode.REAL_TIME,
          endpointUrl: `${server}/sensorhub/api`, //update to access ip and port from server
          resource: `/datastreams/${data.neutronDataStream[0].id}/observations`,
          connectorOpts: {
            username: 'admin',
            password: 'admin',
          },
        });
        neutronSource.connect();

        const tamperSource = new SweApi(data.laneData.name, {
          tls: false,
          protocol: Protocols.WS,
          mode: Mode.REAL_TIME,
          endpointUrl: `${server}/sensorhub/api`, //update to access ip and port from server
          resource: `/datastreams/${data.tamperDataStream[0].id}/observations`,
          connectorOpts: {
            username: 'admin',
            password: 'admin',
          },
        });
        tamperSource.connect();

        datasources.push(gammaSource, neutronSource, tamperSource);

        gammaSource.subscribe((message: any) => handleStatusData(data.laneData.name, 'alarmState', message), [EventType.DATA]);
        neutronSource.subscribe((message: any) => handleStatusData(data.laneData.name, 'alarmState', message), [EventType.DATA]);
        tamperSource.subscribe((message: any) => handleTamperData(data.laneData.name, 'tamperStatus', message), [EventType.DATA]);
      });

    }

    return () =>{
      datasources.forEach(source => source.disconnect());
    };

  }, [props.laneStatusData]);


  const handleStatusData = async (datasourceName: string, valueKey: string, message: any[]) => {
    // @ts-ignore
    const msgVal: any[] = message.values || [];
    let newStatuses: LaneStatusItem[] = [];

    msgVal.map((value) => {
      const state = findInObject(value, valueKey);
      // console.log('state:', state, ', name:', datasourceName)

      const newStatus: LaneStatusItem = {
        id: idVal.current++,
        laneName: datasourceName,
        status: alarmingStates.includes(state) ? state : 'Online'
      };
      newStatuses.push(newStatus);

    });
    await timeout(10000);

    //update the statuses with the previous statuses
    setStatus(prevStatus => [
      ...newStatuses,
      // ...prevStatus.filter(item => item.laneName !== datasourceName)]);
      ...prevStatus.filter(item => item.laneName !== datasourceName && !(alarmingStates.includes(item.status)))]);
  };

  const handleTamperData = async (datasourceName: string, valueKey: string, message: any[]) => {
    // @ts-ignore
    const msgVal: any[] = message.values || [];
    let tamperStatuses: LaneStatusItem[] = [];

    msgVal.map((value) => {
      const tamperState = findInObject(value, valueKey);
      console.log('tamper:', tamperState, ', name:', datasourceName)

      if(tamperState){
        const newStatus: LaneStatusItem ={
          id: idVal.current++,
          laneName: datasourceName,
          status: 'Tamper'
          // status: tamperState ? 'Tamper' : 'Online'
        };
        tamperStatuses.push(newStatus);
      }
    });

    setStatus(prevStatuses => [
      ...tamperStatuses,
      ...prevStatuses.filter(item => item.laneName !== datasourceName || item.status !== 'Tamper')
    ]);

  };

  return (
      <Stack padding={2} justifyContent={"start"} spacing={1}>
        <Typography variant="h6">Lane Status</Typography>
        <Stack spacing={1} sx={{ overflow: "auto", maxHeight: "100%" }}>
          {statusBars.map((item) => (
              <Link href={{
                pathname: '/lane-view',
                query: {
                  //todo update id for page
                  id: 'id',
                }
              }}
                    passHref
                    key={item.id}>
                <LaneStatusItem key={item.id} id={item.id} name={item.laneName} status={item.status} />
              </Link>
          ))}
        </Stack>
      </Stack>
  );
}