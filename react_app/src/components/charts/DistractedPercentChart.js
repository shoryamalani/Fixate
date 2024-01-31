import React from "react";
import { Line } from "react-chartjs-2";

function DistractedPercentChart(props) {
    const DistractedPercentData = props.data;
    return (

            <Line data={DistractedPercentData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Distractions Over Time",
            }
          }
          
        }} />


    )
}

export default DistractedPercentChart;