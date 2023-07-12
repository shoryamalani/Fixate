 //handle setupevents as quickly as possible
 const log = require('electron-log');
 try{
 const setupEvents = require('../installers/setupEvents')
 try{
   require('update-electron-app')({
     repo: 'shoryamalani/Fixate',
     logger: require('electron-log'),
    })
  }catch{
    log.debug("Could not update app");
  }
  if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
  }
}
catch{
  log.debug("Could not handle squirrel event");
}

const fs = require('fs');
const electron = require('electron')
// Module to control application life.
const app = electron.app
const {ipcMain} = require('electron')
var path = require('path')
// const { app, BrowserWindow } = require('electron');
// const path = require('path');

const {BrowserWindow} = require('electron');
var VERSION = app.getVersion();
// const {PythonShell} = require('python-shell');
// const child_process = require('child_process');
const util = require("util");
// const execFile = util.promisify(child_process.execFile);
const fetch = require('node-fetch');
// import resourcesPath
const resourcesPath = app.isPackaged ? process.resourcesPath : __dirname;
// const fs = require("fs");
// const { Server } = require('http');
// const { time } = require('console');
// const { start } = require('repl');
const { Menu, Tray } = require('electron');





const resolvePath = (file) => path.join(__dirname, file);
let tray = null
let tray_color = 'white';
app.whenReady().then(() => {
  tray = new Tray(resolvePath('assets/tray.png'))
  setUpTray();
  setInterval(keepUpTray,1000);
})
async function keepUpTray(){
  setUpTray();
    // try{
    //   response = await fetch('http://127.0.0.1:5005/logger_status');
    //   if(response.ok){
    //       const data = await response.json();
    //       if(data.status == "running"){
    //         tray.setTitle('Logging')
    //         logging = true;
    //       }else{
    //         tray.setTitle('Not Logging')
    //         logging = false;
    //       }
    //   }
    // }catch{
    //   logging = false;
    // }
    // const contextMenu = Menu.buildFromTemplate([
    //   { label: 'Start Logging', type: 'normal', click: () => {
    //     tray.setTitle('Logging')
    //     fetch('http://127.0.0.1:5005/start_logger')
    //     contextMenu.items[0].visible = false;
    //     contextMenu.items[1].visible = true;
    //     } , visible: logging},
    //   { label: 'Stop Logging', type: 'normal', click: () => {
    //     tray.setTitle('Not Logging')
    //     fetch('http://127.0.0.1:5005/stop_logger')
    //     contextMenu.items[0].visible = true;
    //     contextMenu.items[1].visible = false;
    //     }, visible: !logging},
    // ])
    // tray.setToolTip('Power Time Tracking Application Helper')
    // tray.setContextMenu(contextMenu)
}
async function setUpTray() {
  
  try{
    response = await fetch('http://127.0.0.1:5005/logger_status');
    if(response.ok){
        const data = await response.json();
        if(data.logger_running_status == true){
          if(data.in_focus_mode.status == true){
            tray.setTitle(data.in_focus_mode['Name'] + ' ' + data.in_focus_mode['Time Remaining'])
            logging = true;
            if (tray_color == 'white'){
              tray.setImage(resolvePath('assets/tray_blue.png'));
              tray_color = 'blue';
            } else if (tray_color == 'blue'){
              tray.setImage(resolvePath('assets/tray.png'));
              tray_color = 'white';
            }
          }else{
            tray.setTitle('Logging')
            tray.setImage(resolvePath('assets/tray.png'));
            logging = true;
          }
        }else{
          tray.setTitle('Not Logging')
          tray.setImage(resolvePath('assets/tray.png'));
          logging = false;
        }
    }
  }catch{
    logging = false;
  }
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Start Logging', type: 'normal', click: () => {
      tray.setTitle('Logging')
      fetch('http://127.0.0.1:5005/start_logger')
      contextMenu.items[0].visible = false;
      contextMenu.items[1].visible = true;
      } , visible: !logging},
    { label: 'Stop Logging', type: 'normal', click: () => {
      tray.setTitle('Not Logging')
      fetch('http://127.0.0.1:5005/stop_logger')
      contextMenu.items[0].visible = true;
      contextMenu.items[1].visible = false;
      }, visible: logging},
  ])
  tray.setToolTip('Fixate Application Helper')
  tray.setContextMenu(contextMenu)
}
class HTTPResponseError extends Error {
	constructor(response, ...args) {
		super(`HTTP Error Response: ${response.status} ${response.statusText}`, ...args);
		this.response = response;
	}
}
async function startServer(){
    // PythonShell.run(path.join(app.getAppPath(), 'py/server.py'),null,function(err){
    //     if (err) throw err;
    //     console.log('finished engine');
    // });
    try{
        response = await fetch('http://127.0.0.1:5005/get_version');
        if(response.ok){
            const data = await response.json();
            if(data.version != VERSION){
                console.log("Updating server");
                fetch('http://127.0.0.1:5005/kill_server')
              //   setTimeout( function(){
              //     start_server();
              // },5000);
                 
            }
            console.log("server is running");
          } else {
            throw ~new HTTPResponseError(response);

        }
    }
    catch(err){
      console.log(err);
      // start_server();
    }
    
    // document.getElementById("result").innerHTML = "Server started";
}
async function start_server(){
  await execFile(findPython(), [findServer()]).catch(err => {
    throw err;
  });
}

