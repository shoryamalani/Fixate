/* Based on https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/ */

const { notarize } = require("electron-notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const archName = context.packager.appInfo.electronPlatformName;

  return await notarize({
    appBundleId: "com.powerTimeTracking.ShoryaMalani.app",
    appPath: `out/PowerTimeTracking-darwin-x64/${appName}.zip`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
  });
};