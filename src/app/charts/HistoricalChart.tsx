


import ChartJsView from "osh-js/source/core/ui/view/chart/ChartJsView.js";
import CurveLayer from 'osh-js/source/core/ui/layer/CurveLayer.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import DataSourceProvider from "@/app/contexts/DataSourceContext";
import {useDSContext} from "@/app/contexts/DataSourceContext";
import {Mode} from "osh-js/source/core/datasource/Mode";
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource";
import {startServer} from "next/dist/server/lib/start-server";
import {END_TIME, START_TIME} from "@/lib/data/Constants";
import {useContext, useEffect, useRef, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/lib/state/Store";
import {selectMoveHighlighterTimeStamp} from "@/lib/state/Slice";

//TODO remove any ref to Ian's IP from code before pushing.

const rpm002OccupancyId = '1tbv8s3niveii';
const rpm002GamaId = '9fgu8dcfmv6ti'
const server ='http://162.238.96.81:8781/sensorhub/api';
const start = START_TIME
const end = END_TIME

const chartViewRef = useRef(null);
const HighlighterValue = useSelector((state: RootState) => selectMoveHighlighterTimeStamp(state));
//TODO replace with actual value for threshold.
const ThresholdValue = 258
export default function() {

    const chartOccupancyDataSource = new SweApi("asd", {
        protocol: "ws",
        endpointUrl: server,
        resource: `/datastreams/${rpm002OccupancyId}/observations`,
        startTime: start,
        endTime: end,
        mode: Mode.BATCH
        // tls: secure

    });
    const chartGammaDataSource = new SweApi("asd", {
        protocol: "ws",
        endpointUrl: server,
        resource: `/datastreams/${rpm002GamaId}/observations`,
        startTime: start,
        endTime: end,
        mode: Mode.BATCH
        // tls: secure

    });


    const timeCurve = new CurveLayer({
        dataSourceId: [chartOccupancyDataSource.id, chartGammaDataSource.id],
        getValues: (rec: any, timeStamp: any) => {

            return {
                x: timeStamp,
                y: rec.gamaGrossCount1
            }

        },
        lineColor: 'rgba(38,152,255,0.5)',
        fill: true,
        backgroundColor: 'rgba(169,212,255,0.5)',
        maxValues: 100,
        name: 'rpm002',

    });


    const HistoricalChart = new ChartJsView({
        container: 'chart-historical-container',
        layers: [timeCurve],
        css: "chart-view",
        options: {
            type:'line',
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "GamaCount",
                        padding: 20
                    },
                },
            },
            plugins: {
                annotation: {
                    annotations: {
                        thresholdLine: {
                            type: 'line',
                            yMin: ThresholdValue,
                            yMax: ThresholdValue,
                            borderColor: 'orange',
                            fill:true,
                            backgroundColor:'rgba(253, 200,50, 0.9)',
                            borderWidth: 2,
                            label: {
                                content: 'Threshold',
                                enabled: false,
                                position: 'center'
                            }
                        },
                        highlighterLine: {
                            type:'line',
                            xMin: 'Point 2',
                            xMax:'Point 2',
                            borderColor: 'red',
                            fill:true,
                            backgroundColor:'rgba(253, 200,0, 0.5)',
                            borderWidth: 2,
                            label: {
                                content: 'Threshold',
                                enabled: false,
                                position: 'center'
                            }
                        },
                    }
                }
            }
        },
        datasetOptions: {
            tension: 0.2 // for 'line',

        }
    });

    useEffect(() => {
        if (chartViewRef.current && HighlighterValue !== null) {
            const chart = chartViewRef.current.chart;

            // test to see if adding annotation directly to chatJSView props is viable or if it needs to be declared separately.
            chart.options.plugins.annotation = {
                annotations: {
                    line1: {
                        type: 'line',
                        xMin: HighlighterValue,
                        xMax: HighlighterValue,
                        borderColor: 'red',
                        borderWidth: 2,
                    },

                }
            };

            chart.update();
        }
    }, [HighlighterValue]);
    return (
        <HistoricalChart />
    );

}
//



