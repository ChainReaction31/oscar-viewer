 "use client";

import { Grid, Pagination, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import "../style/cameragrid.css";
import { Datastream } from '@/lib/data/osh/Datastreams';
import { useSelector } from 'react-redux';
import { LaneDSColl, LaneMapEntry, LaneMeta } from '@/lib/data/oscar/LaneCollection';
import CameraGridVideo from '../_components/video/VideoComponent';
import { selectDatastreams } from '@/lib/state/OSHSlice';
import { selectLaneMap, selectLanes } from '@/lib/state/OSCARClientSlice';
import { RootState } from '@/lib/state/Store';
import VideoComponent from '../_components/video/VideoComponent';
import VideoStatusWrapper from '../_components/video/VideoStatusWrapper';
import {EventType} from 'osh-js/source/core/event/EventType';
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource"
import { Protocols } from "@/lib/data/Constants";
import {Mode} from 'osh-js/source/core/datasource/Mode';
import {DataSourceContext} from '../contexts/DataSourceContext';


interface LaneWithVideo {
  laneName: string,
  videoSources: typeof SweApi[],
  status: string,
}

/* TODO
If lane has multiple videostreams, just use one or 
implement ability to switch between videostreams
*/
export default function CameraGrid() {
  const lanes: LaneMeta[] = useSelector(selectLanes);
  const [videoList, setVideoList] = useState<LaneWithVideo[] | null>(null);

  // Create and connect alarm statuses
  const {laneMapRef} = useContext(DataSourceContext);
  const laneMap = useSelector((state: RootState) => selectLaneMap(state));

  const [dataSourcesByLane, setDataSourcesByLane] = useState<Map<string, LaneDSColl>>(new Map<string, LaneDSColl>());

  // Create and connect videostreams
  useEffect(() => {

    if(videoList == null || videoList.length == 0 && laneMap.size > 0) {
      let videos: LaneWithVideo[] = []

      laneMap.forEach((value, key) =>{
        if(laneMap.has(key)){
            let ds: LaneMapEntry = laneMap.get(key);
            const videoSources = ds.datasourcesBatch.filter((item) => item.name.includes('Video') && item.name.includes('Lane'));
            console.log(videoSources);
            const laneWithVideo: LaneWithVideo = {
              laneName: videoSources[0].name,
              videoSources: videoSources,
              status: 'none',
            };

            videos.push(laneWithVideo);
        }
      })

      console.log(videos);
      setVideoList(videos);
    }
  }, [laneMap]);


  const datasourceSetup = useCallback(async () => {

    let laneDSMap = new Map<string, LaneDSColl>();

    for (let [laneid, lane] of laneMapRef.current.entries()) {
      laneDSMap.set(laneid, new LaneDSColl());
      for (let ds of lane.datastreams) {

        let idx: number = lane.datastreams.indexOf(ds);
        let rtDS = lane.datasourcesRealtime[idx];
        let laneDSColl = laneDSMap.get(laneid);

        if (ds.properties.name.includes('Driver - Gamma Count')) {
          laneDSColl.addDS('gammaRT', rtDS);
        }

        if (ds.properties.name.includes('Driver - Neutron Count')) {
          laneDSColl.addDS('neutronRT', rtDS);
        }

        // if (ds.properties.name.includes('Video')) {
        //   laneDSColl.addDS('videoRT', rtDS);
        // }

        if (ds.properties.name.includes('Driver - Tamper')) {
          laneDSColl.addDS('tamperRT', rtDS);
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
      laneDSColl.addSubscribeHandlerToALLDSMatchingName('gammaRT', (message: any) => {updateVideoList(laneName, message)});
      laneDSColl.addSubscribeHandlerToALLDSMatchingName('neutronRT', (message: any) => {updateVideoList(laneName, message)});
      laneDSColl.addSubscribeHandlerToALLDSMatchingName('tamperRT', (message: any) => {updateVideoList(laneName, message)});

      laneDSColl.connectAllDS();
    }
  }, [dataSourcesByLane]);


  useEffect(() => {
    addSubscriptionCallbacks();
  }, [dataSourcesByLane]);

  const updateVideoList = (laneName: string, newStatus: string) => {
    setVideoList((prevList) => {
      const updatedList = prevList.map((videoData) => 
        videoData.laneName === laneName ? {...videoData, status: newStatus } : videoData
      );

      const updatedVideo = updatedList.find((videoData) => videoData.laneName === laneName);

      if(newStatus !== 'Background' && newStatus !== 'Scan') {
        // Get timeout from config
        setTimeout(() => updateVideoList(laneName, "none"), 10000);
        const filteredVideos = updatedList.filter((videoData) => videoData.laneName !== laneName);
        return [updatedVideo, ...filteredVideos];
      }

      return updatedList;
    })
  };

  // TODO: Create swe api objects and pass to children

  // DELETE ABOVE ON PRODUCTION

  const maxItems = 6; // Max number of videos per page
  const [page, setPage] = useState(1);  // Page currently selected
  const [startItem, setStartItem] = useState(0);  // Current start of range
  const [endItem, setEndItem] = useState(6); // Current end of range

  // Handle page value change
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    setStartItem(maxItems * (value - 1)); // Set startItem
    setEndItem(maxItems * (value - 1) + maxItems); // Set endItem to offset by maxItems
  };

  return (
    <>
    {videoList != null && (
      <Grid container padding={2} justifyContent={"start"}>
        {videoList.slice(startItem, endItem).map((lane) => (
          <VideoStatusWrapper key={lane.laneName} laneName={lane.laneName} status={lane.status} 
          children={<VideoComponent id={lane.laneName} videoSources={lane.videoSources}/>}>
          </VideoStatusWrapper>
        ))}
      <Grid item xs={12} display={"flex"} justifyContent={"center"}>
        <Pagination count={Math.ceil(videoList.length / maxItems)} onChange={handleChange} color="primary" showFirstButton showLastButton />
      </Grid>
    </Grid>)}
    </>
  );
}