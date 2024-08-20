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
import DataSynchronizer from "osh-js/source/core/timesync/DataSynchronizer";
//TODO remove any ref to Ian's IP from code before pushing.


const server ='http://162.238.96.81:8781/sensorhub/api';
const end = '2024-08-14T18:08:31Z'
const start = '2024-08-14T17:57:02Z'

const TopRight = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #e0e0e0;
    height:377.5px;
`;





interface HistoricalChartProps {
    OccDataSourceId:string;
    GamaDataSourceId?: string;
    NeutronDataSourceId?: string;
    GamaName?:string;
    NeutronName?:string;
    ThresholdValue:any;

}
const initialState: HistoricalChartProps = {
    OccDataSourceId:'',
    GamaDataSourceId:'',
    NeutronDataSourceId:'',
    NeutronName:'',
    ThresholdValue:1269.068573667372
}

function HistoricalGamaChart({OccDataSourceId,
                                GamaDataSourceId,
                                GamaName,
                                ThresholdValue}: HistoricalChartProps) {



    const gamaChartViewRef = useRef(null);

    let HighlighterValue =
        '2024-08-06T19:28:49Z '


    // const HighlighterValue = useSelector((state: RootState) => selectMoveHighlighterTimeStamp(state));




    //TODO Replace SweApi structure with store/context datasource calls.
    const gamaName:string = GamaName;
    const chartOccupancyDataSource = new SweApi("asd", {
        protocol: "ws",
        endpointUrl: server,
        resource: `/datastreams/${OccDataSourceId}/observations`,
        startTime: start,
        endTime: end,
        mode: Mode.BATCH
        // tls: secure

    });
    chartOccupancyDataSource.connect();
    // useEffect(() => {

        const gamaValueDataSource = new SweApi("asd", {
            protocol: "ws",
            endpointUrl: server,
            resource: `/datastreams/${GamaDataSourceId}/observations`,
            startTime: start,
            endTime: end,
            mode: Mode.BATCH
            // tls: secure


        });
    gamaValueDataSource.connect();
    // const dataSynchronizergama = new DataSynchronizer({
    //     startTime: start,
    //     endTime: end,
    //     dataSources: [gamaValueDataSource,chartOccupancyDataSource],
    //
    // });
    // dataSynchronizergama.connect();
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





useEffect(() => {

        const gamaChartConfig = {
        container: 'chart-historical-container',
        layers: [timeCurve, gamaCurve],
        css: "chart-view",
        options: {
            type:'line',
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: gamaName || 'NA',
                        padding: 20
                    }
                },
            }
        },

            plugins: {
                annotation: {
                    annotations: {
                        thresholdLine: {
                            type: 'line',
                            // yMin: ThresholdValue || 'NA',
                            // yMax: ThresholdValue || 'NA',
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
            },

        datasetOptions: {
            tension: 0.2 // for 'line',

        },
    };
    const gamaChart = new ChartJsView(gamaChartConfig);
    gamaChartViewRef.current = gamaChart;
    // Cleanup if necessary when the component unmounts

if(gamaChart) {
    console.log(OccDataSourceId)
}

    // useEffect(() => {



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

    return () => {
        gamaChart.destroy(); // Assuming ChartJsView has a destroy method
    };
}, [timeCurve, HighlighterValue, ThresholdValue]);



    return(
        <div className="chart-Historical">
            <h3>RAM Chart</h3>
            <TopRight>
                <div id="chart-historical-container" className="chart-container"></div>

            </TopRight>


        </div>
    );

}

export {HistoricalGamaChart}



