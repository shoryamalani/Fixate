import React from "react";
import { Bar } from "react-chartjs-2";

function LookawayChart(props) {
    const lookawayData = props.data;
    return (

      <Bar data={lookawayData} 
      style={{height:'50vh',alignSelf:'center'}}
      options={{
        plugins: {
          title: {
            display: true,
            text: "Lookaways",
          }
        },

        legend: {
          display: false
        }
      }} />

    )
}

export default LookawayChart;