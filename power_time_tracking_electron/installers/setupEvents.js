const electron = require('electron')
const app = electron.app
const log = require('electron-log');
const { spawn } = require('node:child_process');



module.exports = {
handleSquirrelEvent: function() {
 if (process.argv.length === 1) {
 return false;
 }

 const ChildProcess = require('child_process');
 const path = require('path');

 const appFolder = path.resolve(process.execPath, '..');
 const rootAtomFolder = path.resolve(appFolder, '..');
 const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
 const exeName = path.basename(process.execPath);
 const spawn = function(command, args) {
 let spawnedProcess, error;

 try {
 spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
 } catch (error) {}

 return spawnedProcess;
 };

 const spawnUpdate = function(args) {
 return spawn(updateDotExe, args);
 };

 const squirrelEvent = process.argv[1];
switch (squirrelEvent) {
   
 case '--squirrel-install':
   //  async function setup() {
   //    const setup_windows = spawn('cmd.exe', 
   //    ['/c', '%LocalAppData%/Fixate/app-0.9.10/resources/app/installers/windows-setup.bat'], {
   //       detached: true,
   //       stdio: 'ignore'
   //    }).unref();
   
   //    setup_windows.stdout.on('data', (data) => {
   //       log.info(`bat stdout: ${data}`);
   //    });
   //    setup_windows.stderr.on('data', (data) => {
   //       log.error(`dir stderr: ${data}`);
   //    });
   //  }
   //  if(process.platform == 'win32'){
   //    setup();
   //  }
      // for mac
   if(process.platform == 'darwin'){
      fetch("http://127.0.0.1:5005/restart_server_macos");
   }
    
    
    
    spawnUpdate(['--createShortcut', exeName]);
    

    
 case '--squirrel-updated':
   
   log.info("Squirrel is updating");
 // Optionally do things such as:
 // - Add your .exe to the PATH
 // - Write to the registry for things like file associations and
 // explorer context menus

 // Install desktop and start menu shortcuts

//  spawnUpdate(['--createShortcut', exeName]);

 setTimeout(app.quit, 1000);
 return true;

 case '--squirrel-uninstall':
 // Undo anything you did in the --squirrel-install and
 // --squirrel-updated handlers

 // Remove desktop and start menu shortcuts
 spawnUpdate(['--removeShortcut', exeName]);

 setTimeout(app.quit, 1000);
 return true;

 case '--squirrel-obsolete':
 // This is called on the outgoing version of your app before
 // we update to the new version - it's the opposite of
 // --squirrel-updated

 app.quit();
 return true;
}
}
}