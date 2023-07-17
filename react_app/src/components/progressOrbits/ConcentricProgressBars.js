import { CircularProgressbar, CircularProgressbarWithChildren,buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ConcentricProgressBar = ({ percentage1,percentage2,percentage3 },props) => {
  const circleSizes = [200, 160, 120]; // Sizes of the concentric circles
  const strokeWidth = 10; // Stroke width for all circles

  return (
    <CircularProgressbarWithChildren value={percentage1} styles={buildStyles({    
    
        // How long animation takes to go from one percentage to another, in seconds
        pathTransitionDuration: 0.5,
        // Can specify path transition in more detail, or remove it entirely
        // pathTransition: 'none',
    
        // Colors
        pathColor: `#DBACAB`,
        textColor: '#f88',
        trailColor: '#141414',
        backgroundColor: '#3e98c7',
      })}>
        <div style={{padding:'0.7em'}}>
        <CircularProgressbarWithChildren styles={buildStyles(
            {pathColor: `#CAE2E8`,trailColor: '#141414',}
        )} value={percentage2}>
        <div style={{padding:'0.6em'}}>
            <CircularProgressbar value={percentage3}
            styles={buildStyles(
                {pathColor: `#D8BCE6`,trailColor: '#141414',}
            )}>
                </CircularProgressbar>
                </div>
        </CircularProgressbarWithChildren>    
        </div>
  </CircularProgressbarWithChildren>
  );
};

export default ConcentricProgressBar;
