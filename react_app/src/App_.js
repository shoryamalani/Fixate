import logo from './logo.svg';
import './App.css';
// import Button from mui
import Button from '@mui/material/Button';



function App() {
  async function getLoggerState(){
    try{
      const response = await fetch('http://127.0.0.1:5005/logger_status');
      console.log(await response.json());
      return await response.json();
  }catch(error) {
      return [];
  }
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <Button variant='contained' onClick={(e)=> {console.log(getLoggerState())}}>Testing</Button>
      </header>
    </div>
  );
}

export default App;
