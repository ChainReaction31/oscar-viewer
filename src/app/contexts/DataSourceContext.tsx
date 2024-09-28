'use client';

import React, {createContext, MutableRefObject, ReactNode, useCallback, useEffect, useRef} from "react";
// @ts-ignore
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource";
// @ts-ignore
import DataSynchronizer from "osh-js/source/core/timesync/DataSynchronizer";
import {useSelector} from "react-redux";
import {useAppDispatch} from "@/lib/state/Hooks";
import {INode, Node} from "@/lib/data/osh/Node";
import {
    addDatasourceToDatastreamEntry,
    changeConfigNode, createDatasourceOfDatastream,
    setDatasources,
    setDatastreams,
    setSystems
} from "@/lib/state/OSHSlice";
import {System} from "@/lib/data/osh/Systems";
import {selectLaneMap, setLaneMap, setLanes} from "@/lib/state/OSCARClientSlice";
import {RootState} from "@/lib/state/Store";
import {LaneMapEntry} from "@/lib/data/oscar/LaneCollection";
import assert from "assert";
import {OSHSliceWriterReader} from "@/lib/data/state-management/OSHSliceWriterReader";

interface IDataSourceContext {
    masterTimeSyncRef: MutableRefObject<typeof DataSynchronizer | undefined>
    laneMapRef: MutableRefObject<Map<string, LaneMapEntry>> | undefined
}

// create context with a default value of undefined (This will differ if there is a file import at page load)
const DataSourceContext = createContext<IDataSourceContext | undefined>(undefined);

export {DataSourceContext};


export default function DataSourceProvider({children}: { children: ReactNode }) {
    const mainDataSynchronizer = useSelector((state: RootState) => state.oshSlice.mainDataSynchronizer);
    const configNode: Node = useSelector((state: RootState) => state.oshSlice.configNode);
    const dispatch = useAppDispatch();
    const nodes = useSelector((state: RootState) => state.oshSlice.nodes);
    const masterTimeSyncRef = useRef<typeof DataSynchronizer>();
    const minSystemFetchInterval = 30000;
    const [lastSystemFetch, setLastSystemFetch] = React.useState<number>(0);
    const laneMap = useSelector((state: RootState) => selectLaneMap(state));
    const laneMapRef = useRef<Map<string, LaneMapEntry>>(new Map<string, LaneMapEntry>());

    const InitializeApplication = useCallback(async () => {
        if (!configNode) {
            // if no default node, then just grab the first node in the list and try to use that
            if (nodes.length > 0) {
                if (nodes[0].isDefaultNode) {
                    dispatch(changeConfigNode(nodes[0]));
                    return; // force a rerender...
                }
            }
            console.error("No config node found in state. Cannot initialize application.");
        }

        let filedata = await OSHSliceWriterReader.retrieveLatestConfig(configNode);

        if (filedata) {
            console.log("Filedata from config node:", filedata);
            // load the filedata into the state
        } else {
            console.log("No filedata found from config node");
            // do nothing else for now
        }

    }, [dispatch, configNode]);


    function checkSystemFetchInterval() {
        console.log("Checking system fetch interval for TK Fetch...");
        return Date.now() - lastSystemFetch >= minSystemFetchInterval;
    }

    const testSysFetch = useCallback(async () => {
        console.log("Received new nodes, updating state\nNodes:");
        console.log(nodes);
        let lanes: Map<string, LaneMapEntry> = new Map();
        await Promise.all(nodes.map(async (node: INode) => {
            console.log("Fetching lanes from node ", node);
            let laneMap = await node.fetchLaneSystemsAndSubsystems();
            await node.fetchDatastreamsTK(laneMap);
            for (let mapEntry of laneMap.values()) {
                mapEntry.addDefaultSWEAPIs();
            }

            laneMap.forEach((value, key) => {
                lanes.set(key, value);
            });
        }));

        dispatch(setLaneMap(lanes));
        laneMapRef.current = lanes;
        console.log("LaneMapRef for Table:", laneMapRef);
    }, [nodes]);

    useEffect(() => {
        if (laneMap.size > 0) {
            console.log("LaneMap After Update:", laneMap);
            if (laneMap.has("lane1")) {
                let ds: LaneMapEntry = laneMap.get("lane1")
                console.log("LaneMap test for prop datastream:", ds.hasOwnProperty("datastreams"));
                console.log("LaneMap test systems:", ds.systems);
                console.log("LaneMap test DS:", ds.datastreams[0]);
                let test = ds.datastreams[0].stream();
                console.log("LaneMap test DS stream:", test);


            }
        }
    }, [laneMap]);

    useEffect(() => {
        // if(checkSystemFetchInterval()) {
        testSysFetch();
        setLastSystemFetch(Date.now());
        // }
    }, [nodes]);

    useEffect(() => {
        InitializeApplication();
    }, [InitializeApplication]);


    if (!masterTimeSyncRef.current) {
        masterTimeSyncRef.current = new DataSynchronizer({...mainDataSynchronizer});
    }


    return (
        <DataSourceContext.Provider value={{masterTimeSyncRef: useRef(), laneMapRef}}>
            {children}
        </DataSourceContext.Provider>
    );
};
