import React from 'react';
import wikiStore from "../../data/store";

import { observer } from 'mobx-react';
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";
import './LineChart.css'
import {autorun} from 'mobx';

interface LineChartProperties {
}

@observer
export default class LineChart extends React.Component<LineChartProperties, {}>{
    autoUpdateDisposer;
    
    resize = () =>{ 
        this.setState({})
    } //https://stackoverflow.com/a/37952875/10916298

    buildLineArray() {
        let objMap = {};
        wikiStore.timeSeries.result.points.forEach(function (obj) {
            let key = obj['point_in_time'];
            if (!(key in objMap)) {
                objMap[key] = []
            }
            objMap[key].push(obj['value']);
        });
        let x = Object.keys(objMap);
        let y = [];
        Object.keys(objMap).forEach(function (key) {
            let avg = objMap[key].reduce((p, c) => Number(p) + Number(c)) / objMap[key].length;
            y.push(avg);
        });
        return [x, y]
    }
    componentDidMount() {
        window.addEventListener('resize', this.resize)
        let firstTime = true;
        this.autoUpdateDisposer = autorun(() => { //https://stackoverflow.com/a/55103784/10916298
            console.debug(`previewFullScreen changed: ${wikiStore.ui.previewFullScreen}`);//https://stackoverflow.com/a/41087278/10916298

            if(!firstTime){
            this.resize();
            }
            firstTime = false;
        });
      }
      
      componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
        this.autoUpdateDisposer(); //https://stackoverflow.com/a/43607070/10916298
      }
    render() {
        const averaged = this.buildLineArray();
        const result = wikiStore.timeSeries.result;
        const params = wikiStore.ui.visualizationParams.getParams(result);

        const Plot = createPlotlyComponent(Plotly);
        return (
            <Plot
                data={[
                    {
                        x: averaged[0],
                        y: averaged[1],
                        mode: 'lines',
                        line: {
                            dash: params.lineType,
                            width: 4
                        },
                        marker: {
                            color: params.color
                        },
                    },
                ]}
                layout={{title: wikiStore.timeSeries.name, showlegend: true,
                legend: {"orientation": "h"} }}
            />
        );
    }
}