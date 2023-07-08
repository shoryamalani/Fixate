/* Based on https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/ */
// const { notarize } = require("electron-notarize");
// import { notarize } from '@electron/notarize';
const { notarize } = require("@electron/notarize");
exports.default =  async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }
  console.log("Notarizing the app")

  const appName = context.packager.appInfo.productFilename;
  const archName = context.packager.appInfo.electronPlatformName;
  try{
  return notarize({
    // appBundleId: "com.fixate.macos",
    // appPath: `out/PowerTimeTracking-darwin-${archName}/${appName}.zip`,
    // appPath: '/Applications/Fixate.app',
    appPath: `/Users/shoryamalani/Documents/coding/electron_apps/new_app/power_time_tracking_electron/out/Fixate-darwin-${archName}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    teamId: "6KK9M46VM2",
    hardenRuntime: true,
  });
}catch (error){
  console.log(error.message)
  console.log("TESTING IF IT GETS HERE")
  if(error.message?.includes('Failed to staple')) {
    spawn('xcrun',['stapler','staple',`${appOutDir}/${appName}.zip`]);
  } else {
    throw error;
  }
}
};