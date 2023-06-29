import { makeUniversalApp } from '@electron/universal';

 
await makeUniversalApp({
  x64AppPath: "/Users/shoryamalani/Documents/coding/electron_apps/new_app/power_time_tracking_electron/out/Fixate-darwin-x64/Fixate.app",
  arm64AppPath: "/Users/shoryamalani/Documents/coding/electron_apps/new_app/power_time_tracking_electron/out/Fixate-darwin-arm64/Fixate.app",
  x64AsarPath: "/Users/shoryamalani/Documents/coding/electron_apps/new_app/power_time_tracking_electron/out/Fixate-darwin-x64/Fixate.app/Contents/Resources/app.asar",
  arm64AsarPath: "/Users/shoryamalani/Documents/coding/electron_apps/new_app/power_time_tracking_electron/out/Fixate-darwin-arm64/Fixate.app/Contents/Resources/app.asar",
  filesToSkip: [
    'product.json','Credits.rtf','CodeResources','fsevents.node','Info.plist',
    '.npmrc',
  ],
  outAppPath: "/Users/shoryamalani/Documents/coding/electron_apps/new_app/power_time_tracking_electron/out/Universal/Fixate.app",
  force: true});
// Assumes support for top-level await, if it doesn't exist for the version of Node.js
// you're using, wrap in an async function.
