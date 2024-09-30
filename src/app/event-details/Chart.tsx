"use client"



import ChartTimeHighlight from "@/app/_components/event-preview/ChartTimeHighlight";
import {useCallback, useContext, useEffect, useState} from "react";
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource";
import {LaneMapEntry} from "@/lib/data/oscar/LaneCollection";
import {DataSourceContext} from "@/app/contexts/DataSourceContext";
import {SelectedEventOcc} from "../../../types/new-types";
import ChartHighlight from "./ChartHighlight";

export default function Chart(props: {
    currentLane: SelectedEventOcc
}){

    // Chart Specifics
    const [gammaDatasources, setGammaDS] = useState<typeof SweApi[]>([]);
    const [neutronDatasources, setNeutronDS] = useState<typeof SweApi[]>([]);
    const [occDatasources, setOccDS] = useState<typeof SweApi[]>([]);
    const [thresholdDatasources, setThresholdDS] = useState<typeof SweApi[]>([]);
    const [chartReady, setChartReady] = useState<boolean>(false);

    const laneMapRef = useContext(DataSourceContext).laneMapRef;

    const collectDatasources = useCallback(() =>{
        if(!props.currentLane) return;

        const currLaneEntry: LaneMapEntry = laneMapRef.current.get(props.currentLane?.laneId)

        console.log('curr lane', currLaneEntry);

        let tempDSMap = new Map<string, typeof SweApi[]>();
        if (currLaneEntry) {
            let datasources = currLaneEntry.getDatastreamsForEventDetail(props.currentLane.startTime, props.currentLane.endTime);
            console.log("DataSources", datasources);

            tempDSMap = datasources;
        }


        setGammaDS(tempDSMap.get("gamma"));
        setNeutronDS(tempDSMap.get("neutron"));
        setThresholdDS(tempDSMap.get("gammaTrshld"));
        console.log('this is gamma', gammaDatasources)

    },[laneMapRef, props.currentLane]);

    useEffect(() => {
        if(props.currentLane){
            collectDatasources();
        }
    }, [laneMapRef, props.currentLane]);

    return (
        <ChartHighlight
            gammaDatasources={gammaDatasources}
            neutronDatasources={neutronDatasources}
            occDatasources={occDatasources}
            thresholdDatasources={thresholdDatasources}
            setChartReady={setChartReady}
            status={props.currentLane.status}
        />
    )
}