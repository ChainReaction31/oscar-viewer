"use client";


import ChartJsView from "osh-js/source/core/ui/view/chart/ChartJsView.js";
import CurveLayer from 'osh-js/source/core/ui/layer/CurveLayer.js';
import {Mode} from "osh-js/source/core/datasource/Mode";
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource";
import {END_TIME, START_TIME} from "@/lib/data/Constants";
import {useEffect, useRef, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/lib/state/Store";
import {selectMoveHighlighterTimeStamp} from "@/lib/state/Slice";
import styled from "styled-components";
//TODO remove any ref to Ian's IP from code before pushing.

const rpm002OccupancyId = '1tbv8s3niveii';
const rpm002GamaId = '9fgu8dcfmv6ti'
const server ='http://162.238.96.81:8781/sensorhub/api';
const start = START_TIME
const end = END_TIME

const TopRight = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #e0e0e0;
    height:377.5px;
`;
//examples for how to implement currently.
// (OccDataSourceId:'1tbv8s3niveii', GamaDataSourceId: '9fgu8dcfmv6ti', NeutronDataSourceId: null, GamaName:'gammaGrossCount1', NeutronName:null, ThresholdValue:1269.068573667372)
//  const [valX, setValX] = useState(null);
//
//   useEffect(() => {
//     const result = HistoricalGamaChart('1tbv8s3niveii', '9fgu8dcfmv6ti', null, 'gammaGrossCount1', null, 1269.068573667372);
//     setValX(result);
//   }, []);
// return(
//<div>valX</div>
//TODO replace with actual value for threshold.

// const ThresholdValue = 258



interface HistoricalChartProps {
    OccDataSourceId:string;
    GamaDataSourceId?: string;
    NeutronDataSourceId?: string;
    GamaName?:string;
    NeutronName?:string;
    ThresholdValue:any;

}
function HistoricalChart({OccDataSourceId,
                                GamaDataSourceId = null,
                                NeutronDataSourceId = null,
                                GamaName = null,
                                NeutronName= null,
                                ThresholdValue}: HistoricalChartProps) {


    const [isNeutronCurve, setNeutronCurve] = useState(null);
    const [isGamaCurve, setGamaCurve] = useState(null);
    const gamaChartViewRef = useRef(null);
    const neutronChartViewRef = useRef(null);
    let HighlighterValue =
        '2024-08-06T19:28:49Z '
    // useEffect(() => {

    // const HighlighterValue = useSelector((state: RootState) => selectMoveHighlighterTimeStamp(state));

    // const [isGamaCurve, setGamaCurve] = useState(null);


    //TODO Replace SweApi structure with store/context datasource calls.
    const gamaName:string = GamaName;
    const neutronName:string = NeutronName;
    const chartOccupancyDataSource = new SweApi("asd", {
        protocol: "ws",
        endpointUrl: server,
        resource: `/datastreams/${OccDataSourceId}/observations`,
        startTime: start,
        endTime: end,
        mode: Mode.BATCH
        // tls: secure

    });
    useEffect(() => {

    if (GamaDataSourceId != null) {
        const gamaValueDataSource = new SweApi("asd", {
            protocol: "ws",
            endpointUrl: server,
            resource: `/datastreams/${GamaDataSourceId}/observations`,
            startTime: start,
            endTime: end,
            mode: Mode.BATCH
            // tls: secure


        });
        const gamaCurve = new CurveLayer({
            dataSourceId: [gamaValueDataSource.id],
            getValues: (rec: any) => {

                return {
                    y: rec.gamaName,
                }

            },
            lineColor: 'rgba(38,152,255,0.5)',
            fill: true,
            backgroundColor: 'rgba(169,212,255,0.5)',
            maxValues: 1000,
            name: gamaName,

        });
        setGamaCurve(gamaCurve);
    }
    }, [isGamaCurve]);
    useEffect(() => {
    if (NeutronDataSourceId != null) {
        const neutronValueDataSource = new SweApi("asd", {
            protocol: "ws",
            endpointUrl: server,
            resource: `/datastreams/${NeutronDataSourceId}/observations`,
            startTime: start,
            endTime: end,
            mode: Mode.BATCH
            // tls: secure

        });
        const neutronCurve = new CurveLayer({
            dataSourceId: [neutronValueDataSource.id],
            getValues: (rec:any) => {

                return {
                    y: rec.neutronName,
                }

            },
            lineColor: 'rgba(38,152,255,0.5)',
            fill: true,
            backgroundColor: 'rgba(169,212,255,0.5)',
            maxValues: 1000,
            name: neutronName,

        });
        setNeutronCurve(neutronCurve);
    }
    }, [isNeutronCurve]);


    const timeCurve = new CurveLayer({
        dataSourceId: [chartOccupancyDataSource.id],
        getValues: (timeStamp: any) => {

            return {
                x: timeStamp,
            }

        },
        lineColor: 'rgba(38,152,255,0.5)',
        fill: true,
        backgroundColor: 'rgba(169,212,255,0.5)',
        maxValues: 1000,
        name: 'timeStamp',

    });







        const gamaChartProperties ={
        container: 'chart-historical-container',
        layers: [timeCurve, isGamaCurve],
        css: "chart-view",
        options: {
            type:'line',
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: gamaName,
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

        },
    };

   const neutronChartProperties ={
        container: 'chart-historical-container',
        layers: [timeCurve, isNeutronCurve],
        css: "chart-view",
        options: {
            type:'line',
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: neutronName,
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

        },
    };
   const gamaChart = new ChartJsView(gamaChartProperties);
   const neutronChart = new ChartJsView(neutronChartProperties);


        // useEffect(() => {

    useEffect(() => {


        if (gamaChart && HighlighterValue !== null) {
            const chart = gamaChartViewRef.current.chart;

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
        if (neutronChart && HighlighterValue !== null) {
            const chart = neutronChartViewRef.current.chart;

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



    return(
        <div className="chart-Historical">
            <h3>RAM Chart</h3>
            <TopRight>
                <div>{gamaChart}</div>

            </TopRight>


        </div>
    );

}

export {HistoricalChart}



