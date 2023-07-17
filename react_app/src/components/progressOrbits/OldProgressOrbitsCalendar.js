import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { colors } from './ProgressBars';
import { Progress } from 'antd';
import ConcentricProgressBars from './ConcentricProgressBars';
import styled from 'styled-components';
// import "../CalendarDark.css"
export const CalendarDiv = styled.div`
.react-calendar {
    width: 100%;
    max-width: 100%;
    background: #303030;
    /* border: 1px solid #a0a096; */
    border: 0px;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.125em;
    border-radius: 3em;
  }
  
  .react-calendar--doubleView {
    width: 700px;
  }
  
  .react-calendar--doubleView .react-calendar__viewContainer {
    display: flex;
    margin: -0.5em;
  }
  
  .react-calendar--doubleView .react-calendar__viewContainer > * {
    width: 50%;
    margin: 0.5em;
  }
  
  .react-calendar,
  .react-calendar *,
  .react-calendar *:before,
  .react-calendar *:after {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  
  .react-calendar button {
    margin: 0;
    border: 0;
    outline: none;
    color: white;
    font-size: large;
  }
  
  .react-calendar button:enabled:hover {
    cursor: pointer;
  
  }
  
  .react-calendar__navigation {
    display: flex;
    height: 44px;
    margin-bottom: 1em;
  }
  
  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
  }
  
  .react-calendar__navigation button:disabled {
    background-color: #f0f0f0;
  }
  
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #868686;
    border-radius: 1em;
  }
  
  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75em;
    color: white;
  }
  
  .react-calendar__month-view__weekdays__weekday {
    padding: 0.5em;
    color: white;
  }
  
  .react-calendar__month-view__weekNumbers .react-calendar__tile {
    display: flex;
    color: white;
    align-items: center;
    justify-content: center;
    font-size: 0.75em;
    font-weight: bold;
  }
  
  .react-calendar__month-view__days__day--weekend {
    color: #d10000;
  }
  
  .react-calendar__month-view__days__day--neighboringMonth {
    color: black !important;
  }
  
  .react-calendar__year-view .react-calendar__tile,
  .react-calendar__decade-view .react-calendar__tile,
  .react-calendar__century-view .react-calendar__tile {
    padding: 2em 0.5em;
    color: white;
  }
  
  .react-calendar__tile {
    max-width: 100%;
    padding: 10px 6.6667px;
    color:white;
    font-size: large;
    background: none;
    text-align: center;
    line-height: 16px;
  }
  
  .react-calendar__tile:disabled {
    color:white;
    background-color: #f0f0f0;
  }
  
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #868686;
    border-radius: 1em;
  }
  
  .react-calendar__tile--now {
    border-radius: 1em;
    color:#fd0303;
  }
  
  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: #868686;
    color:#fd0303;
  }
  
  .react-calendar__tile--hasActive {
    background: #76baff;
  }
  
  .react-calendar__tile--hasActive:enabled:hover,
  .react-calendar__tile--hasActive:enabled:focus {
    background: #a9d4ff;
  }
  
  .react-calendar__tile--active {
    /* background: #006edc; */
    color: white;
  }
  
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    /* background: #1087ff; */
  }
  
  .react-calendar--selectRange .react-calendar__tile--hover {
    background-color: #e6e6e6;
    
  }

`
const OldProgressOrbitsCalendar = ( props ) => {
    const { progressOrbits,changeSelection } = props;
    const [calendar, setCalendar] = useState(null);
    const [calendarData, setCalendarData] = useState(null);
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            var newDate = new Date(date);
            var year = newDate.getFullYear();
            var month = newDate.getMonth() + 1;
            if (month < 10) {
                month = `0${month}`
            }
            var day = newDate.getDate();
            if (day < 10) {
                day = `0${day}`
            }
            var dateString = `${year}-${month}-${day}`;
            var values = {
                planning : 0,
                focus : 0,
                tasks : 0
            }
            console.log(progressOrbits[dateString])
            if (progressOrbits[dateString] != null) {
                values['planning'] = progressOrbits[dateString]['tasks'].length/3;
                values['focus'] = progressOrbits[dateString]['time_completed']/(progressOrbits[dateString]['time_completed'] != 0 ? progressOrbits[dateString]['time_completed']:30);
                values['tasks'] = progressOrbits[dateString]['complete'].length/(progressOrbits[dateString]['complete'].length != 0 ? progressOrbits[dateString]['complete'].length > 3 ? progressOrbits[dateString]['tasks'].length -1 : progressOrbits[dateString]['tasks'].length:1);
            }
            return (
                <div>
                    <ConcentricProgressBars
                    percentage1={values['planning']*100}
                    percentage2={values['focus']*100}
                    percentage3={values['tasks']*100}
                    />
                    {/* <Progress type='circle' percent={values['tasks']*100} size='small' strokeColor={{ '0%': colors['completed_tasks'][0], '100%': colors['completed_tasks'][1] }} format={()=>{return ``}} >
                <Progress type='circle' percent={values['planning']*100} size='small' strokeColor={{ '0%': colors['writing_tasks'][0], '100%': colors['writing_tasks'][1] }} format={()=>{return ``}} ></Progress>
                </Progress> */}
                </div>
            )

        }
        return null;
    }

    return (
        <CalendarDiv className='calendar-container'>
        <Calendar style={{width:'100%'}} tileContent={tileContent} />
        {/* <ConcentricProgressBars percentage1={50} percentage2={30} percentage3={20}></ConcentricProgressBars> */}
        </CalendarDiv>
    )
}
export default OldProgressOrbitsCalendar;