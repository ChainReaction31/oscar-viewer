'use client';

import React, {createContext, MutableRefObject, ReactNode, useCallback, useEffect, useRef, useState} from "react";
// @ts-ignore
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource";
// @ts-ignore
import DataSynchronizer from "osh-js/source/core/timesync/DataSynchronizer";
import {useSelector} from "react-redux";
import {Datastream} from "@/lib/data/osh/Datastreams";
import {useAppDispatch} from "@/lib/state/Hooks";
import {INode, Node} from "@/lib/data/osh/Node";
import {changeConfigNode, setDatastreams, setSystems} from "@/lib/state/OSHSlice";
import {System} from "@/lib/data/osh/Systems";
import {setLanes} from "@/lib/state/OSCARClientSlice";

interface IDataSourceContext {
    dataSources: Map<string, typeof SweApi>
    masterTimeSyncRef: MutableRefObject<typeof DataSynchronizer | undefined>
}

// create context with a default value of undefined (This will differ if there is a file import at page load)
const DataSourceContext = createContext<IDataSourceContext | undefined>(undefined);


export default function DataSourceProvider({children}: { children: ReactNode }) {
    const mainDataSynchronizer = useSelector((state: any) => state.oshSlice.mainDataSynchronizer);
    const isInitialized = useSelector((state: any) => state.oshSlice.isInitialized);
    const configNode: Node = useSelector((state: any) => state.oshSlice.configNode);
    const dispatch = useAppDispatch();
    const nodes = useSelector((state: any) => state.oshSlice.nodes);
    const systems = useSelector((state: any) => state.oshSlice.systems);
    const masterTimeSyncRef = useRef<typeof DataSynchronizer>()
    const dataSources = useSelector((state: any) => state.oshSlice.datasources);

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

        console.log("Initializing application...");
        let cfgEP = configNode.getConfigEndpoint();
        // assume that the local server may have a config file that can be loaded
        let localConfigResp = await fetch(`${cfgEP}/systems?uid=urn:ornl:client:configs`, {
            headers: {
                ...configNode.getBasicAuthHeader()
            }
        })
        if (!localConfigResp.ok) {
            let localConfig = localConfigResp.json()
            console.info("Local config not loaded")
            // Need to fire off some sort of alert on the screen
        } else {
            // TODO: move this into a method in the slice writer/reader or somewhere else so it's 1 reusable and 2 not clogging up this Context file
            let localConfigJson = await localConfigResp.json();
            let systemId = localConfigJson.items[0].id;
            // get datastream ID
            let configDSResp = await fetch(encodeURI(`${cfgEP}/systems/${systemId}/datastreams`), {
                headers: {
                    ...configNode.getBasicAuthHeader()
                }
            });
            let configDSJson = await configDSResp.json();
            let dsID = configDSJson.items[0].id;
            // fetch the latest result
            let cfgObsResp = await fetch(`${cfgEP}/datastreams/${dsID}/observations?f=application/om%2Bjson&resultTime=latest`, {
                headers: {
                    ...configNode.getBasicAuthHeader()
                }
            });
            let cfgObsJson = await cfgObsResp.json();
            let cfgObservation = cfgObsJson.items[0];
            // get the config object file data
            let configString = cfgObservation.result.filedata;
            let configObj = JSON.parse(configString);
            // TODO Load into state
        }
    }, [dispatch, configNode]);

    const laneFetch = useCallback(async () => {
        console.log("Nodes:", nodes);
        await Promise.all(nodes.map(async (node: INode) => {
            return await node.fetchLanes();
        })).then((fetched) => {
            console.log("Fetched:", fetched);
            let lanes = fetched.flatMap((item: any) => item.lanes);
            let systems = fetched.flatMap((item: any) => item.systems);

            dispatch(setLanes(lanes));
            dispatch(setSystems(systems));
            console.log("Statewide systems", systems)
        });
        console.info("Lanes fetched, continuing onward...");
    }, [nodes, dispatch]);

    const datastreamFetch = useCallback(async () => {
        console.warn("Fetching datastreams of systems...", systems);
        await Promise.all(systems.map(async (system: System) => {
            return await system.fetchDataStreams();
        })).then((datastreams) => {
            const combinedDatastreams = datastreams.flat();
            let datastreamsMap = new Map<string, Datastream>();
            combinedDatastreams.forEach((datastreamJson: any) => {
                const datastream = new Datastream(datastreamJson.id, datastreamJson.name, datastreamJson["system@id"], [datastreamJson.validTime[0], datastreamJson.validTime[1]]);
                datastreamsMap.set(datastream.id, datastream);
                // dispatch(addDatastream(datastream))
            });
            dispatch(setDatastreams(datastreamsMap));
        });
    }, [systems, dispatch]);

    useEffect(() => {
        InitializeApplication();
        laneFetch();
    }, [InitializeApplication]);

    useEffect(() => {
        datastreamFetch();
    }, [systems]);

    if (!masterTimeSyncRef.current) {
        masterTimeSyncRef.current = new DataSynchronizer({...mainDataSynchronizer});
    }


    return (
        <DataSourceContext.Provider value={{dataSources, masterTimeSyncRef}}>
            {children}
        </DataSourceContext.Provider>
    );
};
