import React from "react";
import { Pie } from "react-chartjs-2";

function TimeSpentPieChart(props) {
    const timeSpentData = props.data;
    return (

      <Pie data={timeSpentData}
        id = "pieChart"
        options={{
          plugins: {
            title: {
              display: true,
              text: "Minutes Spent per App",
            },
            legend: {
              display: false
            }
            
          }
          
        }} />

    )
}

export default TimeSpentPieChart;