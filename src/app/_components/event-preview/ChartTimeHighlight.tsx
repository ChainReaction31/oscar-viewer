/*
 * Copyright (c) 2024.  Botts Innovative Research, Inc.
 * All Rights Reserved
 */
'use client';

import {useCallback, useEffect, useRef, useState} from "react";
import {Typography} from "@mui/material";
import {useSelector} from "react-redux";
import {RootState} from "@/lib/state/Store";
import {selectEventPreview} from "@/lib/state/OSCARClientSlice";
import ChartJsView from "osh-js/source/core/ui/view/chart/ChartJsView.js";
import CurveLayer from 'osh-js/source/core/ui/layer/CurveLayer.js';
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource";
import annotationPlugin from 'chartjs-plugin-annotation';
import {Chart, registerables} from 'chart.js';
import {SelectedEventOcc} from "../../../../types/new-types";

Chart.register(...registerables, annotationPlugin);

export class ChartInterceptProps {
    gammaDatasources: typeof SweApi[];
    neutronDatasources: typeof SweApi[];
    occDatasources: typeof SweApi[];
    thresholdDatasources: typeof SweApi[];
    setChartReady: Function
}

export default function ChartTimeHighlight(props: ChartInterceptProps) {
    const eventPreview = useSelector((state: RootState) => selectEventPreview(state));
    const [chartsReady, setChartsReady] = useState<boolean>(false);
    const [viewReady, setViewReady] = useState<boolean>(false);
    const [isReadyToRender, setIsReadyToRender] = useState<boolean>(false);

    // chart specifics
    const timeVert = useState<Date>;
    const horizontalThreshold = useState<number>(0);
    const gammaChartViewRef = useRef<typeof ChartJsView | null>(null);
    const neutronChartViewRef = useRef<typeof ChartJsView | null>(null);
    const [thresholdCurve, setThresholdCurve] = useState<typeof CurveLayer>();
    const [gammaCurve, setGammaCurve] = useState<typeof CurveLayer>();
    const [neutronCurve, setNeutronCurve] = useState<typeof CurveLayer>();
    const [occupancyCurve, setOccupancyCurve] = useState<typeof CurveLayer>();


    const createCurveLayers = useCallback(() => {
        // console.log("LocalDSMap", localDSMap);
        if (props.thresholdDatasources.length > 0) {
            // console.log("Threshold DS", props.thresholdDatasources);
            const tCurve = new CurveLayer({
                dataSourceIds: props.thresholdDatasources.map((ds) => ds.id),
                getValues: (rec: any, timestamp: any) => ({x: timestamp, y: rec.threshold}),
                name: "Gamma Threshold"
            });
            setThresholdCurve(tCurve);

            const timeCurve = new CurveLayer({
                dataSourceIds: props.thresholdDatasources.map((ds) => ds.id),
                getValues: () => {
                    return {x: 0}
                },
                name: "CurrentTime"
            });
        }

        if (props.gammaDatasources.length > 0) {
            // console.log("Gamma DS", props.gammaDatasources);
            const gCurve = new CurveLayer({
                dataSourceIds: props.gammaDatasources.map((ds) => ds.id),
                getValues: (rec: any, timestamp: any) => {
                    // console.log(rec.gammaGrossCount1)
                    return {x: timestamp, y: rec.gammaGrossCount1}
                },
                name: "Gamma Count",
                lineColor: "red",
                backgroundColor: "red"
            });
            setGammaCurve(gCurve);
        }

        if (props.neutronDatasources.length > 0) {
            // console.log("Neutron DS", props.neutronDatasources);
            const nCurve = new CurveLayer({
                dataSourceIds: props.neutronDatasources.map((ds) => ds.id),
                getValues: (rec: any, timestamp: any) => {
                    // console.log(rec.neutronGrossCount1);
                    return {x: timestamp, y: rec.neutronGrossCount1}
                },
                name: 'Neutron Count',
                lineColor: "blue",
                backgroundColor: "blue"
            });
            setNeutronCurve(nCurve);
        }

        setChartsReady(true);
    }, [props]);

    const resetView = useCallback(() => {
        if (!eventPreview.isOpen) {
            gammaChartViewRef.current.destroy();
            neutronChartViewRef.current.destroy();
            gammaChartViewRef.current = null;
            neutronChartViewRef.current = null;
            setIsReadyToRender(false);
        }

    }, [eventPreview]);

    useEffect(() => {
        resetView();
    }, [resetView]);

    const checkForMountableAndCreateCharts = useCallback(() => {
        if (!gammaChartViewRef.current && !isReadyToRender && thresholdCurve && gammaCurve) {
            // console.log("Creating Gamma Chart:", thresholdCurve, gammaCurve);

            const container = document.getElementById("chart-view-event-detail-gamma");
            if (container) {
                gammaChartViewRef.current = new ChartJsView({
                    container: "chart-view-event-detail-gamma",
                    layers: [thresholdCurve, gammaCurve],
                    css: "chart-view-event-detail",
                });
                setViewReady(true);
            }
        }

        if (!neutronChartViewRef.current && !isReadyToRender && neutronCurve) {
            // console.log("Creating Neutron Chart:", neutronCurve);

            const containerN = document.getElementById("chart-view-event-detail-neutron");
            if (containerN) {
                neutronChartViewRef.current = new ChartJsView({
                    container: "chart-view-event-detail-neutron",
                    layers: [neutronCurve],
                    css: "chart-view-event-detail",
                });
                setViewReady(true);
            }
        }


    }, [thresholdCurve, gammaCurve, neutronCurve, isReadyToRender]);

    const checkReadyToRender = useCallback(() => {
        if (chartsReady && viewReady) {
            setIsReadyToRender(true);
        } else {
            setIsReadyToRender(false);
        }
    }, [chartsReady, viewReady]);

    useEffect(() => {
        checkForMountableAndCreateCharts();
    }, [checkForMountableAndCreateCharts]);

    useEffect(() => {
        if (checkForProvidedDataSources()) {
            createCurveLayers();
        }
    }, [props]);

    useEffect(() => {
        checkReadyToRender();
    }, [chartsReady, viewReady]);

    useEffect(() => {
        if (isReadyToRender) {
            // console.log("Chart is ready to render");
            props.setChartReady(true);
        }
    }, [isReadyToRender]);

    const checkForProvidedDataSources = useCallback(() => {
        // console.log("[CI] Checking for provided data sources...");
        if (!props.gammaDatasources || !props.neutronDatasources || !props.thresholdDatasources) {
            // console.warn("No DataSources provided for ChartTimeHighlight");
            return false;
        } else {
            return true;
        }
    }, [props.gammaDatasources, props.neutronDatasources, props.thresholdDatasources]);

    if (!checkForProvidedDataSources()) {
        return (
            <Typography variant="h6">No DataSources provided for ChartIntercept</Typography>
        );
    } else if (eventPreview.eventData.status === "Gamma") {
        return (
            <div>
                <Typography variant="h6">Gamma Readings</Typography>
                <div id="chart-view-event-detail-gamma"></div>
            </div>
        );
    } else if (eventPreview.eventData.status === "Neutron") {
        return (
            <div>
                <Typography variant="h6">Neutron Readings</Typography>
                <div id="chart-view-event-detail-neutron"></div>
            </div>
        );
    } else if (eventPreview.eventData.status === "Gamma & Neutron") {
        return (
            <div>
                <Typography variant="h6">Gamma Readings</Typography>
                <div id="chart-view-event-detail-gamma"></div>
                <Typography variant="h6">Neutron Readings</Typography>
                <div id="chart-view-event-detail-neutron"></div>
            </div>
        );
    }
}