// copy run-server.bat to shell startup folder
function copyToStartup() {
  var source = ""

  if(app.isPackaged) {
    source = path.join(resourcesPath,"app","installers", "run-server.bat");
  }else{
    source = path.join(__dirname,"..", "installers", "run-server.bat");
  }
  log.debug("source")
  log.debug(source);
  const target = path.join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", "Startup","run-server.bat");
  fs.copyFile(source, target,(err) => {
    if (err) {
      log.debug(err)
      return
    }
    const child_process = require("child_process");
    const bat = child_process.spawn("cmd.exe", ["/c", path.join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", "Startup","run-server.bat")], {
      detached: true,
      stdio: "ignore",
    });
    bat.unref();
  });
}


function runServer() {
  // run windows batch file
  
}

function killServer(){
  fetch('http://127.0.0.1:5005/kill_server').catch(err => {
    return ;
  });
  return ;
}

// function findServer() {
//   const possibilities = [
//     // In packaged app
//     path.join(process.resourcesPath,"app", "py","server.py"),
//     // In development
//     path.join(__dirname, "py","server.py"),
//   ];
//   for (const path of possibilities) {
//     if (fs.existsSync(path)) {
//       return path;
//     }
//   }
//   console.log("Could not find server, checked", possibilities);
//   app.quit();
// }

// function findPython() {
//   const possibilities = [
//     // In packaged app
//     path.join(process.resourcesPath,"app", "python", "bin", "python3.9"),
//     // In development
//     path.join(__dirname, "python", "bin", "python3.9"),
//     //Windows in dev
//     path.join(__dirname, "python", "python.exe")
//   ];
//   for (const path of possibilities) {
//     if (fs.existsSync(path)) {
//       return path;
//     }
//   }
//   console.log("Could not find python3, checked", possibilities);
//   app.quit();
// }


function createWindow() {
    // Create the browser window.
    // PythonShell.run(path.join(app.getAppPath(),"..", 'py/server.py'),null,function(err){
    //     if (err) throw err;
    //     console.log('finished engine');
    // });   
    let win = new BrowserWindow({
        width: 1600,
        height: 1200,
    });
    // PythonShell.run('py/server.py',null,function(err){
    //     if (err) throw err;
    //     console.log('finished engine');
    // });
    // win.loadFile('src/index.html');
    if(app.isPackaged) {
      win.loadFile('index.html'); // prod
    }else{
      win.loadURL('http://localhost:3000'); // dev
      // win.loadFile('../react_app/build/index.html'); // prod
      // win.webContents.session.webRequest.onBeforeRequest({urls: ["*://*/*.png","*://*/*.jpg","*://*/*.jpeg","*://*/*.gif"]}, (details, callback) => {
      // // get from file system
      // callback({path: details.url.replace("http://localhost:3000","")});
      // });
      win.webContents.session.setProxy({mode:"direct","proxyRules":"http://127.0.0.1:5005"});
      // get images from local
      

    }
    // try{
    //     PythonShell.run(path.join(app.getAppPath(), 'py/server.py'),null,function(err){
    //         if (err) throw err;
    //         console.log('finished engine');
    //     });
    // }
    // catch(err){
    //     console.log(err);
    //     // PythonShell.run('py/server.py',null,function(err){
    //     //     if (err) throw err;
    //     //     console.log('finished engine');
    //     // });
            
    // // }
    if(!app.isPackaged){
      win.openDevTools();
    }
    // windows platform server startup
    log.debug(process.platform);
    if(process.platform == 'win32'){
      console.log(VERSION)
      if (getServerVersion() != VERSION){
        log.debug("Updating server");
        deleteServer();
        log.debug('deleted server')
        killServer();
        log.debug('killed server')
        copyToStartup();
        log.debug('copied to startup')
      // runServer();
      }
    }
    if (process.platform == 'darwin'){
      startServer();
    }


    // and load the index.html of the app.
    
    
}
function deleteServer(){
  fs.unlink(path.join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", "Startup","run-server.bat"), (err) => {
    if (err) {
      console.error(err)
      return
    }
  }
  )
}
function getServerVersion(){
  return fetch('http://127.0.0.1:5005/get_version')
  .then(response => response.json())
  .then(data => {
    console.log(data.version);
    return data.version;
  }).catch(err => {
    // console.log(err);
    return '';
  });
  
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      
      app.quit();
    }
});

app.on('activate',() => {
    if(BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }

})
